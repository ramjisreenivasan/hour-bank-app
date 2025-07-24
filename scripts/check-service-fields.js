#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔍 Checking what fields exist in services...');
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

async function checkServiceFields() {
  try {
    // Try a basic query first to see what fields are available
    const basicQuery = `
      query ListServices {
        listServices(limit: 1) {
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

    console.log('📋 Testing basic service fields...');
    const basicResult = await makeGraphQLRequest(basicQuery);
    
    if (basicResult.errors) {
      console.log('❌ Error with basic query:', JSON.stringify(basicResult.errors, null, 2));
      return;
    }

    console.log('✅ Basic fields work');
    
    // Now try to add potential duration/float fields one by one
    const fieldsToTest = [
      'hourlyRate',
      'minBookingHours', 
      'maxBookingHours',
      'duration',
      'requiresScheduling'
    ];

    const workingFields = ['id', 'userId', 'title', 'description', 'category', 'tags', 'isActive', 'createdAt', 'updatedAt'];
    
    for (const field of fieldsToTest) {
      const testQuery = `
        query ListServices {
          listServices(limit: 1) {
            items {
              id
              ${field}
            }
          }
        }
      `;

      try {
        console.log(`🔍 Testing field: ${field}`);
        const testResult = await makeGraphQLRequest(testQuery);
        
        if (testResult.errors) {
          console.log(`❌ Field '${field}' not available:`, testResult.errors[0].message);
        } else {
          console.log(`✅ Field '${field}' is available`);
          workingFields.push(field);
        }
      } catch (error) {
        console.log(`❌ Error testing field '${field}':`, error.message);
      }
    }

    // Now get all services with working fields
    const workingFieldsQuery = `
      query ListServices {
        listServices {
          items {
            ${workingFields.join('\n            ')}
          }
        }
      }
    `;

    console.log('\n📋 Fetching all services with available fields...');
    const servicesResult = await makeGraphQLRequest(workingFieldsQuery);
    
    if (servicesResult.errors) {
      console.log('❌ Error fetching services:', JSON.stringify(servicesResult.errors, null, 2));
      return;
    }

    const services = servicesResult.data.listServices.items;
    console.log(`✅ Found ${services.length} services`);

    // Show sample service structure
    if (services.length > 0) {
      console.log('\n📋 Sample service structure:');
      console.log(JSON.stringify(services[0], null, 2));
    }

    // Check for any float values that should be integers
    const floatIssues = [];
    
    services.forEach(service => {
      Object.keys(service).forEach(key => {
        const value = service[key];
        if (typeof value === 'number' && !Number.isInteger(value)) {
          // Check if this field should logically be an integer
          const shouldBeInteger = [
            'duration', 'minBookingHours', 'maxBookingHours', 
            'advanceBookingDays', 'cancellationHours'
          ].includes(key);
          
          if (shouldBeInteger) {
            floatIssues.push({
              serviceId: service.id,
              serviceTitle: service.title,
              field: key,
              currentValue: value,
              suggestedValue: Math.round(value)
            });
          }
        }
      });
    });

    console.log('\n📊 Float values that should be integers:');
    console.log('='.repeat(60));
    
    if (floatIssues.length === 0) {
      console.log('✅ No float values found that should be integers!');
    } else {
      floatIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.serviceTitle}`);
        console.log(`   Service ID: ${issue.serviceId}`);
        console.log(`   Field: ${issue.field}`);
        console.log(`   Current: ${issue.currentValue} → Suggested: ${issue.suggestedValue}`);
        console.log('');
      });
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`• Total services: ${services.length}`);
    console.log(`• Available fields: ${workingFields.join(', ')}`);
    console.log(`• Float issues found: ${floatIssues.length}`);
    
    return { services, floatIssues, workingFields };

  } catch (error) {
    console.log('❌ Failed to check service fields:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Service Fields Checker');
  console.log('===================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const result = await checkServiceFields();
    
    if (result && result.floatIssues.length > 0) {
      console.log('\n🔧 Float issues found that need fixing.');
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

module.exports = { checkServiceFields };
