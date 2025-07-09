#!/usr/bin/env node

console.log('🔍 Testing hourlyDuration API after deployment...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const USER_ID = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';

// Test the servicesByUserId query with hourlyDuration
const servicesByUserIdQuery = `
  query ServicesByUserId($userId: ID!, $limit: Int) {
    servicesByUserId(userId: $userId, limit: $limit) {
      items {
        id
        userId
        title
        description
        category
        hourlyDuration
        tags
        isActive
        createdAt
      }
      nextToken
    }
  }
`;

async function testAPI() {
    console.log('📋 Testing servicesByUserId with hourlyDuration...');
    console.log(`User ID: ${USER_ID}`);
    console.log('');
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ 
                query: servicesByUserIdQuery,
                variables: { 
                    userId: USER_ID,
                    limit: 10
                }
            })
        });
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:');
            result.errors.forEach((error, index) => {
                console.error(`  Error ${index + 1}: ${error.message}`);
                if (error.locations) {
                    console.error(`    Location: Line ${error.locations[0].line}, Column ${error.locations[0].column}`);
                }
            });
            console.log('');
            console.log('🔍 This means the schema deployment may not be complete yet');
            console.log('   or the field name is still incorrect');
            return false;
        } else {
            const services = result.data.servicesByUserId.items;
            console.log('✅ API call successful!');
            console.log(`📊 Services returned: ${services.length}`);
            console.log('');
            
            if (services.length > 0) {
                console.log('📋 Services found:');
                services.forEach((service, index) => {
                    console.log(`  ${index + 1}. ${service.title}`);
                    console.log(`     Category: ${service.category}`);
                    console.log(`     Duration: ${service.hourlyDuration} hours`);
                    console.log(`     Active: ${service.isActive}`);
                    console.log(`     ID: ${service.id}`);
                    console.log('');
                });
                
                console.log('🎉 Schema deployment successful!');
                console.log('✅ Profile page should now work correctly');
                return true;
            } else {
                console.log('📋 No services found for this user');
                console.log('✅ API works but user has no services');
                return true;
            }
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('');
        console.log('🔍 Check your internet connection and API endpoint');
        return false;
    }
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('');
    console.log('Alternative: Test this query in AWS AppSync Console:');
    console.log(servicesByUserIdQuery);
    console.log(`Variables: {"userId": "${USER_ID}", "limit": 10}`);
    process.exit(1);
}

testAPI().then(success => {
    if (success) {
        console.log('\n✅ Test completed successfully!');
        console.log('The profile page should now load services correctly.');
    } else {
        console.log('\n❌ Test failed!');
        console.log('The schema may need more time to deploy or there may be an issue.');
    }
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
