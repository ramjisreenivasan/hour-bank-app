#!/usr/bin/env node

console.log('🚀 Direct AWS AppSync Schema Update...\n');

// This script attempts to update the GraphQL schema directly
// Note: This requires AWS credentials and proper permissions

const { execSync } = require('child_process');
const fs = require('fs');

// Read the current schema
const schemaPath = 'amplify/backend/api/hourbankapp/schema.graphql';
let schema;

try {
    schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded');
} catch (error) {
    console.error('❌ Could not read schema file:', error.message);
    process.exit(1);
}

// Check if schema has hourlyDuration
if (schema.includes('hourlyDuration: Float!')) {
    console.log('✅ Schema contains hourlyDuration field');
} else {
    console.error('❌ Schema does not contain hourlyDuration field');
    process.exit(1);
}

console.log('\n📋 Schema Update Options:');
console.log('1. Use AWS CLI with CloudFormation');
console.log('2. Use Amplify CLI (requires credentials)');
console.log('3. Manual update via AWS Console');
console.log('');

// Option 1: Try AWS CLI approach
console.log('🔄 Attempting AWS CLI deployment...');

try {
    // Check if we can access AWS
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS credentials available');
    
    // Try to find the CloudFormation stack
    const stackName = 'amplify-hourbankapp-dev';
    
    try {
        const stackInfo = execSync(`aws cloudformation describe-stacks --stack-name ${stackName} --region us-east-1`, { stdio: 'pipe' });
        console.log('✅ Found Amplify CloudFormation stack');
        
        // Try to update via Amplify CLI
        console.log('🔄 Attempting Amplify push...');
        
        try {
            execSync('amplify push --yes', { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log('✅ Schema deployed successfully via Amplify CLI!');
            
            // Test the deployment
            console.log('\n🔍 Testing deployment...');
            execSync('node test-hourly-duration-api.js', { stdio: 'inherit' });
            
        } catch (amplifyError) {
            console.log('❌ Amplify push failed');
            console.log('Error:', amplifyError.message);
            
            // Provide manual instructions
            console.log('\n📋 Manual Deployment Instructions:');
            console.log('1. Configure AWS credentials:');
            console.log('   aws configure');
            console.log('');
            console.log('2. Deploy schema:');
            console.log('   amplify push --yes');
            console.log('');
            console.log('3. Test deployment:');
            console.log('   node test-hourly-duration-api.js');
        }
        
    } catch (stackError) {
        console.log('❌ Could not find Amplify stack');
        console.log('You may need to run: amplify init');
    }
    
} catch (awsError) {
    console.log('❌ AWS credentials not configured');
    console.log('');
    console.log('📋 Please configure AWS credentials:');
    console.log('');
    console.log('Option A - AWS Configure:');
    console.log('  aws configure');
    console.log('  # Enter your AWS Access Key ID');
    console.log('  # Enter your AWS Secret Access Key');
    console.log('  # Enter region: us-east-1');
    console.log('  # Enter output format: json');
    console.log('');
    console.log('Option B - Environment Variables:');
    console.log('  export AWS_ACCESS_KEY_ID=your_access_key');
    console.log('  export AWS_SECRET_ACCESS_KEY=your_secret_key');
    console.log('  export AWS_DEFAULT_REGION=us-east-1');
    console.log('');
    console.log('Then run: amplify push --yes');
}

console.log('\n📋 Alternative: Manual AWS Console Update');
console.log('1. Go to AWS AppSync Console');
console.log('2. Select your hourbankapp API');
console.log('3. Go to Schema tab');
console.log('4. Update Service type to use hourlyDuration instead of hourlyRate');
console.log('5. Save and deploy the schema');
console.log('');
console.log('Schema change needed:');
console.log('  hourlyRate: Float!  →  hourlyDuration: Float!');
console.log('');

console.log('✅ Script complete!');
