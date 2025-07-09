# ID Mapping Troubleshooting Guide

## Problem Description
Services are not displaying correctly on the profile page due to confusion between different ID fields in the User and Service DynamoDB tables.

## ID Field Explanation

### User Table Fields
- **`id`**: DynamoDB primary key (auto-generated UUID)
- **`cognitoId`**: Cognito User Pool ID (maps to authenticated user)
- **`username`**: User's chosen username
- **`email`**: User's email address

### Service Table Fields
- **`id`**: DynamoDB primary key (auto-generated UUID)
- **`userId`**: Foreign key that **MUST** reference `User.id` (not cognitoId)

## Common Issues

### Issue 1: Service.userId Points to Wrong ID
**Problem**: Services created with `cognitoId` as `userId` instead of DynamoDB `User.id`
**Symptom**: `servicesByUserId` query returns empty results
**Fix**: Update Service records to use correct `User.id`

### Issue 2: Missing cognitoId in User Records
**Problem**: User records don't have `cognitoId` field for mapping
**Symptom**: User mapping service can't link Cognito user to DynamoDB user
**Fix**: Add `cognitoId` field to existing User records

### Issue 3: Multiple User Records
**Problem**: Same user has multiple records in User table
**Symptom**: Services scattered across different user IDs
**Fix**: Merge duplicate users and update service references

## Diagnostic Steps

### Step 1: Run Browser Console Diagnostic
1. Navigate to your profile page
2. Open Developer Tools (F12)
3. Copy and paste the diagnostic script from `diagnose-id-mapping.js`
4. Review the output for ID mapping issues

### Step 2: Test GraphQL Queries
1. Go to AWS AppSync Console
2. Navigate to your `hourbankapp` API
3. Click "Queries" in the left sidebar
4. Run these test queries:

```graphql
# Query 1: List all users
query ListUsers {
    listUsers(limit: 10) {
        items {
            id
            cognitoId
            email
            username
            firstName
            lastName
        }
    }
}

# Query 2: List all services
query ListServices {
    listServices(limit: 10) {
        items {
            id
            userId
            title
            category
            hourlyDuration
        }
    }
}

# Query 3: Test servicesByUserId (replace USER_ID with actual User.id)
query ServicesByUserId {
    servicesByUserId(userId: "USER_ID", limit: 10) {
        items {
            id
            userId
            title
            category
            hourlyDuration
        }
    }
}
```

### Step 3: Analyze Data Relationships
1. Check if User records have `cognitoId` field
2. Verify Service `userId` values match existing User `id` values
3. Identify any orphaned services
4. Look for duplicate user records

## Fix Procedures

### Option 1: Automated Fix (Recommended)
1. **Update table names** in `fix-id-mapping.js`:
   ```javascript
   const USER_TABLE = 'User-YOUR-ACTUAL-TABLE-NAME';
   const SERVICE_TABLE = 'Service-YOUR-ACTUAL-TABLE-NAME';
   ```

2. **Install dependencies**:
   ```bash
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   # OR
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_DEFAULT_REGION=us-east-1
   ```

4. **Run the fix script**:
   ```bash
   node fix-id-mapping.js
   ```

### Option 2: Manual Fix via AWS Console
1. **Go to DynamoDB Console**
2. **Find your User and Service tables**
3. **For each User record missing cognitoId**:
   - Add `cognitoId` field with appropriate Cognito User Pool ID
4. **For each Service with incorrect userId**:
   - Update `userId` to reference correct `User.id`

### Option 3: GraphQL Mutations (Advanced)
Use GraphQL mutations to update records programmatically:

```graphql
# Update User with cognitoId
mutation UpdateUser {
    updateUser(input: {
        id: "USER_ID"
        cognitoId: "COGNITO_USER_ID"
    }) {
        id
        cognitoId
        username
    }
}

# Update Service with correct userId
mutation UpdateService {
    updateService(input: {
        id: "SERVICE_ID"
        userId: "CORRECT_USER_ID"
    }) {
        id
        userId
        title
    }
}
```

## Verification Steps

### 1. Check User Mapping Service
In your browser console on the profile page:
```javascript
// Check current user mapping
this.userMappingService.getCurrentUserDynamoDbId().subscribe(id => {
    console.log('DynamoDB User ID:', id);
});

// Debug mapping state
this.userMappingService.debugMapping();
```

### 2. Test Service Loading
Look for these debug messages in browser console:
```
🔍 DEBUG: Loading services for user: [USER_ID]
🔍 DEBUG: API Response: [response object]
🔍 DEBUG: Services count: [number]
```

### 3. Verify GraphQL Query
Test the `servicesByUserId` query with the correct User ID:
```graphql
query TestServicesByUserId {
    servicesByUserId(userId: "CORRECT_USER_ID", limit: 5) {
        items {
            id
            title
            category
            hourlyDuration
        }
    }
}
```

## Expected Results After Fix

### Profile Page Should Show:
- User's actual services (not mock data)
- Correct service count
- Ability to add/edit services
- No GraphQL errors in console

### Debug Console Should Show:
```
🔍 DEBUG: DynamoDB User ID received: [valid-uuid]
🔍 DEBUG: Services data found: [array of services]
🔍 DEBUG: Services loaded successfully: [service objects]
```

## Troubleshooting Common Errors

### Error: "Failed to get services for user"
**Cause**: Service.userId doesn't match any User.id
**Fix**: Update Service records with correct userId

### Error: "User mapping not found"
**Cause**: No User record with matching cognitoId
**Fix**: Add cognitoId to User record or create new User

### Error: "servicesByUserId query failed"
**Cause**: GraphQL schema/query mismatch or invalid userId
**Fix**: Verify schema is deployed and userId is valid

### Services Show as Mock Data Only
**Cause**: Real services not loading, fallback to mock data
**Fix**: Check GraphQL query and data relationships

## Prevention

### For New Services
Ensure services are created with correct userId:
```typescript
const serviceData = {
    ...serviceInfo,
    userId: this.user.id, // Use DynamoDB User.id, not cognitoId
};
```

### For User Registration
Ensure new users have cognitoId field:
```typescript
const newUser = {
    ...userInfo,
    cognitoId: cognitoUser.userId, // Store Cognito mapping
};
```

## Tools Reference

- **`diagnose-id-mapping.js`**: Browser console diagnostic
- **`fix-id-mapping.js`**: Automated data migration
- **`test-data-structure.js`**: GraphQL API testing
- **Profile component**: Enhanced with debugging

## Getting Help

If issues persist:
1. Run all diagnostic tools
2. Capture browser console output
3. Export sample data from DynamoDB
4. Check AWS CloudWatch logs for API errors
5. Verify AWS Amplify deployment status

## Contact Information

For additional support, provide:
- Browser console debug output
- GraphQL query results
- DynamoDB table structure
- AWS Amplify environment details
