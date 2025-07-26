# HourBank Event-Driven Backend Implementation Guide
## Step-by-Step Development Plan for Amplify Custom Resources

**Document Version**: 1.0  
**Target Audience**: Development Team  
**Architecture**: Event-Driven with AWS Step Functions + Amplify GraphQL  
**Deployment Strategy**: Unified Amplify Custom Resources  

---

## Executive Summary

This implementation guide provides a detailed, step-by-step plan to implement the HourBank event-driven backend using AWS Step Functions integrated with Amplify. The approach prioritizes one workflow at a time to ensure systematic development and testing.

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step Function │    │     Lambda       │    │   Amplify       │
│   (Orchestrate) │←→  │   (Execute)      │←→  │   GraphQL       │
│   Complex       │    │   Business       │    │   (Persist &    │
│   Workflows     │    │   Logic          │    │    Query)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Implementation Strategy
- **Workflow-by-Workflow**: Implement one complete workflow before moving to the next
- **Unified Deployment**: All resources deployed via single `amplify push`
- **Incremental Testing**: Each workflow fully tested before proceeding
- **Backward Compatibility**: Existing functionality remains unaffected

---

## Prerequisites and Setup

### Development Environment Requirements
- **Node.js**: v18 or higher
- **Amplify CLI**: Latest version (`npm install -g @aws-amplify/cli`)
- **AWS CLI**: Configured with appropriate permissions
- **TypeScript**: For Lambda function development
- **Angular CLI**: For frontend integration

### AWS Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "states:*",
        "lambda:*",
        "dynamodb:*",
        "iam:*",
        "events:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Project Structure Overview
```
amplify/backend/
├── api/hourbankapp/           # Existing GraphQL API
├── auth/                      # Existing Cognito Auth
├── function/                  # Lambda Functions (NEW)
│   ├── validateServiceRequest/
│   ├── createEscrow/
│   ├── notifyProvider/
│   └── [other workflow functions]/
├── custom/                    # Custom Resources (NEW)
│   └── stepfunctions/
│       ├── stepfunctions-template.json
│       ├── parameters.json
│       └── workflows/
└── hosting/                   # Existing hosting
```

---

## Implementation Phases Overview

### Phase 1: Foundation (Week 1)
- **Workflow**: Service Request Workflow
- **Priority**: CRITICAL
- **Components**: 6 Lambda functions + 1 Step Function + GraphQL extensions
- **Outcome**: Complete service request lifecycle working

### Phase 2: Financial Engine (Week 2)  
- **Workflow**: Escrow Management Workflow
- **Priority**: CRITICAL
- **Components**: 4 Lambda functions + 2 Step Functions + Balance management
- **Outcome**: Secure financial transactions working

### Phase 3: User Experience (Week 3)
- **Workflow**: Transaction Processing Workflow  
- **Priority**: HIGH
- **Components**: 3 Lambda functions + 1 Step Function + Payment processing
- **Outcome**: Complete payment and completion flow

### Phase 4: Governance (Week 4)
- **Workflow**: Dispute Resolution Workflow
- **Priority**: MODERATE
- **Components**: 3 Lambda functions + 1 Step Function + Admin integration
- **Outcome**: Dispute handling and resolution system

---

## Development Standards and Conventions

### Naming Conventions
- **Lambda Functions**: `hourbank-{workflow}-{action}-{env}`
  - Example: `hourbank-servicerequest-validate-dev`
- **Step Functions**: `{WorkflowName}Workflow-{env}`
  - Example: `ServiceRequestWorkflow-dev`
- **DynamoDB Tables**: `{EntityName}-{env}`
  - Example: `ServiceRequest-dev`

### Code Structure Standards
```typescript
// Lambda Function Structure
export interface WorkflowInput {
  // Input interface
}

export interface WorkflowOutput {
  // Output interface
}

export const handler = async (event: WorkflowInput): Promise<WorkflowOutput> => {
  // Implementation
};
```

### Error Handling Standards
- **Consistent Error Format**: All functions return standardized error objects
- **Retry Logic**: Built into Step Functions with exponential backoff
- **Logging**: Structured logging with correlation IDs
- **Monitoring**: CloudWatch metrics for all critical operations

### Testing Standards
- **Unit Tests**: Each Lambda function has comprehensive unit tests
- **Integration Tests**: End-to-end workflow testing
- **Load Tests**: Performance testing for critical workflows
- **Error Scenario Tests**: Failure mode testing

---

## Shared Infrastructure Components

### EventBridge Configuration
```json
{
  "EventBusName": "hourbank-event-bus",
  "Rules": [
    {
      "Name": "ServiceRequestEvents",
      "EventPattern": {
        "source": ["hourbank.service-requests"],
        "detail-type": ["Service Request Submitted", "Provider Response Received"]
      }
    }
  ]
}
```

### Common Lambda Layer
Create a shared layer for common utilities:
```
amplify/backend/function/hourbankCommonLayer/
├── lib/
│   ├── dynamodb-client.ts
│   ├── eventbridge-client.ts
│   ├── error-handler.ts
│   ├── logger.ts
│   └── types.ts
└── package.json
```

### Monitoring and Alerting Setup
- **CloudWatch Dashboards**: Real-time workflow monitoring
- **Alarms**: Critical failure alerting
- **X-Ray Tracing**: End-to-end request tracing
- **Custom Metrics**: Business-specific metrics

---

## Quality Assurance Framework

### Code Review Checklist
- [ ] Function follows naming conventions
- [ ] Error handling implemented correctly
- [ ] Unit tests written and passing
- [ ] Integration tests updated
- [ ] Documentation updated
- [ ] Performance considerations addressed

### Testing Strategy
1. **Unit Testing**: Jest for Lambda functions
2. **Integration Testing**: Step Functions Local for workflow testing
3. **End-to-End Testing**: Automated testing via CI/CD
4. **Performance Testing**: Load testing for critical paths
5. **Security Testing**: IAM permissions and data validation

### Deployment Gates
- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

---

## Risk Mitigation Strategies

### Technical Risks
1. **Step Functions Limits**
   - **Mitigation**: Monitor execution history size, implement archiving
2. **Lambda Cold Starts**
   - **Mitigation**: Provisioned concurrency for critical functions
3. **DynamoDB Throttling**
   - **Mitigation**: Auto-scaling configuration, proper capacity planning

### Business Risks
1. **Data Consistency**
   - **Mitigation**: Atomic operations, proper transaction handling
2. **Financial Accuracy**
   - **Mitigation**: Comprehensive audit trails, reconciliation processes
3. **User Experience**
   - **Mitigation**: Graceful error handling, clear user feedback

### Operational Risks
1. **Deployment Failures**
   - **Mitigation**: Blue-green deployments, rollback procedures
2. **Monitoring Gaps**
   - **Mitigation**: Comprehensive alerting, proactive monitoring
3. **Team Knowledge**
   - **Mitigation**: Documentation, training, knowledge sharing

---

## Success Metrics and KPIs

### Technical Metrics
- **Workflow Success Rate**: >99.5%
- **Average Execution Time**: <30 seconds
- **Error Rate**: <0.5%
- **Cost per Execution**: <$0.01

### Business Metrics
- **Service Request Completion**: >95%
- **Payment Processing Success**: >99.9%
- **User Satisfaction**: >4.5/5
- **Dispute Resolution Time**: <48 hours

### Performance Metrics
- **Throughput**: 10,000+ requests/day
- **Latency**: <2 seconds response time
- **Availability**: 99.9% uptime
- **Scalability**: Support 1000+ concurrent users

---

## Next Steps

This implementation guide is structured to provide:
1. **Detailed Phase Implementation Plans** (following sections)
2. **Complete Code Examples** for each component
3. **Testing Procedures** for each workflow
4. **Deployment Instructions** with rollback procedures
5. **Monitoring and Maintenance** guidelines

Each phase includes:
- Prerequisites and dependencies
- Step-by-step implementation instructions
- Code templates and examples
- Testing procedures
- Deployment and verification steps
- Troubleshooting guides

---

# Phase 1: Service Request Workflow Implementation

## Overview
**Timeline**: Week 1 (5 working days)  
**Priority**: CRITICAL  
**Workflow**: Complete service request lifecycle from submission to acceptance  
**Reference Document**: `SERVICE_REQUEST_LIFECYCLE.md`

### Phase 1 Architecture
```
User Request → Step Function → Lambda Functions → DynamoDB → Notifications
     ↓              ↓              ↓              ↓           ↓
  Frontend    ServiceRequest    Business      State      Provider
  Submission    Workflow        Logic      Persistence  Notification
```

### Components to Implement
1. **GraphQL Schema Extensions** (1 day)
2. **Lambda Functions** (2 days)
3. **Step Functions State Machine** (1 day)
4. **Frontend Integration** (1 day)

---

## Day 1: GraphQL Schema Extensions

### Step 1.1: Extend Amplify GraphQL Schema

Add the following to your existing `schema.graphql`:

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

# User Balance Management (for Phase 1)
type UserBalance @model @auth(rules: [
  { allow: owner, ownerField: "userId" }
]) {
  userId: ID! @primaryKey
  totalBalance: Float!
  availableBalance: Float!
  escrowedBalance: Float!
  lastTransactionId: ID
  version: Int!
  
  # Relationships
  user: User @belongsTo(fields: ["userId"])
  
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

# Custom mutations for Step Functions integration
type Mutation {
  startServiceRequestWorkflow(input: StartServiceRequestInput!): ServiceRequestWorkflowResponse
  updateProviderResponse(input: ProviderResponseInput!): ServiceRequest
}

input StartServiceRequestInput {
  serviceId: ID!
  providerId: ID!
  estimatedHours: Float!
  message: String
}

type ServiceRequestWorkflowResponse {
  serviceRequest: ServiceRequest!
  executionArn: String!
  status: String!
}

input ProviderResponseInput {
  requestId: ID!
  response: ProviderResponseType!
  message: String
  counterOffer: CounterOfferInput
}

enum ProviderResponseType {
  ACCEPTED
  REJECTED
  COUNTER_OFFER
}

input CounterOfferInput {
  newRate: Float
  newHours: Float
  message: String
}
```

### Step 1.2: Deploy Schema Changes

```bash
amplify push
```

**Verification**: Confirm new tables are created in DynamoDB console.

---

## Day 2-3: Lambda Functions Implementation

### Step 2.1: Create Common Layer

```bash
amplify add function
# Choose: Lambda layer
# Name: hourbankCommonLayer
```

Create shared utilities in `amplify/backend/function/hourbankCommonLayer/lib/`:

```typescript
// amplify/backend/function/hourbankCommonLayer/lib/types.ts
export interface ServiceRequestWorkflowInput {
  requestId: string;
  serviceId: string;
  requesterId: string;
  providerId: string;
  estimatedHours: number;
  message?: string;
}

export interface WorkflowResponse {
  statusCode: number;
  success: boolean;
  data?: any;
  error?: string;
}

// amplify/backend/function/hourbankCommonLayer/lib/dynamodb-client.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const dynamoClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// amplify/backend/function/hourbankCommonLayer/lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ level: 'INFO', message, data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'ERROR', message, error, timestamp: new Date().toISOString() }));
  }
};
```

### Step 2.2: Create Lambda Functions

#### Function 1: Validate Service Request

```bash
amplify add function
# Name: hourbankValidateServiceRequest
# Runtime: NodeJS
# Template: Hello World
```

```typescript
// amplify/backend/function/hourbankValidateServiceRequest/src/index.ts
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, ServiceRequestWorkflowInput, WorkflowResponse } from '/opt/nodejs/lib';

export const handler = async (event: ServiceRequestWorkflowInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Starting service request validation', { requestId: event.requestId });

    // 1. Validate user balance
    const userBalance = await docClient.send(new GetCommand({
      TableName: process.env.USER_BALANCE_TABLE_NAME,
      Key: { userId: event.requesterId }
    }));

    if (!userBalance.Item) {
      // Create initial balance record if doesn't exist
      await docClient.send(new PutCommand({
        TableName: process.env.USER_BALANCE_TABLE_NAME,
        Item: {
          userId: event.requesterId,
          totalBalance: 10, // Welcome bonus
          availableBalance: 10,
          escrowedBalance: 0,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
    }

    const balance = userBalance.Item || { availableBalance: 10 };
    
    if (balance.availableBalance < event.estimatedHours) {
      return {
        statusCode: 400,
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        data: { 
          required: event.estimatedHours, 
          available: balance.availableBalance 
        }
      };
    }

    // 2. Validate service exists and is active
    const service = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_TABLE_NAME,
      Key: { id: event.serviceId }
    }));

    if (!service.Item || !service.Item.isActive) {
      return {
        statusCode: 400,
        success: false,
        error: 'SERVICE_NOT_AVAILABLE'
      };
    }

    // 3. Update ServiceRequest status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'VALIDATING',
        ':updatedAt': new Date().toISOString()
      }
    }));

    logger.info('Service request validation successful', { requestId: event.requestId });

    return {
      statusCode: 200,
      success: true,
      data: {
        requestId: event.requestId,
        validationResult: 'PASSED',
        serviceRate: service.Item.hourlyRate
      }
    };

  } catch (error) {
    logger.error('Service request validation failed', error);
    throw error;
  }
};
```

#### Function 2: Create Escrow

```bash
amplify add function
# Name: hourbankCreateEscrow
```

```typescript
// amplify/backend/function/hourbankCreateEscrow/src/index.ts
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface CreateEscrowInput {
  requestId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  serviceRate: number;
}

export const handler = async (event: CreateEscrowInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Creating escrow', { requestId: event.requestId, amount: event.amount });

    const escrowId = uuidv4();
    const now = new Date().toISOString();

    // Atomic transaction: Create escrow + Update user balance + Update service request
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.ESCROW_TABLE_NAME,
            Item: {
              id: escrowId,
              requestId: event.requestId,
              fromUserId: event.fromUserId,
              toUserId: event.toUserId,
              amount: event.amount,
              status: 'ESCROWED',
              escrowType: 'SERVICE_REQUEST',
              createdAt: now,
              updatedAt: now
            }
          }
        },
        {
          Update: {
            TableName: process.env.USER_BALANCE_TABLE_NAME,
            Key: { userId: event.fromUserId },
            UpdateExpression: 'SET availableBalance = availableBalance - :amount, escrowedBalance = escrowedBalance + :amount, version = version + :inc, updatedAt = :now',
            ExpressionAttributeValues: {
              ':amount': event.amount,
              ':inc': 1,
              ':now': now
            }
          }
        },
        {
          Update: {
            TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
            Key: { id: event.requestId },
            UpdateExpression: 'SET escrowId = :escrowId, #status = :status, agreedRate = :rate, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':escrowId': escrowId,
              ':status': 'ESCROWED',
              ':rate': event.serviceRate,
              ':now': now
            }
          }
        }
      ]
    }));

    logger.info('Escrow created successfully', { requestId: event.requestId, escrowId });

    return {
      statusCode: 200,
      success: true,
      data: {
        escrowId,
        amount: event.amount,
        status: 'ESCROWED'
      }
    };

  } catch (error) {
    logger.error('Escrow creation failed', error);
    throw error;
  }
};
```

#### Function 3: Notify Provider

```bash
amplify add function
# Name: hourbankNotifyProvider
```

```typescript
// amplify/backend/function/hourbankNotifyProvider/src/index.ts
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface NotifyProviderInput {
  requestId: string;
  providerId: string;
  serviceId: string;
  requesterId: string;
}

export const handler = async (event: NotifyProviderInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Notifying provider', { requestId: event.requestId, providerId: event.providerId });

    // 1. Get service details for provider response timeout
    const service = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_TABLE_NAME,
      Key: { id: event.serviceId }
    }));

    const responseTimeoutHours = service.Item?.responseTimeHours || 24;
    const expiresAt = new Date(Date.now() + (responseTimeoutHours * 60 * 60 * 1000)).toISOString();

    // 2. Create notification for provider
    await docClient.send(new PutCommand({
      TableName: process.env.NOTIFICATION_TABLE_NAME,
      Item: {
        id: `notification-${event.requestId}`,
        userId: event.providerId,
        type: 'SERVICE_REQUEST_RECEIVED',
        title: 'New Service Request',
        message: `You have received a new service request for ${service.Item?.title}`,
        isRead: false,
        relatedId: event.requestId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));

    // 3. Update service request status and expiration
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, expiresAt = :expiresAt, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'AWAITING_RESPONSE',
        ':expiresAt': expiresAt,
        ':now': new Date().toISOString()
      }
    }));

    logger.info('Provider notified successfully', { requestId: event.requestId });

    return {
      statusCode: 200,
      success: true,
      data: {
        notificationSent: true,
        expiresAt,
        providerResponseTimeoutSeconds: responseTimeoutHours * 3600
      }
    };

  } catch (error) {
    logger.error('Provider notification failed', error);
    throw error;
  }
};
```

### Step 2.3: Configure Lambda Environment Variables

For each Lambda function, add environment variables in the function's `amplify/backend/function/{functionName}/function-parameters.json`:

```json
{
  "SERVICE_REQUEST_TABLE_NAME": {
    "Ref": "ServiceRequestTable"
  },
  "USER_BALANCE_TABLE_NAME": {
    "Ref": "UserBalanceTable"
  },
  "SERVICE_TABLE_NAME": {
    "Ref": "ServiceTable"
  },
  "NOTIFICATION_TABLE_NAME": {
    "Ref": "NotificationTable"
  },
  "ESCROW_TABLE_NAME": {
    "Ref": "EscrowTable"
  }
}
```

---

## Day 4: Step Functions State Machine

### Step 3.1: Create Custom Resource Structure

```bash
mkdir -p amplify/backend/custom/stepfunctions
```

### Step 3.2: Create Step Functions CloudFormation Template

Create `amplify/backend/custom/stepfunctions/stepfunctions-template.json`:

```json
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "HourBank Service Request Workflow",
  "Parameters": {
    "env": {
      "Type": "String"
    },
    "ValidateServiceRequestFunctionName": {
      "Type": "String"
    },
    "CreateEscrowFunctionName": {
      "Type": "String"
    },
    "NotifyProviderFunctionName": {
      "Type": "String"
    }
  },
  "Resources": {
    "ServiceRequestWorkflowRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "states.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Policies": [
          {
            "PolicyName": "StepFunctionsExecutionPolicy",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Action": [
                    "lambda:InvokeFunction"
                  ],
                  "Resource": [
                    {
                      "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ValidateServiceRequestFunctionName}"
                    },
                    {
                      "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${CreateEscrowFunctionName}"
                    },
                    {
                      "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${NotifyProviderFunctionName}"
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    "ServiceRequestWorkflow": {
      "Type": "AWS::StepFunctions::StateMachine",
      "Properties": {
        "StateMachineName": {
          "Fn::Sub": "ServiceRequestWorkflow-${env}"
        },
        "RoleArn": {
          "Fn::GetAtt": ["ServiceRequestWorkflowRole", "Arn"]
        },
        "DefinitionString": {
          "Fn::Sub": [
            "{\"Comment\":\"Service Request Workflow\",\"StartAt\":\"ValidateRequest\",\"States\":{\"ValidateRequest\":{\"Type\":\"Task\",\"Resource\":\"${ValidateServiceRequestFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"RejectRequest\",\"ResultPath\":\"$.error\"}],\"Next\":\"CreateEscrow\"},\"CreateEscrow\":{\"Type\":\"Task\",\"Resource\":\"${CreateEscrowFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"RejectRequest\",\"ResultPath\":\"$.error\"}],\"Next\":\"NotifyProvider\"},\"NotifyProvider\":{\"Type\":\"Task\",\"Resource\":\"${NotifyProviderFunctionArn}\",\"Next\":\"WaitForProviderResponse\"},\"WaitForProviderResponse\":{\"Type\":\"Wait\",\"SecondsPath\":\"$.providerResponseTimeoutSeconds\",\"Next\":\"CheckProviderResponse\"},\"CheckProviderResponse\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.providerResponse\",\"StringEquals\":\"ACCEPTED\",\"Next\":\"AcceptRequest\"},{\"Variable\":\"$.providerResponse\",\"StringEquals\":\"REJECTED\",\"Next\":\"RejectRequest\"}],\"Default\":\"TimeoutRequest\"},\"AcceptRequest\":{\"Type\":\"Pass\",\"Result\":{\"status\":\"ACCEPTED\"},\"End\":true},\"RejectRequest\":{\"Type\":\"Pass\",\"Result\":{\"status\":\"REJECTED\"},\"End\":true},\"TimeoutRequest\":{\"Type\":\"Pass\",\"Result\":{\"status\":\"EXPIRED\"},\"End\":true}}",
            {
              "ValidateServiceRequestFunctionArn": {
                "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ValidateServiceRequestFunctionName}"
              },
              "CreateEscrowFunctionArn": {
                "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${CreateEscrowFunctionName}"
              },
              "NotifyProviderFunctionArn": {
                "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${NotifyProviderFunctionName}"
              }
            }
          ]
        }
      }
    }
  },
  "Outputs": {
    "ServiceRequestWorkflowArn": {
      "Description": "Service Request Workflow ARN",
      "Value": {
        "Ref": "ServiceRequestWorkflow"
      }
    }
  }
}
```

### Step 3.3: Create Parameters File

Create `amplify/backend/custom/stepfunctions/parameters.json`:

```json
{
  "ValidateServiceRequestFunctionName": {
    "Ref": "functionhourbankValidateServiceRequestName"
  },
  "CreateEscrowFunctionName": {
    "Ref": "functionhourbankCreateEscrowName"
  },
  "NotifyProviderFunctionName": {
    "Ref": "functionhourbankNotifyProviderName"
  }
}
```

### Step 3.4: Add Custom Resource to Amplify

```bash
amplify add custom
# Resource name: stepfunctions
# CloudFormation template: stepfunctions-template.json
# Parameters: parameters.json
```

---

## Day 5: Frontend Integration

### Step 4.1: Install Dependencies

```bash
npm install @aws-sdk/client-sfn
```

### Step 4.2: Create Step Functions Service

```typescript
// src/app/services/step-functions.service.ts
import { Injectable } from '@angular/core';
import { SFNClient, StartExecutionCommand, DescribeExecutionCommand } from '@aws-sdk/client-sfn';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class StepFunctionsService {
  private sfnClient: SFNClient;
  private workflowArn: string;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const credentials = await Auth.currentCredentials();
    this.sfnClient = new SFNClient({
      region: 'us-east-1', // Your region
      credentials: Auth.essentialCredentials(credentials)
    });
    
    // Get workflow ARN from environment or config
    this.workflowArn = 'arn:aws:states:region:account:stateMachine:ServiceRequestWorkflow-dev';
  }

  async startServiceRequestWorkflow(input: any): Promise<string> {
    const command = new StartExecutionCommand({
      stateMachineArn: this.workflowArn,
      input: JSON.stringify(input),
      name: `service-request-${Date.now()}`
    });

    const result = await this.sfnClient.send(command);
    return result.executionArn!;
  }

  async getExecutionStatus(executionArn: string) {
    const command = new DescribeExecutionCommand({
      executionArn
    });

    return await this.sfnClient.send(command);
  }
}
```

### Step 4.3: Update Service Request Component

```typescript
// src/app/components/service-request/service-request.component.ts
import { Component } from '@angular/core';
import { StepFunctionsService } from '../../services/step-functions.service';
import { API, graphqlOperation } from 'aws-amplify';
import { createServiceRequest, updateServiceRequest } from '../../graphql/mutations';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html'
})
export class ServiceRequestComponent {
  
  constructor(
    private stepFunctionsService: StepFunctionsService
  ) {}

  async submitServiceRequest(requestData: any) {
    try {
      // 1. Create ServiceRequest record
      const serviceRequest = await API.graphql(graphqlOperation(createServiceRequest, {
        input: {
          serviceId: requestData.serviceId,
          requesterId: requestData.requesterId,
          providerId: requestData.providerId,
          status: 'INITIATED',
          estimatedHours: requestData.estimatedHours,
          message: requestData.message,
          negotiationRound: 0
        }
      }));

      const requestId = serviceRequest.data.createServiceRequest.id;

      // 2. Start Step Functions workflow
      const executionArn = await this.stepFunctionsService.startServiceRequestWorkflow({
        requestId,
        ...requestData
      });

      // 3. Update ServiceRequest with execution ARN
      await API.graphql(graphqlOperation(updateServiceRequest, {
        input: {
          id: requestId,
          stepFunctionExecutionArn: executionArn
        }
      }));

      // 4. Monitor workflow progress
      this.monitorWorkflowProgress(executionArn);

      return { requestId, executionArn };

    } catch (error) {
      console.error('Error submitting service request:', error);
      throw error;
    }
  }

  private async monitorWorkflowProgress(executionArn: string) {
    const checkStatus = async () => {
      const status = await this.stepFunctionsService.getExecutionStatus(executionArn);
      
      console.log('Workflow status:', status.status);
      
      if (status.status === 'RUNNING') {
        setTimeout(checkStatus, 5000); // Check again in 5 seconds
      } else {
        console.log('Workflow completed:', status.status);
        // Handle completion or failure
        this.handleWorkflowCompletion(status);
      }
    };
    
    checkStatus();
  }

  private handleWorkflowCompletion(status: any) {
    if (status.status === 'SUCCEEDED') {
      // Show success message
      console.log('Service request submitted successfully');
    } else {
      // Handle failure
      console.error('Service request failed:', status.error);
    }
  }
}
```

### Step 4.4: Deploy Complete Phase 1

```bash
amplify push
```

---

## Phase 1 Testing and Verification

### Unit Testing
```bash
# Test Lambda functions
cd amplify/backend/function/hourbankValidateServiceRequest/src
npm test

cd ../hourbankCreateEscrow/src
npm test

cd ../hourbankNotifyProvider/src
npm test
```

### Integration Testing
1. **Test Step Functions Workflow**:
   - Go to AWS Step Functions console
   - Find `ServiceRequestWorkflow-dev`
   - Start execution with test input
   - Verify all steps complete successfully

2. **Test Frontend Integration**:
   - Submit a service request through the UI
   - Verify workflow starts
   - Check DynamoDB tables for correct data
   - Verify notifications are created

### Verification Checklist
- [ ] GraphQL schema deployed successfully
- [ ] All Lambda functions deployed and working
- [ ] Step Functions state machine created
- [ ] Frontend can start workflows
- [ ] DynamoDB tables populated correctly
- [ ] Notifications created for providers
- [ ] Error handling works correctly
- [ ] Monitoring and logging functional

**Phase 1 Complete**: Service request workflow fully implemented and tested.

---

# Phase 2: Escrow Management Workflow Implementation

## Overview
**Timeline**: Week 2 (5 working days)  
**Priority**: CRITICAL  
**Workflow**: Secure financial transaction processing with escrow management  
**Reference Document**: `TRANSACTION_PROCESSING_LIFECYCLE.md`  
**Dependencies**: Phase 1 must be completed

### Phase 2 Architecture
```
Service Completion → Step Function → Escrow Release → Balance Update → Audit Trail
        ↓               ↓              ↓              ↓             ↓
    Provider/User    EscrowManagement  Financial     DynamoDB    Transaction
    Confirmation      Workflow        Processing    Updates        Logs
```

### Components to Implement
1. **Extended GraphQL Schema** (1 day)
2. **Escrow Management Lambda Functions** (2 days)
3. **Step Functions for Financial Workflows** (1 day)
4. **Balance Management & Reconciliation** (1 day)

---

## Day 6: Extended GraphQL Schema for Financial Operations

### Step 2.1: Add Escrow and Transaction Models

Add to your existing `schema.graphql`:

```graphql
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

# Custom mutations for financial operations
type Mutation {
  releaseEscrow(input: ReleaseEscrowInput!): EscrowReleaseResponse
  cancelEscrow(input: CancelEscrowInput!): EscrowCancelResponse
  processDirectTransfer(input: DirectTransferInput!): TransferResponse
}

input ReleaseEscrowInput {
  escrowId: ID!
  requestId: ID!
  releaseReason: String!
}

type EscrowReleaseResponse {
  escrow: Escrow!
  executionArn: String!
  status: String!
}

input CancelEscrowInput {
  escrowId: ID!
  cancellationReason: String!
}

type EscrowCancelResponse {
  escrow: Escrow!
  refundAmount: Float!
  status: String!
}

input DirectTransferInput {
  fromUserId: ID
  toUserId: ID!
  amount: Float!
  transferType: TransactionType!
  description: String!
}

type TransferResponse {
  transactionLog: TransactionLog!
  success: Boolean!
}
```

### Step 2.2: Deploy Schema Extensions

```bash
amplify push
```

---

## Day 7-8: Escrow Management Lambda Functions

### Step 2.3: Create Escrow Release Function

```bash
amplify add function
# Name: hourbankReleaseEscrow
```

```typescript
// amplify/backend/function/hourbankReleaseEscrow/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface ReleaseEscrowInput {
  escrowId: string;
  requestId: string;
  releaseReason: string;
}

export const handler = async (event: ReleaseEscrowInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Starting escrow release', { escrowId: event.escrowId });

    // 1. Get escrow details
    const escrowResult = await docClient.send(new GetCommand({
      TableName: process.env.ESCROW_TABLE_NAME,
      Key: { id: event.escrowId }
    }));

    if (!escrowResult.Item || escrowResult.Item.status !== 'ESCROWED') {
      return {
        statusCode: 400,
        success: false,
        error: 'INVALID_ESCROW_STATUS',
        data: { currentStatus: escrowResult.Item?.status }
      };
    }

    const escrow = escrowResult.Item;
    const transactionId = uuidv4();
    const now = new Date().toISOString();

    // 2. Atomic transaction: Release escrow + Update balances + Create logs
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Update escrow status
        {
          Update: {
            TableName: process.env.ESCROW_TABLE_NAME,
            Key: { id: event.escrowId },
            UpdateExpression: 'SET #status = :status, releasedAt = :now, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'RELEASED',
              ':now': now
            },
            ConditionExpression: '#status = :currentStatus',
            ExpressionAttributeValues: {
              ...ExpressionAttributeValues,
              ':currentStatus': 'ESCROWED'
            }
          }
        },
        // Update provider balance (add funds)
        {
          Update: {
            TableName: process.env.USER_BALANCE_TABLE_NAME,
            Key: { userId: escrow.toUserId },
            UpdateExpression: 'SET totalBalance = totalBalance + :amount, availableBalance = availableBalance + :amount, version = version + :inc, updatedAt = :now',
            ExpressionAttributeValues: {
              ':amount': escrow.amount,
              ':inc': 1,
              ':now': now
            }
          }
        },
        // Update requester balance (reduce escrowed amount)
        {
          Update: {
            TableName: process.env.USER_BALANCE_TABLE_NAME,
            Key: { userId: escrow.fromUserId },
            UpdateExpression: 'SET escrowedBalance = escrowedBalance - :amount, version = version + :inc, updatedAt = :now',
            ExpressionAttributeValues: {
              ':amount': escrow.amount,
              ':inc': 1,
              ':now': now
            }
          }
        },
        // Create transaction log for provider (credit)
        {
          Put: {
            TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
            Item: {
              id: `${transactionId}-credit`,
              transactionId,
              userId: escrow.toUserId,
              transactionType: 'TRANSFER',
              amount: escrow.amount,
              balanceBefore: 0, // Will be updated by reconciliation
              balanceAfter: 0,  // Will be updated by reconciliation
              description: `Payment received for service request ${event.requestId}`,
              relatedEntityId: event.requestId,
              stepFunctionExecutionArn: process.env.AWS_STEP_FUNCTIONS_EXECUTION_ARN,
              createdAt: now
            }
          }
        },
        // Create transaction log for requester (escrow release)
        {
          Put: {
            TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
            Item: {
              id: `${transactionId}-debit`,
              transactionId,
              userId: escrow.fromUserId,
              transactionType: 'ESCROW',
              amount: -escrow.amount,
              balanceBefore: 0, // Will be updated by reconciliation
              balanceAfter: 0,  // Will be updated by reconciliation
              description: `Payment for service request ${event.requestId}`,
              relatedEntityId: event.requestId,
              stepFunctionExecutionArn: process.env.AWS_STEP_FUNCTIONS_EXECUTION_ARN,
              createdAt: now
            }
          }
        }
      ]
    }));

    logger.info('Escrow released successfully', { 
      escrowId: event.escrowId, 
      amount: escrow.amount,
      toUserId: escrow.toUserId 
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        escrowId: event.escrowId,
        amount: escrow.amount,
        releasedTo: escrow.toUserId,
        transactionId,
        status: 'RELEASED'
      }
    };

  } catch (error) {
    logger.error('Escrow release failed', error);
    throw error;
  }
};
```

### Step 2.4: Create Escrow Cancellation Function

```bash
amplify add function
# Name: hourbankCancelEscrow
```

```typescript
// amplify/backend/function/hourbankCancelEscrow/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface CancelEscrowInput {
  escrowId: string;
  cancellationReason: string;
}

export const handler = async (event: CancelEscrowInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Starting escrow cancellation', { escrowId: event.escrowId });

    // 1. Get escrow details
    const escrowResult = await docClient.send(new GetCommand({
      TableName: process.env.ESCROW_TABLE_NAME,
      Key: { id: event.escrowId }
    }));

    if (!escrowResult.Item || escrowResult.Item.status !== 'ESCROWED') {
      return {
        statusCode: 400,
        success: false,
        error: 'INVALID_ESCROW_STATUS'
      };
    }

    const escrow = escrowResult.Item;
    const transactionId = uuidv4();
    const now = new Date().toISOString();

    // 2. Atomic transaction: Cancel escrow + Refund to original user
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Update escrow status
        {
          Update: {
            TableName: process.env.ESCROW_TABLE_NAME,
            Key: { id: event.escrowId },
            UpdateExpression: 'SET #status = :status, cancelledAt = :now, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'CANCELLED',
              ':now': now
            }
          }
        },
        // Refund to original user
        {
          Update: {
            TableName: process.env.USER_BALANCE_TABLE_NAME,
            Key: { userId: escrow.fromUserId },
            UpdateExpression: 'SET availableBalance = availableBalance + :amount, escrowedBalance = escrowedBalance - :amount, version = version + :inc, updatedAt = :now',
            ExpressionAttributeValues: {
              ':amount': escrow.amount,
              ':inc': 1,
              ':now': now
            }
          }
        },
        // Create refund transaction log
        {
          Put: {
            TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
            Item: {
              id: `${transactionId}-refund`,
              transactionId,
              userId: escrow.fromUserId,
              transactionType: 'REFUND',
              amount: escrow.amount,
              balanceBefore: 0,
              balanceAfter: 0,
              description: `Refund for cancelled service request - ${event.cancellationReason}`,
              relatedEntityId: escrow.requestId,
              stepFunctionExecutionArn: process.env.AWS_STEP_FUNCTIONS_EXECUTION_ARN,
              createdAt: now
            }
          }
        }
      ]
    }));

    logger.info('Escrow cancelled successfully', { 
      escrowId: event.escrowId, 
      refundAmount: escrow.amount 
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        escrowId: event.escrowId,
        refundAmount: escrow.amount,
        refundedTo: escrow.fromUserId,
        status: 'CANCELLED'
      }
    };

  } catch (error) {
    logger.error('Escrow cancellation failed', error);
    throw error;
  }
};
```

### Step 2.5: Create Balance Reconciliation Function

```bash
amplify add function
# Name: hourbankReconcileBalances
```

```typescript
// amplify/backend/function/hourbankReconcileBalances/src/index.ts
import { ScanCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger } from '/opt/nodejs/lib';

interface ReconciliationResult {
  userId: string;
  expectedBalance: number;
  actualBalance: number;
  discrepancy: number;
  status: 'MATCH' | 'DISCREPANCY';
}

export const handler = async (event: any) => {
  try {
    logger.info('Starting balance reconciliation');

    const results: ReconciliationResult[] = [];
    
    // 1. Get all user balances
    const balancesResult = await docClient.send(new ScanCommand({
      TableName: process.env.USER_BALANCE_TABLE_NAME
    }));

    // 2. For each user, calculate expected balance from transaction logs
    for (const userBalance of balancesResult.Items || []) {
      const userId = userBalance.userId;
      
      // Get all transaction logs for user
      const transactionsResult = await docClient.send(new QueryCommand({
        TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
        IndexName: 'byUserId',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));

      // Calculate expected balance
      let expectedBalance = 0;
      const transactions = transactionsResult.Items || [];
      
      for (const transaction of transactions) {
        expectedBalance += transaction.amount;
      }

      // Add welcome bonus if no transactions (new user)
      if (transactions.length === 0) {
        expectedBalance = 10; // Welcome bonus
      }

      const actualBalance = userBalance.totalBalance;
      const discrepancy = Math.abs(expectedBalance - actualBalance);
      
      const result: ReconciliationResult = {
        userId,
        expectedBalance,
        actualBalance,
        discrepancy,
        status: discrepancy < 0.01 ? 'MATCH' : 'DISCREPANCY'
      };

      results.push(result);

      // Update transaction logs with correct balance information
      for (const transaction of transactions) {
        if (transaction.balanceBefore === 0 && transaction.balanceAfter === 0) {
          // Update with calculated balances
          await docClient.send(new UpdateCommand({
            TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
            Key: { id: transaction.id },
            UpdateExpression: 'SET balanceBefore = :before, balanceAfter = :after',
            ExpressionAttributeValues: {
              ':before': actualBalance - transaction.amount,
              ':after': actualBalance
            }
          }));
        }
      }
    }

    // 3. Log discrepancies
    const discrepancies = results.filter(r => r.status === 'DISCREPANCY');
    if (discrepancies.length > 0) {
      logger.error('Balance discrepancies found', { discrepancies });
    }

    logger.info('Balance reconciliation completed', { 
      totalUsers: results.length,
      discrepancies: discrepancies.length 
    });

    return {
      statusCode: 200,
      totalUsers: results.length,
      discrepancies: discrepancies.length,
      results: discrepancies // Only return discrepancies for review
    };

  } catch (error) {
    logger.error('Balance reconciliation failed', error);
    throw error;
  }
};
```

---

## Day 9: Step Functions for Financial Workflows

### Step 2.6: Create Escrow Management Workflow

Update `amplify/backend/custom/stepfunctions/stepfunctions-template.json` to add:

```json
{
  "EscrowManagementWorkflow": {
    "Type": "AWS::StepFunctions::StateMachine",
    "Properties": {
      "StateMachineName": {
        "Fn::Sub": "EscrowManagementWorkflow-${env}"
      },
      "RoleArn": {
        "Fn::GetAtt": ["ServiceRequestWorkflowRole", "Arn"]
      },
      "DefinitionString": {
        "Fn::Sub": [
          "{\"Comment\":\"Escrow Management Workflow\",\"StartAt\":\"ValidateEscrowRelease\",\"States\":{\"ValidateEscrowRelease\":{\"Type\":\"Task\",\"Resource\":\"${ValidateEscrowReleaseFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"HandleEscrowError\",\"ResultPath\":\"$.error\"}],\"Next\":\"ProcessEscrowRelease\"},\"ProcessEscrowRelease\":{\"Type\":\"Task\",\"Resource\":\"${ReleaseEscrowFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":5,\"MaxAttempts\":5,\"BackoffRate\":2.0}],\"Catch\":[{\"ErrorEquals\":[\"States.ALL\"],\"Next\":\"HandleEscrowError\",\"ResultPath\":\"$.error\"}],\"Next\":\"ReconcileBalances\"},\"ReconcileBalances\":{\"Type\":\"Task\",\"Resource\":\"${ReconcileBalancesFunctionArn}\",\"End\":true},\"HandleEscrowError\":{\"Type\":\"Pass\",\"Result\":{\"status\":\"FAILED\"},\"End\":true}}",
          {
            "ValidateEscrowReleaseFunctionArn": {
              "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ValidateEscrowReleaseFunctionName}"
            },
            "ReleaseEscrowFunctionArn": {
              "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ReleaseEscrowFunctionName}"
            },
            "ReconcileBalancesFunctionArn": {
              "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ReconcileBalancesFunctionName}"
            }
          }
        ]
      }
    }
  },
  "EscrowCancellationWorkflow": {
    "Type": "AWS::StepFunctions::StateMachine",
    "Properties": {
      "StateMachineName": {
        "Fn::Sub": "EscrowCancellationWorkflow-${env}"
      },
      "RoleArn": {
        "Fn::GetAtt": ["ServiceRequestWorkflowRole", "Arn"]
      },
      "DefinitionString": {
        "Fn::Sub": [
          "{\"Comment\":\"Escrow Cancellation Workflow\",\"StartAt\":\"ValidateEscrowCancellation\",\"States\":{\"ValidateEscrowCancellation\":{\"Type\":\"Task\",\"Resource\":\"${ValidateEscrowCancellationFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":2,\"MaxAttempts\":3,\"BackoffRate\":2.0}],\"Next\":\"ProcessEscrowCancellation\"},\"ProcessEscrowCancellation\":{\"Type\":\"Task\",\"Resource\":\"${CancelEscrowFunctionArn}\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\"],\"IntervalSeconds\":5,\"MaxAttempts\":5,\"BackoffRate\":2.0}],\"End\":true}}",
          {
            "ValidateEscrowCancellationFunctionArn": {
              "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${ValidateEscrowCancellationFunctionName}"
            },
            "CancelEscrowFunctionArn": {
              "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${CancelEscrowFunctionName}"
            }
          }
        ]
      }
    }
  }
}
```

---

## Day 10: Balance Management & Integration

### Step 2.7: Create Direct Transfer Function

```bash
amplify add function
# Name: hourbankProcessDirectTransfer
```

```typescript
// amplify/backend/function/hourbankProcessDirectTransfer/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface DirectTransferInput {
  fromUserId?: string; // Optional for system transfers
  toUserId: string;
  amount: number;
  transferType: 'WELCOME_BONUS' | 'REFUND' | 'ADMIN_ADJUSTMENT' | 'DISPUTE_RESOLUTION';
  description: string;
}

export const handler = async (event: DirectTransferInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Processing direct transfer', { 
      fromUserId: event.fromUserId, 
      toUserId: event.toUserId, 
      amount: event.amount,
      type: event.transferType 
    });

    const transactionId = uuidv4();
    const now = new Date().toISOString();
    const transactItems = [];

    // 1. Handle recipient balance update
    transactItems.push({
      Update: {
        TableName: process.env.USER_BALANCE_TABLE_NAME,
        Key: { userId: event.toUserId },
        UpdateExpression: 'SET totalBalance = totalBalance + :amount, availableBalance = availableBalance + :amount, version = version + :inc, updatedAt = :now',
        ExpressionAttributeValues: {
          ':amount': event.amount,
          ':inc': 1,
          ':now': now
        }
      }
    });

    // 2. Handle sender balance update (if not system transfer)
    if (event.fromUserId) {
      transactItems.push({
        Update: {
          TableName: process.env.USER_BALANCE_TABLE_NAME,
          Key: { userId: event.fromUserId },
          UpdateExpression: 'SET totalBalance = totalBalance - :amount, availableBalance = availableBalance - :amount, version = version + :inc, updatedAt = :now',
          ExpressionAttributeValues: {
            ':amount': event.amount,
            ':inc': 1,
            ':now': now
          },
          ConditionExpression: 'availableBalance >= :amount' // Ensure sufficient balance
        }
      });

      // Create transaction log for sender
      transactItems.push({
        Put: {
          TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
          Item: {
            id: `${transactionId}-debit`,
            transactionId,
            userId: event.fromUserId,
            transactionType: event.transferType,
            amount: -event.amount,
            balanceBefore: 0,
            balanceAfter: 0,
            description: event.description,
            relatedEntityId: event.toUserId,
            createdAt: now
          }
        }
      });
    }

    // 3. Create transaction log for recipient
    transactItems.push({
      Put: {
        TableName: process.env.TRANSACTION_LOG_TABLE_NAME,
        Item: {
          id: `${transactionId}-credit`,
          transactionId,
          userId: event.toUserId,
          transactionType: event.transferType,
          amount: event.amount,
          balanceBefore: 0,
          balanceAfter: 0,
          description: event.description,
          relatedEntityId: event.fromUserId || 'SYSTEM',
          createdAt: now
        }
      }
    });

    // 4. Execute atomic transaction
    await docClient.send(new TransactWriteCommand({
      TransactItems: transactItems
    }));

    logger.info('Direct transfer completed successfully', { 
      transactionId, 
      amount: event.amount 
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        transactionId,
        amount: event.amount,
        fromUserId: event.fromUserId || 'SYSTEM',
        toUserId: event.toUserId,
        transferType: event.transferType
      }
    };

  } catch (error) {
    logger.error('Direct transfer failed', error);
    throw error;
  }
};
```

### Step 2.8: Update Frontend Services

```typescript
// src/app/services/financial.service.ts
import { Injectable } from '@angular/core';
import { StepFunctionsService } from './step-functions.service';
import { API, graphqlOperation } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  constructor(private stepFunctionsService: StepFunctionsService) {}

  async releaseEscrow(escrowId: string, requestId: string, reason: string) {
    try {
      const executionArn = await this.stepFunctionsService.startEscrowManagementWorkflow({
        escrowId,
        requestId,
        releaseReason: reason
      });

      return { executionArn, status: 'PROCESSING' };
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  async cancelEscrow(escrowId: string, reason: string) {
    try {
      const executionArn = await this.stepFunctionsService.startEscrowCancellationWorkflow({
        escrowId,
        cancellationReason: reason
      });

      return { executionArn, status: 'PROCESSING' };
    } catch (error) {
      console.error('Error cancelling escrow:', error);
      throw error;
    }
  }

  async processDirectTransfer(transferData: any) {
    try {
      // Call Lambda function directly for simple transfers
      const result = await API.graphql(graphqlOperation(`
        mutation ProcessDirectTransfer($input: DirectTransferInput!) {
          processDirectTransfer(input: $input) {
            transactionLog {
              id
              amount
              transactionType
              description
            }
            success
          }
        }
      `, { input: transferData }));

      return result.data.processDirectTransfer;
    } catch (error) {
      console.error('Error processing direct transfer:', error);
      throw error;
    }
  }
}
```

### Step 2.9: Deploy Phase 2

```bash
amplify push
```

---

## Phase 2 Testing and Verification

### Financial Transaction Testing
1. **Test Escrow Release**:
   - Complete a service request from Phase 1
   - Trigger escrow release workflow
   - Verify balances updated correctly
   - Check transaction logs created

2. **Test Escrow Cancellation**:
   - Create and cancel a service request
   - Verify refund processed correctly
   - Check balance reconciliation

3. **Test Direct Transfers**:
   - Process welcome bonus for new user
   - Test admin adjustments
   - Verify transaction logging

### Verification Checklist
- [ ] Escrow management workflows deployed
- [ ] Financial Lambda functions working
- [ ] Balance updates are atomic and consistent
- [ ] Transaction logs created for all operations
- [ ] Reconciliation function identifies discrepancies
- [ ] Error handling prevents financial inconsistencies
- [ ] Frontend integration functional

**Phase 2 Complete**: Secure financial transaction processing implemented.

---

# Phase 3: Transaction Processing Workflow Implementation

## Overview
**Timeline**: Week 3 (5 working days)  
**Priority**: HIGH  
**Workflow**: Complete payment processing and service completion flow  
**Dependencies**: Phases 1 and 2 must be completed

### Components to Implement
1. **Service Completion Workflow** (2 days)
2. **Payment Processing Integration** (2 days)
3. **Rating System Integration** (1 day)

---

## Day 11-12: Service Completion Workflow

### Step 3.1: Create Service Completion Functions

```bash
amplify add function
# Name: hourbankProcessServiceCompletion
```

```typescript
// amplify/backend/function/hourbankProcessServiceCompletion/src/index.ts
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface ServiceCompletionInput {
  requestId: string;
  completedBy: 'PROVIDER' | 'REQUESTER';
  userId: string;
  completionNotes?: string;
}

export const handler = async (event: ServiceCompletionInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Processing service completion', { requestId: event.requestId });

    // Get current request status
    const request = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId }
    }));

    if (!request.Item) {
      return { statusCode: 404, success: false, error: 'REQUEST_NOT_FOUND' };
    }

    const currentStatus = request.Item.status;
    let newStatus: string;

    // Determine next status based on current state and actor
    if (currentStatus === 'IN_PROGRESS' && event.completedBy === 'PROVIDER') {
      newStatus = 'PENDING_COMPLETION_CONFIRMATION';
    } else if (currentStatus === 'PENDING_COMPLETION_CONFIRMATION' && event.completedBy === 'REQUESTER') {
      newStatus = 'COMPLETED';
    } else {
      return { 
        statusCode: 400, 
        success: false, 
        error: 'INVALID_COMPLETION_STATE',
        data: { currentStatus, completedBy: event.completedBy }
      };
    }

    // Update request status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':now': new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      success: true,
      data: {
        requestId: event.requestId,
        previousStatus: currentStatus,
        newStatus,
        readyForPayment: newStatus === 'COMPLETED'
      }
    };

  } catch (error) {
    logger.error('Service completion processing failed', error);
    throw error;
  }
};
```

---

## Day 13-14: Payment Processing Integration

### Step 3.2: Create Payment Processing Workflow

```bash
amplify add function
# Name: hourbankProcessPayment
```

```typescript
// amplify/backend/function/hourbankProcessPayment/src/index.ts
import { StepFunctionsService } from './step-functions-client';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface PaymentProcessingInput {
  requestId: string;
  escrowId: string;
  amount: number;
  providerId: string;
  requesterId: string;
}

export const handler = async (event: PaymentProcessingInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Starting payment processing', { requestId: event.requestId });

    // Start escrow release workflow
    const stepFunctions = new StepFunctionsService();
    const executionArn = await stepFunctions.startExecution(
      process.env.ESCROW_MANAGEMENT_WORKFLOW_ARN,
      {
        escrowId: event.escrowId,
        requestId: event.requestId,
        releaseReason: 'SERVICE_COMPLETED'
      }
    );

    // Update service request with payment processing status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, paymentExecutionArn = :arn, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'PROCESSING_PAYMENT',
        ':arn': executionArn,
        ':now': new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      success: true,
      data: {
        requestId: event.requestId,
        paymentExecutionArn: executionArn,
        status: 'PROCESSING_PAYMENT'
      }
    };

  } catch (error) {
    logger.error('Payment processing failed', error);
    throw error;
  }
};
```

---

## Day 15: Rating System Integration

### Step 3.3: Create Rating Enablement Function

```bash
amplify add function
# Name: hourbankEnableRating
```

```typescript
// amplify/backend/function/hourbankEnableRating/src/index.ts
import { UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface EnableRatingInput {
  requestId: string;
  providerId: string;
  requesterId: string;
}

export const handler = async (event: EnableRatingInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Enabling rating system', { requestId: event.requestId });

    const now = new Date().toISOString();

    // Update service request to PAID status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, paidAt = :now, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'PAID',
        ':now': now
      }
    }));

    // Create notification for requester to rate the service
    await docClient.send(new PutCommand({
      TableName: process.env.NOTIFICATION_TABLE_NAME,
      Item: {
        id: `rating-${event.requestId}`,
        userId: event.requesterId,
        type: 'RATING_ENABLED',
        title: 'Rate Your Service',
        message: 'Please rate the service you received',
        isRead: false,
        relatedId: event.requestId,
        createdAt: now,
        updatedAt: now
      }
    }));

    return {
      statusCode: 200,
      success: true,
      data: {
        requestId: event.requestId,
        status: 'PAID',
        ratingEnabled: true
      }
    };

  } catch (error) {
    logger.error('Rating enablement failed', error);
    throw error;
  }
};
```

---

# Phase 4: Dispute Resolution Workflow Implementation

## Overview
**Timeline**: Week 4 (5 working days)  
**Priority**: MODERATE  
**Workflow**: Dispute handling and admin resolution system  
**Dependencies**: Phases 1, 2, and 3 must be completed

### Components to Implement
1. **Dispute Initiation** (2 days)
2. **Admin Resolution Workflow** (2 days)
3. **Resolution Execution** (1 day)

---

## Day 16-17: Dispute Initiation

### Step 4.1: Add Dispute Schema

Add to `schema.graphql`:

```graphql
type Dispute @model @auth(rules: [
  { allow: owner, ownerField: "raisedBy" }
  { allow: groups, groups: ["admin"] }
]) {
  id: ID!
  requestId: ID! @index(name: "byRequestId")
  transactionId: ID @index(name: "byTransactionId")
  raisedBy: ID! @index(name: "byRaisedBy")
  againstUserId: ID! @index(name: "byAgainstUserId")
  disputeType: DisputeType! @index(name: "byDisputeType")
  status: DisputeStatus! @index(name: "byStatus")
  description: String!
  evidence: AWSJSON
  adminId: ID @index(name: "byAdminId")
  resolution: String
  stepFunctionExecutionArn: String
  
  # Relationships
  request: ServiceRequest @belongsTo(fields: ["requestId"])
  raisedByUser: User @belongsTo(fields: ["raisedBy"])
  againstUser: User @belongsTo(fields: ["againstUserId"])
  admin: User @belongsTo(fields: ["adminId"])
  
  createdAt: AWSDateTime!
  resolvedAt: AWSDateTime
  updatedAt: AWSDateTime!
}

enum DisputeType {
  SERVICE_QUALITY
  PAYMENT_ISSUE
  NO_SHOW
  COMMUNICATION
  OTHER
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  DISMISSED
}
```

### Step 4.2: Create Dispute Initiation Function

```bash
amplify add function
# Name: hourbankInitiateDispute
```

```typescript
// amplify/backend/function/hourbankInitiateDispute/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface InitiateDisputeInput {
  requestId: string;
  raisedBy: string;
  disputeType: string;
  description: string;
  evidence?: any;
}

export const handler = async (event: InitiateDisputeInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Initiating dispute', { requestId: event.requestId });

    // Get service request details
    const request = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId }
    }));

    if (!request.Item) {
      return { statusCode: 404, success: false, error: 'REQUEST_NOT_FOUND' };
    }

    const disputeId = uuidv4();
    const now = new Date().toISOString();
    const againstUserId = event.raisedBy === request.Item.requesterId 
      ? request.Item.providerId 
      : request.Item.requesterId;

    // Atomic transaction: Create dispute + Update request status + Freeze escrow
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Create dispute record
        {
          Put: {
            TableName: process.env.DISPUTE_TABLE_NAME,
            Item: {
              id: disputeId,
              requestId: event.requestId,
              raisedBy: event.raisedBy,
              againstUserId,
              disputeType: event.disputeType,
              status: 'OPEN',
              description: event.description,
              evidence: event.evidence || {},
              createdAt: now,
              updatedAt: now
            }
          }
        },
        // Update service request status
        {
          Update: {
            TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
            Key: { id: event.requestId },
            UpdateExpression: 'SET #status = :status, disputeId = :disputeId, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'DISPUTED',
              ':disputeId': disputeId,
              ':now': now
            }
          }
        },
        // Freeze escrow if exists
        {
          Update: {
            TableName: process.env.ESCROW_TABLE_NAME,
            Key: { id: request.Item.escrowId },
            UpdateExpression: 'SET #status = :status, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'FROZEN',
              ':now': now
            },
            ConditionExpression: 'attribute_exists(id)'
          }
        }
      ]
    }));

    return {
      statusCode: 200,
      success: true,
      data: {
        disputeId,
        status: 'OPEN',
        requestFrozen: true
      }
    };

  } catch (error) {
    logger.error('Dispute initiation failed', error);
    throw error;
  }
};
```

---

## Day 18-20: Complete Implementation and Deployment

### Step 4.3: Final Deployment and Testing

```bash
# Deploy all changes
amplify push

# Run comprehensive tests
npm run test:integration

# Deploy to staging
amplify env checkout staging
amplify push

# Deploy to production
amplify env checkout prod
amplify push
```

---

# Deployment and Maintenance

## Production Deployment Checklist

### Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Performance testing completed
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Monitoring and alerting configured

### Deployment Process
1. **Staging Deployment**
   ```bash
   amplify env checkout staging
   amplify push
   ```

2. **Production Deployment**
   ```bash
   amplify env checkout prod
   amplify push
   ```

3. **Post-Deployment Verification**
   - Verify all Step Functions deployed
   - Test critical workflows
   - Check CloudWatch metrics
   - Validate database connections

### Rollback Procedure
```bash
# If issues arise, rollback to previous version
amplify env checkout prod
git checkout <previous-commit>
amplify push --yes
```

---

## Monitoring and Maintenance

### CloudWatch Dashboards
Create dashboards for:
- **Workflow Performance**: Execution times, success rates
- **Financial Metrics**: Transaction volumes, balance accuracy
- **Error Tracking**: Failed executions, error rates
- **Business Metrics**: Service completion rates, user activity

### Alerting Setup
```json
{
  "Alarms": [
    {
      "AlarmName": "WorkflowFailureRate",
      "MetricName": "ExecutionsFailed",
      "Threshold": 5,
      "ComparisonOperator": "GreaterThanThreshold"
    },
    {
      "AlarmName": "BalanceDiscrepancies",
      "MetricName": "ReconciliationErrors",
      "Threshold": 1,
      "ComparisonOperator": "GreaterThanThreshold"
    }
  ]
}
```

### Maintenance Tasks
- **Daily**: Monitor workflow executions and error rates
- **Weekly**: Review balance reconciliation reports
- **Monthly**: Performance optimization and cost analysis
- **Quarterly**: Security review and dependency updates

---

## Success Metrics

### Technical KPIs
- **Workflow Success Rate**: >99.5%
- **Average Execution Time**: <30 seconds
- **Error Rate**: <0.5%
- **System Availability**: >99.9%

### Business KPIs
- **Service Request Completion**: >95%
- **Payment Processing Success**: >99.9%
- **Dispute Resolution Time**: <48 hours average
- **User Satisfaction**: >4.5/5 rating

### Cost Optimization
- **Step Functions Cost**: <$50/month
- **Lambda Execution Cost**: <$100/month
- **DynamoDB Cost**: <$200/month
- **Total Infrastructure**: <$500/month

---

## Team Handover

### Documentation Deliverables
- [ ] Complete implementation guide (this document)
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Monitoring runbook
- [ ] Disaster recovery procedures

### Knowledge Transfer
- [ ] Architecture overview session
- [ ] Code walkthrough
- [ ] Deployment process training
- [ ] Monitoring and alerting training
- [ ] Troubleshooting workshop

### Support Structure
- **Level 1**: Basic monitoring and alerting response
- **Level 2**: Workflow debugging and issue resolution
- **Level 3**: Architecture changes and optimization

---

## Conclusion

This implementation guide provides a comprehensive, step-by-step approach to building the HourBank event-driven backend using AWS Step Functions and Amplify. The phased approach ensures:

1. **Systematic Development**: One workflow at a time
2. **Risk Mitigation**: Thorough testing at each phase
3. **Scalable Architecture**: Built for growth and reliability
4. **Maintainable Code**: Clear structure and documentation
5. **Production Ready**: Comprehensive monitoring and alerting

The development team now has everything needed to implement a robust, scalable, and maintainable event-driven backend that will support HourBank's growth and success.

**Total Implementation Timeline**: 4 weeks
**Expected ROI**: 814x - 1,163x return on Step Functions investment
**Maintenance Effort**: <5 hours/week after initial deployment
