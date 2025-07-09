#!/usr/bin/env node

const https = require('https');

const graphqlEndpoint = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const apiKey = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// Test query to check available fields in Service type
const testQuery = {
  query: `
    query TestServiceFields {
      listServices(limit: 1) {
        items {
          id
          title
          hourlyRate
          hourlyDuration
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

console.log('Testing GraphQL API to check Service field availability...\n');

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
