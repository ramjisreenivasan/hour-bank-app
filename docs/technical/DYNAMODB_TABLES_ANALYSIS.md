# HourBank DynamoDB Tables Analysis
## Existing vs Required Tables for Event-Driven Backend

This document analyzes the existing Amplify GraphQL schema and identifies which DynamoDB tables are already available versus what new tables need to be created for the event-driven backend architecture.

---

## Existing Tables (From Amplify GraphQL Schema)

### ✅ Core Business Tables (Already Available)

#### 1. **User** Table
- **Status**: ✅ EXISTS
- **Purpose**: Core user profiles and account information
- **Key Fields**: id, email, username, firstName, lastName, bankHours, skills, bio, rating
- **Event-Driven Usage**: User management, profile updates, balance tracking
- **Note**: Integrates with Cognito for authentication

#### 2. **Service** Table  
- **Status**: ✅ EXISTS
- **Purpose**: Services offered by users
- **Key Fields**: id, userId, title, description, category, hourlyRate, isActive, tags
- **Event-Driven Usage**: Service creation, modification, deactivation workflows
- **Note**: Includes scheduling fields for future enhancements

#### 3. **Transaction** Table
- **Status**: ✅ EXISTS  
- **Purpose**: Records of service exchanges
- **Key Fields**: id, providerId, consumerId, serviceId, hoursSpent, status, description
- **Event-Driven Usage**: Transaction processing, payment workflows
- **Note**: Has basic transaction status enum

#### 4. **Rating** Table
- **Status**: ✅ EXISTS
- **Purpose**: User ratings and reviews
- **Key Fields**: id, transactionId, raterId, ratedUserId, rating, feedback
- **Event-Driven Usage**: Rating submission, moderation workflows
- **Note**: Supports detailed rating categories

#### 5. **Notification** Table
- **Status**: ✅ EXISTS
- **Purpose**: System notifications to users
- **Key Fields**: id, userId, type, title, message, isRead, relatedId
- **Event-Driven Usage**: Notification delivery and management
- **Note**: Has notification type enum

### ✅ Supporting Tables (Already Available)

#### 6. **Category** Table
- **Status**: ✅ EXISTS
- **Purpose**: Service categories for organization
- **Event-Driven Usage**: Service validation and categorization

#### 7. **Skill** Table  
- **Status**: ✅ EXISTS
- **Purpose**: Predefined skills for consistency
- **Event-Driven Usage**: Profile validation and skill matching

#### 8. **Report** Table
- **Status**: ✅ EXISTS
- **Purpose**: User reports for moderation
- **Event-Driven Usage**: Dispute resolution workflows

#### 9. **Message** & **Conversation** Tables
- **Status**: ✅ EXISTS
- **Purpose**: Direct messaging between users
- **Event-Driven Usage**: Communication workflows (future enhancement)

#### 10. **Booking** & **ServiceSchedule** Tables
- **Status**: ✅ EXISTS
- **Purpose**: Service scheduling and time slot management
- **Event-Driven Usage**: Advanced scheduling workflows (future enhancement)

---

## Required New Tables for Event-Driven Backend (Step Functions Integration)

### ❌ Core Workflow Tables (Need to Create - Reduced Set)

#### 1. **ServiceRequests** Table
- **Status**: ❌ MISSING - CRITICAL
- **Purpose**: State persistence for Step Functions workflows and business queries
- **Required Fields**:
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
    "message": "string",
    "escrowId": "uuid",
    "negotiationRound": "number",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "expiresAt": "timestamp"
  }
  ```
- **Indexes**: byRequesterId, byProviderId, byServiceId, byStatus
- **Step Functions Usage**: State persistence + business queries
- **Note**: Step Functions handles workflow orchestration, DynamoDB stores queryable state

#### 2. **Escrows** Table  
- **Status**: ❌ MISSING - CRITICAL
- **Purpose**: Financial state tracking with Step Functions execution linking
- **Required Fields**:
  ```json
  {
    "escrowId": "uuid",
    "requestId": "uuid", 
    "fromUserId": "uuid",
    "toUserId": "uuid",
    "amount": "number",
    "status": "CREATING_ESCROW|ESCROWED|RELEASING|RELEASED|CANCELLED|FAILED",
    "escrowType": "SERVICE_REQUEST|REFUND",
    "stepFunctionExecutionArn": "string",
    "createdAt": "timestamp",
    "releasedAt": "timestamp",
    "cancelledAt": "timestamp"
  }
  ```
- **Indexes**: byRequestId, byFromUserId, byToUserId, byStatus
- **Step Functions Usage**: Escrow workflows with state persistence

#### 3. **TransactionLogs** Table
- **Status**: ❌ MISSING - CRITICAL  
- **Purpose**: Detailed audit trail complementing Step Functions execution history
- **Required Fields**:
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
- **Indexes**: byUserId, byTransactionId, byTransactionType
- **Step Functions Usage**: Business audit trail (Step Functions provides technical audit)

#### 4. **UserBalances** Table
- **Status**: ❌ MISSING - CRITICAL
- **Purpose**: Real-time balance tracking with optimistic locking for concurrency
- **Required Fields**:
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
- **Indexes**: Primary key only (userId)
- **Step Functions Usage**: Balance management with atomic updates
- **Note**: Separate from User table for performance and concurrency control

#### 5. **Disputes** Table
- **Status**: ❌ MISSING - IMPORTANT
- **Purpose**: Dispute resolution workflow state (can use Step Functions for complex disputes)
- **Required Fields**:
  ```json
  {
    "disputeId": "uuid",
    "requestId": "uuid",
    "transactionId": "uuid",
    "raisedBy": "uuid",
    "againstUserId": "uuid", 
    "disputeType": "SERVICE_QUALITY|PAYMENT|NO_SHOW|OTHER",
    "status": "OPEN|UNDER_REVIEW|RESOLVED|DISMISSED",
    "description": "string",
    "evidence": "json",
    "adminId": "uuid",
    "resolution": "string",
    "stepFunctionExecutionArn": "string",
    "createdAt": "timestamp",
    "resolvedAt": "timestamp"
  }
  ```
- **Indexes**: byRequestId, byRaisedBy, byStatus, byAdminId
- **Step Functions Usage**: Complex dispute resolution workflows

#### 6. **EventLogs** Table
- **Status**: ❌ MISSING - MODERATE
- **Purpose**: Business event tracking (separate from Step Functions technical logs)
- **Required Fields**:
  ```json
  {
    "eventId": "uuid",
    "eventType": "string",
    "entityType": "SERVICE_REQUEST|USER|SERVICE|TRANSACTION",
    "entityId": "uuid", 
    "actorUserId": "uuid",
    "eventData": "json",
    "businessContext": "string",
    "stepFunctionExecutionArn": "string",
    "timestamp": "timestamp",
    "source": "string"
  }
  ```
- **Indexes**: byEntityId, byEventType, byActorUserId, byTimestamp
- **Step Functions Usage**: Business analytics (Step Functions provides technical execution logs)

---

## Tables No Longer Needed (Step Functions Handles)

### ✅ **Eliminated Tables** (Step Functions Replaces Functionality)

#### ~~ServiceValidations~~ Table → **Step Functions Execution History**
- **Why Eliminated**: Step Functions automatically tracks validation workflow execution
- **Step Functions Benefit**: Built-in execution history with visual debugging
- **What's Gained**: Automatic retry logic, error handling, visual workflow tracking

#### ~~RatingModerations~~ Table → **Simple Lambda + Database Updates**
- **Why Eliminated**: Rating moderation is straightforward, doesn't need complex workflow
- **Alternative**: Direct Lambda functions with existing Rating table
- **What's Gained**: Simpler implementation, lower cost

#### ~~AdminActions~~ Table → **Step Functions + CloudTrail**
- **Why Eliminated**: Admin actions can be tracked through Step Functions and AWS CloudTrail
- **Alternative**: Step Functions for complex admin workflows, CloudTrail for audit
- **What's Gained**: Native AWS audit trail, better compliance

#### ~~SystemConfigurations~~ Table → **AWS Parameter Store/Systems Manager**
- **Why Eliminated**: AWS has native configuration management services
- **Alternative**: Parameter Store for configuration, Systems Manager for dynamic updates
- **What's Gained**: Native AWS configuration management, better security

---

## Updated Migration Strategy

### Phase 1: Critical Tables (Immediate - Week 1)
1. **ServiceRequests** - Core workflow state persistence
2. **Escrows** - Financial transaction state
3. **UserBalances** - Balance management with locking
4. **TransactionLogs** - Business audit trail

### Phase 2: Important Tables (Week 2)
5. **Disputes** - Dispute resolution workflows
6. **EventLogs** - Business event tracking

### Phase 3: Step Functions Implementation (Week 2-3)
7. **Service Request Workflow** - Complex multi-step process
8. **Escrow Management Workflow** - Financial reliability
9. **Transaction Processing Workflow** - Payment processing
10. **Dispute Resolution Workflow** - Admin coordination

---

## Revised Implementation Approach

### ✅ **Recommended: Hybrid Step Functions + Amplify GraphQL**

#### Step Functions for Workflow Orchestration:
- Service request lifecycle management
- Escrow creation and release
- Payment processing with retries
- Dispute resolution coordination

#### Amplify GraphQL for Data Persistence:
- Add new types to existing `schema.graphql`
- Leverage Amplify's automatic DynamoDB creation
- Maintain consistency with existing auth structure
- Use for business queries and reporting

#### Example GraphQL Schema Addition:
```graphql
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

# Add enums and other types...
```

---

## Cost Analysis (Updated)

### Step Functions Cost (Estimated):
- **Service Requests**: 10,000/month × 8 transitions = $2.00/month
- **Escrow Management**: 10,000/month × 4 transitions = $1.00/month
- **Payment Processing**: 8,000/month × 3 transitions = $0.60/month
- **Dispute Resolution**: 100/month × 6 transitions = $0.015/month
- **Total Step Functions**: ~$3.62/month

### Development Time Savings:
- **Workflow Management**: 3-4 weeks saved
- **Error Handling & Retries**: 2-3 weeks saved
- **State Management**: 1-2 weeks saved
- **Monitoring & Debugging**: 1 week saved
- **Total**: 7-10 weeks development time saved

### ROI Analysis:
- **Step Functions Cost**: $43/year
- **Developer Time Saved**: 7-10 weeks × $5,000/week = $35,000-50,000
- **ROI**: 814x - 1,163x return on investment

---

## Summary (Updated)

- **✅ 10 Core tables already exist** from your Amplify GraphQL schema
- **❌ 6 New tables needed** (reduced from 10) for Step Functions integration
- **🚀 4 Tables eliminated** by using Step Functions native capabilities
- **Critical Priority**: 4 tables needed immediately for core workflows
- **Timeline**: 2-3 weeks to implement all required tables and Step Functions
- **Cost**: ~$3.62/month for Step Functions vs $35,000-50,000 in development savings

### Key Benefits of Step Functions Integration:
1. **Massive Development Savings**: 7-10 weeks of custom workflow development eliminated
2. **Superior Reliability**: Built-in error handling, retries, and recovery
3. **Better Monitoring**: Visual workflow execution and debugging
4. **Reduced Complexity**: 40% fewer custom tables needed
5. **Enterprise Grade**: Battle-tested AWS infrastructure for critical workflows

Your existing Amplify setup provides an excellent foundation, and Step Functions integration will handle the complex workflow orchestration while maintaining your ability to query and report on business data through GraphQL and DynamoDB.

---

## Migration Strategy

### Phase 1: Critical Tables (Immediate - Week 1)
1. **ServiceRequests** - Core service request workflow
2. **Escrows** - Transaction processing
3. **TransactionLogs** - Audit trail
4. **UserBalances** - Balance management

### Phase 2: Important Tables (Week 2)
5. **EventLogs** - System monitoring
6. **Disputes** - Dispute resolution

### Phase 3: Moderate Priority (Week 3-4)
7. **ServiceValidations** - Service approval workflow
8. **RatingModerations** - Review moderation
9. **AdminActions** - Admin audit trail

### Phase 4: Low Priority (Future)
10. **SystemConfigurations** - Dynamic configuration

---

## Implementation Approach

### Option 1: Extend Amplify GraphQL Schema (Recommended)
- Add new types to existing `schema.graphql`
- Leverage Amplify's automatic DynamoDB table creation
- Maintain consistency with existing auth and API structure
- Use Amplify's built-in resolvers and subscriptions

### Option 2: Create Separate DynamoDB Tables
- Create tables manually via AWS CLI/CDK
- Build custom Lambda functions for CRUD operations
- More control but requires more development effort
- May complicate the existing Amplify setup

### Recommended: Option 1 with Schema Extension

Add the missing types to your existing `schema.graphql`:

```graphql
# Add these new types to your existing schema.graphql

type ServiceRequest @model @auth(rules: [
  { allow: owner, ownerField: "requesterId" }
  { allow: owner, ownerField: "providerId" }
]) {
  id: ID!
  serviceId: ID! @index(name: "byServiceId")
  requesterId: ID! @index(name: "byRequesterId") 
  providerId: ID! @index(name: "byProviderId")
  status: ServiceRequestStatus! @index(name: "byStatus")
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
  DRAFT
  PENDING_VALIDATION
  ACTIVE
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  PAID
  REJECTED
  EXPIRED
  DISPUTED
}

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
  ESCROWED
  RELEASING
  RELEASED
  CANCELLED
}

enum EscrowType {
  SERVICE_REQUEST
  REFUND
}

# Add other missing types similarly...
```

This approach will automatically create the DynamoDB tables with proper indexes, auth rules, and GraphQL resolvers while maintaining consistency with your existing Amplify setup.

---

## Summary

- **✅ 10 Core tables already exist** from your Amplify GraphQL schema
- **❌ 10 New tables needed** for full event-driven backend functionality  
- **Critical Priority**: 4 tables needed immediately for core workflows
- **Recommended**: Extend existing Amplify GraphQL schema rather than creating separate tables
- **Timeline**: 3-4 weeks to implement all required tables in phases

Your existing Amplify setup provides a solid foundation with most business logic tables already in place. The missing tables are primarily for event management, audit trails, and workflow state tracking - all essential for the event-driven architecture.
