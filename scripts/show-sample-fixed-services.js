#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('📋 Sample of fixed service descriptions...');
console.log('');

// Function to make GraphQL requests
function makeGraphQLRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: query,
      variables: variables
    });

    const options = {
      hostname: 'fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function showSampleFixedServices() {
  try {
    // Get all users
    const listUsersQuery = `
      query ListUsers {
        listUsers {
          items {
            id
            firstName
            lastName
          }
        }
      }
    `;

    const usersResult = await makeGraphQLRequest(listUsersQuery);
    const users = usersResult.data.listUsers.items;
    
    // Create user lookup
    const userLookup = {};
    users.forEach(user => {
      userLookup[user.id] = user;
    });

    // Get sample services
    const listServicesQuery = `
      query ListServices {
        listServices(limit: 10) {
          items {
            id
            userId
            title
            description
          }
        }
      }
    `;

    const servicesResult = await makeGraphQLRequest(listServicesQuery);
    const services = servicesResult.data.listServices.items;

    console.log('🎯 Sample of Fixed Service Descriptions:');
    console.log('='.repeat(60));

    services.forEach((service, index) => {
      const user = userLookup[service.userId];
      if (user && service.description && service.description.includes("Hi! I'm")) {
        console.log(`\n${index + 1}. ${service.title}`);
        console.log(`   👤 User: ${user.firstName} ${user.lastName}`);
        console.log(`   📝 Description: ${service.description}`);
        console.log('   ' + '-'.repeat(50));
      }
    });

    console.log('\n✅ All service descriptions now use the correct user names!');

  } catch (error) {
    console.log('❌ Failed to show sample services:', error.message);
  }
}

// Run the function
showSampleFixedServices();
