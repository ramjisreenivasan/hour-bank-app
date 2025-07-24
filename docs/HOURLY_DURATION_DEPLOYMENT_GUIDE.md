# HourlyDuration Standardization Deployment Guide

## Overview
This guide covers the complete migration from `hourlyRate` to `hourlyDuration` throughout the entire HourBank application.

## What's Being Changed

### GraphQL Schema
- **Service.hourlyRate** → **Service.hourlyDuration**
- **searchServices.maxHourlyRate** → **searchServices.maxHourlyDuration**

### Application Code
- All GraphQL queries updated to use `hourlyDuration`
- Service interface updated to use `hourlyDuration`
- Profile component updated to use `hourlyDuration`
- HTML templates updated to use `hourlyDuration`

## Deployment Steps

### Step 1: Deploy GraphQL Schema Changes

#### Option A: Automated Deployment (Recommended)
```bash
# Run the deployment script
./deploy-hourly-duration-schema.sh
```

#### Option B: Manual Deployment
```bash
# Configure AWS credentials
aws configure

# Deploy schema changes
amplify push --yes
```

### Step 2: Migrate Existing Data

After the schema is deployed, migrate existing service data:

```bash
# Run the data migration script
node migrate-hourly-rate-to-duration.js
```

This script will:
- Find all services with `hourlyRate` values
- Copy `hourlyRate` values to `hourlyDuration` field
- Verify the migration was successful

### Step 3: Test the Application

1. **Navigate to Profile Page**
   - Services should load correctly
   - No GraphQL errors in console
   - Service creation/editing should work

2. **Check Browser Console**
   - Look for successful GraphQL queries
   - Verify no field undefined errors

3. **Test Service Management**
   - Create new service with hourlyDuration
   - Edit existing services
   - Verify data persistence

## Verification Queries

Test these queries in AWS AppSync Console:

### Query 1: List Services with hourlyDuration
```graphql
query ListServices {
  listServices(limit: 5) {
    items {
      id
      title
      category
      hourlyDuration
      isActive
    }
  }
}
```

### Query 2: Services by User ID
```graphql
query ServicesByUserId($userId: ID!) {
  servicesByUserId(userId: $userId, limit: 10) {
    items {
      id
      title
      category
      hourlyDuration
      isActive
    }
  }
}
```

### Query 3: Test Service Creation
```graphql
mutation CreateService($input: CreateServiceInput!) {
  createService(input: $input) {
    id
    title
    category
    hourlyDuration
    isActive
  }
}
```

Variables:
```json
{
  "input": {
    "userId": "your-user-id",
    "title": "Test Service",
    "description": "Testing hourlyDuration field",
    "category": "Technology",
    "hourlyDuration": 2.5,
    "isActive": true,
    "tags": ["test"],
    "requiresScheduling": false
  }
}
```

## Expected Results

### Before Migration
- Services use `hourlyRate` field
- GraphQL queries fail with "Field 'hourlyDuration' undefined"
- Profile page shows errors or mock data

### After Migration
- Services use `hourlyDuration` field
- GraphQL queries succeed
- Profile page displays actual services
- Service creation/editing works correctly

## Troubleshooting

### Issue: Schema deployment fails
**Solution**: 
- Check AWS credentials
- Verify Amplify CLI is configured
- Check for syntax errors in schema.graphql

### Issue: Data migration fails
**Solution**:
- Verify GraphQL API is accessible
- Check API key permissions
- Run migration script with Node.js 18+

### Issue: Services still not loading
**Solution**:
- Clear browser cache
- Check browser console for errors
- Verify schema deployment in AWS AppSync Console
- Run verification queries manually

### Issue: Mixed field names in data
**Solution**:
- Re-run the migration script
- Check for services that weren't migrated
- Manually update problematic records

## Rollback Plan

If issues occur, you can rollback:

### 1. Revert Application Code
```bash
git revert HEAD~1  # Revert the hourlyDuration changes
git push origin main
```

### 2. Revert Schema Changes
```bash
# Restore schema backup
cp amplify/backend/api/hourbankapp/schema.graphql.backup amplify/backend/api/hourbankapp/schema.graphql

# Deploy reverted schema
amplify push --yes
```

### 3. Revert Data (if needed)
```bash
# Run reverse migration script (if created)
node migrate-hourly-duration-to-rate.js
```

## Files Changed

### GraphQL Schema
- `amplify/backend/api/hourbankapp/schema.graphql`

### GraphQL Queries
- `src/app/graphql/queries.ts`

### TypeScript Models
- `src/app/models/user.model.ts`

### Components
- `src/app/components/profile/profile.component.ts`
- `src/app/components/profile/profile.component.html`

### Migration Tools
- `deploy-hourly-duration-schema.sh`
- `migrate-hourly-rate-to-duration.js`

## Post-Deployment Checklist

- [ ] GraphQL schema deployed successfully
- [ ] Data migration completed without errors
- [ ] Profile page loads services correctly
- [ ] Service creation works with hourlyDuration
- [ ] Service editing preserves hourlyDuration values
- [ ] No GraphQL errors in browser console
- [ ] All service components use hourlyDuration
- [ ] Search functionality works (if implemented)

## Benefits of This Change

1. **Consistency**: Single field name throughout the application
2. **Clarity**: `hourlyDuration` better describes the field purpose
3. **Maintainability**: Easier to understand and maintain code
4. **Future-proofing**: Consistent naming for future features

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for specific errors
3. Test GraphQL queries manually in AWS AppSync Console
4. Verify AWS credentials and permissions
5. Check Amplify deployment status

## Success Criteria

The migration is successful when:
- ✅ Profile page displays actual services (not mock data)
- ✅ Services show correct hourlyDuration values
- ✅ Service creation/editing works normally
- ✅ No GraphQL field undefined errors
- ✅ All components use hourlyDuration consistently
