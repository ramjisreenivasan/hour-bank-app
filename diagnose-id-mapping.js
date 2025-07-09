#!/usr/bin/env node

console.log('🔍 Diagnosing User/Service ID Mapping Issues...\n');

// This script will help identify the ID mapping confusion
// Run this in your browser console on the profile page

const diagnosticScript = `
// === USER/SERVICE ID MAPPING DIAGNOSTIC ===
console.log('🔍 Starting User/Service ID Mapping Diagnostic...');

// 1. Check current authentication state
async function checkAuthState() {
    console.log('\\n1. 📋 Checking Authentication State...');
    
    try {
        const { getCurrentUser } = await import('aws-amplify/auth');
        const cognitoUser = await getCurrentUser();
        
        console.log('✅ Cognito User Info:');
        console.log('   - User ID (Cognito):', cognitoUser.userId);
        console.log('   - Username:', cognitoUser.username);
        console.log('   - Sign-in details:', cognitoUser.signInDetails);
        
        return cognitoUser;
    } catch (error) {
        console.error('❌ Authentication Error:', error);
        return null;
    }
}

// 2. Check user mapping service
async function checkUserMapping() {
    console.log('\\n2. 📋 Checking User Mapping Service...');
    
    // This would need to be run in the Angular context
    console.log('Run this in your Angular component:');
    console.log(\`
    this.userMappingService.getCurrentUserDynamoDbId().subscribe({
        next: (dynamoDbId) => {
            console.log('✅ DynamoDB User ID:', dynamoDbId);
        },
        error: (error) => {
            console.error('❌ User Mapping Error:', error);
        }
    });
    
    this.userMappingService.debugMapping();
    \`);
}

// 3. Check DynamoDB User table structure
async function checkUserTable() {
    console.log('\\n3. 📋 Checking User Table Structure...');
    
    console.log('Expected User table fields:');
    console.log('   - id: Primary key (DynamoDB generated)');
    console.log('   - cognitoId: Maps to Cognito User Pool ID');
    console.log('   - email: User email');
    console.log('   - username: User username');
    console.log('   - firstName, lastName, etc.');
}

// 4. Check Service table structure
async function checkServiceTable() {
    console.log('\\n4. 📋 Checking Service Table Structure...');
    
    console.log('Expected Service table fields:');
    console.log('   - id: Primary key (DynamoDB generated)');
    console.log('   - userId: Foreign key to User.id (DynamoDB ID)');
    console.log('   - title, description, category, etc.');
    console.log('');
    console.log('⚠️  CRITICAL: Service.userId must match User.id (not cognitoId)');
}

// 5. Test GraphQL queries
async function testGraphQLQueries() {
    console.log('\\n5. 📋 Testing GraphQL Queries...');
    
    console.log('Test these queries in AWS AppSync Console:');
    console.log('');
    console.log('Query 1 - List all users:');
    console.log(\`
    query ListUsers {
        listUsers(limit: 5) {
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
    \`);
    
    console.log('Query 2 - List all services:');
    console.log(\`
    query ListServices {
        listServices(limit: 5) {
            items {
                id
                userId
                title
                category
                hourlyDuration
            }
        }
    }
    \`);
    
    console.log('Query 3 - Services by User ID (replace USER_ID):');
    console.log(\`
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
    \`);
}

// 6. Check for common ID mapping issues
function checkCommonIssues() {
    console.log('\\n6. 📋 Common ID Mapping Issues...');
    
    console.log('Issue 1: Service.userId points to cognitoId instead of User.id');
    console.log('   - Services created with Cognito ID as userId');
    console.log('   - Should use DynamoDB User.id instead');
    console.log('');
    
    console.log('Issue 2: User mapping not working correctly');
    console.log('   - UserMappingService not finding correct DynamoDB ID');
    console.log('   - Profile component using wrong user ID for service lookup');
    console.log('');
    
    console.log('Issue 3: Multiple user records');
    console.log('   - Same user has multiple records in User table');
    console.log('   - Services pointing to different user IDs');
    console.log('');
    
    console.log('Issue 4: Missing cognitoId field');
    console.log('   - User records missing cognitoId mapping');
    console.log('   - Cannot link Cognito user to DynamoDB user');
}

// 7. Provide fix recommendations
function provideFixes() {
    console.log('\\n7. 🔧 Fix Recommendations...');
    
    console.log('Fix 1: Update Service records to use correct userId');
    console.log('   - Find services with incorrect userId');
    console.log('   - Update to use DynamoDB User.id');
    console.log('');
    
    console.log('Fix 2: Ensure User records have cognitoId');
    console.log('   - Add cognitoId field to existing users');
    console.log('   - Map to Cognito User Pool ID');
    console.log('');
    
    console.log('Fix 3: Clean up duplicate user records');
    console.log('   - Identify and merge duplicate users');
    console.log('   - Update service references');
    console.log('');
    
    console.log('Fix 4: Test user mapping service');
    console.log('   - Verify getCurrentUserDynamoDbId() returns correct ID');
    console.log('   - Ensure profile component uses mapped ID');
}

// Run all diagnostics
async function runDiagnostics() {
    await checkAuthState();
    await checkUserMapping();
    await checkUserTable();
    await checkServiceTable();
    await testGraphQLQueries();
    checkCommonIssues();
    provideFixes();
    
    console.log('\\n✅ Diagnostic complete!');
    console.log('\\nNext steps:');
    console.log('1. Run the GraphQL queries in AWS AppSync Console');
    console.log('2. Check the data relationships');
    console.log('3. Apply the recommended fixes');
    console.log('4. Test the profile page again');
}

// Start diagnostics
runDiagnostics();
`;

console.log('Copy and paste this script into your browser console:');
console.log('='.repeat(60));
console.log(diagnosticScript);
console.log('='.repeat(60));

console.log('\nOr run these manual checks:');
console.log('\n1. Check AWS AppSync Console:');
console.log('   - Go to AWS AppSync Console');
console.log('   - Select your hourbankapp API');
console.log('   - Click "Queries" in the left sidebar');
console.log('   - Run the diagnostic queries');

console.log('\n2. Check DynamoDB Console:');
console.log('   - Go to AWS DynamoDB Console');
console.log('   - Look for User and Service tables');
console.log('   - Check the data structure and relationships');

console.log('\n3. Check browser console:');
console.log('   - Navigate to profile page');
console.log('   - Open DevTools (F12)');
console.log('   - Look for debug messages about user ID mapping');
