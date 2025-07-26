# HourBank - Event-Driven Backend Design Document

## Overview
This document outlines the event-driven architecture for the HourBank skill exchange platform, detailing user interactions, process flows, state transitions, and events that drive the system.

## Table of Contents
1. [Core User Scenarios](#core-user-scenarios)
2. [Event-Driven Architecture Overview](#event-driven-architecture-overview)
3. [Detailed Process Flows](#detailed-process-flows)
4. [Events and State Transitions](#events-and-state-transitions)
5. [System Components](#system-components)
6. [Data Models](#data-models)

---

## Discovery Session

### Initial Analysis
Based on the HourBank application requirements, I've identified the following core user interactions that need event-driven flows:

1. **Service Request Flow** - When a user requests a service from a provider
2. **Service Offering Flow** - When a user creates/updates/deletes a service offering
3. **User Registration/Profile Flow** - Account creation and profile management
4. **Transaction Processing Flow** - Hour bank transactions and payments
5. **Rating and Review Flow** - Post-service completion feedback
6. **Notification Flow** - Real-time updates to users

---

## Discovery Questions and Decisions

### Scenario 1: Service Request Flow

#### Question 1: Request Initiation Process
**Decision: Option C + D (Hybrid Approach with Escrow System)**
- User can send request immediately, but it's marked as "pending validation"
- System performs background checks (bank hours, user status)
- User's bank hours are temporarily held/reserved when making request
- Provider sees request only after validation passes
- Hours are released back if request is rejected
- Hours are transferred only upon service completion
- User gets notified if validation fails

#### Question 2: Provider Response Timeframe
**Decision: Option C (Provider-defined response time)**
- Each provider sets their typical response time in their profile
- System uses this when showing the service to requesters
- Auto-expiration happens based on provider's stated timeframe
- Minimum 2 hours, maximum 72 hours allowed

#### Question 3: Concurrent Service Requests
**Decision: Option B (Multiple concurrent requests allowed)**
- Provider can receive multiple requests for the same service
- Provider can accept multiple requests if they have capacity
- Each request is handled independently
- Provider manages their own availability/capacity

#### Question 4: Negotiation and Modification
**Decision: Option D (Hybrid approach)**
- Provider can send one counter-offer with optional message
- Requester can accept, reject, or send one final counter-offer
- Maximum 2 rounds of negotiation to keep it simple
- All communication logged for reference

#### Question 5: Service Execution Tracking
Once a service request is accepted, how should the system track when the actual work begins and ends?

**Option A: Honor system**
- Provider manually marks service as "started" and "completed"
- No automatic tracking or validation
- Relies on trust between parties
- Simple but minimal oversight
- **Implementation Complexity: LOW** ⭐
  - Simple state updates in database
  - Basic UI buttons for status changes
  - Minimal backend logic required

**Option B: Mutual confirmation system**
- Provider marks "work started" → Requester confirms
- Provider marks "work completed" → Requester confirms
- Both confirmations required to move to next stage
- Dispute process if confirmations don't match
- **Implementation Complexity: MEDIUM** ⭐⭐
  - Dual confirmation workflow logic
  - Notification system for confirmations
  - Basic dispute handling mechanism
  - State machine with multiple confirmation states

**Option C: Time-based check-in system**
- Provider must check-in when starting work
- System tracks elapsed time automatically
- Provider checks-out when work is done
- Automatic time calculation for billing
- **Implementation Complexity: MEDIUM-HIGH** ⭐⭐⭐
  - Real-time time tracking system
  - Automatic billing calculations
  - Handle edge cases (forgot to check-out, system downtime)
  - Mobile-friendly check-in/out interface

**Option D: Milestone-based tracking**
- Service broken into predefined milestones/checkpoints
- Provider marks each milestone as complete
- Requester can approve/request changes at each milestone
- Payment can be released incrementally
- **Implementation Complexity: HIGH** ⭐⭐⭐⭐
  - Complex milestone definition system
  - Incremental payment processing
  - Advanced state management
  - Detailed progress tracking UI

**Please choose:**
- **Primary option** (for initial release)
- **Future option** (for later enhancement)

#### Question 5: Service Execution Tracking
**Decision:**
- **Primary option (Initial Release): Option B (Mutual confirmation system)**
  - Provider marks "work started" → Requester confirms
  - Provider marks "work completed" → Requester confirms
  - Both confirmations required to move to next stage
  - Dispute process if confirmations don't match
  - **Implementation Complexity: MEDIUM** ⭐⭐

- **Future option (Later Enhancement): Option D (Milestone-based tracking)**
  - Service broken into predefined milestones/checkpoints
  - Provider marks each milestone as complete
  - Requester can approve/request changes at each milestone
  - Payment can be released incrementally
  - **Implementation Complexity: HIGH** ⭐⭐⭐⭐

#### Question 6: Service Completion and Payment
**Decision:**
- **Primary option (Initial Release): Option B (Transfer after requester confirmation)**
  - Provider marks "completed" → Requester must confirm
  - Hours transfer only after requester confirmation
  - Built-in quality gate before payment
  - **Implementation Complexity: LOW-MEDIUM** ⭐⭐

- **Future option (Later Enhancement): Option C (Automatic transfer with grace period)**
  - Provider marks "completed"
  - 24-48 hour grace period for requester to dispute
  - If no dispute, hours transfer automatically
  - **Implementation Complexity: MEDIUM** ⭐⭐

#### Question 7: Dispute Resolution Process
**Decision:**
- **Primary option (Initial Release): Option A (Simple escalation system)**
  - Either party can flag a dispute
  - Dispute freezes the transaction state
  - Admin/moderator manually reviews and decides
  - Decision is final, hours transferred accordingly
  - **Implementation Complexity: LOW-MEDIUM** ⭐⭐

- **Future option (Later Enhancement): Option C (Community mediation)**
  - Disputes assigned to verified community mediators
  - Mediators are experienced users with good ratings
  - Mediator facilitates resolution between parties
  - Escalates to admin only if mediation fails
  - **Implementation Complexity: HIGH** ⭐⭐⭐⭐

---

## Service Request Flow Summary

---

## Service Request Flow Summary

Based on your decisions, here's the complete service request flow for the initial release:

### Initial Release Flow:
1. **Request Submission**: User submits request → System validates & escrows hours → Provider notified (if validation passes)
2. **Provider Response**: Provider has custom timeframe to accept/reject/counter-offer
3. **Negotiation**: Up to 2 rounds of negotiation allowed
4. **Service Execution**: Mutual confirmation system (provider starts → requester confirms → provider completes → requester confirms)
5. **Payment**: Hours transfer only after requester confirms completion
6. **Disputes**: Simple admin escalation system

### Future Enhancements:
- Milestone-based tracking for complex services
- Automatic payment with grace period
- Community mediation for disputes

---

## Next Scenario: Service Offering Management

Now let's move to the second major scenario. When a user wants to create, update, or delete a service offering, what should the process look like?

### Question 8: Service Creation Process

When a user creates a new service offering, what validation and approval process should occur?

#### Question 8: Service Creation Process
**Decision:**
- **Primary option (Initial Release): Option B (Automated review with manual fallback)**
  - System performs automated checks (content filtering, pricing validation)
  - Auto-approves if passes all checks
  - Flags suspicious content for manual review
  - **Implementation Complexity: MEDIUM** ⭐⭐

- **Future option (Later Enhancement): Option C (Mandatory manual approval)**
  - All new services require admin/moderator approval
  - Review for quality, appropriateness, and completeness
  - 24-48 hour approval timeframe
  - **Implementation Complexity: MEDIUM** ⭐⭐

#### Question 9: Service Modification Rules
**Decision: Option D (Freeze modifications during active requests)**
- Service cannot be modified while requests are pending
- Provider must resolve all pending requests first
- Ensures consistency but limits flexibility
- **Implementation Complexity: LOW-MEDIUM** ⭐⭐

#### Question 10: Service Deactivation/Deletion
**Decision: Option A (Immediate deactivation with pending request handling)**
- Service immediately hidden from marketplace
- Existing pending requests continue normally
- Provider must complete all accepted services
- **Implementation Complexity: LOW** ⭐

---

## Service Offering Management Flow Summary

### Initial Release Flow:
1. **Service Creation**: Automated review with manual fallback for suspicious content
2. **Service Modification**: Frozen during active requests - must resolve pending requests first
3. **Service Deactivation**: Immediate removal from marketplace, existing requests continue normally

### Future Enhancements:
- Mandatory manual approval for all new services
- More sophisticated modification handling

---

## Next Scenario: User Registration and Profile Management

Now let's move to user onboarding and profile management.

#### Question 11: User Registration Process
**Decision:**
- **Primary option (Initial Release): Option A (Basic registration with immediate access)**
  - User provides email, password, basic profile info
  - Email verification required
  - Immediate access to browse and request services
  - Can offer services right away
  - **Implementation Complexity: LOW** ⭐

- **Future option (Later Enhancement): Option C (Registration with identity verification)**
  - Basic registration + identity verification required
  - Phone number verification, document upload
  - Manual review of identity documents
  - Full access only after verification approval
  - **Implementation Complexity: HIGH** ⭐⭐⭐

#### Question 12: Initial Bank Hours Distribution
**Decision:**
- **Primary option (Initial Release): Option A (Welcome bonus system)**
  - All new users receive 5-10 free bank hours upon registration
  - One-time bonus to kickstart participation
  - No additional free hours after initial bonus
  - **Implementation Complexity: LOW** ⭐

- **Future option (Later Enhancement): Option C (Referral and activity rewards)**
  - Small welcome bonus (2-3 hours)
  - Additional hours for completing profile, referring friends
  - Gamified onboarding with hour rewards
  - **Implementation Complexity: MEDIUM** ⭐⭐

#### Question 13: Profile Update Notifications
**Decision:**
- **Primary option (Initial Release): Option A (No automatic notifications)**
  - Profile updates are private until user initiates contact
  - Changes only visible when others browse their profile
  - No proactive notifications sent
  - **Implementation Complexity: LOW** ⭐

- **Future option (Later Enhancement): Option B (Notify interested users only)**
  - Users can "follow" or "watch" specific providers
  - Followers get notified of profile updates and new services
  - Opt-in notification system
  - **Implementation Complexity: MEDIUM** ⭐⭐

---

## User Registration and Profile Management Flow Summary

### Initial Release Flow:
1. **Registration**: Basic registration with email verification and immediate access
2. **Initial Hours**: 5-10 welcome bonus bank hours upon registration
3. **Profile Updates**: Private updates with no automatic notifications

### Future Enhancements:
- Identity verification system
- Referral and activity-based rewards
- Follow/watch system for interested users

---

## Next Scenario: Transaction Processing and Bank Hours Management

Now let's discuss the core economic engine of the platform.

#### Question 14: Bank Hours Transfer Mechanism
**Decision: Option D (Hybrid escrow system)**
- Platform holds hours in escrow during active transactions
- Direct transfers for completed transactions
- Automatic release mechanisms with manual override
- **Implementation Complexity: MEDIUM** ⭐⭐

#### Question 15: Transaction Fee Structure
**Decision: Option A (No transaction fees)**
- Platform operates without taking fees from transactions
- Revenue from other sources (premium features, advertising)
- Pure peer-to-peer hour exchange
- **Implementation Complexity: LOW** ⭐

#### Question 16: Negative Balance Handling
**Decision: Option A (Prevent negative balances)**
- System blocks any transaction that would result in negative balance
- Users must maintain minimum balance for active requests
- Hard constraint on spending
- **Implementation Complexity: LOW** ⭐

---

## Transaction Processing and Bank Hours Management Flow Summary

### Initial Release Flow:
1. **Transfer Mechanism**: Hybrid escrow system - platform holds hours during transactions, direct transfer on completion
2. **Fee Structure**: No transaction fees - pure peer-to-peer exchange
3. **Balance Management**: Prevent negative balances with hard constraints

### Future Enhancements:
- Potential fee structures as platform scales
- More sophisticated balance management options

---

## Next Scenario: Rating and Review System

Now let's discuss how users build reputation and trust.

#### Question 17: Rating Timing and Requirements
**Decision:**
- **Primary option (Initial Release): Option C (Requester-only rating system)**
  - Only service requesters can rate providers
  - Providers cannot rate requesters
  - Simpler one-way reputation system
  - **Implementation Complexity: LOW** ⭐

- **Future option (Later Enhancement): Option A (Mutual rating after completion)**
  - Both requester and provider must rate each other
  - Ratings revealed only after both parties submit
  - Required step before transaction is fully closed
  - **Implementation Complexity: MEDIUM** ⭐⭐

#### Question 18: Rating Scale and Components
**Decision:**
- **Primary option (Initial Release): Option A (Simple 5-star overall rating)**
  - Single 1-5 star rating for overall service quality
  - Optional text review/comment
  - Easy to understand and use
  - **Implementation Complexity: LOW** ⭐

- **Future option (Later Enhancement): Option C (Thumbs up/down with categories)**
  - Simple positive/negative rating
  - Predefined categories: "Great service", "On time", "Good communication"
  - Users can select multiple positive/negative categories
  - **Implementation Complexity: LOW-MEDIUM** ⭐⭐

#### Question 19: Review Moderation and Disputes
**Decision:**
- **Primary option (Initial Release): Option C (Admin-only moderation)**
  - Only platform admins can remove inappropriate reviews
  - Users can report reviews for admin review
  - Manual moderation process
  - **Implementation Complexity: LOW-MEDIUM** ⭐⭐

- **Future option (Later Enhancement): Option A (Community self-moderation)**
  - Users can flag inappropriate reviews
  - Reviews hidden after multiple flags until admin review
  - Community-driven quality control
  - **Implementation Complexity: MEDIUM** ⭐⭐

---

## Rating and Review System Flow Summary

### Initial Release Flow:
1. **Rating System**: Requester-only 5-star ratings with optional text reviews
2. **Moderation**: Admin-only moderation with user reporting capability

### Future Enhancements:
- Mutual rating system between requesters and providers
- Thumbs up/down with predefined categories
- Community-driven moderation system

---

## Final Scenario: Notification System

Let's complete our discovery with the notification and communication system.

#### Question 20: Notification Delivery Methods
**Decision: Option A (In-app notifications only)**
- All notifications displayed within the application
- Notification bell/badge system
- No external communication
- **Implementation Complexity: LOW** ⭐

#### Question 21: Notification Event Types
**Decision: Option A (Essential events only)**
- Service request received/accepted/rejected
- Service completion confirmations
- Dispute notifications
- **Implementation Complexity: LOW** ⭐

---

## Notification System Flow Summary

### Initial Release Flow:
1. **Delivery Method**: In-app notifications only with bell/badge system
2. **Event Types**: Essential events only (requests, completions, disputes)

### Future Enhancements:
- Email notifications with user preferences
- Real-time push notifications
- Comprehensive event coverage
- User-customizable notification preferences

---

# COMPLETE EVENT-DRIVEN BACKEND ARCHITECTURE

## Executive Summary

Based on our comprehensive discovery session, here's the complete event-driven architecture for HourBank's initial release, designed for simplicity and scalability:

### Core Design Principles
- **Start Simple**: Low-complexity implementations for rapid MVP development
- **Event-Driven**: All major state changes trigger events for loose coupling
- **Scalable Foundation**: Architecture supports future enhancements
- **User-Centric**: Prioritizes user experience and trust-building

### Implementation Complexity Overview
- **Total Initial Release Complexity**: LOW to MEDIUM ⭐⭐
- **Future Enhancement Path**: Gradual complexity increase with proven value
- **Development Timeline**: Estimated 3-4 months for initial release

---

## Detailed Event-Driven Process Flows

---

## Detailed Event-Driven Process Flows

### 1. Service Request Flow (Initial Release)

#### States:
- `DRAFT` → `PENDING_VALIDATION` → `ACTIVE` → `ACCEPTED`/`REJECTED` → `IN_PROGRESS` → `COMPLETED` → `PAID`

#### Events and Transitions:

**1.1 Request Submission**
```
Event: ServiceRequestSubmitted
Trigger: User clicks "Request Service"
Actions:
  - Create request record in DRAFT state
  - Validate user has sufficient bank hours
  - Escrow required hours from user balance
  - Transition to PENDING_VALIDATION
  - Emit: RequestValidationStarted
```

**1.2 Request Validation**
```
Event: RequestValidationCompleted
Trigger: System validation process completes
Actions:
  - If validation passes: Transition to ACTIVE, notify provider
  - If validation fails: Transition to REJECTED, release escrowed hours
  - Emit: RequestActivated OR RequestRejected
```

**1.3 Provider Response**
```
Event: ProviderResponseReceived
Trigger: Provider accepts/rejects/counter-offers
Actions:
  - If accepted: Transition to ACCEPTED
  - If rejected: Transition to REJECTED, release escrowed hours
  - If counter-offer: Transition to NEGOTIATING
  - Emit: RequestAccepted OR RequestRejected OR NegotiationStarted
```

**1.4 Service Execution**
```
Event: ServiceStarted
Trigger: Provider marks "work started" + Requester confirms
Actions:
  - Transition to IN_PROGRESS
  - Record start timestamp
  - Emit: ServiceInProgress

Event: ServiceCompleted
Trigger: Provider marks "completed" + Requester confirms
Actions:
  - Transition to COMPLETED
  - Record completion timestamp
  - Emit: ServiceReadyForPayment
```

**1.5 Payment Processing**
```
Event: PaymentProcessed
Trigger: Requester confirms completion
Actions:
  - Transfer escrowed hours to provider
  - Transition to PAID
  - Enable rating/review
  - Emit: TransactionCompleted
```

### 2. Service Offering Management Flow (Initial Release)

#### States:
- `DRAFT` → `PENDING_REVIEW` → `ACTIVE` → `DEACTIVATED`

#### Events and Transitions:

**2.1 Service Creation**
```
Event: ServiceOfferingCreated
Trigger: Provider submits new service
Actions:
  - Create service record in DRAFT state
  - Run automated content validation
  - If passes: Transition to ACTIVE
  - If flagged: Transition to PENDING_REVIEW
  - Emit: ServicePublished OR ServiceFlaggedForReview
```

**2.2 Service Modification**
```
Event: ServiceModificationAttempted
Trigger: Provider tries to edit service
Actions:
  - Check for pending requests
  - If pending requests exist: Block modification, notify provider
  - If no pending requests: Allow modification
  - Emit: ServiceModificationBlocked OR ServiceModified
```

**2.3 Service Deactivation**
```
Event: ServiceDeactivated
Trigger: Provider deactivates service
Actions:
  - Hide service from marketplace
  - Continue processing existing requests
  - Transition to DEACTIVATED
  - Emit: ServiceRemovedFromMarketplace
```

### 3. User Registration and Profile Management Flow (Initial Release)

#### States:
- `UNVERIFIED` → `EMAIL_VERIFIED` → `ACTIVE`

#### Events and Transitions:

**3.1 User Registration**
```
Event: UserRegistered
Trigger: User completes registration form
Actions:
  - Create user account in UNVERIFIED state
  - Send email verification
  - Emit: EmailVerificationSent
```

**3.2 Email Verification**
```
Event: EmailVerified
Trigger: User clicks verification link
Actions:
  - Transition to EMAIL_VERIFIED
  - Credit welcome bonus bank hours (5-10 hours)
  - Transition to ACTIVE
  - Emit: UserActivated, WelcomeBonusCredited
```

**3.3 Profile Updates**
```
Event: ProfileUpdated
Trigger: User saves profile changes
Actions:
  - Update profile data
  - No automatic notifications (privacy-first)
  - Emit: ProfileDataChanged
```

### 4. Transaction Processing Flow (Initial Release)

#### States:
- `ESCROW` → `RELEASED` → `COMPLETED`

#### Events and Transitions:

**4.1 Hour Escrow**
```
Event: HoursEscrowed
Trigger: Service request validation passes
Actions:
  - Move hours from user balance to escrow account
  - Create escrow record
  - Emit: EscrowCreated
```

**4.2 Hour Release**
```
Event: HoursReleased
Trigger: Service completion confirmed
Actions:
  - Transfer hours from escrow to provider balance
  - Update transaction record
  - Emit: PaymentCompleted
```

**4.3 Escrow Cancellation**
```
Event: EscrowCancelled
Trigger: Request rejected or expired
Actions:
  - Return hours to requester balance
  - Close escrow record
  - Emit: EscrowRefunded
```

### 5. Rating and Review Flow (Initial Release)

#### States:
- `PENDING` → `SUBMITTED` → `PUBLISHED`

#### Events and Transitions:

**5.1 Rating Submission**
```
Event: RatingSubmitted
Trigger: Requester submits rating after service completion
Actions:
  - Create rating record
  - Update provider's average rating
  - Transition to PUBLISHED
  - Emit: ProviderRatingUpdated
```

**5.2 Review Reporting**
```
Event: ReviewReported
Trigger: User reports inappropriate review
Actions:
  - Flag review for admin attention
  - Add to moderation queue
  - Emit: ReviewFlaggedForModeration
```

### 6. Notification Flow (Initial Release)

#### Events and Triggers:

**6.1 Essential Notifications**
```
Event: NotificationTriggered
Triggers:
  - ServiceRequestReceived
  - RequestAccepted/Rejected
  - ServiceCompleted
  - DisputeRaised
Actions:
  - Create in-app notification
  - Update notification badge count
  - Emit: NotificationDelivered
```

---

## Event-Driven Architecture Components

### Core Services

**1. Event Bus (AWS EventBridge)**
- Central event routing and distribution
- Event filtering and transformation
- Dead letter queues for failed events
- Event replay capabilities

**2. State Management Service**
- Manages entity state transitions
- Validates state change permissions
- Maintains state history/audit trail
- Handles concurrent state changes

**3. Notification Service**
- Processes notification events
- Manages in-app notification delivery
- Handles notification preferences
- Maintains notification history

**4. Transaction Service**
- Manages bank hour transfers
- Handles escrow operations
- Prevents negative balances
- Maintains transaction ledger

**5. User Service**
- Manages user profiles and authentication
- Handles registration workflows
- Manages user preferences
- Integrates with AWS Cognito

**6. Service Management Service**
- Manages service offerings
- Handles service validation
- Manages service lifecycle
- Maintains service catalog

### Data Models

**User Entity**
```json
{
  "userId": "uuid",
  "email": "string",
  "profile": {
    "name": "string",
    "skills": ["string"],
    "bio": "string"
  },
  "bankHours": "number",
  "status": "ACTIVE|SUSPENDED|DEACTIVATED",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Service Entity**
```json
{
  "serviceId": "uuid",
  "providerId": "uuid",
  "title": "string",
  "description": "string",
  "hourlyRate": "number",
  "category": "string",
  "status": "ACTIVE|DEACTIVATED",
  "responseTimeHours": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Request Entity**
```json
{
  "requestId": "uuid",
  "serviceId": "uuid",
  "requesterId": "uuid",
  "providerId": "uuid",
  "status": "PENDING_VALIDATION|ACTIVE|ACCEPTED|IN_PROGRESS|COMPLETED|PAID",
  "estimatedHours": "number",
  "agreedRate": "number",
  "escrowId": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Transaction Entity**
```json
{
  "transactionId": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": "number",
  "type": "ESCROW|TRANSFER|REFUND",
  "status": "PENDING|COMPLETED|FAILED",
  "requestId": "uuid",
  "createdAt": "timestamp"
}
```

---

## Implementation Roadmap

### Phase 1: Core MVP (Months 1-2)
- User registration and authentication
- Basic service creation and browsing
- Simple request/accept workflow
- In-app notifications
- Basic transaction processing

### Phase 2: Enhanced Features (Months 3-4)
- Mutual confirmation system
- Rating and review system
- Dispute handling
- Admin moderation tools
- Enhanced profile management

### Phase 3: Future Enhancements (Months 5+)
- Milestone-based tracking
- Community moderation
- Advanced notification preferences
- Identity verification
- Referral and reward systems

---

## Technical Architecture

### AWS Services Stack
- **API Gateway**: REST API endpoints
- **Lambda Functions**: Event processors and business logic
- **EventBridge**: Event bus and routing
- **DynamoDB**: Primary data storage
- **Cognito**: User authentication
- **SES**: Email notifications (future)
- **CloudWatch**: Monitoring and logging
- **S3**: File storage for profiles/documents

### Event Processing Pattern
1. **Command**: User action triggers API call
2. **Event**: API publishes event to EventBridge
3. **Processors**: Lambda functions process events
4. **State Update**: Database state updated
5. **Notifications**: Downstream events trigger notifications

This comprehensive event-driven architecture provides a solid foundation for HourBank's skill exchange platform, balancing simplicity for rapid development with scalability for future growth.
