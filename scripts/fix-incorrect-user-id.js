#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔧 Fixing services with incorrect user ID...');
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

async function fixIncorrectUserIds() {
  try {
    // First, get services with the incorrect user ID
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
        }
      }
    `;

    console.log('🔍 Fetching all services...');
    const servicesResult = await makeGraphQLRequest(listServicesQuery);
    
    if (servicesResult.errors) {
      console.log('❌ Error fetching services:', JSON.stringify(servicesResult.errors, null, 2));
      return;
    }

    const services = servicesResult.data.listServices.items;
    const incorrectUserId = '64083428-a041-702c-2e7e-7e4b2c4ba1f4';
    const correctUserId = '0e7133f3-5180-49d4-b3a4-2a0255755abf';
    
    const servicesToFix = services.filter(service => service.userId === incorrectUserId);
    
    console.log(`📊 Found ${servicesToFix.length} services with incorrect user ID`);
    
    if (servicesToFix.length === 0) {
      console.log('✅ No services need fixing!');
      return;
    }

    console.log('🔧 Services to fix:');
    servicesToFix.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} (ID: ${service.id})`);
    });
    console.log('');

    // Update each service
    const updateServiceMutation = `
      mutation UpdateService($input: UpdateServiceInput!) {
        updateService(input: $input) {
          id
          userId
          title
          updatedAt
        }
      }
    `;

    let successCount = 0;
    let failureCount = 0;

    for (const service of servicesToFix) {
      try {
        console.log(`🔄 Updating service: ${service.title}`);
        
        const updateInput = {
          id: service.id,
          userId: correctUserId
        };

        const updateResult = await makeGraphQLRequest(updateServiceMutation, { input: updateInput });
        
        if (updateResult.errors) {
          console.log(`❌ Error updating service ${service.title}:`, JSON.stringify(updateResult.errors, null, 2));
          failureCount++;
        } else {
          console.log(`✅ Successfully updated: ${service.title}`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Error updating service ${service.title}:`, error.message);
        failureCount++;
      }
    }

    console.log('');
    console.log('📈 SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ Successfully updated: ${successCount} services`);
    console.log(`❌ Failed to update: ${failureCount} services`);
    console.log(`📊 Total processed: ${successCount + failureCount} services`);
    
    if (successCount > 0) {
      console.log(`\n🎉 Services have been fixed!`);
      console.log(`💡 All services now reference correct user IDs.`);
    }

  } catch (error) {
    console.log('❌ Failed to fix services:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Service User ID Fix Utility');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    await fixIncorrectUserIds();
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Script failed with error:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { fixIncorrectUserIds };
