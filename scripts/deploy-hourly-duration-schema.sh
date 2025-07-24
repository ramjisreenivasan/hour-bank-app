#!/bin/bash

echo "🚀 Deploying hourlyDuration Schema Changes"
echo "=========================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured or credentials missing"
    echo ""
    echo "Please configure AWS credentials first:"
    echo "1. Run: aws configure"
    echo "2. Or set environment variables:"
    echo "   export AWS_ACCESS_KEY_ID=your_access_key"
    echo "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "   export AWS_DEFAULT_REGION=us-east-1"
    echo ""
    exit 1
fi

echo "✅ AWS credentials configured"
echo ""

# Check if Amplify CLI is available
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI not found"
    echo "Please install: npm install -g @aws-amplify/cli"
    exit 1
fi

echo "✅ Amplify CLI available"
echo ""

# Show what will be changed
echo "📋 Schema Changes to Deploy:"
echo "- Service.hourlyRate → Service.hourlyDuration"
echo "- searchServices.maxHourlyRate → searchServices.maxHourlyDuration"
echo ""

# Backup current schema
echo "📦 Creating schema backup..."
cp amplify/backend/api/hourbankapp/schema.graphql amplify/backend/api/hourbankapp/schema.graphql.backup
echo "✅ Schema backed up to schema.graphql.backup"
echo ""

# Deploy the changes
echo "🚀 Deploying schema changes..."
echo "This will:"
echo "1. Update the GraphQL schema in AWS AppSync"
echo "2. Modify the DynamoDB table structure"
echo "3. Update resolvers and data sources"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running amplify push..."
    
    # Run amplify push with auto-confirm
    if amplify push --yes; then
        echo ""
        echo "✅ Schema deployment successful!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Update GraphQL queries to use hourlyDuration"
        echo "2. Update application code to use hourlyDuration"
        echo "3. Test the profile page"
        echo ""
        echo "🔧 Data Migration Required:"
        echo "Existing services with 'hourlyRate' field need to be migrated"
        echo "to 'hourlyDuration'. Run the migration script after deployment."
        echo ""
    else
        echo ""
        echo "❌ Schema deployment failed!"
        echo ""
        echo "🔄 Restoring backup..."
        cp amplify/backend/api/hourbankapp/schema.graphql.backup amplify/backend/api/hourbankapp/schema.graphql
        echo "✅ Schema restored from backup"
        echo ""
        echo "Please check the error messages above and try again."
        exit 1
    fi
else
    echo "❌ Deployment cancelled"
    exit 0
fi

echo "🎉 Deployment complete!"
echo ""
echo "⚠️  Important: This is a breaking change!"
echo "You'll need to update all application code to use 'hourlyDuration'"
echo "instead of 'hourlyRate' before the app will work correctly."
