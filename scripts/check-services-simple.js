#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('📋 Checking services in the database...');
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

async function checkServices() {
  try {
    const listServicesQuery = `
      query ListServices {
        listServices {
          items {
            id
            userId
            title
            description
            category
            tags
            isActive
            createdAt
            updatedAt
          }
          nextToken
        }
      }
    `;

    const result = await makeGraphQLRequest(listServicesQuery);
    
    if (result.errors) {
      console.log('❌ Error listing services:', JSON.stringify(result.errors, null, 2));
      return;
    }

    const services = result.data.listServices.items;
    
    if (services.length === 0) {
      console.log('📭 No services found in the database.');
    } else {
      console.log(`✅ Found ${services.length} service(s):`);
      console.log('');
      
      // Group services by userId
      const servicesByUser = {};
      services.forEach(service => {
        if (!servicesByUser[service.userId]) {
          servicesByUser[service.userId] = [];
        }
        servicesByUser[service.userId].push(service);
      });
      
      // Display services grouped by user
      Object.keys(servicesByUser).forEach((userId, userIndex) => {
        console.log(`👤 User ${userIndex + 1} (ID: ${userId}):`);
        servicesByUser[userId].forEach((service, serviceIndex) => {
          console.log(`   🔧 Service ${serviceIndex + 1}:`);
          console.log(`      ID: ${service.id}`);
          console.log(`      Title: ${service.title}`);
          console.log(`      Category: ${service.category}`);
          console.log(`      Active: ${service.isActive}`);
          console.log(`      Tags: ${service.tags ? service.tags.join(', ') : 'None'}`);
          console.log(`      Created: ${service.createdAt}`);
          console.log('');
        });
        console.log('');
      });
      
      // Show unique user IDs referenced in services
      const uniqueUserIds = [...new Set(services.map(s => s.userId))];
      console.log(`📊 Summary:`);
      console.log(`   • Total services: ${services.length}`);
      console.log(`   • Unique users with services: ${uniqueUserIds.length}`);
      console.log(`   • User IDs in services: ${uniqueUserIds.join(', ')}`);
    }

  } catch (error) {
    console.log('❌ Failed to check services:', error.message);
  }
}

// Run the function
checkServices();
