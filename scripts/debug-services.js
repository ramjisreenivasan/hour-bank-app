#!/usr/bin/env node

/**
 * Debug script to investigate service and user mapping issues
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

const LIST_SERVICES_QUERY = `
  query ListServices {
    listServices {
      items {
        id
        userId
        title
        description
        category
        hourlyRate
        isActive
        tags
        requiresScheduling
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      username
      firstName
      lastName
      bankHours
      rating
      totalTransactions
      cognitoId
      createdAt
      updatedAt
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

async function debugServices() {
  console.log('🔍 HourBank Service & User Mapping Debug');
  console.log('=========================================\n');

  try {
    // Get Ramji's user details
    const ramjiUserId = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';
    console.log(`👤 Fetching user details for Ramji (${ramjiUserId})...`);
    
    const userResult = await makeGraphQLRequest(GET_USER_QUERY, { id: ramjiUserId });
    const ramjiUser = userResult.data?.getUser;
    
    if (ramjiUser) {
      console.log('✅ Ramji User Found:');
      console.log(`   ID: ${ramjiUser.id}`);
      console.log(`   Name: ${ramjiUser.firstName} ${ramjiUser.lastName}`);
      console.log(`   Username: ${ramjiUser.username}`);
      console.log(`   Email: ${ramjiUser.email}`);
      console.log(`   Cognito ID: ${ramjiUser.cognitoId || 'Not set'}`);
      console.log(`   Bank Hours: ${ramjiUser.bankHours}`);
    } else {
      console.log('❌ Ramji user not found');
      return;
    }

    console.log('\n📋 Fetching all services...');
    
    // Get all services
    const servicesResult = await makeGraphQLRequest(LIST_SERVICES_QUERY);
    const allServices = servicesResult.data?.listServices?.items || [];
    
    console.log(`📊 Total services in database: ${allServices.length}`);
    
    // Filter services for Ramji
    const ramjiServices = allServices.filter(service => service.userId === ramjiUserId);
    console.log(`🎯 Services belonging to Ramji: ${ramjiServices.length}`);
    
    if (ramjiServices.length > 0) {
      console.log('\n🛠️ Ramji\'s Services:');
      console.log('='.repeat(60));
      ramjiServices.forEach((service, index) => {
        console.log(`[${index + 1}] ${service.title}`);
        console.log(`    ID: ${service.id}`);
        console.log(`    User ID: ${service.userId}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Rate: ${service.hourlyRate} hours`);
        console.log(`    Active: ${service.isActive}`);
        console.log(`    Requires Scheduling: ${service.requiresScheduling}`);
        console.log(`    Tags: ${service.tags.join(', ')}`);
        console.log(`    Created: ${new Date(service.createdAt).toLocaleString()}`);
        console.log('-'.repeat(60));
      });
    }

    // Check services for other users (to see if filtering logic works)
    const otherServices = allServices.filter(service => service.userId !== ramjiUserId && service.isActive);
    console.log(`\n🌐 Active services from other users: ${otherServices.length}`);
    
    if (otherServices.length > 0) {
      console.log('\n📋 Sample of other users\' services:');
      console.log('='.repeat(60));
      otherServices.slice(0, 3).forEach((service, index) => {
        console.log(`[${index + 1}] ${service.title}`);
        console.log(`    User ID: ${service.userId}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Rate: ${service.hourlyRate} hours`);
        console.log('-'.repeat(60));
      });
    }

    // Check for potential ID mismatches
    console.log('\n🔍 Checking for potential ID mapping issues...');
    
    const uniqueUserIds = [...new Set(allServices.map(s => s.userId))];
    console.log(`📊 Unique user IDs in services: ${uniqueUserIds.length}`);
    
    console.log('\n🆔 User ID Analysis:');
    console.log('='.repeat(50));
    for (const userId of uniqueUserIds.slice(0, 5)) {
      const userServices = allServices.filter(s => s.userId === userId);
      console.log(`User ID: ${userId}`);
      console.log(`  Services: ${userServices.length}`);
      
      // Try to get user details
      try {
        const userResult = await makeGraphQLRequest(GET_USER_QUERY, { id: userId });
        const user = userResult.data?.getUser;
        if (user) {
          console.log(`  Name: ${user.firstName} ${user.lastName}`);
          console.log(`  Username: ${user.username}`);
        } else {
          console.log(`  ⚠️  User not found in Users table`);
        }
      } catch (error) {
        console.log(`  ❌ Error fetching user: ${error.message}`);
      }
      console.log('-'.repeat(50));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Main execution
async function main() {
  try {
    await debugServices();
    console.log('\n✨ Debug completed!');
  } catch (error) {
    console.error('\n💥 Debug failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugServices };
