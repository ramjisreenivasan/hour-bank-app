#!/usr/bin/env node

const https = require('https');

const graphqlEndpoint = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const apiKey = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// Introspection query to check Service type fields
const introspectionQuery = {
  query: `
    query IntrospectServiceType {
      __type(name: "Service") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `
};

const postData = JSON.stringify(introspectionQuery);

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

console.log('Introspecting GraphQL schema for Service type...\n');

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
        });
      }
      
      if (response.data && response.data.__type) {
        const serviceType = response.data.__type;
        console.log(`Service Type Fields:`);
        
        serviceType.fields.forEach(field => {
          const typeName = field.type.name || field.type.ofType?.name || 'Unknown';
          const isNonNull = field.type.kind === 'NON_NULL';
          const isList = field.type.kind === 'LIST';
          
          console.log(`  ${field.name}: ${typeName}${isNonNull ? '!' : ''}${isList ? '[]' : ''}`);
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
