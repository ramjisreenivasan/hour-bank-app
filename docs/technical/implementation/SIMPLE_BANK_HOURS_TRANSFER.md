# Simple Bank Hours Transfer Implementation
## Direct Integration with Existing Service Completion

This implementation adds bank hours transfer functionality to your existing service completion process without complex escrow systems.

---

## Implementation Changes

### 1. Create Bank Hours Transfer Utility Function

Add this utility function to your existing Lambda functions or shared utilities:

```typescript
// src/utils/bankHoursTransfer.ts or add to existing utility file
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './dynamodb-client'; // Your existing DynamoDB client

interface TransferResult {
  success: boolean;
  error?: string;
  transactionDetails?: {
    requesterId: string;
    providerId: string;
    hours: number;
    transferredAt: string;
  };
}

export const transferBankHours = async (
  requesterId: string, 
  providerId: string, 
  hours: number,
  requestId: string
): Promise<TransferResult> => {
  try {
    const now = new Date().toISOString();
    
    console.log(`Transferring ${hours} hours from ${requesterId} to ${providerId} for request ${requestId}`);

    // Atomic transaction to update both users' bank hours
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        // Deduct hours from requester
        {
          Update: {
            TableName: process.env.USER_TABLE_NAME || 'User-dev', // Adjust table name as needed
            Key: { id: requesterId },
            UpdateExpression: 'SET bankHours = bankHours - :hours, updatedAt = :now',
            ConditionExpression: 'bankHours >= :hours', // Ensure sufficient balance
            ExpressionAttributeValues: {
              ':hours': hours,
              ':now': now
            }
          }
        },
        // Add hours to provider
        {
          Update: {
            TableName: process.env.USER_TABLE_NAME || 'User-dev', // Adjust table name as needed
            Key: { id: providerId },
            UpdateExpression: 'SET bankHours = bankHours + :hours, updatedAt = :now',
            ExpressionAttributeValues: {
              ':hours': hours,
              ':now': now
            }
          }
        }
      ]
    }));

    console.log(`Bank hours transfer successful: ${hours} hours from ${requesterId} to ${providerId}`);

    return {
      success: true,
      transactionDetails: {
        requesterId,
        providerId,
        hours,
        transferredAt: now
      }
    };

  } catch (error) {
    console.error('Bank hours transfer failed:', error);
    
    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        success: false,
        error: 'Insufficient bank hours balance'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown transfer error'
    };
  }
};
```

### 2. Update Your Existing Service Completion Function

Modify your existing service completion handler to include the bank hours transfer:

```typescript
// In your existing service completion Lambda function or API handler
import { transferBankHours } from './utils/bankHoursTransfer'; // Adjust import path

export const handleServiceCompletion = async (event: any) => {
  try {
    const { requestId, completedBy, userId } = event;
    
    // Your existing service completion logic...
    
    // Get service request details
    const serviceRequest = await docClient.send(new GetCommand({
      TableName: process.env.SERVICE_REQUEST_TABLE_NAME || 'ServiceRequest-dev',
      Key: { id: requestId }
    }));

    if (!serviceRequest.Item) {
      throw new Error('Service request not found');
    }

    const request = serviceRequest.Item;
    
    // Check if this is the final completion step (both parties confirmed)
    // Adjust this condition based on your existing completion flow
    const isReadyForPayment = (
      request.status === 'COMPLETED' || 
      (completedBy === 'REQUESTER' && request.providerCompleted) ||
      // Add your specific completion conditions here
      request.status === 'PENDING_PAYMENT'
    );

    if (isReadyForPayment) {
      console.log('Service ready for payment processing');
      
      // Transfer bank hours from requester to provider
      const transferResult = await transferBankHours(
        request.requesterId,
        request.providerId,
        request.estimatedHours || request.agreedRate || request.hourlyRate, // Use appropriate hours field
        requestId
      );

      if (!transferResult.success) {
        console.error('Payment transfer failed:', transferResult.error);
        
        // Update service request with payment failure
        await docClient.send(new UpdateCommand({
          TableName: process.env.SERVICE_REQUEST_TABLE_NAME || 'ServiceRequest-dev',
          Key: { id: requestId },
          UpdateExpression: 'SET #status = :status, paymentError = :error, updatedAt = :now',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':status': 'PAYMENT_FAILED',
            ':error': transferResult.error,
            ':now': new Date().toISOString()
          }
        }));

        throw new Error(`Payment failed: ${transferResult.error}`);
      }

      // Update service request status to PAID
      await docClient.send(new UpdateCommand({
        TableName: process.env.SERVICE_REQUEST_TABLE_NAME || 'ServiceRequest-dev',
        Key: { id: requestId },
        UpdateExpression: 'SET #status = :status, paidAt = :now, paymentDetails = :details, updatedAt = :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': 'PAID',
          ':now': new Date().toISOString(),
          ':details': transferResult.transactionDetails
        }
      }));

      // Create notifications for both users
      await Promise.all([
        // Notification for provider
        docClient.send(new PutCommand({
          TableName: process.env.NOTIFICATION_TABLE_NAME || 'Notification-dev',
          Item: {
            id: `payment-${requestId}-provider`,
            userId: request.providerId,
            type: 'PAYMENT_RECEIVED',
            title: 'Payment Received',
            message: `You received ${transferResult.transactionDetails.hours} bank hours for your completed service`,
            isRead: false,
            relatedId: requestId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })),
        // Notification for requester
        docClient.send(new PutCommand({
          TableName: process.env.NOTIFICATION_TABLE_NAME || 'Notification-dev',
          Item: {
            id: `payment-${requestId}-requester`,
            userId: request.requesterId,
            type: 'PAYMENT_PROCESSED',
            title: 'Payment Processed',
            message: `Payment of ${transferResult.transactionDetails.hours} bank hours has been sent to your service provider`,
            isRead: false,
            relatedId: requestId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }))
      ]);

      console.log('Service completion with payment successful');
    }

    // Your existing completion response logic...
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        requestId,
        status: isReadyForPayment ? 'PAID' : 'COMPLETED',
        paymentProcessed: isReadyForPayment
      })
    };

  } catch (error) {
    console.error('Service completion failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
```

### 3. Update Your GraphQL Mutation (If using GraphQL)

If you're using GraphQL mutations for service completion, update your resolver:

```typescript
// In your GraphQL resolvers
const completeService = async (parent: any, args: { requestId: string }, context: any) => {
  try {
    // Your existing completion logic...
    
    const serviceRequest = await getServiceRequest(args.requestId);
    
    // Check if ready for payment (adjust condition as needed)
    if (serviceRequest.status === 'COMPLETED') {
      const transferResult = await transferBankHours(
        serviceRequest.requesterId,
        serviceRequest.providerId,
        serviceRequest.estimatedHours,
        args.requestId
      );

      if (!transferResult.success) {
        throw new Error(`Payment failed: ${transferResult.error}`);
      }

      // Update to PAID status
      await updateServiceRequestStatus(args.requestId, 'PAID');
    }

    return serviceRequest;
  } catch (error) {
    throw new Error(`Service completion failed: ${error.message}`);
  }
};
```

### 4. Frontend Integration (Optional Enhancement)

Update your Angular service to handle the payment status:

```typescript
// In your Angular service
async completeService(requestId: string): Promise<any> {
  try {
    const result = await this.api.completeService(requestId);
    
    if (result.paymentProcessed) {
      // Show success message about payment
      this.notificationService.showSuccess('Service completed and payment processed!');
    } else {
      // Show completion message
      this.notificationService.showSuccess('Service marked as completed!');
    }
    
    return result;
  } catch (error) {
    if (error.message.includes('Insufficient bank hours')) {
      this.notificationService.showError('Payment failed: Insufficient bank hours balance');
    } else {
      this.notificationService.showError('Service completion failed');
    }
    throw error;
  }
}
```

---

## Testing the Implementation

### Test Cases

1. **Successful Transfer**:
   - Requester has sufficient bank hours
   - Service completion triggers payment
   - Both users' balances updated correctly

2. **Insufficient Balance**:
   - Requester has insufficient bank hours
   - Transfer fails gracefully
   - Service status updated to PAYMENT_FAILED

3. **Concurrent Requests**:
   - Multiple simultaneous completions
   - Atomic transactions prevent race conditions

### Test Data Setup

```typescript
// Test with these sample values
const testTransfer = {
  requesterId: 'user-123',
  providerId: 'user-456', 
  hours: 5,
  requestId: 'request-789'
};

// Ensure requester has at least 5 bank hours before testing
```

---

## Deployment

1. **Add the utility function** to your existing codebase
2. **Update your service completion handler** with the payment logic
3. **Test thoroughly** with different scenarios
4. **Deploy** using your existing deployment process (`amplify push` or your current method)

This implementation provides a simple, reliable way to transfer bank hours without complex escrow systems while maintaining data consistency through atomic transactions.
