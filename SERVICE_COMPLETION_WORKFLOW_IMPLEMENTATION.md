# Service Completion Workflow Implementation Guide
## Complete Implementation for HourBank Application

**Workflow**: Service completion with mutual confirmation and payment processing  
**Reference Documents**: SERVICE_REQUEST_LIFECYCLE.md, TRANSACTION_PROCESSING_LIFECYCLE.md  
**Integration**: Step Functions + Lambda + Amplify GraphQL + Angular Frontend  

---

## Workflow Overview

### Service Completion Process Flow
```
Service In Progress → Provider Marks Complete → Requester Confirms → Payment Processing → Rating Enabled
       ↓                      ↓                      ↓                    ↓                ↓
   IN_PROGRESS        PENDING_COMPLETION      COMPLETED         PROCESSING_PAYMENT      PAID
                      _CONFIRMATION                                                      ↓
                                                                                   RATING_ENABLED
```

### Actors and Responsibilities
- **Provider**: Marks service as completed, provides work summary
- **Requester**: Confirms service completion and satisfaction
- **Step Functions**: Orchestrates the completion workflow
- **Lambda Functions**: Execute individual completion steps
- **System**: Processes payment and enables rating

### Key Features
- **Mutual Confirmation**: Both parties must confirm completion
- **Work Documentation**: Provider can add completion notes and deliverables
- **Automatic Payment**: Payment processed upon mutual confirmation
- **Rating System**: Automatically enabled after payment
- **Timeout Handling**: Auto-confirmation if requester doesn't respond within 48 hours

---

## Architecture Components

### Step Functions Workflow
```
ServiceCompletionWorkflow:
├── ProviderMarksComplete
├── WaitForRequesterConfirmation (48-hour timeout)
├── ProcessPayment
├── EnableRating
└── CompleteWorkflow
```

### Lambda Functions Required
1. **processProviderCompletion** - Handle provider completion marking
2. **processRequesterConfirmation** - Handle requester confirmation
3. **processCompletionPayment** - Coordinate payment processing
4. **enableRatingSystem** - Activate rating functionality
5. **handleCompletionTimeout** - Handle auto-confirmation scenarios

### Database Updates
- **ServiceRequest**: Status transitions and completion tracking
- **Escrow**: Release coordination
- **TransactionLog**: Payment audit trail
- **Notification**: User notifications at each step

---

## Implementation Steps

### Step 1: GraphQL Schema Extensions

Add to your existing `schema.graphql`:

```graphql
# Service Completion Types
type ServiceCompletion @model @auth(rules: [
  { allow: owner, ownerField: "providerId" }
  { allow: owner, ownerField: "requesterId" }
]) {
  id: ID!
  requestId: ID! @index(name: "byRequestId")
  providerId: ID! @index(name: "byProviderId")
  requesterId: ID! @index(name: "byRequesterId")
  
  # Completion Details
  providerCompletedAt: AWSDateTime
  requesterConfirmedAt: AWSDateTime
  workSummary: String
  deliverables: [String]
  providerNotes: String
  requesterNotes: String
  satisfactionLevel: SatisfactionLevel
  
  # Workflow Tracking
  status: CompletionStatus! @index(name: "byStatus")
  stepFunctionExecutionArn: String
  paymentProcessedAt: AWSDateTime
  ratingEnabledAt: AWSDateTime
  
  # Relationships
  request: ServiceRequest @belongsTo(fields: ["requestId"])
  provider: User @belongsTo(fields: ["providerId"])
  requester: User @belongsTo(fields: ["requesterId"])
  
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

enum CompletionStatus {
  PROVIDER_COMPLETED
  PENDING_REQUESTER_CONFIRMATION
  CONFIRMED
  PAYMENT_PROCESSING
  COMPLETED
  AUTO_CONFIRMED
}

enum SatisfactionLevel {
  VERY_SATISFIED
  SATISFIED
  NEUTRAL
  DISSATISFIED
  VERY_DISSATISFIED
}

# Custom Mutations
type Mutation {
  markServiceComplete(input: MarkServiceCompleteInput!): ServiceCompletionResponse
  confirmServiceCompletion(input: ConfirmServiceCompletionInput!): ServiceCompletionResponse
}

input MarkServiceCompleteInput {
  requestId: ID!
  workSummary: String!
  deliverables: [String]
  providerNotes: String
}

input ConfirmServiceCompletionInput {
  requestId: ID!
  satisfactionLevel: SatisfactionLevel!
  requesterNotes: String
}

type ServiceCompletionResponse {
  serviceCompletion: ServiceCompletion!
  executionArn: String
  nextStep: String!
  success: Boolean!
}

# Update ServiceRequest to include completion tracking
type ServiceRequest @model @auth(rules: [
  { allow: owner, ownerField: "requesterId" }
  { allow: owner, ownerField: "providerId" }
]) {
  # ... existing fields ...
  
  # Completion Tracking
  completionId: ID @index(name: "byCompletionId")
  completionWorkflowArn: String
  
  # Relationships
  completion: ServiceCompletion @belongsTo(fields: ["completionId"])
  
  # ... rest of existing fields ...
}
```

### Step 2: Lambda Functions Implementation

#### Function 1: Process Provider Completion

```bash
amplify add function
# Name: hourbankProcessProviderCompletion
# Runtime: NodeJS
# Template: Hello World
```

```typescript
// amplify/backend/function/hourbankProcessProviderCompletion/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';
import { v4 as uuidv4 } from 'uuid';

interface ProviderCompletionInput {
  requestId: string;
  providerId: string;
  workSummary: string;
  deliverables?: string[];
  providerNotes?: string;
}

export const handler = async (event: ProviderCompletionInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Processing provider completion', { requestId: event.requestId });

    // 1. Get current service request
    const request = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId }
    }));

    if (!request.Item) {
      return { statusCode: 404, success: false, error: 'REQUEST_NOT_FOUND' };
    }

    if (request.Item.status !== 'IN_PROGRESS') {
      return { 
        statusCode: 400, 
        success: false, 
        error: 'INVALID_STATUS_FOR_COMPLETION',
        data: { currentStatus: request.Item.status }
      };
    }

    if (request.Item.providerId !== event.providerId) {
      return { statusCode: 403, success: false, error: 'UNAUTHORIZED_PROVIDER' };
    }

    const completionId = uuidv4();
    const now = new Date().toISOString();
    const confirmationDeadline = new Date(Date.now() + (48 * 60 * 60 * 1000)).toISOString(); // 48 hours

    // 2. Atomic transaction: Create completion record + Update service request
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Create service completion record
        {
          Put: {
            TableName: process.env.SERVICE_COMPLETION_TABLE_NAME,
            Item: {
              id: completionId,
              requestId: event.requestId,
              providerId: event.providerId,
              requesterId: request.Item.requesterId,
              providerCompletedAt: now,
              workSummary: event.workSummary,
              deliverables: event.deliverables || [],
              providerNotes: event.providerNotes || '',
              status: 'PROVIDER_COMPLETED',
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
            UpdateExpression: 'SET #status = :status, completionId = :completionId, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'PENDING_COMPLETION_CONFIRMATION',
              ':completionId': completionId,
              ':now': now
            }
          }
        },
        // Create notification for requester
        {
          Put: {
            TableName: process.env.NOTIFICATION_TABLE_NAME,
            Item: {
              id: `completion-${event.requestId}`,
              userId: request.Item.requesterId,
              type: 'SERVICE_COMPLETION_CONFIRMATION_REQUIRED',
              title: 'Service Completed - Confirmation Required',
              message: `${request.Item.service?.title || 'Your service'} has been marked as completed. Please review and confirm.`,
              isRead: false,
              relatedId: event.requestId,
              actionUrl: `/service-requests/${event.requestId}/confirm-completion`,
              expiresAt: confirmationDeadline,
              createdAt: now,
              updatedAt: now
            }
          }
        }
      ]
    }));

    logger.info('Provider completion processed successfully', { 
      requestId: event.requestId, 
      completionId 
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        completionId,
        status: 'PROVIDER_COMPLETED',
        confirmationDeadline,
        nextStep: 'WAITING_FOR_REQUESTER_CONFIRMATION'
      }
    };

  } catch (error) {
    logger.error('Provider completion processing failed', error);
    throw error;
  }
};
```

#### Function 2: Process Requester Confirmation

```bash
amplify add function
# Name: hourbankProcessRequesterConfirmation
```

```typescript
// amplify/backend/function/hourbankProcessRequesterConfirmation/src/index.ts
import { TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface RequesterConfirmationInput {
  requestId: string;
  requesterId: string;
  satisfactionLevel: string;
  requesterNotes?: string;
  autoConfirmed?: boolean;
}

export const handler = async (event: RequesterConfirmationInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Processing requester confirmation', { 
      requestId: event.requestId,
      autoConfirmed: event.autoConfirmed 
    });

    // 1. Get service completion record
    const request = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId }
    }));

    if (!request.Item || !request.Item.completionId) {
      return { statusCode: 404, success: false, error: 'COMPLETION_NOT_FOUND' };
    }

    const completion = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_COMPLETION_TABLE_NAME,
      Key: { id: request.Item.completionId }
    }));

    if (!completion.Item) {
      return { statusCode: 404, success: false, error: 'COMPLETION_RECORD_NOT_FOUND' };
    }

    if (completion.Item.status !== 'PROVIDER_COMPLETED') {
      return { 
        statusCode: 400, 
        success: false, 
        error: 'INVALID_STATUS_FOR_CONFIRMATION',
        data: { currentStatus: completion.Item.status }
      };
    }

    if (!event.autoConfirmed && request.Item.requesterId !== event.requesterId) {
      return { statusCode: 403, success: false, error: 'UNAUTHORIZED_REQUESTER' };
    }

    const now = new Date().toISOString();
    const newStatus = event.autoConfirmed ? 'AUTO_CONFIRMED' : 'CONFIRMED';

    // 2. Atomic transaction: Update completion + Update service request + Create notifications
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Update service completion record
        {
          Update: {
            TableName: process.env.SERVICE_COMPLETION_TABLE_NAME,
            Key: { id: completion.Item.id },
            UpdateExpression: 'SET requesterConfirmedAt = :now, satisfactionLevel = :satisfaction, requesterNotes = :notes, #status = :status, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':now': now,
              ':satisfaction': event.satisfactionLevel || 'SATISFIED',
              ':notes': event.requesterNotes || '',
              ':status': newStatus
            }
          }
        },
        // Update service request status
        {
          Update: {
            TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
            Key: { id: event.requestId },
            UpdateExpression: 'SET #status = :status, updatedAt = :now',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': 'COMPLETED',
              ':now': now
            }
          }
        },
        // Create notification for provider
        {
          Put: {
            TableName: process.env.NOTIFICATION_TABLE_NAME,
            Item: {
              id: `confirmed-${event.requestId}`,
              userId: completion.Item.providerId,
              type: 'SERVICE_COMPLETION_CONFIRMED',
              title: event.autoConfirmed ? 'Service Auto-Confirmed' : 'Service Completion Confirmed',
              message: event.autoConfirmed 
                ? 'Your service was automatically confirmed. Payment is being processed.'
                : 'Your service completion has been confirmed. Payment is being processed.',
              isRead: false,
              relatedId: event.requestId,
              createdAt: now,
              updatedAt: now
            }
          }
        },
        // Mark original notification as read
        {
          Update: {
            TableName: process.env.NOTIFICATION_TABLE_NAME,
            Key: { id: `completion-${event.requestId}` },
            UpdateExpression: 'SET isRead = :read, updatedAt = :now',
            ExpressionAttributeValues: {
              ':read': true,
              ':now': now
            }
          }
        }
      ]
    }));

    logger.info('Requester confirmation processed successfully', { 
      requestId: event.requestId,
      status: newStatus
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        completionId: completion.Item.id,
        status: newStatus,
        readyForPayment: true,
        nextStep: 'PAYMENT_PROCESSING'
      }
    };

  } catch (error) {
    logger.error('Requester confirmation processing failed', error);
    throw error;
  }
};
```

#### Function 3: Process Completion Payment

```bash
amplify add function
# Name: hourbankProcessCompletionPayment
```

```typescript
// amplify/backend/function/hourbankProcessCompletionPayment/src/index.ts
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, logger, WorkflowResponse } from '/opt/nodejs/lib';

interface CompletionPaymentInput {
  requestId: string;
  completionId: string;
}

export const handler = async (event: CompletionPaymentInput): Promise<WorkflowResponse> => {
  try {
    logger.info('Processing completion payment', { requestId: event.requestId });

    // 1. Get service request and escrow details
    const request = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId }
    }));

    if (!request.Item || !request.Item.escrowId) {
      return { statusCode: 404, success: false, error: 'REQUEST_OR_ESCROW_NOT_FOUND' };
    }

    // 2. Start escrow release workflow
    const sfnClient = new SFNClient({});
    const escrowReleaseInput = {
      escrowId: request.Item.escrowId,
      requestId: event.requestId,
      releaseReason: 'SERVICE_COMPLETED_AND_CONFIRMED'
    };

    const executionResult = await sfnClient.send(new StartExecutionCommand({
      stateMachineArn: process.env.ESCROW_MANAGEMENT_WORKFLOW_ARN,
      input: JSON.stringify(escrowReleaseInput),
      name: `payment-${event.requestId}-${Date.now()}`
    }));

    // 3. Update completion record with payment processing info
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_COMPLETION_TABLE_NAME,
      Key: { id: event.completionId },
      UpdateExpression: 'SET #status = :status, paymentExecutionArn = :arn, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'PAYMENT_PROCESSING',
        ':arn': executionResult.executionArn,
        ':now': new Date().toISOString()
      }
    }));

    // 4. Update service request status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME,
      Key: { id: event.requestId },
      UpdateExpression: 'SET #status = :status, completionWorkflowArn = :arn, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'PROCESSING_PAYMENT',
        ':arn': executionResult.executionArn,
        ':now': new Date().toISOString()
      }
    }));

    logger.info('Completion payment processing started', { 
      requestId: event.requestId,
      executionArn: executionResult.executionArn
    });

    return {
      statusCode: 200,
      success: true,
      data: {
        paymentExecutionArn: executionResult.executionArn,
        status: 'PAYMENT_PROCESSING',
        nextStep: 'WAITING_FOR_PAYMENT_COMPLETION'
      }
    };

  } catch (error) {
    logger.error('Completion payment processing failed', error);
    throw error;
  }
};
```
