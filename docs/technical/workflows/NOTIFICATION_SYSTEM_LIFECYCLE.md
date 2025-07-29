# HourBank Notification System Lifecycle
## Current Implementation (Initial Release)

This document details the complete lifecycle of in-app notifications from trigger events to user interaction, including all events, actors, and system actions.

---

## Actors
- **User**: Notification recipient
- **System**: HourBank platform automated processes
- **Notification Service**: Core notification processing engine
- **Event Bus**: AWS EventBridge for event routing

---

## Complete Notification System Lifecycle

### Phase 1: Notification Trigger & Creation

#### Step 1: Event-Based Notification Trigger
**Actor**: System (various services)  
**Action**: Service emits event that should trigger notification

```
EVENT: NotificationTriggerReceived
├── Payload: {
│   ├── triggerId: "uuid"
│   ├── eventType: "SERVICE_REQUEST_RECEIVED|REQUEST_ACCEPTED|SERVICE_COMPLETED|etc."
│   ├── recipientUserId: "uuid"
│   ├── actorUserId: "uuid" (optional)
│   ├── entityId: "uuid" (requestId, serviceId, etc.)
│   ├── eventData: object
│   └── triggeredAt: "ISO8601"
│   }
├── State Change: NONE → TRIGGER_RECEIVED
└── Triggers: NotificationEligibilityCheck
```

**System Actions**:
1. Receive event from EventBridge
2. Parse event payload and context
3. Identify notification recipient
4. Log trigger reception

---

#### Step 2: Notification Eligibility Check
**Actor**: Notification Service  
**Action**: Determines if notification should be created

```
EVENT: NotificationEligibilityChecked
├── Eligibility Checks:
│   ├── User account is active
│   ├── User has not disabled this notification type
│   ├── Event type is in essential notifications list
│   ├── No duplicate notification exists
│   ├── User is not the actor (no self-notifications)
│   └── Rate limiting not exceeded
├── State Change: TRIGGER_RECEIVED → CHECKING_ELIGIBILITY
└── Triggers: NotificationCreationStarted OR NotificationSuppressed
```

**System Actions**:
1. Update trigger status to `CHECKING_ELIGIBILITY`
2. Validate user account status
3. Check notification preferences (future: currently all essential)
4. Verify event type is in allowed list
5. Check for duplicate notifications

---

#### Step 3A: Notification Creation (Eligible)
**Actor**: Notification Service  
**Action**: Creates notification for eligible event

```
EVENT: NotificationCreationStarted
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── triggerId: "uuid"
│   ├── recipientUserId: "uuid"
│   ├── notificationType: "SERVICE_REQUEST|TRANSACTION|DISPUTE|SYSTEM"
│   ├── priority: "HIGH|MEDIUM|LOW"
│   ├── title: "string"
│   ├── message: "string"
│   ├── actionUrl: "string" (optional)
│   ├── entityId: "uuid"
│   └── createdAt: "ISO8601"
│   }
├── State Change: CHECKING_ELIGIBILITY → CREATING_NOTIFICATION
└── Triggers: NotificationCreated
```

**System Actions**:
1. Generate unique notificationId
2. Create notification record with status `CREATING_NOTIFICATION`
3. Generate notification title and message
4. Determine priority level
5. Create action URL if applicable

---

#### Step 3B: Notification Suppressed (Ineligible)
**Actor**: Notification Service  
**Action**: Suppresses notification for ineligible event

```
EVENT: NotificationSuppressed
├── Payload: {
│   ├── triggerId: "uuid"
│   ├── recipientUserId: "uuid"
│   ├── suppressionReason: "USER_DISABLED|DUPLICATE|RATE_LIMITED|SELF_ACTION"
│   ├── eventType: "string"
│   └── suppressedAt: "ISO8601"
│   }
├── State Change: CHECKING_ELIGIBILITY → SUPPRESSED
└── Triggers: SuppressionLogged
```

**System Actions**:
1. Update trigger status to `SUPPRESSED`
2. Log suppression reason
3. Update rate limiting counters
4. No notification created

---

#### Step 4: Notification Created
**Actor**: Notification Service  
**Action**: Completes notification creation

```
EVENT: NotificationCreated
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── recipientUserId: "uuid"
│   ├── notificationType: "string"
│   ├── title: "string"
│   ├── message: "string"
│   ├── priority: "string"
│   ├── status: "UNREAD"
│   ├── actionUrl: "string"
│   └── createdAt: "ISO8601"
│   }
├── State Change: CREATING_NOTIFICATION → UNREAD
└── Triggers: NotificationDelivered, BadgeCountUpdated
```

**System Actions**:
1. Update notification status to `UNREAD`
2. Store notification in database
3. Update user's unread notification count
4. Make notification available in user's feed
5. Log successful creation

---

### Phase 2: Notification Delivery & Display

#### Step 5: Badge Count Update
**Actor**: Notification Service  
**Action**: Updates user's notification badge count

```
EVENT: BadgeCountUpdated
├── Payload: {
│   ├── userId: "uuid"
│   ├── previousCount: number
│   ├── newCount: number
│   ├── notificationId: "uuid"
│   └── updatedAt: "ISO8601"
│   }
├── State Change: N/A (Badge update)
└── Triggers: BadgeCountDelivered
```

**System Actions**:
1. Increment user's unread notification count
2. Update badge display data
3. Prepare real-time update for active sessions
4. Log badge count change

---

#### Step 6: Notification Delivery
**Actor**: Notification Service  
**Action**: Makes notification available to user

```
EVENT: NotificationDelivered
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── recipientUserId: "uuid"
│   ├── deliveryMethod: "IN_APP"
│   ├── deliveredAt: "ISO8601"
│   └── deliveryStatus: "DELIVERED"
│   }
├── State Change: UNREAD → DELIVERED
└── Triggers: NotificationAvailable
```

**System Actions**:
1. Update notification status to `DELIVERED`
2. Add to user's notification feed
3. Enable real-time display if user is online
4. Log successful delivery

---

### Phase 3: User Interaction

#### Step 7: Notification Viewed
**Actor**: User  
**Action**: Views notification in notification center

```
EVENT: NotificationViewed
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── userId: "uuid"
│   ├── viewedAt: "ISO8601"
│   ├── viewMethod: "NOTIFICATION_CENTER|BADGE_CLICK"
│   └── sessionId: "string"
│   }
├── State Change: DELIVERED → VIEWED
└── Triggers: NotificationMarkedAsViewed
```

**System Actions**:
1. Update notification status to `VIEWED`
2. Record view timestamp
3. Log user interaction
4. Keep notification in feed (still unread)

---

#### Step 8: Notification Read
**Actor**: User  
**Action**: Clicks on notification or marks as read

```
EVENT: NotificationRead
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── userId: "uuid"
│   ├── readAt: "ISO8601"
│   ├── readMethod: "CLICK|MARK_READ|AUTO_READ"
│   ├── actionTaken: boolean
│   └── sessionId: "string"
│   }
├── State Change: VIEWED → READ
└── Triggers: BadgeCountDecremented, NotificationMarkedAsRead
```

**System Actions**:
1. Update notification status to `READ`
2. Decrement user's unread notification count
3. Update badge display
4. Log read action
5. Track if user took associated action

---

#### Step 9: Badge Count Decremented
**Actor**: Notification Service  
**Action**: Updates badge count after notification read

```
EVENT: BadgeCountDecremented
├── Payload: {
│   ├── userId: "uuid"
│   ├── previousCount: number
│   ├── newCount: number
│   ├── notificationId: "uuid"
│   └── decrementedAt: "ISO8601"
│   }
├── State Change: N/A (Badge update)
└── Triggers: BadgeCountUpdated
```

**System Actions**:
1. Decrement user's unread notification count
2. Update badge display data
3. Send real-time update to active sessions
4. Log badge count change

---

### Phase 4: Notification Management

#### Step 10: Notification Action Taken
**Actor**: User  
**Action**: Clicks notification action button/link

```
EVENT: NotificationActionTaken
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── userId: "uuid"
│   ├── actionType: "VIEW_REQUEST|ACCEPT_SERVICE|VIEW_PROFILE"
│   ├── actionUrl: "string"
│   ├── actionTakenAt: "ISO8601"
│   └── sessionId: "string"
│   }
├── State Change: READ → ACTIONED
└── Triggers: ActionTracked, UserRedirected
```

**System Actions**:
1. Update notification status to `ACTIONED`
2. Track action completion
3. Redirect user to appropriate page
4. Log action taken
5. Update engagement metrics

---

#### Step 11: Notification Dismissed
**Actor**: User  
**Action**: Dismisses notification without action

```
EVENT: NotificationDismissed
├── Payload: {
│   ├── notificationId: "uuid"
│   ├── userId: "uuid"
│   ├── dismissedAt: "ISO8601"
│   ├── dismissMethod: "SWIPE|BUTTON|AUTO_DISMISS"
│   └── sessionId: "string"
│   }
├── State Change: READ → DISMISSED
└── Triggers: NotificationHidden
```

**System Actions**:
1. Update notification status to `DISMISSED`
2. Hide notification from active feed
3. Keep in notification history
4. Log dismissal action
5. Update user engagement metrics

---

### Phase 5: Notification Cleanup & Analytics

#### Step 12: Bulk Mark as Read
**Actor**: User  
**Action**: Marks all notifications as read

```
EVENT: BulkNotificationsRead
├── Payload: {
│   ├── userId: "uuid"
│   ├── notificationIds: ["uuid"]
│   ├── totalMarked: number
│   ├── markedAt: "ISO8601"
│   └── sessionId: "string"
│   }
├── State Change: [MULTIPLE] → READ
└── Triggers: BadgeCountReset
```

**System Actions**:
1. Update multiple notifications to `READ`
2. Reset user's unread notification count to 0
3. Update badge display
4. Log bulk action
5. Update user engagement metrics

---

#### Step 13: Notification Cleanup
**Actor**: System (scheduled job)  
**Action**: Cleans up old notifications

```
EVENT: NotificationCleanupStarted
├── Payload: {
│   ├── cleanupId: "uuid"
│   ├── cleanupType: "DAILY|WEEKLY"
│   ├── retentionDays: number
│   ├── usersProcessed: number
│   └── startedAt: "ISO8601"
│   }
├── State Change: N/A
└── Triggers: OldNotificationsArchived
```

**System Actions**:
1. Identify notifications older than retention period
2. Archive old notifications
3. Clean up dismissed notifications
4. Update storage metrics
5. Log cleanup results

---

## Exception Flows

### Notification Failure Handling

#### Notification Creation Failed
**Actor**: Notification Service  
**Action**: Handles notification creation failure

```
EVENT: NotificationCreationFailed
├── Payload: {
│   ├── triggerId: "uuid"
│   ├── recipientUserId: "uuid"
│   ├── failureReason: "DATABASE_ERROR|VALIDATION_FAILED|SYSTEM_ERROR"
│   ├── errorDetails: "string"
│   └── failedAt: "ISO8601"
│   }
├── State Change: CREATING_NOTIFICATION → FAILED
└── Triggers: NotificationRetryQueued
```

**System Actions**:
1. Update trigger status to `FAILED`
2. Log failure details
3. Queue for retry if appropriate
4. Alert system administrators if critical

---

### Rate Limiting

#### Rate Limit Exceeded
**Actor**: Notification Service  
**Action**: Applies rate limiting to prevent spam

```
EVENT: NotificationRateLimitExceeded
├── Payload: {
│   ├── userId: "uuid"
│   ├── eventType: "string"
│   ├── currentCount: number
│   ├── limitThreshold: number
│   ├── windowStart: "ISO8601"
│   └── limitExceededAt: "ISO8601"
│   }
├── State Change: CHECKING_ELIGIBILITY → RATE_LIMITED
└── Triggers: NotificationSuppressed
```

**System Actions**:
1. Suppress notification creation
2. Update rate limiting counters
3. Log rate limit event
4. Schedule reset of rate limit window

---

### System Notifications

#### System-Wide Announcement
**Actor**: Admin  
**Action**: Sends system-wide notification

```
EVENT: SystemNotificationBroadcast
├── Payload: {
│   ├── broadcastId: "uuid"
│   ├── adminId: "uuid"
│   ├── notificationType: "MAINTENANCE|FEATURE|SECURITY"
│   ├── title: "string"
│   ├── message: "string"
│   ├── targetUsers: "ALL|ACTIVE|PROVIDERS|REQUESTERS"
│   └── broadcastAt: "ISO8601"
│   }
├── State Change: N/A
└── Triggers: BulkNotificationsCreated
```

**System Actions**:
1. Create notifications for target user group
2. Set high priority for system notifications
3. Bypass some rate limiting rules
4. Log broadcast details
5. Track delivery metrics

---

## State Diagram Summary

```
TRIGGER_RECEIVED → CHECKING_ELIGIBILITY → CREATING_NOTIFICATION → UNREAD → DELIVERED → VIEWED → READ → ACTIONED
       ↓                    ↓                      ↓                ↓         ↓         ↓      ↓
   SUPPRESSED           SUPPRESSED              FAILED           DISMISSED  DISMISSED  DISMISSED  DISMISSED
```

---

## Event Processing Architecture

### Lambda Functions (Event Processors)
1. **NotificationTriggerProcessor**: Handles incoming trigger events
2. **NotificationCreator**: Creates and formats notifications
3. **DeliveryManager**: Manages notification delivery
4. **BadgeCountManager**: Handles badge count updates
5. **CleanupProcessor**: Manages notification cleanup
6. **AnalyticsProcessor**: Tracks notification metrics

### Database Tables
- **Notifications**: Main notification records
- **NotificationTriggers**: Event trigger tracking
- **UserNotificationCounts**: Badge count tracking
- **NotificationPreferences**: User preferences (future)
- **NotificationAnalytics**: Engagement metrics

### Integration Points
- **EventBridge**: Receives trigger events from all services
- **User Service**: Validates user accounts and preferences
- **WebSocket Service**: Real-time notification delivery (future)
- **Analytics Service**: Notification engagement tracking
- **Admin Service**: System notification broadcasting

### Essential Notification Types (Initial Release)
1. **Service Request Received** - Provider gets notified of new request
2. **Request Accepted/Rejected** - Requester gets response notification
3. **Service Started** - Both parties notified when work begins
4. **Service Completed** - Both parties notified when work is done
5. **Payment Processed** - Both parties notified of hour transfer
6. **Dispute Raised** - Both parties and admin notified of disputes
7. **Rating Received** - Provider notified of new rating

This lifecycle ensures reliable, user-friendly notification delivery while preventing spam and maintaining system performance through proper rate limiting and cleanup processes.
