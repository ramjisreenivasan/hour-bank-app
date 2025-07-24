#!/bin/bash

echo "🚀 Deploying GraphQL Schema with hourlyDuration"
echo "==============================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured"
    echo ""
    echo "Please configure AWS credentials first:"
    echo "1. Run: aws configure"
    echo "   - AWS Access Key ID: [your access key]"
    echo "   - AWS Secret Access Key: [your secret key]"
    echo "   - Default region name: us-east-1"
    echo "   - Default output format: json"
    echo ""
    echo "2. Or set environment variables:"
    echo "   export AWS_ACCESS_KEY_ID=your_access_key"
    echo "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "   export AWS_DEFAULT_REGION=us-east-1"
    echo ""
    exit 1
fi

echo "✅ AWS credentials configured"
echo ""

# Check current schema
echo "📋 Current schema uses:"
if grep -q "hourlyDuration" amplify/backend/api/hourbankapp/schema.graphql; then
    echo "✅ hourlyDuration (what we want)"
else
    echo "❌ hourlyRate (needs to be updated)"
fi
echo ""

# Deploy the schema
echo "🚀 Deploying schema to AWS..."
echo "This will update the GraphQL API to use hourlyDuration"
echo ""

if amplify push --yes; then
    echo ""
    echo "✅ Schema deployment successful!"
    echo ""
    echo "📋 What was deployed:"
    echo "- Service.hourlyDuration field"
    echo "- searchServices.maxHourlyDuration parameter"
    echo "- Updated resolvers and data sources"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Test the API with hourlyDuration"
    echo "2. Check the profile page"
    echo "3. Verify services load correctly"
    echo ""
else
    echo ""
    echo "❌ Schema deployment failed!"
    echo "Please check the error messages above"
    exit 1
fi

echo "🎉 Deployment complete!"
