# Deploy hourlyDuration Schema - Step by Step

## Current Situation
- ❌ Deployed schema uses `hourlyRate`
- ✅ Application code uses `hourlyDuration`
- ❌ API calls are failing due to field mismatch

## Solution
Deploy the updated schema with `hourlyDuration` to AWS.

## Step 1: Configure AWS Credentials

### Option A: AWS Configure (Recommended)
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `us-east-1`
- Default output format: `json`

### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1
```

## Step 2: Deploy the Schema

### Option A: Use the deployment script
```bash
./deploy-schema.sh
```

### Option B: Manual deployment
```bash
amplify push --yes
```

## Step 3: Test the Deployment

### Option A: Use the test script
```bash
node test-hourly-duration-api.js
```

### Option B: Manual test in AWS AppSync Console
1. Go to AWS AppSync Console
2. Select your `hourbankapp` API
3. Click "Queries"
4. Run this query:

```graphql
query ServicesByUserId {
  servicesByUserId(userId: "de5d0750-d4b5-4ac7-8888-57344a6b5019", limit: 10) {
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

## Expected Results

### Before Deployment (Current State)
```
❌ GraphQL Error: Field 'hourlyDuration' in type 'Service' is undefined
```

### After Successful Deployment
```
✅ API call successful!
📊 Services returned: 5
📋 Services found:
  1. API Development & Integration (8 hours)
  2. Database Design & Optimization (7 hours)
  3. Programming Tutoring JavaScript/TypeScript (5 hours)
  4. Code Review & Technical Mentoring (6 hours)
  5. AWS Cloud Architecture & Deployment (10 hours)
```

## Step 4: Verify Profile Page

After successful deployment:
1. Navigate to your profile page
2. Services should load correctly
3. No GraphQL errors in browser console
4. Service creation/editing should work

## Troubleshooting

### Issue: AWS credentials not configured
**Solution**: Follow Step 1 above

### Issue: Amplify CLI not found
**Solution**: 
```bash
npm install -g @aws-amplify/cli
```

### Issue: Schema deployment fails
**Solution**: 
- Check AWS permissions
- Verify you're in the correct AWS account
- Check for syntax errors in schema.graphql

### Issue: API still returns hourlyRate
**Solution**: 
- Wait 2-3 minutes for deployment to propagate
- Clear browser cache
- Check AWS AppSync Console for schema updates

## Files Being Deployed

The deployment will update:
- GraphQL schema in AWS AppSync
- DynamoDB table structure (if needed)
- API resolvers and data sources

## Backup Information

Your current schema is automatically backed up by Amplify.
If needed, you can rollback using:
```bash
amplify env checkout dev
```

## Success Criteria

✅ Schema deployment completes without errors
✅ Test script returns services with hourlyDuration
✅ Profile page loads services correctly
✅ No GraphQL field undefined errors

## Need Help?

If deployment fails:
1. Check the error messages carefully
2. Verify AWS credentials and permissions
3. Ensure you're in the correct AWS region (us-east-1)
4. Check AWS CloudFormation console for stack status
