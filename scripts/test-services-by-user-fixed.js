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
    // Test with all users to find services
    console.log('📋 Step 1: Getting all users and their services...');
    
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
    
    const allUsersResponse = await makeGraphQLRequest(allUsersQuery);
    
    if (allUsersResponse.errors) {
      console.log('❌ Error getting users:', allUsersResponse.errors);
      return;
    }
    
    const allUsers = allUsersResponse.data.listUsers.items;
    console.log(`✅ Found ${allUsers.length} users\n`);
    
    let totalServices = 0;
    const usersWithServices = [];
    
    for (const user of allUsers) {
      console.log(`🔍 Checking services for: ${user.firstName} ${user.lastName} (${user.username})`);
      console.log(`   User ID: ${user.id}`);
      
      const userServicesResponse = await makeGraphQLRequest(fallbackQuery, { userId: user.id });
      
      if (userServicesResponse.errors) {
        console.log(`   ❌ Error: ${userServicesResponse.errors[0].message}`);
      } else {
        const userServices = userServicesResponse.data.listServices.items;
        console.log(`   ✅ Found ${userServices.length} services`);
        
        if (userServices.length > 0) {
          totalServices += userServices.length;
          usersWithServices.push({ user, services: userServices });
          
          userServices.forEach((service, index) => {
            console.log(`      ${index + 1}. ${service.title} (${service.category}) - ${service.hourlyDuration}h`);
          });
        }
      }
      
      console.log(''); // Empty line for readability
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('📊 Summary:');
    console.log(`   Total users: ${allUsers.length}`);
    console.log(`   Users with services: ${usersWithServices.length}`);
    console.log(`   Total services: ${totalServices}`);
    
    if (usersWithServices.length > 0) {
      console.log('\n🎯 Users with Services:');
      usersWithServices.forEach(({ user, services }) => {
        console.log(`   ${user.firstName} ${user.lastName}: ${services.length} services`);
      });
      
      console.log('\n✅ The services by user query is working correctly!');
      console.log('✅ Profile pages should now display actual services instead of mock data');
    } else {
      console.log('\n⚠️  No users have services yet');
      console.log('   This might be why the profile page shows mock data');
      console.log('   Users need to create services through the profile page');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServicesQuery();
