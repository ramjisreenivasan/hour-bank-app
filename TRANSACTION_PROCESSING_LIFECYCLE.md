# HourBank Transaction Processing & Bank Hours Management Lifecycle
## Current Implementation (Initial Release) - Step Functions Integration

This document details the complete lifecycle of bank hour transactions, escrow management, and balance operations using AWS Step Functions for complex workflows and Lambda functions for individual operations.

---

## Actors
- **User**: Account holder (requester or provider)
- **Step Functions**: AWS workflow orchestration for complex transactions
- **Lambda Functions**: Individual transaction processors
- **Transaction Service**: Core transaction processing engine
- **DynamoDB**: State persistence and balance management

---

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Step Function │    │     Lambda       │    │    DynamoDB     │
│   (Complex      │←→  │   (Simple        │←→  │   (Balance &    │
│    Workflows)   │    │    Operations)   │    │    Audit)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Step Functions Used For:**
- Escrow creation and management (complex, multi-step)
- Payment processing with retries (critical, needs reliability)
- Dispute resolution workflows (multi-party coordination)

**Direct Lambda Used For:**
- Simple balance inquiries (read-only operations)
- Welcome bonus distribution (straightforward credit)
- Direct transfers (simple operations)

---

## Complete Transaction Processing Lifecycle

### Phase 1: Escrow Creation & Management (Step Functions)

#### Step 1: Escrow Workflow Initiation
**Actor**: Step Functions (triggered by service request)  
**Action**: Starts escrow creation workflow

```
STEP FUNCTION: EscrowManagementWorkflow
├── Input: {
│   ├── requestId: "uuid"
│   ├── fromUserId: "uuid"
│   ├── toUserId: "uuid"
│   ├── amount: number
│   ├── escrowType: "SERVICE_REQUEST"
│   └── timestamp: "ISO8601"
│   }
├── Step Functions State: StartAt → "ValidateBalance"
└── Triggers: ValidateBalanceLambda
```

**System Actions**:
1. Start Step Functions execution for escrow
2. Create escrow record in DynamoDB with status `CREATING_ESCROW`
3. Generate unique escrowId and executionArn
4. Log escrow workflow initiation

---

#### Step 2: Balance Validation
**Actor**: Lambda Function (ValidateBalanceLambda)  
**Action**: Validates user has sufficient balance with concurrency control

```
LAMBDA FUNCTION: ValidateBalanceLambda
├── Step Functions State: "ValidateBalance"
├── Validation Checks:
│   ├── User account is active
│   ├── Sufficient bank hours available
│   ├── No negative balance would result
│   ├── Account not frozen/suspended
│   ├── Optimistic locking check (version number)
│   └── Transaction limits not exceeded
├── DynamoDB Updates:
│   ├── Escrows: status → "VALIDATING_BALANCE"
│   └── UserBalances: lock for validation
└── Next Step: "ProcessEscrow" OR "FailEscrow"
```

**System Actions**:
1. Update escrow status to `VALIDATING_BALANCE`
2. Check user's current bank hour balance with locking
3. Verify account status and transaction limits
4. Calculate post-transaction balance

---

#### Step 3A: Balance Validation Success - Process Escrow
**Actor**: Lambda Function (ProcessEscrowLambda)  
**Action**: Transfers hours from user balance to escrow

```
LAMBDA FUNCTION: ProcessEscrowLambda
├── Step Functions State: "ProcessEscrow"
├── Actions:
│   ├── Deduct hours from user balance
│   ├── Add hours to escrow account
│   ├── Create transaction log entry
│   └── Update escrow status to "ESCROWED"
├── DynamoDB Updates:
│   ├── UserBalances: available balance reduced
│   ├── Escrows: status → "ESCROWED", balance updated
│   └── TransactionLogs: escrow transaction recorded
└── Next Step: "CompleteEscrowCreation"
```

**System Actions**:
1. Atomically transfer hours using DynamoDB transactions
2. Update escrow status to `ESCROWED`
3. Create detailed transaction log
4. Release balance locks

---

#### Step 3B: Balance Validation Failure
**Actor**: Lambda Function (FailEscrowLambda)  
**Action**: Handles insufficient balance scenario

```
LAMBDA FUNCTION: FailEscrowLambda
├── Step Functions State: "FailEscrow"
├── Actions:
│   ├── Update escrow status to "FAILED"
│   ├── Create failure notification
│   ├── Log failure reason
│   └── Trigger service request rejection
├── DynamoDB Update: Escrows status → "FAILED"
└── Step Functions: End (Failure)
```

**System Actions**:
1. Update escrow status to `FAILED`
2. Release any locks
3. Create failure notification
4. Trigger upstream workflow failure

---

### Phase 2: Escrow Release & Transfer (Step Functions)

#### Step 4: Escrow Release Workflow
**Actor**: Step Functions (triggered by service completion)  
**Action**: Initiates release of escrowed hours

```
STEP FUNCTION: EscrowReleaseWorkflow
├── Input: {
│   ├── escrowId: "uuid"
│   ├── requestId: "uuid"
│   ├── releaseReason: "SERVICE_COMPLETED"
│   ├── recipientUserId: "uuid"
│   └── timestamp: "ISO8601"
│   }
├── Step Functions State: StartAt → "ValidateEscrowRelease"
└── Triggers: ValidateEscrowReleaseLambda
```

**System Actions**:
1. Start escrow release workflow
2. Update escrow status to `RELEASING`
3. Validate release conditions
4. Prepare for hour transfer

---

#### Step 5: Escrow Release Processing
**Actor**: Lambda Function (ProcessEscrowReleaseLambda)  
**Action**: Transfers hours from escrow to provider with retry logic

```
LAMBDA FUNCTION: ProcessEscrowReleaseLambda
├── Step Functions State: "ProcessEscrowRelease"
├── Retry Configuration:
│   ├── MaxAttempts: 3
│   ├── BackoffRate: 2.0
│   └── IntervalSeconds: 2
├── Actions:
│   ├── Transfer hours from escrow to provider
│   ├── Update escrow status to "RELEASED"
│   ├── Create transaction log
│   └── Update provider balance
├── DynamoDB Updates:
│   ├── UserBalances: provider balance increased
│   ├── Escrows: status → "RELEASED"
│   └── TransactionLogs: release transaction recorded
└── Next Step: "CompleteEscrowRelease"
```

**System Actions**:
1. Atomically transfer hours using DynamoDB transactions
2. Update escrow status to `RELEASED`
3. Create detailed audit trail
4. Handle any transfer failures with retries

---

### Phase 3: Direct Transfers (Lambda Functions)

#### Step 6: Simple Transfer Processing
**Actor**: Lambda Function (ProcessDirectTransferLambda)  
**Action**: Handles simple transfers (bonuses, refunds, etc.)

```
LAMBDA FUNCTION: ProcessDirectTransferLambda
├── Trigger: Direct API call or EventBridge event
├── Transfer Types:
│   ├── WELCOME_BONUS: System → User
│   ├── REFUND: System → User  
│   ├── ADMIN_ADJUSTMENT: System → User
│   └── DISPUTE_RESOLUTION: User → User
├── Validation:
│   ├── Transfer type is valid
│   ├── Recipient account is active
│   ├── Transfer amount is positive
│   └── Source has sufficient balance (if not system)
├── DynamoDB Updates:
│   ├── UserBalances: recipient balance updated
│   └── TransactionLogs: transfer recorded
└── Response: Success/Failure with details
```

**System Actions**:
1. Validate transfer parameters
2. Execute atomic balance update
3. Create transaction log entry
4. Send notifications if required

---

### Phase 4: Balance Management (Lambda Functions)

#### Step 7: Balance Inquiry
**Actor**: Lambda Function (GetUserBalanceLambda)  
**Action**: Returns current balance information

```
LAMBDA FUNCTION: GetUserBalanceLambda
├── Trigger: API Gateway request
├── Query Operations:
│   ├── Get current total balance
│   ├── Calculate available balance (total - escrowed)
│   ├── Get escrowed amount details
│   └── Retrieve recent transaction history
├── DynamoDB Queries:
│   ├── UserBalances: current balance data
│   ├── Escrows: active escrow amounts
│   └── TransactionLogs: recent activity
└── Response: Complete balance information
```

**System Actions**:
1. Retrieve user's current balance data
2. Calculate available vs escrowed amounts
3. Aggregate escrow details
4. Return comprehensive balance information

---

#### Step 8: Balance Reconciliation
**Actor**: Lambda Function (ReconcileBalancesLambda)  
**Action**: Scheduled reconciliation of all user balances

```
LAMBDA FUNCTION: ReconcileBalancesLambda
├── Trigger: CloudWatch Events (daily schedule)
├── Reconciliation Process:
│   ├── Calculate expected balances from transaction logs
│   ├── Compare with actual UserBalances records
│   ├── Identify discrepancies
│   ├── Generate reconciliation report
│   └── Flag accounts needing adjustment
├── DynamoDB Operations:
│   ├── Scan UserBalances table
│   ├── Query TransactionLogs for each user
│   └── Update reconciliation status
└── Output: Reconciliation report and alerts
```

**System Actions**:
1. Perform system-wide balance reconciliation
2. Identify and report discrepancies
3. Generate alerts for manual review
4. Update reconciliation metrics

---

## Exception Flows (Step Functions Error Handling)

### Escrow Cancellation Workflow

#### Escrow Cancellation
**Actor**: Step Functions (triggered by request rejection/expiration)  
**Action**: Cancels escrow and returns hours

```
STEP FUNCTION: EscrowCancellationWorkflow
├── Input: {
│   ├── escrowId: "uuid"
│   ├── cancellationReason: "REQUEST_REJECTED|REQUEST_EXPIRED|DISPUTE"
│   ├── refundUserId: "uuid"
│   └── timestamp: "ISO8601"
│   }
├── Step Functions State: StartAt → "ProcessEscrowCancellation"
└── Triggers: ProcessEscrowCancellationLambda
```

**System Actions**:
1. Start escrow cancellation workflow
2. Update escrow status to `CANCELLING`
3. Prepare refund to original user
4. Log cancellation reason

---

### Transaction Dispute Workflow

#### Dispute Processing
**Actor**: Step Functions (triggered by dispute event)  
**Action**: Handles transaction disputes with admin involvement

```
STEP FUNCTION: TransactionDisputeWorkflow
├── Input: {
│   ├── transactionId: "uuid"
│   ├── disputedBy: "uuid"
│   ├── disputeReason: "string"
│   ├── disputeType: "UNAUTHORIZED|INCORRECT_AMOUNT|SERVICE_ISSUE"
│   └── timestamp: "ISO8601"
│   }
├── Step Functions States:
│   ├── "FreezeTransaction" → Prevent further changes
│   ├── "NotifyAdmin" → Alert administrators
│   ├── "WaitForAdminDecision" → Human review step
│   └── "ExecuteResolution" → Apply admin decision
└── Variable outcomes based on admin decision
```

**System Actions**:
1. Freeze related transactions and balances
2. Create dispute record
3. Notify admin for review
4. Wait for human decision
5. Execute resolution (refund, transfer, or dismiss)

---

## Error Handling and Retry Logic

### Step Functions Retry Configuration
```json
{
  "Retry": [
    {
      "ErrorEquals": ["Lambda.ServiceException", "Lambda.AWSLambdaException"],
      "IntervalSeconds": 2,
      "MaxAttempts": 3,
      "BackoffRate": 2.0
    },
    {
      "ErrorEquals": ["DynamoDB.ProvisionedThroughputExceededException"],
      "IntervalSeconds": 5,
      "MaxAttempts": 5,
      "BackoffRate": 2.0
    }
  ]
}
```

### Catch Blocks for Critical Operations
```json
{
  "Catch": [
    {
      "ErrorEquals": ["States.ALL"],
      "Next": "HandleTransactionError",
      "ResultPath": "$.error"
    }
  ]
}
```

### Dead Letter Queue Configuration
- Failed transactions after max retries go to DLQ
- Manual review and reprocessing capability
- Alerting for critical transaction failures

---

## Data Models (Updated for Step Functions)

### Escrows Table
```json
{
  "escrowId": "uuid",
  "requestId": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid", 
  "amount": "number",
  "status": "CREATING_ESCROW|VALIDATING_BALANCE|ESCROWED|RELEASING|RELEASED|CANCELLING|CANCELLED|FAILED",
  "escrowType": "SERVICE_REQUEST|REFUND",
  "stepFunctionExecutionArn": "string",
  "createdAt": "timestamp",
  "releasedAt": "timestamp",
  "cancelledAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### UserBalances Table (with Optimistic Locking)
```json
{
  "userId": "uuid",
  "totalBalance": "number",
  "availableBalance": "number",
  "escrowedBalance": "number", 
  "lastTransactionId": "uuid",
  "version": "number",
  "lockedAt": "timestamp",
  "lockedBy": "string",
  "updatedAt": "timestamp"
}
```

### TransactionLogs Table
```json
{
  "logId": "uuid",
  "transactionId": "uuid",
  "userId": "uuid",
  "transactionType": "ESCROW|TRANSFER|REFUND|WELCOME_BONUS|DISPUTE_RESOLUTION",
  "amount": "number",
  "balanceBefore": "number",
  "balanceAfter": "number",
  "description": "string",
  "relatedEntityId": "uuid",
  "stepFunctionExecutionArn": "string",
  "createdAt": "timestamp"
}
```

---

## Monitoring and Observability

### Step Functions Monitoring
- **Execution History**: Complete workflow audit trail
- **State Transitions**: Visual workflow progress tracking
- **Error Tracking**: Automatic error capture and alerting
- **Performance Metrics**: Execution time and success rates

### CloudWatch Metrics
- **Transaction Volume**: Transactions per minute/hour
- **Success Rates**: Percentage of successful transactions
- **Error Rates**: Failed transaction percentages
- **Balance Accuracy**: Reconciliation success rates

### DynamoDB Monitoring
- **Read/Write Capacity**: Performance optimization
- **Item-level Metrics**: Transaction frequency per user
- **Consistency Checks**: Balance integrity monitoring

---

## Benefits of Step Functions Integration

### 🚀 **Enhanced Reliability**
- **Automatic Retries**: Built-in retry logic for transient failures
- **Error Recovery**: Structured error handling and rollback
- **Audit Trail**: Complete transaction history automatically maintained
- **Consistency**: Guaranteed workflow completion or rollback

### 📊 **Superior Monitoring**
- **Visual Debugging**: See exactly where transactions succeed/fail
- **Real-time Tracking**: Monitor transaction progress in real-time
- **Performance Analytics**: Built-in metrics and reporting
- **Alert Integration**: Automatic alerting for transaction failures

### 💰 **Cost Optimization**
- **Pay-per-Use**: Only pay for actual transaction executions
- **Reduced Development**: Significant time savings on error handling
- **Operational Efficiency**: Less maintenance and monitoring overhead
- **Scalability**: Automatic scaling for any transaction volume

### 🛡️ **Security and Compliance**
- **Immutable Audit Trail**: Complete transaction history
- **Access Control**: IAM-based permissions for workflow execution
- **Encryption**: Data encrypted in transit and at rest
- **Compliance**: Built-in logging for regulatory requirements

This Step Functions-integrated approach provides enterprise-grade transaction processing while maintaining the simplicity of direct Lambda functions for straightforward operations. It ensures financial accuracy, provides comprehensive audit trails, and handles complex multi-step workflows with built-in reliability and monitoring.

---

## Complete Transaction Processing Lifecycle

### Phase 1: Escrow Creation & Management

#### Step 1: Escrow Request
**Actor**: System (triggered by service request)  
**Action**: Creates escrow for service request

```
EVENT: EscrowCreationRequested
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── requestId: "uuid"
│   ├── fromUserId: "uuid"
│   ├── toUserId: "uuid"
│   ├── amount: number
│   ├── escrowType: "SERVICE_REQUEST"
│   └── timestamp: "ISO8601"
│   }
├── State Change: NONE → CREATING_ESCROW
└── Triggers: BalanceValidationStarted
```

**System Actions**:
1. Create escrow record with status `CREATING_ESCROW`
2. Generate unique escrowId
3. Link to service request
4. Log escrow creation attempt

---

#### Step 2: Balance Validation
**Actor**: Transaction Service  
**Action**: Validates user has sufficient balance

```
EVENT: BalanceValidationStarted
├── Validation Checks:
│   ├── User account is active
│   ├── Sufficient bank hours available
│   ├── No negative balance would result
│   ├── Account not frozen/suspended
│   └── Transaction limits not exceeded
├── State Change: CREATING_ESCROW → VALIDATING_BALANCE
└── Triggers: BalanceValidationCompleted
```

**System Actions**:
1. Update escrow status to `VALIDATING_BALANCE`
2. Check user's current bank hour balance
3. Verify account status and limits
4. Calculate post-transaction balance

---

#### Step 3A: Balance Validation Success
**Actor**: Transaction Service  
**Action**: Sufficient balance confirmed, proceed with escrow

```
EVENT: BalanceValidationCompleted (Success)
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── userId: "uuid"
│   ├── validationResult: "PASSED"
│   ├── currentBalance: number
│   ├── escrowAmount: number
│   └── newAvailableBalance: number
│   }
├── State Change: VALIDATING_BALANCE → PROCESSING_ESCROW
└── Triggers: HoursEscrowed
```

**System Actions**:
1. Update escrow status to `PROCESSING_ESCROW`
2. Proceed with hour transfer to escrow
3. Log successful validation

---

#### Step 3B: Balance Validation Failure
**Actor**: Transaction Service  
**Action**: Insufficient balance, reject escrow

```
EVENT: BalanceValidationCompleted (Failure)
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── userId: "uuid"
│   ├── validationResult: "FAILED"
│   ├── failureReason: "INSUFFICIENT_BALANCE"
│   ├── currentBalance: number
│   └── requiredAmount: number
│   }
├── State Change: VALIDATING_BALANCE → ESCROW_FAILED
└── Triggers: EscrowCreationFailed
```

**System Actions**:
1. Update escrow status to `ESCROW_FAILED`
2. Create failure notification
3. Log validation failure
4. Trigger service request rejection

---

#### Step 4: Hours Escrowed
**Actor**: Transaction Service  
**Action**: Transfers hours from user balance to escrow

```
EVENT: HoursEscrowed
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── transactionId: "uuid"
│   ├── fromUserId: "uuid"
│   ├── amount: number
│   ├── userBalanceBefore: number
│   ├── userBalanceAfter: number
│   ├── escrowBalanceAfter: number
│   └── escrowedAt: "ISO8601"
│   }
├── State Change: PROCESSING_ESCROW → ESCROWED
└── Triggers: EscrowCreated, UserBalanceUpdated
```

**System Actions**:
1. Deduct hours from user's available balance
2. Add hours to escrow account
3. Update escrow status to `ESCROWED`
4. Create transaction record
5. Update user balance
6. Log successful escrow

---

### Phase 2: Escrow Release & Transfer

#### Step 5: Escrow Release Request
**Actor**: System (triggered by service completion)  
**Action**: Initiates release of escrowed hours

```
EVENT: EscrowReleaseRequested
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── requestId: "uuid"
│   ├── releaseReason: "SERVICE_COMPLETED"
│   ├── releaseAmount: number
│   ├── recipientUserId: "uuid"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ESCROWED → RELEASING
└── Triggers: EscrowReleaseProcessed
```

**System Actions**:
1. Update escrow status to `RELEASING`
2. Validate release conditions
3. Prepare hour transfer to provider

---

#### Step 6: Escrow Release Processed
**Actor**: Transaction Service  
**Action**: Transfers hours from escrow to provider

```
EVENT: EscrowReleaseProcessed
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── releaseTransactionId: "uuid"
│   ├── toUserId: "uuid"
│   ├── amount: number
│   ├── providerBalanceBefore: number
│   ├── providerBalanceAfter: number
│   ├── escrowBalanceAfter: number
│   └── releasedAt: "ISO8601"
│   }
├── State Change: RELEASING → RELEASED
└── Triggers: HoursTransferred, ProviderBalanceUpdated
```

**System Actions**:
1. Transfer hours from escrow to provider balance
2. Update escrow status to `RELEASED`
3. Create transfer transaction record
4. Update provider balance
5. Close escrow account
6. Log successful release

---

### Phase 3: Direct Transfers (Non-Escrow)

#### Step 7: Direct Transfer Request
**Actor**: System (for bonuses, refunds, etc.)  
**Action**: Initiates direct hour transfer

```
EVENT: DirectTransferRequested
├── Payload: {
│   ├── transferId: "uuid"
│   ├── fromUserId: "uuid" (or "SYSTEM")
│   ├── toUserId: "uuid"
│   ├── amount: number
│   ├── transferType: "WELCOME_BONUS|REFUND|ADMIN_ADJUSTMENT"
│   ├── reason: "string"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: NONE → PROCESSING_TRANSFER
└── Triggers: TransferValidationStarted
```

**System Actions**:
1. Create transfer record with status `PROCESSING_TRANSFER`
2. Generate unique transferId
3. Validate transfer parameters
4. Log transfer request

---

#### Step 8: Transfer Validation
**Actor**: Transaction Service  
**Action**: Validates transfer conditions

```
EVENT: TransferValidationStarted
├── Validation Checks:
│   ├── Recipient account is active
│   ├── Transfer amount is positive
│   ├── Source has sufficient balance (if not system)
│   ├── Transfer type is valid
│   └── No account restrictions
├── State Change: PROCESSING_TRANSFER → VALIDATING_TRANSFER
└── Triggers: TransferValidationCompleted
```

**System Actions**:
1. Update transfer status to `VALIDATING_TRANSFER`
2. Check recipient account status
3. Validate transfer amount and type
4. Check for account restrictions

---

#### Step 9A: Transfer Validation Success
**Actor**: Transaction Service  
**Action**: Transfer validated, proceed with processing

```
EVENT: TransferValidationCompleted (Success)
├── Payload: {
│   ├── transferId: "uuid"
│   ├── validationResult: "PASSED"
│   ├── recipientCurrentBalance: number
│   ├── transferAmount: number
│   └── validatedAt: "ISO8601"
│   }
├── State Change: VALIDATING_TRANSFER → EXECUTING_TRANSFER
└── Triggers: HoursTransferred
```

**System Actions**:
1. Update transfer status to `EXECUTING_TRANSFER`
2. Proceed with hour transfer
3. Log successful validation

---

#### Step 9B: Transfer Validation Failure
**Actor**: Transaction Service  
**Action**: Transfer validation failed

```
EVENT: TransferValidationCompleted (Failure)
├── Payload: {
│   ├── transferId: "uuid"
│   ├── validationResult: "FAILED"
│   ├── failureReason: "string"
│   ├── failedChecks: ["string"]
│   └── failedAt: "ISO8601"
│   }
├── State Change: VALIDATING_TRANSFER → TRANSFER_FAILED
└── Triggers: TransferFailed
```

**System Actions**:
1. Update transfer status to `TRANSFER_FAILED`
2. Log failure reason
3. Create failure notification
4. Rollback any partial changes

---

#### Step 10: Hours Transferred
**Actor**: Transaction Service  
**Action**: Completes hour transfer

```
EVENT: HoursTransferred
├── Payload: {
│   ├── transferId: "uuid"
│   ├── transactionId: "uuid"
│   ├── fromUserId: "uuid"
│   ├── toUserId: "uuid"
│   ├── amount: number
│   ├── senderBalanceBefore: number
│   ├── senderBalanceAfter: number
│   ├── recipientBalanceBefore: number
│   ├── recipientBalanceAfter: number
│   └── transferredAt: "ISO8601"
│   }
├── State Change: EXECUTING_TRANSFER → COMPLETED
└── Triggers: TransferCompleted, BalancesUpdated
```

**System Actions**:
1. Update sender balance (if not system transfer)
2. Update recipient balance
3. Update transfer status to `COMPLETED`
4. Create transaction record
5. Log successful transfer
6. Create notifications for involved parties

---

### Phase 4: Balance Management

#### Step 11: Balance Inquiry
**Actor**: User or System  
**Action**: Requests current balance information

```
EVENT: BalanceInquiryRequested
├── Payload: {
│   ├── userId: "uuid"
│   ├── inquiryType: "CURRENT|AVAILABLE|ESCROWED"
│   ├── requestedBy: "USER|SYSTEM"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: N/A (Read-only operation)
└── Triggers: BalanceInquiryCompleted
```

**System Actions**:
1. Retrieve user's current balance
2. Calculate available balance (total - escrowed)
3. Get escrowed amount details
4. Log balance inquiry

---

#### Step 12: Balance Inquiry Response
**Actor**: Transaction Service  
**Action**: Returns balance information

```
EVENT: BalanceInquiryCompleted
├── Payload: {
│   ├── userId: "uuid"
│   ├── totalBalance: number
│   ├── availableBalance: number
│   ├── escrowedBalance: number
│   ├── activeEscrows: number
│   ├── lastTransactionAt: "ISO8601"
│   └── inquiredAt: "ISO8601"
│   }
├── State Change: N/A
└── Triggers: BalanceDataReturned
```

**System Actions**:
1. Return balance information
2. Include escrow details
3. Log successful inquiry

---

## Exception Flows

### Escrow Cancellation

#### Escrow Cancellation Request
**Actor**: System (due to request rejection/expiration)  
**Action**: Cancels escrow and returns hours

```
EVENT: EscrowCancellationRequested
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── cancellationReason: "REQUEST_REJECTED|REQUEST_EXPIRED|DISPUTE"
│   ├── refundAmount: number
│   ├── refundUserId: "uuid"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ESCROWED → CANCELLING
└── Triggers: EscrowRefundProcessed
```

**System Actions**:
1. Update escrow status to `CANCELLING`
2. Prepare refund to original user
3. Log cancellation reason

---

#### Escrow Refund Processed
**Actor**: Transaction Service  
**Action**: Returns escrowed hours to original user

```
EVENT: EscrowRefundProcessed
├── Payload: {
│   ├── escrowId: "uuid"
│   ├── refundTransactionId: "uuid"
│   ├── refundUserId: "uuid"
│   ├── refundAmount: number
│   ├── userBalanceBefore: number
│   ├── userBalanceAfter: number
│   └── refundedAt: "ISO8601"
│   }
├── State Change: CANCELLING → CANCELLED
└── Triggers: EscrowCancelled, UserBalanceUpdated
```

**System Actions**:
1. Transfer hours from escrow back to user
2. Update escrow status to `CANCELLED`
3. Update user balance
4. Create refund transaction record
5. Close escrow account

---

### Transaction Disputes

#### Transaction Dispute Raised
**Actor**: User or Admin  
**Action**: Disputes a transaction

```
EVENT: TransactionDisputeRaised
├── Payload: {
│   ├── disputeId: "uuid"
│   ├── transactionId: "uuid"
│   ├── disputedBy: "uuid"
│   ├── disputeReason: "string"
│   ├── disputeType: "UNAUTHORIZED|INCORRECT_AMOUNT|SERVICE_ISSUE"
│   └── raisedAt: "ISO8601"
│   }
├── State Change: COMPLETED → DISPUTED
└── Triggers: TransactionFrozen, AdminNotified
```

**System Actions**:
1. Update transaction status to `DISPUTED`
2. Freeze related accounts if necessary
3. Create dispute record
4. Notify admin for review
5. Log dispute details

---

### System Maintenance

#### Balance Reconciliation
**Actor**: System (scheduled job)  
**Action**: Reconciles all user balances

```
EVENT: BalanceReconciliationStarted
├── Payload: {
│   ├── reconciliationId: "uuid"
│   ├── reconciliationType: "DAILY|WEEKLY|MANUAL"
│   ├── totalUsers: number
│   └── startedAt: "ISO8601"
│   }
├── State Change: N/A
└── Triggers: UserBalancesReconciled
```

**System Actions**:
1. Calculate expected balances for all users
2. Compare with actual balances
3. Identify discrepancies
4. Generate reconciliation report
5. Flag accounts needing adjustment

---

## State Diagram Summary

### Escrow States:
```
CREATING_ESCROW → VALIDATING_BALANCE → PROCESSING_ESCROW → ESCROWED → RELEASING → RELEASED
       ↓               ↓                      ↓              ↓          ↓
   ESCROW_FAILED   ESCROW_FAILED         ESCROW_FAILED   CANCELLING  CANCELLED
```

### Transfer States:
```
PROCESSING_TRANSFER → VALIDATING_TRANSFER → EXECUTING_TRANSFER → COMPLETED
         ↓                    ↓                     ↓
    TRANSFER_FAILED      TRANSFER_FAILED      TRANSFER_FAILED
```

---

## Event Processing Architecture

### Lambda Functions (Event Processors)
1. **EscrowManager**: Handles escrow creation and management
2. **TransactionProcessor**: Processes all hour transfers
3. **BalanceValidator**: Validates balance operations
4. **ReconciliationEngine**: Handles balance reconciliation
5. **DisputeProcessor**: Manages transaction disputes
6. **AuditLogger**: Logs all transaction events

### Database Tables
- **Transactions**: All hour transfer records
- **Escrows**: Temporary hour holdings
- **UserBalances**: Current user bank hour balances
- **TransactionLogs**: Detailed audit trail
- **Disputes**: Transaction dispute records
- **Reconciliations**: Balance reconciliation results

### Integration Points
- **User Service**: Account status validation
- **Service Request Service**: Escrow triggers
- **Notification Service**: Transaction notifications
- **Admin Service**: Dispute resolution
- **Audit Service**: Compliance and reporting

This lifecycle ensures secure, auditable, and reliable bank hour transactions while preventing negative balances and maintaining system integrity through comprehensive validation and reconciliation processes.
