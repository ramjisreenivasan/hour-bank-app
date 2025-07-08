#!/usr/bin/env node

/**
 * Simplified debug script to investigate service issues
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
        category
        hourlyRate
        isActive
        tags
        createdAt
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
      cognitoId
    }
  }
`;

async function makeGraphQLRequest(query, variables = {}) {
  const graphqlEndpoint = amplifyConfig.aws_appsync_graphqlEndpoint;
  const apiKey = amplifyConfig.aws_appsync_apiKey;

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

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
  }

  return result;
}

async function debugServices() {
  console.log('🔍 Service Mapping Debug (Simplified)');
  console.log('=====================================\n');

  const ramjiUserId = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';
  
  try {
    // Get Ramji's user details
    console.log(`👤 Checking user: ${ramjiUserId}`);
    const userResult = await makeGraphQLRequest(GET_USER_QUERY, { id: ramjiUserId });
    const ramjiUser = userResult.data?.getUser;
    
    if (ramjiUser) {
      console.log('✅ User Found:');
      console.log(`   ID: ${ramjiUser.id}`);
      console.log(`   Name: ${ramjiUser.firstName} ${ramjiUser.lastName}`);
      console.log(`   Username: ${ramjiUser.username}`);
      console.log(`   Cognito ID: ${ramjiUser.cognitoId || 'Not set'}`);
    } else {
      console.log('❌ User not found');
      return;
    }

    // Get all services
    console.log('\n📋 Fetching services...');
    const servicesResult = await makeGraphQLRequest(LIST_SERVICES_QUERY);
    const allServices = servicesResult.data?.listServices?.items || [];
    
    console.log(`📊 Total services: ${allServices.length}`);
    
    // Filter services for Ramji
    const ramjiServices = allServices.filter(service => service.userId === ramjiUserId);
    console.log(`🎯 Ramji's services: ${ramjiServices.length}`);
    
    if (ramjiServices.length > 0) {
      console.log('\n🛠️ Ramji\'s Services:');
      console.log('='.repeat(50));
      ramjiServices.forEach((service, index) => {
        console.log(`[${index + 1}] ${service.title}`);
        console.log(`    ID: ${service.id}`);
        console.log(`    User ID: ${service.userId}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Rate: ${service.hourlyRate} hours`);
        console.log(`    Active: ${service.isActive}`);
        console.log(`    Created: ${new Date(service.createdAt).toLocaleString()}`);
        console.log('-'.repeat(50));
      });
    } else {
      console.log('\n❌ No services found for Ramji');
    }

    // Check active services from other users
    const otherActiveServices = allServices.filter(service => 
      service.userId !== ramjiUserId && service.isActive
    );
    console.log(`\n🌐 Active services from others: ${otherActiveServices.length}`);

    // Check if there are any services with the old user ID format
    const servicesWithOldId = allServices.filter(service => 
      service.userId === '6438e458-e0f1-700c-cdd1-e15a4cecd6e5'
    );
    console.log(`🔍 Services with old ID format: ${servicesWithOldId.length}`);

    if (servicesWithOldId.length > 0) {
      console.log('\n⚠️  Found services with old ID format:');
      servicesWithOldId.forEach((service, index) => {
        console.log(`[${index + 1}] ${service.title} (ID: ${service.id})`);
      });
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
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugServices };
