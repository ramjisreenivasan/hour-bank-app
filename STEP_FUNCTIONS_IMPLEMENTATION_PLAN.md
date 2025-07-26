# HourBank Step Functions Implementation Plan
## Detailed Implementation Phases and Priorities

This document outlines the detailed implementation plan for integrating AWS Step Functions into the HourBank event-driven backend architecture.

---

## Implementation Overview

### Architecture Strategy
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step Function │    │     Lambda       │    │   Amplify       │
│   (Orchestrate) │←→  │   (Execute)      │←→  │   GraphQL       │
│   Complex       │    │   Business       │    │   (Persist &    │
│   Workflows     │    │   Logic          │    │    Query)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Workflow Distribution
- **Step Functions**: Complex, multi-step workflows requiring reliability
- **Direct Lambda**: Simple operations and CRUD operations
- **Amplify GraphQL**: Data persistence, queries, and real-time subscriptions

---

## Phase 1: Foundation Setup (Week 1)

### 1.1 DynamoDB Tables Creation
**Priority**: CRITICAL  
**Timeline**: Days 1-2

#### Extend Amplify GraphQL Schema
Add the following types to your existing `schema.graphql`:

```graphql
# Service Request Management
type ServiceRequest @model @auth(rules: [
  { allow: owner, ownerField: "requesterId" }
  { allow: owner, ownerField: "providerId" }
]) {
  id: ID!
  serviceId: ID! @index(name: "byServiceId")
  requesterId: ID! @index(name: "byRequesterId") 
  providerId: ID! @index(name: "byProviderId")
  status: ServiceRequestStatus! @index(name: "byStatus")
  stepFunctionExecutionArn: String
  estimatedHours: Float!
  agreedRate: Float
  message: String
  escrowId: ID @index(name: "byEscrowId")
  negotiationRound: Int!
  expiresAt: AWSDateTime
  
  # Relationships
  service: Service @belongsTo(fields: ["serviceId"])
  requester: User @belongsTo(fields: ["requesterId"])
  provider: User @belongsTo(fields: ["providerId"])
  escrow: Escrow @belongsTo(fields: ["escrowId"])
  
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

enum ServiceRequestStatus {
  INITIATED
  VALIDATING
  ESCROWED
  AWAITING_RESPONSE
  ACCEPTED
  NEGOTIATING
  IN_PROGRESS
  COMPLETED
  PAID
  REJECTED
  EXPIRED
  DISPUTED
}

# Escrow Management
type Escrow @model @auth(rules: [
  { allow: owner, ownerField: "fromUserId" }
  { allow: owner, ownerField: "toUserId" }
]) {
  id: ID!
  requestId: ID @index(name: "byRequestId")
  fromUserId: ID! @index(name: "byFromUserId")
  toUserId: ID! @index(name: "byToUserId") 
  amount: Float!
  status: EscrowStatus! @index(name: "byStatus")
  escrowType: EscrowType!
  stepFunctionExecutionArn: String
  
  # Relationships
  request: ServiceRequest @belongsTo(fields: ["requestId"])
  fromUser: User @belongsTo(fields: ["fromUserId"])
  toUser: User @belongsTo(fields: ["toUserId"])
  
  createdAt: AWSDateTime!
  releasedAt: AWSDateTime
  cancelledAt: AWSDateTime
  updatedAt: AWSDateTime!
}

enum EscrowStatus {
  CREATING_ESCROW
  VALIDATING_BALANCE
  ESCROWED
  RELEASING
  RELEASED
  CANCELLING
  CANCELLED
  FAILED
}

enum EscrowType {
  SERVICE_REQUEST
  REFUND
  DISPUTE_RESOLUTION
}

# User Balance Management
type UserBalance @model @auth(rules: [
  { allow: owner, ownerField: "userId" }
]) {
  userId: ID! @primaryKey
  totalBalance: Float!
  availableBalance: Float!
  escrowedBalance: Float!
  lastTransactionId: ID
  version: Int!
  lockedAt: AWSDateTime
  lockedBy: String
  
  # Relationships
  user: User @belongsTo(fields: ["userId"])
  
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

# Transaction Audit Trail
type TransactionLog @model @auth(rules: [
  { allow: owner, ownerField: "userId" }
  { allow: groups, groups: ["admin"] }
]) {
  id: ID!
  transactionId: ID @index(name: "byTransactionId")
  userId: ID! @index(name: "byUserId")
  transactionType: TransactionType! @index(name: "byTransactionType")
  amount: Float!
  balanceBefore: Float!
  balanceAfter: Float!
  description: String!
  relatedEntityId: ID
  stepFunctionExecutionArn: String
  
  # Relationships
  user: User @belongsTo(fields: ["userId"])
  
  createdAt: AWSDateTime!
}

enum TransactionType {
  ESCROW
  TRANSFER
  REFUND
  WELCOME_BONUS
  DISPUTE_RESOLUTION
  ADMIN_ADJUSTMENT
}
```

#### Deploy Schema Updates
```bash
amplify push
```

### 1.2 IAM Roles and Permissions Setup
**Priority**: CRITICAL  
**Timeline**: Day 2

#### Step Functions Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:*:*:function:hourbank-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/ServiceRequest-*",
        "arn:aws:dynamodb:*:*:table/Escrow-*",
        "arn:aws:dynamodb:*:*:table/UserBalance-*",
        "arn:aws:dynamodb:*:*:table/TransactionLog-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "events:PutEvents"
      ],
      "Resource": "arn:aws:events:*:*:event-bus/hourbank-event-bus"
    }
  ]
}
```

#### Lambda Execution Roles
- DynamoDB read/write permissions
- EventBridge publish permissions
- CloudWatch Logs permissions
- Step Functions callback permissions

### 1.3 EventBridge Setup
**Priority**: HIGH  
**Timeline**: Day 3

#### Custom Event Bus
```bash
aws events create-event-bus --name hourbank-event-bus
```

#### Event Rules Configuration
```json
{
  "Rules": [
    {
      "Name": "ServiceRequestEvents",
      "EventPattern": {
        "source": ["hourbank.service-requests"],
        "detail-type": ["Service Request Submitted", "Provider Response Received"]
      },
      "Targets": [
        {
          "Id": "1",
          "Arn": "arn:aws:states:region:account:stateMachine:ServiceRequestWorkflow"
        }
      ]
    }
  ]
}
```

---

## Phase 2: Core Workflow Implementation (Week 2)

### 2.1 Service Request Workflow
**Priority**: CRITICAL  
**Timeline**: Days 4-6

#### Lambda Functions to Create
1. **ValidateServiceRequestLambda**
   - Validate user balance and service availability
   - Update ServiceRequest status
   - Return validation result

2. **CreateEscrowLambda**
   - Create escrow record
   - Transfer hours from user to escrow
   - Update UserBalance with atomic operations

3. **NotifyProviderLambda**
   - Create notification for provider
   - Update ServiceRequest status
   - Set response timeout

4. **ProcessProviderResponseLambda**
   - Handle accept/reject/counter-offer
   - Update ServiceRequest accordingly
   - Route to next workflow step

5. **ProcessNegotiationLambda**
   - Handle negotiation rounds
   - Update terms and status
   - Manage negotiation timeouts

#### Step Functions State Machine Structure
```
ServiceRequestWorkflow:
├── ValidateRequest
├── CreateEscrow (on success)
├── NotifyProvider
├── WaitForProviderResponse (timeout: provider-defined)
├── ProcessProviderResponse (Choice State)
│   ├── Accept → StartServiceExecution
│   ├── Reject → RefundEscrow
│   ├── CounterOffer → ProcessNegotiation
│   └── Timeout → ExpireRequest
└── [Continue to service execution phases]
```

### 2.2 Escrow Management Workflow
**Priority**: CRITICAL  
**Timeline**: Days 6-7

#### Lambda Functions to Create
1. **ValidateEscrowReleaseLambda**
   - Validate release conditions
   - Check escrow status and amount
   - Prepare for transfer

2. **ProcessEscrowReleaseLambda**
   - Transfer hours from escrow to provider
   - Update UserBalance atomically
   - Create transaction log

3. **ProcessEscrowCancellationLambda**
   - Handle escrow cancellation
   - Refund hours to original user
   - Update all related records

#### Step Functions State Machine Structure
```
EscrowManagementWorkflow:
├── ValidateEscrowRelease
├── ProcessEscrowRelease (with retries)
├── UpdateBalances
├── CreateTransactionLog
└── CompleteEscrowRelease

EscrowCancellationWorkflow:
├── ValidateEscrowCancellation
├── ProcessRefund (with retries)
├── UpdateBalances
├── CreateTransactionLog
└── CompleteEscrowCancellation
```

---

## Phase 3: Enhanced Workflows (Week 3)

### 3.1 Transaction Processing Workflow
**Priority**: HIGH  
**Timeline**: Days 8-10

#### Lambda Functions to Create
1. **ProcessPaymentLambda**
   - Handle service completion payment
   - Transfer hours from escrow to provider
   - Update transaction records

2. **ProcessDirectTransferLambda**
   - Handle welcome bonuses, refunds
   - Direct balance updates
   - Create audit trail

3. **ReconcileBalancesLambda**
   - Scheduled balance reconciliation
   - Identify discrepancies
   - Generate reconciliation reports

#### Step Functions Integration
- Payment processing with automatic retries
- Balance reconciliation workflows
- Error handling and rollback mechanisms

### 3.2 Dispute Resolution Workflow
**Priority**: MODERATE  
**Timeline**: Days 10-12

#### Lambda Functions to Create
1. **InitiateDisputeLambda**
   - Create dispute record
   - Freeze related transactions
   - Notify admin

2. **ProcessDisputeResolutionLambda**
   - Handle admin decisions
   - Execute resolution actions
   - Update all affected records

#### Step Functions State Machine Structure
```
DisputeResolutionWorkflow:
├── InitiateDispute
├── FreezeRelatedTransactions
├── NotifyAdmin
├── WaitForAdminDecision (human task)
├── ProcessResolution (Choice State)
│   ├── RefundToRequester
│   ├── PayToProvider
│   ├── PartialRefund
│   └── DismissDispute
└── CompleteDisputeResolution
```

---

## Phase 4: Integration and Testing (Week 4)

### 4.1 Frontend Integration
**Priority**: HIGH  
**Timeline**: Days 13-15

#### Angular Service Updates
1. **Update Service Request Service**
   ```typescript
   // Start service request workflow
   async submitServiceRequest(requestData: ServiceRequestInput) {
     // Create ServiceRequest via GraphQL
     const request = await this.createServiceRequest(requestData);
     
     // Trigger Step Functions workflow
     await this.startWorkflow('ServiceRequestWorkflow', {
       requestId: request.id,
       ...requestData
     });
     
     return request;
   }
   ```

2. **Add Workflow Status Tracking**
   ```typescript
   // Track workflow progress
   async getWorkflowStatus(executionArn: string) {
     return await this.stepFunctions.describeExecution({
       executionArn
     }).promise();
   }
   ```

#### Real-time Updates
- GraphQL subscriptions for ServiceRequest updates
- WebSocket integration for workflow status
- Progress indicators for multi-step processes

### 4.2 Monitoring and Observability
**Priority**: HIGH  
**Timeline**: Days 15-16

#### CloudWatch Dashboards
1. **Workflow Performance Dashboard**
   - Execution success rates
   - Average execution times
   - Error rates by workflow type
   - Cost tracking

2. **Business Metrics Dashboard**
   - Service request completion rates
   - Transaction volumes
   - User balance trends
   - Dispute resolution times

#### Alerting Setup
```json
{
  "Alarms": [
    {
      "AlarmName": "ServiceRequestWorkflowFailures",
      "MetricName": "ExecutionsFailed",
      "Namespace": "AWS/States",
      "Threshold": 5,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 2
    },
    {
      "AlarmName": "EscrowProcessingErrors",
      "MetricName": "ExecutionsFailed",
      "Namespace": "AWS/States",
      "Threshold": 1,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 1
    }
  ]
}
```

### 4.3 Testing Strategy
**Priority**: CRITICAL  
**Timeline**: Days 16-18

#### Unit Testing
- Individual Lambda function testing
- Mock Step Functions executions
- DynamoDB integration testing

#### Integration Testing
- End-to-end workflow testing
- Error scenario testing
- Performance testing under load

#### User Acceptance Testing
- Complete service request flows
- Error handling validation
- UI/UX workflow testing

---

## Phase 5: Production Deployment (Week 5)

### 5.1 Environment Setup
**Priority**: CRITICAL  
**Timeline**: Days 19-20

#### Production Configuration
- Separate Step Functions for prod environment
- Production DynamoDB tables with proper capacity
- Production EventBridge configuration
- IAM roles and permissions review

#### Deployment Pipeline
```yaml
# GitHub Actions workflow
name: Deploy Step Functions
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Step Functions
        run: |
          aws stepfunctions create-state-machine \
            --name ServiceRequestWorkflow-prod \
            --definition file://workflows/service-request.json \
            --role-arn ${{ secrets.STEP_FUNCTIONS_ROLE_ARN }}
```

### 5.2 Migration Strategy
**Priority**: HIGH  
**Timeline**: Days 20-21

#### Gradual Rollout
1. **Phase 1**: New service requests use Step Functions
2. **Phase 2**: Migrate existing pending requests
3. **Phase 3**: Full Step Functions integration

#### Rollback Plan
- Keep existing event-driven system running in parallel
- Feature flags for Step Functions vs legacy system
- Quick rollback capability if issues arise

---

## Success Metrics and KPIs

### Technical Metrics
- **Workflow Success Rate**: >99.5%
- **Average Execution Time**: <30 seconds for service requests
- **Error Rate**: <0.5%
- **Cost per Execution**: <$0.01

### Business Metrics
- **Service Request Completion Rate**: >95%
- **Payment Processing Success**: >99.9%
- **Dispute Resolution Time**: <48 hours average
- **User Satisfaction**: >4.5/5 rating

### Performance Metrics
- **Concurrent Executions**: Support 1000+ simultaneous workflows
- **Throughput**: 10,000+ service requests per day
- **Latency**: <2 seconds for workflow initiation
- **Availability**: 99.9% uptime

---

## Risk Mitigation

### Technical Risks
1. **Step Functions Limits**
   - **Risk**: Execution history size limits
   - **Mitigation**: Archive old executions, use Express workflows for high-volume

2. **Lambda Cold Starts**
   - **Risk**: Increased latency for infrequent functions
   - **Mitigation**: Provisioned concurrency for critical functions

3. **DynamoDB Throttling**
   - **Risk**: High-volume operations causing throttling
   - **Mitigation**: Auto-scaling, proper capacity planning

### Business Risks
1. **Workflow Complexity**
   - **Risk**: Complex workflows difficult to debug
   - **Mitigation**: Comprehensive logging, visual monitoring

2. **Cost Overruns**
   - **Risk**: Unexpected Step Functions costs
   - **Mitigation**: Cost monitoring, budget alerts

---

## Post-Implementation Optimization

### Week 6+: Continuous Improvement
1. **Performance Optimization**
   - Analyze execution patterns
   - Optimize Lambda function performance
   - Fine-tune Step Functions workflows

2. **Cost Optimization**
   - Review execution patterns
   - Optimize workflow design for cost
   - Consider Express vs Standard workflows

3. **Feature Enhancements**
   - Add more complex workflows
   - Implement advanced error handling
   - Enhance monitoring and alerting

This implementation plan provides a structured approach to integrating Step Functions into your HourBank platform while maintaining system reliability and user experience throughout the transition.
