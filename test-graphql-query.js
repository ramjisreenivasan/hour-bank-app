#!/usr/bin/env node

console.log('🔍 Testing GraphQL servicesByUserId Query...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const TEST_USER_ID = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';

// Test the exact query that's failing
const servicesByUserIdQuery = `
  query ServicesByUserId($userId: ID!, $limit: Int, $nextToken: String) {
    servicesByUserId(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        title
        description
        category
        hourlyDuration
        tags
        requiresScheduling
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Also test a simpler version
const simpleServicesByUserIdQuery = `
  query SimpleServicesByUserId($userId: ID!) {
    servicesByUserId(userId: $userId) {
      items {
        id
        userId
        title
        category
        hourlyDuration
        isActive
      }
    }
  }
`;

// Test if the user exists
const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      username
      firstName
      lastName
      cognitoId
    }
  }
`;

// Test basic listServices
const listServicesQuery = `
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
`;

async function testQuery(query, variables, description) {
    console.log(`📋 Testing: ${description}`);
    console.log(`Variables:`, variables);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ 
                query,
                variables 
            })
        });
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:');
            result.errors.forEach((error, index) => {
                console.error(`  Error ${index + 1}:`, {
                    message: error.message,
                    locations: error.locations,
                    path: error.path,
                    extensions: error.extensions
                });
            });
            return { success: false, errors: result.errors };
        }
        
        console.log('✅ Query successful');
        console.log('📊 Data:', JSON.stringify(result.data, null, 2));
        console.log('');
        
        return { success: true, data: result.data };
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🔍 GraphQL Query Testing Tool');
    console.log('==============================\n');
    
    // Test 1: Check if user exists
    console.log('=== Test 1: Check if user exists ===');
    const userResult = await testQuery(
        getUserQuery, 
        { id: TEST_USER_ID }, 
        'Get User by ID'
    );
    
    // Test 2: List all services to see structure
    console.log('=== Test 2: List all services ===');
    const listResult = await testQuery(
        listServicesQuery, 
        {}, 
        'List Services'
    );
    
    // Test 3: Simple servicesByUserId
    console.log('=== Test 3: Simple servicesByUserId ===');
    const simpleResult = await testQuery(
        simpleServicesByUserIdQuery, 
        { userId: TEST_USER_ID }, 
        'Simple Services by User ID'
    );
    
    // Test 4: Full servicesByUserId (the failing one)
    console.log('=== Test 4: Full servicesByUserId (the failing query) ===');
    const fullResult = await testQuery(
        servicesByUserIdQuery, 
        { 
            userId: TEST_USER_ID,
            limit: undefined,
            nextToken: undefined
        }, 
        'Full Services by User ID'
    );
    
    // Analysis
    console.log('=== Analysis ===');
    
    if (userResult.success && userResult.data?.getUser) {
        console.log('✅ User exists in database');
        const user = userResult.data.getUser;
        console.log(`   - User: ${user.firstName} ${user.lastName} (${user.username})`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Cognito ID: ${user.cognitoId || 'MISSING'}`);
    } else {
        console.log('❌ User not found in database');
        console.log('   This could be the root cause of the issue');
    }
    
    if (listResult.success && listResult.data?.listServices?.items) {
        const services = listResult.data.listServices.items;
        console.log(`✅ Found ${services.length} total services in database`);
        
        // Check if any services belong to our test user
        const userServices = services.filter(s => s.userId === TEST_USER_ID);
        console.log(`   - Services for test user: ${userServices.length}`);
        
        if (userServices.length > 0) {
            console.log('   - User services:');
            userServices.forEach(service => {
                console.log(`     * ${service.title} (${service.category})`);
            });
        }
        
        // Show all unique userIds to understand the data
        const uniqueUserIds = [...new Set(services.map(s => s.userId))];
        console.log(`   - Unique user IDs in services: ${uniqueUserIds.length}`);
        uniqueUserIds.forEach(userId => {
            const count = services.filter(s => s.userId === userId).length;
            console.log(`     * ${userId}: ${count} services`);
        });
    }
    
    // Recommendations
    console.log('\n=== Recommendations ===');
    
    if (!userResult.success || !userResult.data?.getUser) {
        console.log('🔧 Issue: User not found');
        console.log('   - The user ID might be incorrect');
        console.log('   - Check user mapping service');
        console.log('   - Verify authentication flow');
    }
    
    if (simpleResult.success && !fullResult.success) {
        console.log('🔧 Issue: Complex query failing');
        console.log('   - Some fields in the query might not exist');
        console.log('   - Check GraphQL schema vs query fields');
    }
    
    if (!simpleResult.success) {
        console.log('🔧 Issue: servicesByUserId query not working');
        console.log('   - Check if GSI "byUserId" exists');
        console.log('   - Verify GraphQL schema deployment');
        console.log('   - Check API permissions');
    }
    
    console.log('\n✅ Testing complete!');
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('\nAlternative: Test these queries manually in AWS AppSync Console:');
    console.log('\n1. Get User Query:');
    console.log(getUserQuery);
    console.log(`Variables: {"id": "${TEST_USER_ID}"}`);
    
    console.log('\n2. List Services Query:');
    console.log(listServicesQuery);
    
    console.log('\n3. Services by User ID Query:');
    console.log(simpleServicesByUserIdQuery);
    console.log(`Variables: {"userId": "${TEST_USER_ID}"}`);
    
    process.exit(1);
}

runTests().catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
});
