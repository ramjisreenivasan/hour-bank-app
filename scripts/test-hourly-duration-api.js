#!/usr/bin/env node

const https = require('https');

const graphqlEndpoint = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const apiKey = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// Test query with hourlyDuration only
const testQuery = {
  query: `
    query TestServiceFields {
      listServices(limit: 3) {
        items {
          id
          title
          description
          category
          hourlyDuration
          isActive
          tags
          userId
          createdAt
          __typename
        }
      }
    }
  `
};

const postData = JSON.stringify(testQuery);

const options = {
  hostname: 'fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com',
  port: 443,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-api-key': apiKey
  }
};

console.log('Testing GraphQL API with hourlyDuration field...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.errors) {
        console.log('GraphQL Errors:');
        response.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.message}`);
          if (error.locations) {
            console.log(`   Location: Line ${error.locations[0].line}, Column ${error.locations[0].column}`);
          }
        });
      }
      
      if (response.data) {
        console.log('GraphQL Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        const services = response.data.listServices?.items || [];
        console.log(`\nFound ${services.length} services`);
        
        services.forEach((service, index) => {
          console.log(`\nService ${index + 1}:`);
          console.log(`  ID: ${service.id}`);
          console.log(`  Title: ${service.title}`);
          console.log(`  Category: ${service.category}`);
          console.log(`  Hourly Duration: ${service.hourlyDuration}`);
          console.log(`  Is Active: ${service.isActive}`);
          console.log(`  User ID: ${service.userId}`);
        });
      }
      
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();
