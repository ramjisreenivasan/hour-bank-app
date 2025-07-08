#!/usr/bin/env node

/**
 * Utility script to list all users in the database
 * Helps identify the correct user ID for other scripts
 */

const fs = require('fs');
const path = require('path');

// Read Amplify configuration
let amplifyConfig;
try {
  const configPath = path.join(__dirname, '../src/amplifyconfiguration.json');
  amplifyConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not read amplifyconfiguration.json:', error.message);
  process.exit(1);
}

const LIST_USERS_QUERY = `
  query ListUsers {
    listUsers {
      items {
        id
        email
        username
        firstName
        lastName
        bankHours
        rating
        totalTransactions
        createdAt
        updatedAt
      }
    }
  }
`;

async function makeGraphQLRequest(query, variables = {}) {
  const graphqlEndpoint = amplifyConfig.aws_appsync_graphqlEndpoint;
  const apiKey = amplifyConfig.aws_appsync_apiKey;

  if (!graphqlEndpoint || !apiKey) {
    throw new Error('GraphQL endpoint or API key not found in configuration');
  }

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
  }

  return result;
}

async function listUsers() {
  try {
    console.log('🔍 Fetching all users from database...\n');
    
    const result = await makeGraphQLRequest(LIST_USERS_QUERY);
    const users = result.data?.listUsers?.items || [];
    
    if (users.length === 0) {
      console.log('📭 No users found in the database.');
      return;
    }

    console.log(`👥 Found ${users.length} user(s):\n`);
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`[${index + 1}] User Details:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Name: ${user.firstName} ${user.lastName}`);
      console.log(`    Username: ${user.username}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Bank Hours: ${user.bankHours}`);
      console.log(`    Rating: ${user.rating}`);
      console.log(`    Total Transactions: ${user.totalTransactions}`);
      console.log(`    Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log(`    Updated: ${new Date(user.updatedAt).toLocaleDateString()}`);
      console.log('-'.repeat(80));
    });

    // Find users named Ramji
    const ramjiUsers = users.filter(user => 
      user.firstName?.toLowerCase().includes('ramji') || 
      user.lastName?.toLowerCase().includes('ramji') ||
      user.username?.toLowerCase().includes('ramji')
    );

    if (ramjiUsers.length > 0) {
      console.log('\n🎯 Users matching "Ramji":');
      console.log('='.repeat(50));
      ramjiUsers.forEach((user, index) => {
        console.log(`[${index + 1}] ${user.firstName} ${user.lastName} (${user.username})`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log('-'.repeat(50));
      });

      if (ramjiUsers.length === 1) {
        console.log(`\n💡 To add services for ${ramjiUsers[0].firstName}, use:`);
        console.log(`    node scripts/add-services-simple.js ${ramjiUsers[0].id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank User List Utility');
  console.log('=============================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    await listUsers();
    console.log('\n✨ User list completed successfully!');
  } catch (error) {
    console.error('\n💥 Script failed with error:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error.message);
    process.exit(1);
  });
}

module.exports = { listUsers };
