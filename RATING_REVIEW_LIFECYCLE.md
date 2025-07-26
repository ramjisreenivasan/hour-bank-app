# HourBank Rating & Review System Lifecycle
## Current Implementation (Initial Release)

This document details the complete lifecycle of ratings and reviews from submission to moderation, including all events, actors, and system actions.

---

## Actors
- **Requester**: User who received the service and can rate
- **Provider**: User who provided the service (receives ratings)
- **System**: HourBank platform automated processes
- **Admin**: Platform administrator/moderator

---

## Complete Rating & Review Lifecycle

### Phase 1: Rating Eligibility & Submission

#### Step 1: Rating Eligibility Check
**Actor**: System (triggered by service completion)  
**Action**: Determines if rating is now available

```
EVENT: RatingEligibilityChecked
├── Payload: {
│   ├── requestId: "uuid"
│   ├── requesterId: "uuid"
│   ├── providerId: "uuid"
│   ├── serviceCompletedAt: "ISO8601"
│   ├── paymentCompletedAt: "ISO8601"
│   └── ratingEligible: boolean
│   }
├── State Change: NONE → RATING_AVAILABLE
└── Triggers: RatingEnabled
```

**System Actions**:
1. Verify service was completed and paid
2. Check requester hasn't already rated
3. Enable rating functionality for requester
4. Set rating window (no expiration in initial release)
5. Log rating availability

---

#### Step 2: Rating Submission
**Actor**: Requester  
**Action**: Submits rating and optional review

```
EVENT: RatingSubmitted
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── requestId: "uuid"
│   ├── requesterId: "uuid"
│   ├── providerId: "uuid"
│   ├── rating: number (1-5)
│   ├── reviewText: "string" (optional)
│   ├── serviceCategory: "string"
│   ├── submittedAt: "ISO8601"
│   └── ipAddress: "string"
│   }
├── State Change: RATING_AVAILABLE → RATING_SUBMITTED
└── Triggers: RatingValidationStarted
```

**System Actions**:
1. Create rating record with status `RATING_SUBMITTED`
2. Generate unique ratingId
3. Store rating and review text
4. Link to service request
5. Log rating submission

---

#### Step 3: Rating Validation
**Actor**: System  
**Action**: Validates rating submission

```
EVENT: RatingValidationStarted
├── Validation Checks:
│   ├── Rating is within valid range (1-5)
│   ├── Review text is appropriate length
│   ├── No inappropriate language detected
│   ├── Requester is authorized to rate
│   ├── No duplicate rating exists
│   └── Service request is eligible for rating
├── State Change: RATING_SUBMITTED → VALIDATING_RATING
└── Triggers: RatingValidationCompleted
```

**System Actions**:
1. Update rating status to `VALIDATING_RATING`
2. Run content filtering on review text
3. Validate rating value and requester authorization
4. Check for spam or duplicate submissions

---

#### Step 4A: Rating Validation Success
**Actor**: System  
**Action**: Rating passes validation, publish immediately

```
EVENT: RatingValidationCompleted (Success)
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── validationResult: "PASSED"
│   ├── autoPublished: true
│   ├── contentScore: number
│   └── validatedAt: "ISO8601"
│   }
├── State Change: VALIDATING_RATING → PUBLISHED
└── Triggers: RatingPublished, ProviderRatingUpdated
```

**System Actions**:
1. Update rating status to `PUBLISHED`
2. Make rating visible on provider profile
3. Update provider's average rating
4. Create notification for provider
5. Log successful publication

---

#### Step 4B: Rating Validation Flagged
**Actor**: System  
**Action**: Rating flagged for manual review

```
EVENT: RatingValidationCompleted (Flagged)
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── validationResult: "FLAGGED"
│   ├── flagReasons: ["string"]
│   ├── contentScore: number
│   └── flaggedAt: "ISO8601"
│   }
├── State Change: VALIDATING_RATING → PENDING_MODERATION
└── Triggers: AdminModerationQueued
```

**System Actions**:
1. Update rating status to `PENDING_MODERATION`
2. Add to admin moderation queue
3. Hide rating from public view
4. Create notification for requester about review
5. Log flagging reasons

---

### Phase 2: Provider Rating Update

#### Step 5: Provider Rating Calculation
**Actor**: System  
**Action**: Recalculates provider's overall rating

```
EVENT: ProviderRatingUpdateStarted
├── Payload: {
│   ├── providerId: "uuid"
│   ├── newRatingId: "uuid"
│   ├── newRatingValue: number
│   ├── currentAverageRating: number
│   ├── totalRatingsCount: number
│   └── calculationStartedAt: "ISO8601"
│   }
├── State Change: N/A (Calculation process)
└── Triggers: ProviderRatingUpdated
```

**System Actions**:
1. Retrieve all published ratings for provider
2. Calculate new average rating
3. Update rating statistics
4. Determine rating trend (improving/declining)

---

#### Step 6: Provider Rating Updated
**Actor**: System  
**Action**: Updates provider's profile with new rating

```
EVENT: ProviderRatingUpdated
├── Payload: {
│   ├── providerId: "uuid"
│   ├── previousAverageRating: number
│   ├── newAverageRating: number
│   ├── totalRatings: number
│   ├── ratingDistribution: object
│   ├── ratingTrend: "IMPROVING|STABLE|DECLINING"
│   └── updatedAt: "ISO8601"
│   }
├── State Change: N/A (Profile update)
└── Triggers: ProviderProfileUpdated, ProviderNotified
```

**System Actions**:
1. Update provider's profile with new average rating
2. Update rating distribution statistics
3. Update search index with new rating
4. Create notification for provider
5. Log rating update

---

### Phase 3: Review Moderation

#### Step 7: Admin Review Process
**Actor**: Admin  
**Action**: Reviews flagged rating/review

```
EVENT: AdminModerationStarted
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── moderationStartedAt: "ISO8601"
│   ├── flagReasons: ["string"]
│   └── originalContent: object
│   }
├── State Change: PENDING_MODERATION → UNDER_REVIEW
└── Triggers: ModerationInProgress
```

**System Actions**:
1. Update rating status to `UNDER_REVIEW`
2. Assign to admin for review
3. Provide moderation context and tools
4. Log moderation start

---

#### Step 8A: Admin Approves Rating
**Actor**: Admin  
**Action**: Approves flagged rating for publication

```
EVENT: AdminModerationCompleted (Approved)
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── moderationResult: "APPROVED"
│   ├── adminNotes: "string"
│   ├── moderatedAt: "ISO8601"
│   └── modifications: object (if any)
│   }
├── State Change: UNDER_REVIEW → PUBLISHED
└── Triggers: RatingPublished, ProviderRatingUpdated
```

**System Actions**:
1. Update rating status to `PUBLISHED`
2. Make rating visible on provider profile
3. Update provider's average rating
4. Create notifications for both parties
5. Log admin approval

---

#### Step 8B: Admin Rejects Rating
**Actor**: Admin  
**Action**: Rejects inappropriate rating

```
EVENT: AdminModerationCompleted (Rejected)
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── moderationResult: "REJECTED"
│   ├── rejectionReasons: ["string"]
│   ├── adminFeedback: "string"
│   └── moderatedAt: "ISO8601"
│   }
├── State Change: UNDER_REVIEW → REJECTED
└── Triggers: RatingRejected, RequesterNotified
```

**System Actions**:
1. Update rating status to `REJECTED`
2. Keep rating hidden from public view
3. Create notification for requester with feedback
4. Log rejection reasons
5. Allow requester to resubmit if appropriate

---

### Phase 4: Review Reporting & Management

#### Step 9: Review Report Submission
**Actor**: Provider or other users  
**Action**: Reports inappropriate review

```
EVENT: ReviewReported
├── Payload: {
│   ├── reportId: "uuid"
│   ├── ratingId: "uuid"
│   ├── reportedBy: "uuid"
│   ├── reportReason: "INAPPROPRIATE|SPAM|FALSE|HARASSMENT"
│   ├── reportDetails: "string"
│   ├── reportedAt: "ISO8601"
│   └── reporterType: "PROVIDER|USER|SYSTEM"
│   }
├── State Change: PUBLISHED → REPORTED
└── Triggers: ReportQueued, AdminNotified
```

**System Actions**:
1. Create report record
2. Update rating status to `REPORTED`
3. Add to admin review queue
4. Create notification for admin
5. Log report submission

---

#### Step 10: Report Investigation
**Actor**: Admin  
**Action**: Investigates reported review

```
EVENT: ReportInvestigationStarted
├── Payload: {
│   ├── reportId: "uuid"
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── investigationStartedAt: "ISO8601"
│   └── reportDetails: object
│   }
├── State Change: REPORTED → UNDER_INVESTIGATION
└── Triggers: InvestigationInProgress
```

**System Actions**:
1. Update rating status to `UNDER_INVESTIGATION`
2. Assign to admin for investigation
3. Provide investigation tools and context
4. Temporarily hide review if severe violation suspected

---

#### Step 11A: Report Dismissed
**Actor**: Admin  
**Action**: Dismisses report as unfounded

```
EVENT: ReportInvestigationCompleted (Dismissed)
├── Payload: {
│   ├── reportId: "uuid"
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── investigationResult: "DISMISSED"
│   ├── dismissalReason: "string"
│   └── investigatedAt: "ISO8601"
│   }
├── State Change: UNDER_INVESTIGATION → PUBLISHED
└── Triggers: ReportDismissed, ReporterNotified
```

**System Actions**:
1. Update rating status to `PUBLISHED`
2. Ensure rating remains visible
3. Close report as dismissed
4. Create notification for reporter
5. Log dismissal

---

#### Step 11B: Report Upheld - Review Removed
**Actor**: Admin  
**Action**: Upholds report and removes review

```
EVENT: ReportInvestigationCompleted (Upheld)
├── Payload: {
│   ├── reportId: "uuid"
│   ├── ratingId: "uuid"
│   ├── adminId: "uuid"
│   ├── investigationResult: "UPHELD"
│   ├── violationType: "string"
│   ├── actionTaken: "REVIEW_REMOVED"
│   └── investigatedAt: "ISO8601"
│   }
├── State Change: UNDER_INVESTIGATION → REMOVED
└── Triggers: ReviewRemoved, ProviderRatingUpdated
```

**System Actions**:
1. Update rating status to `REMOVED`
2. Hide review from public view
3. Recalculate provider's average rating
4. Create notifications for all parties
5. Log removal action

---

## Exception Flows

### Rating Modification Request

#### Requester Requests Rating Change
**Actor**: Requester  
**Action**: Requests to modify submitted rating

```
EVENT: RatingModificationRequested
├── Payload: {
│   ├── ratingId: "uuid"
│   ├── requesterId: "uuid"
│   ├── currentRating: number
│   ├── newRating: number
│   ├── modificationReason: "string"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: PUBLISHED → MODIFICATION_REQUESTED
└── Triggers: AdminApprovalRequired
```

**System Actions**:
1. Update rating status to `MODIFICATION_REQUESTED`
2. Store modification request
3. Queue for admin approval
4. Create notification for admin

---

### Bulk Rating Operations

#### Provider Account Suspension Impact
**Actor**: Admin  
**Action**: Suspends provider account

```
EVENT: ProviderAccountSuspended
├── Payload: {
│   ├── providerId: "uuid"
│   ├── adminId: "uuid"
│   ├── suspensionReason: "string"
│   ├── affectedRatingIds: ["uuid"]
│   └── suspendedAt: "ISO8601"
│   }
├── State Change: [ALL_RATINGS] → PROVIDER_SUSPENDED
└── Triggers: RatingsHidden
```

**System Actions**:
1. Update all provider ratings to `PROVIDER_SUSPENDED`
2. Hide ratings from public view
3. Preserve rating data for potential restoration
4. Update provider's profile status

---

### Rating Analytics

#### Rating Trend Analysis
**Actor**: System (scheduled job)  
**Action**: Analyzes rating trends

```
EVENT: RatingTrendAnalysisStarted
├── Payload: {
│   ├── analysisId: "uuid"
│   ├── analysisType: "DAILY|WEEKLY|MONTHLY"
│   ├── providersAnalyzed: number
│   └── startedAt: "ISO8601"
│   }
├── State Change: N/A
└── Triggers: TrendAnalysisCompleted
```

**System Actions**:
1. Analyze rating patterns across providers
2. Identify trending providers
3. Detect unusual rating patterns
4. Generate analytics reports
5. Flag potential rating manipulation

---

## State Diagram Summary

```
RATING_AVAILABLE → RATING_SUBMITTED → VALIDATING_RATING → PUBLISHED → REPORTED → UNDER_INVESTIGATION → REMOVED
                         ↓                    ↓              ↓           ↓              ↓
                    VALIDATION_FAILED   PENDING_MODERATION  REJECTED   DISMISSED   PUBLISHED
                                             ↓
                                        UNDER_REVIEW
                                             ↓
                                        PUBLISHED/REJECTED
```

---

## Event Processing Architecture

### Lambda Functions (Event Processors)
1. **RatingValidator**: Validates rating submissions
2. **ContentModerator**: Handles content filtering
3. **RatingCalculator**: Updates provider ratings
4. **ModerationProcessor**: Manages admin review workflow
5. **ReportProcessor**: Handles review reports
6. **AnalyticsEngine**: Generates rating analytics

### Database Tables
- **Ratings**: Main rating and review records
- **RatingReports**: Review report records
- **ModerationQueue**: Admin review queue
- **ProviderRatings**: Aggregated provider rating data
- **RatingAnalytics**: Trend analysis and statistics

### Integration Points
- **User Service**: Validates user permissions
- **Service Request Service**: Links ratings to completed services
- **Notification Service**: Sends rating-related notifications
- **Search Service**: Updates provider search rankings
- **Admin Service**: Moderation tools and workflows

This lifecycle ensures quality control of ratings and reviews while maintaining transparency and fairness for both service providers and requesters through proper validation, moderation, and reporting mechanisms.
