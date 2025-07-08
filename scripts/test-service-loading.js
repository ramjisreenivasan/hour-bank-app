#!/usr/bin/env node

/**
 * Test script to verify service loading works correctly
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

// Test the same query that the UI uses
const LIST_SERVICES_QUERY_WITH_SCHEDULING = `
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
        minBookingHours
        maxBookingHours
        advanceBookingDays
        cancellationHours
        createdAt
        updatedAt
      }
    }
  }
`;

const LIST_SERVICES_QUERY_FALLBACK = `
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
        createdAt
        updatedAt
      }
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
  return result;
}

async function testServiceLoading() {
  console.log('🧪 Testing Service Loading');
  console.log('==========================\n');

  const ramjiUserId = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';

  try {
    // Test the full query first
    console.log('1️⃣ Testing full query with scheduling fields...');
    const fullResult = await makeGraphQLRequest(LIST_SERVICES_QUERY_WITH_SCHEDULING);
    
    if (fullResult.errors) {
      console.log('❌ Full query failed with errors:');
      console.log('   Error count:', fullResult.errors.length);
      console.log('   Sample error:', fullResult.errors[0].message);
      
      // Test fallback query
      console.log('\n2️⃣ Testing fallback query without scheduling fields...');
      const fallbackResult = await makeGraphQLRequest(LIST_SERVICES_QUERY_FALLBACK);
      
      if (fallbackResult.errors) {
        console.log('❌ Fallback query also failed');
        console.log('   Errors:', fallbackResult.errors);
        return;
      } else {
        console.log('✅ Fallback query succeeded');
        const services = fallbackResult.data?.listServices?.items || [];
        console.log(`   Total services: ${services.length}`);
        
        // Process services like the UI would
        const processedServices = services.map(service => ({
          ...service,
          requiresScheduling: false, // Default value
          tags: service.tags || []
        }));
        
        // Filter for Ramji's services
        const ramjiServices = processedServices.filter(s => s.userId === ramjiUserId);
        console.log(`   Ramji's services: ${ramjiServices.length}`);
        
        // Filter for available services (not Ramji's)
        const availableServices = processedServices.filter(s => 
          s.isActive && s.userId !== ramjiUserId
        );
        console.log(`   Available services for Ramji: ${availableServices.length}`);
        
        if (ramjiServices.length > 0) {
          console.log('\n📋 Ramji\'s Services:');
          ramjiServices.forEach((service, index) => {
            console.log(`   [${index + 1}] ${service.title} (${service.category}, ${service.hourlyRate}h)`);
          });
        }
        
        if (availableServices.length > 0) {
          console.log('\n🛒 Sample Available Services:');
          availableServices.slice(0, 5).forEach((service, index) => {
            console.log(`   [${index + 1}] ${service.title} by ${service.userId.substring(0, 8)}...`);
          });
        }
      }
    } else {
      console.log('✅ Full query succeeded');
      const services = fullResult.data?.listServices?.items || [];
      console.log(`   Total services: ${services.length}`);
      
      const ramjiServices = services.filter(s => s.userId === ramjiUserId);
      console.log(`   Ramji's services: ${ramjiServices.length}`);
      
      const availableServices = services.filter(s => 
        s.isActive && s.userId !== ramjiUserId
      );
      console.log(`   Available services for Ramji: ${availableServices.length}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Main execution
async function main() {
  try {
    await testServiceLoading();
    console.log('\n✨ Test completed!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testServiceLoading };
