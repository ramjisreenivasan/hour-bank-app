# HourlyDuration Standardization Deployment Guide

## Overview
This guide covers the deployment of changes that standardize the application to use `hourlyDuration` instead of `hourlyRate` throughout the entire codebase.

## Changes Made

### 1. GraphQL Schema Updates
- **File**: `amplify/backend/api/hourbankapp/schema.graphql`
- **Change**: Updated Service model to use `hourlyDuration: Float!` instead of `hourlyRate: Float!`
- **Impact**: This is a breaking change that requires database migration

### 2. GraphQL Queries Updated
- **File**: `src/app/graphql/queries.ts`
- **Changes**: All service-related queries now use `hourlyDuration` field
- **Queries Updated**:
  - `getService`
  - `listServices`
  - `servicesByUserId`
  - `servicesByCategory`

### 3. TypeScript Interface Updated
- **File**: `src/app/models/user.model.ts`
- **Change**: Service interface now uses `hourlyDuration: number`
- **Impact**: Ensures type consistency across the application

### 4. Service Service Enhanced
- **File**: `src/app/services/service.service.ts`
- **Changes**: 
  - Added comprehensive debugging for GraphQL calls
  - Improved error handling
  - Better fallback to empty results instead of throwing errors

## Deployment Steps

### Step 1: Deploy Schema Changes
```bash
# Configure AWS credentials first
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1

# Deploy the updated schema
amplify push --yes
```

### Step 2: Handle Data Migration
Since this is a breaking change, existing services in the database will have `hourlyRate` but the new schema expects `hourlyDuration`.

**Option A: Manual Migration (Recommended)**
```bash
# Create a migration script to update existing records
node migrate-hourly-rate-to-duration.js
```

**Option B: Fresh Start (Development Only)**
```bash
# Delete and recreate the API (WARNING: This will delete all data)
amplify delete api
amplify add api
amplify push
```

### Step 3: Verify Deployment
1. Check that the GraphQL schema is updated in AWS AppSync console
2. Test the `servicesByUserId` query with a valid user ID
3. Verify that services display correctly in the profile page

## Testing the Fix

### 1. Test GraphQL Query Directly
```graphql
query TestServicesByUserId {
  servicesByUserId(userId: "your-user-id", limit: 5) {
    items {
      id
      title
      hourlyDuration
      category
      isActive
    }
  }
}
```

### 2. Test in Browser
1. Navigate to the profile page
2. Check browser console for debug messages
3. Verify services are displayed correctly

### 3. Expected Debug Output
```
🔍 DEBUG: ProfileComponent ngOnInit called
🔍 DEBUG: Loading services for user: [userId]
🔍 DEBUG: ServiceService.getServicesByUserId called with: {...}
🔍 DEBUG: GraphQL raw response: {...}
🔍 DEBUG: Services data found: {...}
```

## Rollback Plan

If issues occur, you can rollback by:

1. **Revert Git Changes**:
```bash
git revert 3b7b8b4
git push origin main
```

2. **Revert Schema**:
```bash
# Change hourlyDuration back to hourlyRate in schema.graphql
# Then push the changes
amplify push --yes
```

## Common Issues and Solutions

### Issue 1: "Field hourlyDuration not found"
**Cause**: Schema not deployed or cached
**Solution**: 
- Clear browser cache
- Verify schema deployment in AWS AppSync console
- Wait a few minutes for propagation

### Issue 2: Services not displaying
**Cause**: Data migration not completed
**Solution**:
- Check if existing services have `hourlyRate` field
- Run data migration script
- Or create new test services

### Issue 3: GraphQL errors in console
**Cause**: Query/schema mismatch
**Solution**:
- Verify all queries use `hourlyDuration`
- Check that mutations also use correct field name
- Regenerate GraphQL code if needed

## Verification Checklist

- [ ] GraphQL schema deployed successfully
- [ ] All existing services migrated to use `hourlyDuration`
- [ ] Profile page displays services correctly
- [ ] Service creation works with new field
- [ ] Service editing preserves `hourlyDuration` values
- [ ] Browse services page shows duration correctly
- [ ] No console errors related to `hourlyRate`

## Post-Deployment Tasks

1. **Update Documentation**: Ensure all API documentation reflects `hourlyDuration`
2. **Update Tests**: Modify any tests that reference `hourlyRate`
3. **Monitor Logs**: Watch for any errors related to the field change
4. **User Communication**: If this affects existing users, communicate the change

## Contact

If you encounter issues during deployment:
1. Check the browser console for detailed error messages
2. Verify AWS credentials and permissions
3. Ensure all files are committed and pushed to git
4. Review the debug logs for specific error details
