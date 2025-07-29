# HourBank Service Request Lifecycle
## Current Implementation (Initial Release) - Step Functions Orchestration

This document details the complete lifecycle of a service request using AWS Step Functions for workflow orchestration and DynamoDB for state persistence, including all events, actors, and system actions.

---

## Actors
- **Requester**: User requesting a service
- **Provider**: User offering the service
- **Step Functions**: AWS workflow orchestration service
- **Lambda Functions**: Individual workflow step processors
- **DynamoDB**: State persistence and querying
- **Admin**: Platform administrator/moderator

---

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step Function │    │     Lambda       │    │    DynamoDB     │
│   (Orchestrate) │←→  │   (Execute)      │←→  │   (Persist)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ↓                       ↓                       ↓
    Workflow Logic         Business Logic           State & Queries
```

---

## Complete Service Request Lifecycle

### Phase 1: Request Initiation & Validation

#### Step 1: Workflow Initiation
**Actor**: Requester  
**Action**: Clicks "Request Service" and submits request form

```
STEP FUNCTION: ServiceRequestWorkflow
├── Input: {
│   ├── serviceId: "uuid"
│   ├── requesterId: "uuid"
│   ├── providerId: "uuid"
│   ├── estimatedHours: number
│   ├── message: "string"
│   └── timestamp: "ISO8601"
│   }
├── Step Functions State: StartAt → "ValidateRequest"
└── Triggers: ValidateRequestLambda
```

**System Actions**:
1. Start Step Functions execution
2. Create ServiceRequest record in DynamoDB with status `INITIATED`
3. Generate unique requestId and executionArn
4. Log workflow initiation

---

#### Step 2: Request Validation
**Actor**: Lambda Function (ValidateRequestLambda)  
**Action**: Validates request and user eligibility

```
LAMBDA FUNCTION: ValidateRequestLambda
├── Step Functions State: "ValidateRequest"
├── Validation Checks:
│   ├── User has sufficient bank hours
│   ├── User account is active
│   ├── Service is available
│   ├── Provider is active
│   └── No duplicate pending requests
├── DynamoDB Update: status → "VALIDATING"
└── Next Step: "EscrowHours" OR "RejectRequest"
```

**System Actions**:
1. Update ServiceRequest status to `VALIDATING`
2. Check requester's bank hour balance
3. Verify service availability and provider status
4. Return validation result to Step Functions

---

#### Step 3A: Validation Success - Escrow Hours
**Actor**: Lambda Function (EscrowHoursLambda)  
**Action**: Creates escrow and holds requester's hours

```
LAMBDA FUNCTION: EscrowHoursLambda
├── Step Functions State: "EscrowHours"
├── Actions:
│   ├── Create escrow record
│   ├── Move hours from user balance to escrow
│   ├── Update ServiceRequest with escrowId
│   └── Update status to "ESCROWED"
├── DynamoDB Updates:
│   ├── ServiceRequests: status → "ESCROWED"
│   ├── Escrows: new record created
│   └── UserBalances: available balance reduced
└── Next Step: "NotifyProvider"
```

**System Actions**:
1. Create Escrow record with status `ESCROWED`
2. Transfer hours from requester to escrow account
3. Update ServiceRequest with escrowId and status `ESCROWED`
4. Log escrow creation

---

#### Step 3B: Validation Failure - Reject Request
**Actor**: Lambda Function (RejectRequestLambda)  
**Action**: Rejects request due to validation failure

```
LAMBDA FUNCTION: RejectRequestLambda
├── Step Functions State: "RejectRequest"
├── Actions:
│   ├── Update ServiceRequest status to "REJECTED"
│   ├── Create notification for requester
│   └── Log rejection reason
├── DynamoDB Update: status → "REJECTED"
└── Step Functions: End (Terminal State)
```

**System Actions**:
1. Update ServiceRequest status to `REJECTED`
2. Create notification for requester with failure reason
3. End Step Functions execution
4. Log rejection details

---

### Phase 2: Provider Response & Negotiation

#### Step 4: Notify Provider & Wait for Response
**Actor**: Lambda Function (NotifyProviderLambda) + Step Functions Wait State  
**Action**: Notifies provider and waits for response

```
LAMBDA FUNCTION: NotifyProviderLambda
├── Step Functions State: "NotifyProvider"
├── Actions:
│   ├── Create notification for provider
│   ├── Update ServiceRequest status to "AWAITING_RESPONSE"
│   └── Set provider response timeout
├── DynamoDB Update: status → "AWAITING_RESPONSE"
└── Next Step: "WaitForProviderResponse"

STEP FUNCTIONS WAIT STATE: "WaitForProviderResponse"
├── Wait Type: SecondsPath (from provider's response time setting)
├── Timeout: Provider-defined response time (2-72 hours)
└── Next Step: "CheckProviderResponse"
```

**System Actions**:
1. Update ServiceRequest status to `AWAITING_RESPONSE`
2. Create in-app notification for provider
3. Start Step Functions wait timer
4. Provider response updates workflow via external trigger

---

#### Step 5: Provider Response Processing
**Actor**: Lambda Function (CheckProviderResponseLambda)  
**Action**: Processes provider's response (Accept/Reject/Counter-offer)

```
LAMBDA FUNCTION: CheckProviderResponseLambda
├── Step Functions State: "CheckProviderResponse" (Choice State)
├── Response Options:
│   ├── "ACCEPTED" → Next: "StartServiceExecution"
│   ├── "REJECTED" → Next: "RefundEscrow"
│   ├── "COUNTER_OFFER" → Next: "ProcessNegotiation"
│   └── No Response (Timeout) → Next: "TimeoutRequest"
├── DynamoDB Update: status based on response
└── Route to appropriate next step
```

**System Actions**:
1. Evaluate provider response from external input
2. Update ServiceRequest status based on response
3. Route workflow to appropriate next step
4. Log provider response

---

#### Step 6A: Accept Path - Service Execution Ready
**Actor**: Lambda Function (StartServiceExecutionLambda)  
**Action**: Prepares for service execution

```
LAMBDA FUNCTION: StartServiceExecutionLambda
├── Step Functions State: "StartServiceExecution"
├── Actions:
│   ├── Update ServiceRequest status to "ACCEPTED"
│   ├── Create notifications for both parties
│   └── Enable service start functionality
├── DynamoDB Update: status → "ACCEPTED"
└── Next Step: "WaitForServiceStart"
```

**System Actions**:
1. Update ServiceRequest status to `ACCEPTED`
2. Create notifications for both parties
3. Enable "Start Service" functionality
4. Transition to service execution phase

---

#### Step 6B: Negotiation Path
**Actor**: Lambda Function (ProcessNegotiationLambda)  
**Action**: Handles counter-offer negotiation

```
LAMBDA FUNCTION: ProcessNegotiationLambda
├── Step Functions State: "ProcessNegotiation"
├── Actions:
│   ├── Store counter-offer details
│   ├── Update ServiceRequest status to "NEGOTIATING"
│   ├── Notify requester of counter-offer
│   └── Start negotiation timeout
├── DynamoDB Update: status → "NEGOTIATING"
└── Next Step: "WaitForNegotiationResponse"
```

**System Actions**:
1. Update ServiceRequest status to `NEGOTIATING`
2. Store counter-offer terms
3. Create notification for requester
4. Start negotiation timer (24 hours)

---

### Phase 3: Service Execution (Mutual Confirmation)

#### Step 7: Service Start Confirmation
**Actor**: Lambda Function (ConfirmServiceStartLambda)  
**Action**: Handles mutual confirmation of service start

```
LAMBDA FUNCTION: ConfirmServiceStartLambda
├── Step Functions State: "ConfirmServiceStart"
├── Confirmation Flow:
│   ├── Provider marks "started" → Update status to "PENDING_START_CONFIRMATION"
│   ├── Requester confirms → Update status to "IN_PROGRESS"
│   └── Both confirmed → Record start time
├── DynamoDB Update: status → "IN_PROGRESS"
└── Next Step: "WaitForServiceCompletion"
```

**System Actions**:
1. Handle dual confirmation workflow
2. Update ServiceRequest status to `IN_PROGRESS`
3. Record service start timestamp
4. Create notifications for both parties

---

#### Step 8: Service Completion Confirmation
**Actor**: Lambda Function (ConfirmServiceCompletionLambda)  
**Action**: Handles mutual confirmation of service completion

```
LAMBDA FUNCTION: ConfirmServiceCompletionLambda
├── Step Functions State: "ConfirmServiceCompletion"
├── Confirmation Flow:
│   ├── Provider marks "completed" → Update status to "PENDING_COMPLETION_CONFIRMATION"
│   ├── Requester confirms → Update status to "COMPLETED"
│   └── Both confirmed → Trigger payment processing
├── DynamoDB Update: status → "COMPLETED"
└── Next Step: "ProcessPayment"
```

**System Actions**:
1. Handle dual confirmation workflow
2. Update ServiceRequest status to `COMPLETED`
3. Record completion timestamp
4. Trigger payment processing

---

### Phase 4: Payment Processing

#### Step 9: Payment Processing
**Actor**: Lambda Function (ProcessPaymentLambda)  
**Action**: Transfers escrowed hours to provider

```
LAMBDA FUNCTION: ProcessPaymentLambda
├── Step Functions State: "ProcessPayment"
├── Actions:
│   ├── Transfer hours from escrow to provider
│   ├── Update ServiceRequest status to "PAID"
│   ├── Create transaction record
│   └── Enable rating functionality
├── DynamoDB Updates:
│   ├── ServiceRequests: status → "PAID"
│   ├── Escrows: status → "RELEASED"
│   ├── UserBalances: provider balance increased
│   └── TransactionLogs: payment recorded
└── Next Step: "CompleteWorkflow"
```

**System Actions**:
1. Transfer hours from escrow to provider balance
2. Update ServiceRequest status to `PAID`
3. Create transaction and audit records
4. Enable rating system for requester

---

#### Step 10: Workflow Completion
**Actor**: Lambda Function (CompleteWorkflowLambda)  
**Action**: Finalizes the service request workflow

```
LAMBDA FUNCTION: CompleteWorkflowLambda
├── Step Functions State: "CompleteWorkflow" (Terminal State)
├── Actions:
│   ├── Create completion notifications
│   ├── Enable rating/review functionality
│   ├── Update workflow metrics
│   └── Log successful completion
├── DynamoDB Update: final status confirmation
└── Step Functions: End (Success)
```

**System Actions**:
1. Create completion notifications for both parties
2. Enable rating and review functionality
3. Update system metrics and analytics
4. End Step Functions execution successfully

---

## Exception Handling (Step Functions Error States)

### Timeout Scenarios

#### Provider Response Timeout
```
STEP FUNCTIONS STATE: "TimeoutRequest"
├── Trigger: WaitForProviderResponse timeout
├── Lambda: TimeoutRequestLambda
├── Actions:
│   ├── Update ServiceRequest status to "EXPIRED"
│   ├── Refund escrowed hours to requester
│   ├── Notify both parties
│   └── Close escrow
└── Step Functions: End (Timeout)
```

#### Confirmation Timeout
```
STEP FUNCTIONS STATE: "AutoConfirm"
├── Trigger: Confirmation wait timeout (48 hours)
├── Lambda: AutoConfirmLambda
├── Actions:
│   ├── Auto-confirm pending action
│   ├── Proceed to next workflow step
│   └── Notify both parties of auto-confirmation
└── Continue workflow execution
```

### Error Handling

#### Retry Configuration
```json
{
  "Retry": [
    {
      "ErrorEquals": ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
      "IntervalSeconds": 2,
      "MaxAttempts": 3,
      "BackoffRate": 2.0
    }
  ]
}
```

#### Catch Blocks
```json
{
  "Catch": [
    {
      "ErrorEquals": ["States.ALL"],
      "Next": "HandleWorkflowError",
      "ResultPath": "$.error"
    }
  ]
}
```

### Dispute Handling

#### Dispute Raised During Workflow
```
STEP FUNCTIONS STATE: "HandleDispute"
├── Trigger: External dispute event
├── Lambda: HandleDisputeLambda
├── Actions:
│   ├── Pause workflow execution
│   ├── Update ServiceRequest status to "DISPUTED"
│   ├── Freeze escrow
│   ├── Notify admin
│   └── Create dispute record
└── Step Functions: Wait for dispute resolution
```

---

## State Persistence Strategy

### DynamoDB Tables (Reduced Set)

#### ServiceRequests Table
```json
{
  "requestId": "uuid",
  "serviceId": "uuid",
  "requesterId": "uuid", 
  "providerId": "uuid",
  "status": "INITIATED|VALIDATING|ESCROWED|AWAITING_RESPONSE|ACCEPTED|IN_PROGRESS|COMPLETED|PAID|REJECTED|EXPIRED|DISPUTED",
  "stepFunctionExecutionArn": "string",
  "estimatedHours": "number",
  "agreedRate": "number",
  "escrowId": "uuid",
  "negotiationRound": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Key Benefits of Step Functions Integration:
1. **Workflow State**: Managed by Step Functions
2. **Business State**: Persisted in DynamoDB for queries
3. **Execution History**: Automatic audit trail in Step Functions
4. **Error Handling**: Built-in retry and error recovery
5. **Monitoring**: Visual workflow execution tracking

---

## Monitoring and Observability

### Step Functions Monitoring
- **Execution History**: Complete workflow execution logs
- **State Transitions**: Visual representation of workflow progress
- **Error Tracking**: Automatic error capture and reporting
- **Performance Metrics**: Execution time and success rates

### CloudWatch Integration
- **Custom Metrics**: Business-specific workflow metrics
- **Alarms**: Automated alerting for workflow failures
- **Dashboards**: Real-time workflow monitoring
- **Log Aggregation**: Centralized logging from all Lambda functions

### DynamoDB Monitoring
- **State Queries**: Business intelligence and reporting
- **Performance Metrics**: Read/write capacity and latency
- **Item-level Monitoring**: Track state changes over time

---

## Benefits of Step Functions Approach

### 🚀 **Development Acceleration**
- **No Custom State Management**: Step Functions handles all workflow logic
- **Built-in Error Handling**: Automatic retries and error recovery
- **Visual Debugging**: See exactly where workflows succeed/fail
- **Faster Implementation**: Weeks of development time saved

### 🛡️ **Enhanced Reliability**
- **Proven Infrastructure**: Battle-tested AWS service
- **Automatic Scaling**: Handles any volume of concurrent requests
- **Fault Tolerance**: Built-in resilience and recovery
- **Consistent Execution**: Guaranteed workflow completion

### 📊 **Superior Observability**
- **Complete Audit Trail**: Every workflow step is logged
- **Visual Monitoring**: Real-time workflow execution tracking
- **Performance Analytics**: Built-in metrics and reporting
- **Easy Debugging**: Step-by-step execution analysis

### 💰 **Cost Effectiveness**
- **Pay-per-Use**: Only pay for actual workflow executions
- **No Infrastructure**: Serverless with automatic scaling
- **Reduced Development**: Significant time and cost savings
- **Operational Efficiency**: Less maintenance and monitoring overhead

This Step Functions-based approach provides enterprise-grade workflow management while maintaining the ability to query and report on business state through DynamoDB. It eliminates the complexity of custom state management while providing superior reliability, monitoring, and debugging capabilities.
