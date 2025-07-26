# HourBank User Registration & Profile Management Lifecycle
## Current Implementation (Initial Release) - AWS Cognito Integration

This document details the complete lifecycle of user registration and profile management using AWS Cognito for authentication and email verification, including all events, actors, and system actions.

---

## Actors
- **User**: Person registering or managing their profile
- **System**: HourBank platform automated processes
- **AWS Cognito**: Handles user authentication, registration, and email verification
- **HourBank Backend**: Custom business logic and profile management

---

## Complete User Registration Lifecycle

### Phase 1: User Registration (AWS Cognito Integration)

#### Step 1: Registration Initiation
**Actor**: User  
**Action**: Fills out registration form and submits

```
EVENT: UserRegistrationInitiated
├── Payload: {
│   ├── email: "string"
│   ├── username: "string"
│   ├── password: "string"
│   ├── firstName: "string"
│   ├── lastName: "string"
│   ├── agreedToTerms: boolean
│   └── timestamp: "ISO8601"
│   }
├── State Change: NONE → COGNITO_SIGNUP_INITIATED
└── Triggers: CognitoSignupStarted
```

**System Actions**:
1. Validate form data locally
2. Prepare Cognito signup request
3. Log registration attempt
4. Emit `CognitoSignupStarted` event

---

#### Step 2: AWS Cognito Signup
**Actor**: AWS Cognito  
**Action**: Creates user account and sends verification email

```
EVENT: CognitoSignupStarted
├── Payload: {
│   ├── email: "string"
│   ├── username: "string"
│   ├── password: "hashed_by_cognito"
│   ├── attributes: {
│   │   ├── given_name: "string"
│   │   ├── family_name: "string"
│   │   └── email: "string"
│   │   }
│   └── timestamp: "ISO8601"
│   }
├── State Change: COGNITO_SIGNUP_INITIATED → COGNITO_UNCONFIRMED
└── Triggers: CognitoSignupCompleted OR CognitoSignupFailed
```

**AWS Cognito Actions**:
1. Create user in Cognito User Pool
2. Hash and store password securely
3. Generate email verification code
4. Send verification email automatically
5. Set user status to UNCONFIRMED

---

#### Step 3A: Cognito Signup Success
**Actor**: AWS Cognito  
**Action**: User created successfully, verification email sent

```
EVENT: CognitoSignupCompleted
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── email: "string"
│   ├── userStatus: "UNCONFIRMED"
│   ├── verificationCodeSent: true
│   └── createdAt: "ISO8601"
│   }
├── State Change: COGNITO_UNCONFIRMED → PENDING_EMAIL_VERIFICATION
└── Triggers: HourBankUserCreated
```

**System Actions**:
1. Receive Cognito success callback
2. Create HourBank user profile record
3. Update status to `PENDING_EMAIL_VERIFICATION`
4. Log successful Cognito signup
5. Prepare for email verification

---

#### Step 3B: Cognito Signup Failed
**Actor**: AWS Cognito  
**Action**: Signup failed due to validation or policy issues

```
EVENT: CognitoSignupFailed
├── Payload: {
│   ├── email: "string"
│   ├── username: "string"
│   ├── errorCode: "string"
│   ├── errorMessage: "string"
│   ├── failureReason: "EMAIL_EXISTS|WEAK_PASSWORD|INVALID_EMAIL|POLICY_VIOLATION"
│   └── failedAt: "ISO8601"
│   }
├── State Change: COGNITO_SIGNUP_INITIATED → SIGNUP_FAILED
└── Triggers: UserNotified
```

**System Actions**:
1. Receive Cognito error response
2. Parse error details
3. Create user-friendly error message
4. Log signup failure
5. Return error to frontend

---

#### Step 4: HourBank User Profile Creation
**Actor**: HourBank Backend  
**Action**: Creates internal user profile linked to Cognito user

```
EVENT: HourBankUserCreated
├── Payload: {
│   ├── userId: "uuid" (internal HourBank ID)
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── email: "string"
│   ├── firstName: "string"
│   ├── lastName: "string"
│   ├── status: "PENDING_EMAIL_VERIFICATION"
│   └── createdAt: "ISO8601"
│   }
├── State Change: PENDING_EMAIL_VERIFICATION → AWAITING_CONFIRMATION
└── Triggers: UserProfileInitialized
```

**System Actions**:
1. Create internal user record
2. Link to Cognito user ID
3. Initialize default profile settings
4. Set status to `AWAITING_CONFIRMATION`
5. Prepare for email verification completion

---

#### Step 5A: Email Verification Success (Cognito)
**Actor**: User  
**Action**: Clicks verification link or enters verification code

```
EVENT: CognitoEmailVerified
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── email: "string"
│   ├── userStatus: "CONFIRMED"
│   ├── verifiedAt: "ISO8601"
│   └── verificationMethod: "EMAIL_LINK|VERIFICATION_CODE"
│   }
├── State Change: AWAITING_CONFIRMATION → EMAIL_VERIFIED
└── Triggers: WelcomeBonusProcessed, UserActivated
```

**System Actions**:
1. Receive Cognito confirmation webhook/event
2. Update internal user status to `EMAIL_VERIFIED`
3. Trigger welcome bonus processing
4. Log successful verification

---

#### Step 5B: Email Verification Timeout/Failure
**Actor**: AWS Cognito  
**Action**: Verification code expires or user fails verification

```
EVENT: CognitoEmailVerificationFailed
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── failureReason: "CODE_EXPIRED|INVALID_CODE|MAX_ATTEMPTS_EXCEEDED"
│   ├── userStatus: "UNCONFIRMED"
│   └── failedAt: "ISO8601"
│   }
├── State Change: AWAITING_CONFIRMATION → VERIFICATION_FAILED
└── Triggers: ResendVerificationAvailable
```

**System Actions**:
1. Update internal user status to `VERIFICATION_FAILED`
2. Enable resend verification option
3. Create notification about failure
4. Log verification failure

---

---

#### Step 6: Welcome Bonus Processing
**Actor**: HourBank Backend  
**Action**: Credits welcome bonus bank hours after email verification

```
EVENT: WelcomeBonusProcessed
├── Payload: {
│   ├── userId: "uuid" (internal HourBank ID)
│   ├── cognitoUserId: "uuid"
│   ├── bonusAmount: number (5-10 hours)
│   ├── transactionId: "uuid"
│   ├── bonusType: "WELCOME_BONUS"
│   └── creditedAt: "ISO8601"
│   }
├── State Change: EMAIL_VERIFIED → ACTIVE
└── Triggers: UserActivated, TransactionRecorded
```

**System Actions**:
1. Credit welcome bonus hours to user account
2. Create transaction record
3. Update user status to `ACTIVE`
4. Initialize user profile defaults
5. Create welcome notification

---

#### Step 7: User Activation Complete
**Actor**: HourBank Backend  
**Action**: Completes user activation process

```
EVENT: UserActivated
├── Payload: {
│   ├── userId: "uuid"
│   ├── cognitoUserId: "uuid"
│   ├── activatedAt: "ISO8601"
│   ├── initialBankHours: number
│   ├── profileCompleteness: number
│   └── accessLevel: "BASIC"
│   }
├── State Change: ACTIVE → ACTIVE (confirmed)
└── Triggers: OnboardingStarted
```

**System Actions**:
1. Enable full platform access
2. Create default profile settings
3. Initialize notification preferences
4. Log successful activation
5. Start onboarding flow

---

### Phase 2: Profile Management

#### Step 6: Profile Update Initiated
**Actor**: User  
**Action**: Updates profile information

```
EVENT: ProfileUpdateInitiated
├── Payload: {
│   ├── userId: "uuid"
│   ├── updateType: "BASIC_INFO|SKILLS|PREFERENCES|AVATAR"
│   ├── changedFields: ["string"]
│   ├── oldValues: object
│   ├── newValues: object
│   └── timestamp: "ISO8601"
│   }
├── State Change: ACTIVE → UPDATING_PROFILE
└── Triggers: ProfileValidationStarted
```

**System Actions**:
1. Update user status to `UPDATING_PROFILE`
2. Store old values for rollback
3. Validate new profile data
4. Check for inappropriate content

---

#### Step 7A: Profile Update Success
**Actor**: System  
**Action**: Profile update passes validation

```
EVENT: ProfileUpdateCompleted (Success)
├── Payload: {
│   ├── userId: "uuid"
│   ├── updatedFields: ["string"]
│   ├── newProfileData: object
│   ├── profileCompleteness: number
│   └── updatedAt: "ISO8601"
│   }
├── State Change: UPDATING_PROFILE → ACTIVE
└── Triggers: ProfileDataChanged
```

**System Actions**:
1. Apply profile changes
2. Update user status to `ACTIVE`
3. Recalculate profile completeness score
4. Update search index if skills changed
5. Log successful update

---

#### Step 7B: Profile Update Rejected
**Actor**: System  
**Action**: Profile update fails validation

```
EVENT: ProfileUpdateRejected
├── Payload: {
│   ├── userId: "uuid"
│   ├── rejectionReasons: ["string"]
│   ├── failedFields: ["string"]
│   ├── originalValues: object
│   └── rejectedAt: "ISO8601"
│   }
├── State Change: UPDATING_PROFILE → ACTIVE
└── Triggers: UserNotified
```

**System Actions**:
1. Revert to original profile data
2. Update user status to `ACTIVE`
3. Create notification with rejection reasons
4. Log validation failure

---

### Phase 3: Account Management (AWS Cognito Integration)

#### Step 8: Password Change Request
**Actor**: User  
**Action**: Requests password change through Cognito

```
EVENT: CognitoPasswordChangeRequested
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── changeMethod: "AUTHENTICATED|FORGOT_PASSWORD"
│   ├── ipAddress: "string"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ACTIVE → CHANGING_PASSWORD
└── Triggers: CognitoPasswordChangeProcessed
```

**System Actions**:
1. Update internal user status to `CHANGING_PASSWORD`
2. Let Cognito handle password validation and change
3. Log password change request

---

#### Step 9: Password Change Completed
**Actor**: AWS Cognito  
**Action**: Successfully updates password

```
EVENT: CognitoPasswordChangeCompleted
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── passwordUpdatedAt: "ISO8601"
│   ├── changeMethod: "string"
│   └── sessionInvalidated: boolean
│   }
├── State Change: CHANGING_PASSWORD → ACTIVE
└── Triggers: SecurityEventLogged, SessionsInvalidated
```

**System Actions**:
1. Update internal user status to `ACTIVE`
2. Log security event in HourBank system
3. Cognito automatically invalidates sessions
4. Send security notification (optional)

---

#### Step 10: Account Deactivation Request
**Actor**: User  
**Action**: Requests account deactivation

```
EVENT: AccountDeactivationRequested
├── Payload: {
│   ├── userId: "uuid"
│   ├── cognitoUserId: "uuid"
│   ├── deactivationReason: "string"
│   ├── dataRetention: boolean
│   ├── immediateDeactivation: boolean
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ACTIVE → DEACTIVATING
└── Triggers: ActiveServicesCheck
```

**System Actions**:
1. Update internal user status to `DEACTIVATING`
2. Check for active service requests
3. Check for pending transactions
4. Prepare deactivation process

---

#### Step 11: Account Deactivation Processed
**Actor**: HourBank Backend  
**Action**: Completes account deactivation

```
EVENT: AccountDeactivationCompleted
├── Payload: {
│   ├── userId: "uuid"
│   ├── cognitoUserId: "uuid"
│   ├── deactivatedAt: "ISO8601"
│   ├── dataRetained: boolean
│   ├── servicesDeactivated: number
│   ├── finalBankHours: number
│   └── cognitoUserDisabled: boolean
│   }
├── State Change: DEACTIVATING → DEACTIVATED
└── Triggers: ServicesDeactivated, CognitoUserDisabled
```

**System Actions**:
1. Update internal user status to `DEACTIVATED`
2. Deactivate all user's services
3. Complete pending transactions
4. Archive or delete data per user preference
5. Disable Cognito user account (not delete)

---

## Exception Flows

### Email Verification Resend (Cognito)

#### Resend Verification Email
**Actor**: User  
**Action**: Requests new verification email through Cognito

```
EVENT: CognitoVerificationResendRequested
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── email: "string"
│   ├── resendReason: "CODE_EXPIRED|CODE_LOST|EMAIL_NOT_RECEIVED"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: VERIFICATION_FAILED → PENDING_EMAIL_VERIFICATION
└── Triggers: CognitoVerificationCodeSent
```

**System Actions**:
1. Call Cognito ResendConfirmationCode API
2. Update internal user status to `PENDING_EMAIL_VERIFICATION`
3. Log resend request
4. Cognito handles new code generation and email sending

---

### Account Recovery (Cognito)

#### Password Reset Request
**Actor**: User  
**Action**: Requests password reset through Cognito

```
EVENT: CognitoPasswordResetRequested
├── Payload: {
│   ├── username: "string"
│   ├── email: "string"
│   ├── ipAddress: "string"
│   └── requestedAt: "ISO8601"
│   }
├── State Change: ACTIVE → PENDING_PASSWORD_RESET
└── Triggers: CognitoPasswordResetCodeSent
```

**System Actions**:
1. Call Cognito ForgotPassword API
2. Update internal user status to `PENDING_PASSWORD_RESET`
3. Cognito sends password reset code via email
4. Log password reset request

---

#### Password Reset Completed
**Actor**: User  
**Action**: Completes password reset with verification code

```
EVENT: CognitoPasswordResetCompleted
├── Payload: {
│   ├── cognitoUserId: "uuid"
│   ├── username: "string"
│   ├── resetCompletedAt: "ISO8601"
│   └── newPasswordSet: boolean
│   }
├── State Change: PENDING_PASSWORD_RESET → ACTIVE
└── Triggers: SecurityEventLogged
```

**System Actions**:
1. Update internal user status to `ACTIVE`
2. Log password reset completion
3. Cognito handles password update and session management

---

### Account Suspension (Admin Action)

#### Admin Account Suspension
**Actor**: Admin  
**Action**: Suspends user account

```
EVENT: AccountSuspended
├── Payload: {
│   ├── userId: "uuid"
│   ├── cognitoUserId: "uuid"
│   ├── adminId: "uuid"
│   ├── suspensionReason: "string"
│   ├── suspensionDuration: number
│   └── suspendedAt: "ISO8601"
│   }
├── State Change: ACTIVE → SUSPENDED
└── Triggers: ServicesDeactivated, CognitoUserDisabled, UserNotified
```

**System Actions**:
1. Update internal user status to `SUSPENDED`
2. Disable Cognito user account (AdminDisableUser API)
3. Deactivate all services
4. Send suspension notification
5. Set automatic reactivation if temporary

---

## State Diagram Summary

```
COGNITO_SIGNUP_INITIATED → COGNITO_UNCONFIRMED → PENDING_EMAIL_VERIFICATION → EMAIL_VERIFIED → ACTIVE → DEACTIVATED
         ↓                        ↓                        ↓                      ↓           ↓
    SIGNUP_FAILED            VERIFICATION_FAILED      AWAITING_CONFIRMATION   UPDATING_   SUSPENDED
                                    ↓                        ↓                PROFILE        ↓
                            PENDING_EMAIL_VERIFICATION   EMAIL_VERIFIED          ↓        ACTIVE
                                                                              ACTIVE
```

---

## Event Processing Architecture

### Lambda Functions (Event Processors)
1. **CognitoEventProcessor**: Handles Cognito webhooks and events
2. **UserProfileManager**: Manages HourBank user profiles
3. **WelcomeBonusProcessor**: Handles welcome bonus distribution
4. **ProfileValidator**: Validates profile updates
5. **SecurityEventProcessor**: Manages password changes and security events
6. **AccountManager**: Handles deactivation and suspension

### Database Tables
- **Users**: Main HourBank user records (linked to Cognito)
- **UserProfiles**: Extended profile information
- **CognitoUserMapping**: Maps Cognito User IDs to HourBank User IDs
- **SecurityEvents**: Password changes and security logs
- **AccountActions**: Deactivation and suspension records

### Integration Points
- **AWS Cognito User Pool**: Primary authentication and user management
- **Cognito Triggers**: Lambda triggers for pre/post signup, authentication
- **Cognito Events**: EventBridge integration for user lifecycle events
- **Transaction Service**: Welcome bonus and hour management
- **Service Management**: User service deactivation
- **Notification Service**: User communication

### AWS Cognito Configuration Required
- **User Pool**: Configure with email verification
- **User Pool Client**: Configure for your Angular app
- **Lambda Triggers**: 
  - Pre Sign-up: Validate registration data
  - Post Confirmation: Trigger welcome bonus
  - Post Authentication: Update last login
- **EventBridge Integration**: Send user events to your event bus

### Cognito User Attributes
- **Standard Attributes**: email, given_name, family_name
- **Custom Attributes**: hourbank_user_id, profile_completeness
- **Required Attributes**: email, given_name, family_name

This lifecycle leverages AWS Cognito's robust authentication and user management capabilities while maintaining HourBank-specific business logic and user profile management in your custom backend.
