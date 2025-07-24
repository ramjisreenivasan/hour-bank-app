#!/usr/bin/env node

// Simple test to check GraphQL services query
console.log('🔍 Testing GraphQL Services Query...\n');

// Test with a simple listServices query first
const testQuery = `
  query ListServices {
    listServices(limit: 5) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
        isActive
        tags
        createdAt
      }
    }
  }
`;

console.log('GraphQL Query to test:');
console.log(testQuery);
console.log('\nTo test this:');
console.log('1. Open AWS AppSync Console');
console.log('2. Go to your hourbankapp API');
console.log('3. Click on "Queries" in the left sidebar');
console.log('4. Paste the above query and run it');
console.log('5. Check if it returns data or errors');

console.log('\nAlternatively, test with curl:');
console.log(`
curl -X POST \\
  https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: da2-7p4lacsjwbdabgmhywkvhc7wwi' \\
  -d '{
    "query": "query ListServices { listServices(limit: 5) { items { id userId title description category hourlyRate isActive tags createdAt } } }"
  }'
`);

console.log('\nIf the above works, then test the servicesByUserId query:');

const userServicesQuery = `
  query ServicesByUserId($userId: ID!) {
    servicesByUserId(userId: $userId, limit: 10) {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
        isActive
        tags
        createdAt
      }
    }
  }
`;

console.log(userServicesQuery);
console.log('\nWith variables:');
console.log('{"userId": "de5d0750-d4b5-4ac7-8888-57344a6b5019"}');
