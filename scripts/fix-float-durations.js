#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔧 Fixing float duration values to integers...');
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

async function fixFloatDurations() {
  try {
    let totalFixed = 0;
    let totalErrors = 0;

    // Fix Transaction hoursSpent values
    console.log('🔧 Fixing Transaction hoursSpent values...');
    const transactionsQuery = `
      query ListTransactions {
        listTransactions {
          items {
            id
            hoursSpent
            serviceId
            description
          }
        }
      }
    `;

    const transactionsResult = await makeGraphQLRequest(transactionsQuery);
    if (!transactionsResult.errors) {
      const transactions = transactionsResult.data.listTransactions.items;
      console.log(`📋 Found ${transactions.length} transactions`);

      const updateTransactionMutation = `
        mutation UpdateTransaction($input: UpdateTransactionInput!) {
          updateTransaction(input: $input) {
            id
            hoursSpent
            updatedAt
          }
        }
      `;

      for (const transaction of transactions) {
        if (transaction.hoursSpent && !Number.isInteger(transaction.hoursSpent)) {
          const newValue = Math.round(transaction.hoursSpent);
          
          try {
            console.log(`🔄 Updating transaction ${transaction.id.substring(0, 8)}...`);
            console.log(`   hoursSpent: ${transaction.hoursSpent} → ${newValue}`);
            
            const updateInput = {
              id: transaction.id,
              hoursSpent: newValue
            };

            const updateResult = await makeGraphQLRequest(updateTransactionMutation, { input: updateInput });
            
            if (updateResult.errors) {
              console.log(`❌ Error updating transaction:`, JSON.stringify(updateResult.errors, null, 2));
              totalErrors++;
            } else {
              console.log(`✅ Successfully updated transaction`);
              totalFixed++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.error(`❌ Error updating transaction:`, error.message);
            totalErrors++;
          }
        }
      }
    }

    // Fix Service hourlyDuration values
    console.log('\n🔧 Fixing Service hourlyDuration values...');
    const servicesQuery = `
      query ListServices {
        listServices {
          items {
            id
            title
            hourlyDuration
          }
        }
      }
    `;

    const servicesResult = await makeGraphQLRequest(servicesQuery);
    if (!servicesResult.errors) {
      const services = servicesResult.data.listServices.items;
      console.log(`📋 Found ${services.length} services`);

      const updateServiceMutation = `
        mutation UpdateService($input: UpdateServiceInput!) {
          updateService(input: $input) {
            id
            title
            hourlyDuration
            updatedAt
          }
        }
      `;

      for (const service of services) {
        if (service.hourlyDuration && !Number.isInteger(service.hourlyDuration)) {
          const newValue = Math.round(service.hourlyDuration);
          
          try {
            console.log(`🔄 Updating service: ${service.title}`);
            console.log(`   hourlyDuration: ${service.hourlyDuration} → ${newValue}`);
            
            const updateInput = {
              id: service.id,
              hourlyDuration: newValue
            };

            const updateResult = await makeGraphQLRequest(updateServiceMutation, { input: updateInput });
            
            if (updateResult.errors) {
              console.log(`❌ Error updating service:`, JSON.stringify(updateResult.errors, null, 2));
              totalErrors++;
            } else {
              console.log(`✅ Successfully updated service`);
              totalFixed++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.error(`❌ Error updating service:`, error.message);
            totalErrors++;
          }
        }
      }
    }

    console.log('\n📈 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully fixed: ${totalFixed} items`);
    console.log(`❌ Failed to fix: ${totalErrors} items`);
    console.log(`📊 Total processed: ${totalFixed + totalErrors} items`);
    
    if (totalFixed > 0) {
      console.log(`\n🎉 Float duration values have been converted to integers!`);
      console.log(`💡 All duration-related fields now use integer values.`);
    }

    return totalFixed > 0;

  } catch (error) {
    console.log('❌ Failed to fix float durations:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Float Duration Fixer');
  console.log('=================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const success = await fixFloatDurations();
    
    if (success) {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  No changes were needed or script completed with errors.');
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

module.exports = { fixFloatDurations };
