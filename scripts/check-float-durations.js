#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔍 Checking services for float duration values...');
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

async function checkFloatDurations() {
  try {
    // Get all services - try different field names that might contain duration
    const listServicesQuery = `
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

    console.log('📋 Fetching all services...');
    const servicesResult = await makeGraphQLRequest(listServicesQuery);
    
    if (servicesResult.errors) {
      console.log('❌ Error fetching services:', JSON.stringify(servicesResult.errors, null, 2));
      return;
    }

    const services = servicesResult.data.listServices.items;
    console.log(`✅ Found ${services.length} services`);
    console.log('');

    // Check if there are any duration-related fields
    console.log('🔍 Sample service structure:');
    if (services.length > 0) {
      console.log(JSON.stringify(services[0], null, 2));
    }

    // Check for hourlyRate values that are floats
    const floatRateServices = services.filter(service => {
      return service.hourlyRate && !Number.isInteger(service.hourlyRate);
    });

    console.log('\n📊 Services with float hourlyRate values:');
    console.log('='.repeat(60));
    
    if (floatRateServices.length === 0) {
      console.log('✅ No services found with float hourlyRate values!');
    } else {
      floatRateServices.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title}`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Current hourlyRate: ${service.hourlyRate} (${typeof service.hourlyRate})`);
        console.log(`   Suggested integer: ${Math.round(service.hourlyRate)}`);
        console.log('');
      });
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`• Total services: ${services.length}`);
    console.log(`• Services with float hourlyRate: ${floatRateServices.length}`);
    
    return floatRateServices;

  } catch (error) {
    console.log('❌ Failed to check float durations:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Float Duration Checker');
  console.log('===================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const floatServices = await checkFloatDurations();
    
    if (floatServices.length > 0) {
      console.log('\n🔧 Services found that need fixing.');
      process.exit(1);
    } else {
      console.log('\n✨ No float duration issues found!');
      process.exit(0);
    }
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

module.exports = { checkFloatDurations };
