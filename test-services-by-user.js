#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🧪 Testing Services by User ID Query\n');

async function makeGraphQLRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    
    const options = {
      hostname: 'fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testServicesQuery() {
  try {
    // First, get a user ID to test with
    console.log('📋 Step 1: Getting a sample user ID...');
    
    const usersQuery = `
      query ListUsers {
        listUsers(limit: 1) {
          items {
            id
            username
            firstName
            lastName
          }
        }
      }
    `;
    
    const usersResponse = await makeGraphQLRequest(usersQuery);
    
    if (usersResponse.errors) {
      console.log('❌ Error getting users:', usersResponse.errors);
      return;
    }
    
    const users = usersResponse.data.listUsers.items;
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.firstName} ${testUser.lastName} (${testUser.username})`);
    console.log(`   User ID: ${testUser.id}\n`);
    
    // Now test the services by user query
    console.log('📋 Step 2: Testing services by user ID query...');
    
    const servicesQuery = `
      query ListServicesByUser($userId: ID!) {
        listServices(filter: { userId: { eq: $userId } }) {
          items {
            id
            userId
            title
            description
            category
            hourlyDuration
            isActive
            tags
            requiresScheduling
            minBookingHours
            maxBookingHours
            advanceBookingDays
            cancellationHours
            createdAt
            updatedAt
          }
        }
      }
    `;
    
    const servicesResponse = await makeGraphQLRequest(servicesQuery, { userId: testUser.id });
    
    if (servicesResponse.errors) {
      console.log('❌ GraphQL Errors:');
      servicesResponse.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
        if (error.path) {
          console.log(`      Path: ${error.path.join(' -> ')}`);
        }
      });
      
      // Try fallback query without scheduling fields
      console.log('\n🔄 Trying fallback query without scheduling fields...');
      
      const fallbackQuery = `
        query ListServicesByUserFallback($userId: ID!) {
          listServices(filter: { userId: { eq: $userId } }) {
            items {
              id
              userId
              title
              description
              category
              hourlyDuration
              isActive
              tags
              createdAt
              updatedAt
            }
          }
        }
      `;
      
      const fallbackResponse = await makeGraphQLRequest(fallbackQuery, { userId: testUser.id });
      
      if (fallbackResponse.errors) {
        console.log('❌ Fallback query also failed:', fallbackResponse.errors);
        return;
      } else {
        console.log('✅ Fallback query succeeded');
        const services = fallbackResponse.data.listServices.items;
        console.log(`   Found ${services.length} services for user ${testUser.username}`);
        
        services.forEach((service, index) => {
          console.log(`\n   Service ${index + 1}:`);
          console.log(`     Title: ${service.title}`);
          console.log(`     Category: ${service.category}`);
          console.log(`     Duration: ${service.hourlyDuration} hours`);
          console.log(`     Active: ${service.isActive}`);
          console.log(`     Tags: ${service.tags.join(', ')}`);
        });
      }
    } else {
      console.log('✅ Services by user query succeeded');
      const services = servicesResponse.data.listServices.items;
      console.log(`   Found ${services.length} services for user ${testUser.username}`);
      
      services.forEach((service, index) => {
        console.log(`\n   Service ${index + 1}:`);
        console.log(`     Title: ${service.title}`);
        console.log(`     Category: ${service.category}`);
        console.log(`     Duration: ${service.hourlyDuration} hours`);
        console.log(`     Active: ${service.isActive}`);
        console.log(`     Requires Scheduling: ${service.requiresScheduling || false}`);
        console.log(`     Tags: ${service.tags.join(', ')}`);
      });
    }
    
    // Test with a different user to see if we get different results
    console.log('\n📋 Step 3: Testing with all users to find services...');
    
    const allUsersQuery = `
      query ListAllUsers {
        listUsers(limit: 10) {
          items {
            id
            username
            firstName
            lastName
          }
        }
      }
    `;
    
    const allUsersResponse = await makeGraphQLRequest(allUsersQuery);
    const allUsers = allUsersResponse.data.listUsers.items;
    
    for (const user of allUsers) {
      const userServicesResponse = await makeGraphQLRequest(fallbackQuery, { userId: user.id });
      
      if (!userServicesResponse.errors) {
        const userServices = userServicesResponse.data.listServices.items;
        if (userServices.length > 0) {
          console.log(`   ${user.firstName} ${user.lastName} (${user.username}): ${userServices.length} services`);
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServicesQuery();
