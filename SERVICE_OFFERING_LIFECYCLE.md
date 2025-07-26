# HourBank Service Offering Management Lifecycle
## Current Implementation (Initial Release)

This document details the complete lifecycle of service offering management from creation to deactivation, including all events, actors, and system actions.

---

## Actors
- **Provider**: User creating/managing the service offering
- **System**: HourBank platform automated processes
- **Admin**: Platform administrator/moderator

---

## Complete Service Offering Lifecycle

### Phase 1: Service Creation & Validation

#### Step 1: Service Creation Initiation
**Actor**: Provider  
**Action**: Fills out service creation form and submits

```
EVENT: ServiceOfferingCreated
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── providerId: "uuid"
│   ├── title: "string"
│   ├── description: "string"
│   ├── category: "string"
│   ├── hourlyRate: number
│   ├── estimatedDuration: number
│   ├── tags: ["string"]
│   ├── responseTimeHours: number
│   └── timestamp: "ISO8601"
│   }
├── State Change: NONE → DRAFT
└── Triggers: ServiceValidationStarted
```

**System Actions**:
1. Create service record with status `DRAFT`
2. Generate unique serviceId
3. Log service creation
4. Emit `ServiceValidationStarted` event

---

#### Step 2: Automated Content Validation
**Actor**: System  
**Action**: Runs automated validation checks

```
EVENT: ServiceValidationStarted
├── Validation Checks:
│   ├── Content filtering (inappropriate language)
│   ├── Pricing validation (reasonable rates)
│   ├── Required fields completion
│   ├── Category appropriateness
│   ├── Description quality check
│   └── Provider account status
├── State Change: DRAFT → VALIDATING
└── Triggers: ServiceValidationCompleted
```

**System Actions**:
1. Run content filtering algorithms
2. Validate pricing against category averages
3. Check for spam/duplicate content
4. Update service status to `VALIDATING`

---

#### Step 3A: Validation Success (Auto-Approval)
**Actor**: System  
**Action**: Service passes all automated checks

```
EVENT: ServiceValidationCompleted (Success)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── validationResult: "PASSED"
│   ├── autoApproved: true
│   ├── publishedAt: "ISO8601"
│   └── validationScore: number
│   }
├── State Change: VALIDATING → ACTIVE
└── Triggers: ServicePublished, ProviderNotified
```

**System Actions**:
1. Update service status to `ACTIVE`
2. Add service to marketplace search index
3. Create notification for provider
4. Log successful publication

---

#### Step 3B: Validation Flagged (Manual Review Required)
**Actor**: System  
**Action**: Service flagged for manual review

```
EVENT: ServiceValidationCompleted (Flagged)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── validationResult: "FLAGGED"
│   ├── flagReasons: ["string"]
│   ├── reviewRequired: true
│   └── flaggedAt: "ISO8601"
│   }
├── State Change: VALIDATING → PENDING_REVIEW
└── Triggers: AdminReviewQueued, ProviderNotified
```

**System Actions**:
1. Update service status to `PENDING_REVIEW`
2. Add to admin review queue
3. Create notification for provider about review
4. Log flagging reasons

---

#### Step 4A: Admin Approval
**Actor**: Admin  
**Action**: Reviews and approves flagged service

```
EVENT: AdminReviewCompleted (Approved)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── adminId: "uuid"
│   ├── reviewResult: "APPROVED"
│   ├── adminNotes: "string"
│   ├── reviewedAt: "ISO8601"
│   └── modifications: object (optional)
│   }
├── State Change: PENDING_REVIEW → ACTIVE
└── Triggers: ServicePublished, ProviderNotified
```

**System Actions**:
1. Update service status to `ACTIVE`
2. Add service to marketplace
3. Create notification for provider
4. Log admin approval

---

#### Step 4B: Admin Rejection
**Actor**: Admin  
**Action**: Reviews and rejects flagged service

```
EVENT: AdminReviewCompleted (Rejected)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── adminId: "uuid"
│   ├── reviewResult: "REJECTED"
│   ├── rejectionReasons: ["string"]
│   ├── adminFeedback: "string"
│   └── reviewedAt: "ISO8601"
│   }
├── State Change: PENDING_REVIEW → REJECTED
└── Triggers: ProviderNotified
```

**System Actions**:
1. Update service status to `REJECTED`
2. Create detailed notification for provider
3. Log rejection reasons
4. Allow provider to resubmit with modifications

---

### Phase 2: Service Management & Modification

#### Step 5: Modification Attempt
**Actor**: Provider  
**Action**: Attempts to edit active service

```
EVENT: ServiceModificationAttempted
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── providerId: "uuid"
│   ├── proposedChanges: object
│   ├── modificationReason: "string"
│   └── timestamp: "ISO8601"
│   }
├── State Change: ACTIVE → CHECKING_DEPENDENCIES
└── Triggers: PendingRequestsCheck
```

**System Actions**:
1. Update service status to `CHECKING_DEPENDENCIES`
2. Query for pending service requests
3. Check for active negotiations

---

#### Step 6A: Modification Blocked (Pending Requests Exist)
**Actor**: System  
**Action**: Blocks modification due to pending requests

```
EVENT: ServiceModificationBlocked
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── blockReason: "PENDING_REQUESTS"
│   ├── pendingRequestCount: number
│   ├── pendingRequestIds: ["uuid"]
│   └── blockedAt: "ISO8601"
│   }
├── State Change: CHECKING_DEPENDENCIES → ACTIVE
└── Triggers: ProviderNotified
```

**System Actions**:
1. Revert service status to `ACTIVE`
2. Create notification explaining block reason
3. List pending requests that need resolution
4. Provide guidance on resolving requests

---

#### Step 6B: Modification Allowed (No Pending Requests)
**Actor**: System  
**Action**: Allows modification to proceed

```
EVENT: ServiceModificationAllowed
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── allowedChanges: object
│   ├── requiresRevalidation: boolean
│   └── allowedAt: "ISO8601"
│   }
├── State Change: CHECKING_DEPENDENCIES → MODIFYING
└── Triggers: ServiceModificationProcessed
```

**System Actions**:
1. Update service status to `MODIFYING`
2. Apply the proposed changes
3. Determine if revalidation is needed

---

#### Step 7A: Modification Completed (No Revalidation)
**Actor**: System  
**Action**: Completes modification for minor changes

```
EVENT: ServiceModificationCompleted (Direct)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── appliedChanges: object
│   ├── modifiedAt: "ISO8601"
│   └── revalidationRequired: false
│   }
├── State Change: MODIFYING → ACTIVE
└── Triggers: ServiceUpdated, ProviderNotified
```

**System Actions**:
1. Update service status to `ACTIVE`
2. Update search index with new information
3. Create notification for provider
4. Log modification details

---

#### Step 7B: Modification Requires Revalidation
**Actor**: System  
**Action**: Major changes require revalidation

```
EVENT: ServiceModificationCompleted (Revalidation)
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── appliedChanges: object
│   ├── modifiedAt: "ISO8601"
│   └── revalidationRequired: true
│   }
├── State Change: MODIFYING → VALIDATING
└── Triggers: ServiceValidationStarted
```

**System Actions**:
1. Update service status to `VALIDATING`
2. Remove from marketplace temporarily
3. Start validation process (same as creation)
4. Create notification for provider

---

### Phase 3: Service Deactivation

#### Step 8: Deactivation Request
**Actor**: Provider  
**Action**: Requests to deactivate service

```
EVENT: ServiceDeactivationRequested
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── providerId: "uuid"
│   ├── deactivationReason: "string"
│   ├── immediateDeactivation: boolean
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ACTIVE → DEACTIVATING
└── Triggers: PendingRequestsCheck
```

**System Actions**:
1. Update service status to `DEACTIVATING`
2. Check for pending/active requests
3. Prepare deactivation process

---

#### Step 9: Deactivation Processing
**Actor**: System  
**Action**: Processes deactivation while preserving active requests

```
EVENT: ServiceDeactivationProcessed
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── deactivatedAt: "ISO8601"
│   ├── activeRequestsCount: number
│   ├── activeRequestIds: ["uuid"]
│   └── marketplaceRemoved: true
│   }
├── State Change: DEACTIVATING → DEACTIVATED
└── Triggers: ServiceRemovedFromMarketplace, ProviderNotified
```

**System Actions**:
1. Update service status to `DEACTIVATED`
2. Remove service from marketplace search
3. Preserve existing request processing
4. Create notification for provider
5. Log deactivation details

---

## Exception Flows

### Reactivation Scenario

#### Service Reactivation Request
**Actor**: Provider  
**Action**: Requests to reactivate deactivated service

```
EVENT: ServiceReactivationRequested
├── Payload: {
│   ├── serviceId: "uuid"
│   ├── providerId: "uuid"
│   ├── reactivationReason: "string"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: DEACTIVATED → VALIDATING
└── Triggers: ServiceValidationStarted
```

**System Actions**:
1. Update service status to `VALIDATING`
2. Run full validation process
3. Check for any policy changes since deactivation

---

### Bulk Operations

#### Provider Account Suspension
**Actor**: Admin  
**Action**: Suspends provider account

```
EVENT: ProviderAccountSuspended
├── Payload: {
│   ├── providerId: "uuid"
│   ├── adminId: "uuid"
│   ├── suspensionReason: "string"
│   ├── affectedServiceIds: ["uuid"]
│   └── suspendedAt: "ISO8601"
│   }
├── State Change: [ALL_SERVICES] → SUSPENDED
└── Triggers: ServicesRemovedFromMarketplace
```

**System Actions**:
1. Update all provider services to `SUSPENDED`
2. Remove all services from marketplace
3. Continue processing existing requests
4. Create notifications for affected requesters

---

## State Diagram Summary

```
DRAFT → VALIDATING → ACTIVE → DEACTIVATED
  ↓         ↓          ↓         ↓
REJECTED  PENDING_   MODIFYING  VALIDATING (reactivation)
          REVIEW       ↓
            ↓        CHECKING_
          ACTIVE    DEPENDENCIES
            ↓          ↓
          REJECTED   ACTIVE
```

---

## Event Processing Architecture

### Lambda Functions (Event Processors)
1. **ServiceValidator**: Processes validation events
2. **ContentModerator**: Handles content filtering
3. **DependencyChecker**: Checks for pending requests
4. **MarketplaceManager**: Manages search index updates
5. **NotificationProcessor**: Manages all notifications
6. **AdminReviewProcessor**: Handles admin review workflow

### Database Tables
- **Services**: Main service offering records
- **ServiceValidations**: Validation history and results
- **AdminReviews**: Manual review records
- **ServiceModifications**: Change history
- **MarketplaceIndex**: Search and discovery data

### Integration Points
- **Search Service**: Updates when services are published/modified
- **Request Service**: Checks dependencies before modifications
- **User Service**: Validates provider account status
- **Notification Service**: Sends updates to providers

This lifecycle ensures proper content moderation, prevents conflicts with active requests, and maintains marketplace quality while giving providers flexibility to manage their offerings.
