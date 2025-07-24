#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔍 Checking all models for float duration values...');
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

async function checkAllFloatDurations() {
  try {
    const allIssues = [];

    // Check Services for minBookingHours and maxBookingHours
    console.log('📋 Checking Services...');
    const servicesQuery = `
      query ListServices {
        listServices {
          items {
            id
            title
            minBookingHours
            maxBookingHours
          }
        }
      }
    `;

    try {
      const servicesResult = await makeGraphQLRequest(servicesQuery);
      if (!servicesResult.errors) {
        const services = servicesResult.data.listServices.items;
        console.log(`✅ Found ${services.length} services`);
        
        services.forEach(service => {
          if (service.minBookingHours && !Number.isInteger(service.minBookingHours)) {
            allIssues.push({
              model: 'Service',
              id: service.id,
              title: service.title,
              field: 'minBookingHours',
              currentValue: service.minBookingHours,
              suggestedValue: Math.round(service.minBookingHours)
            });
          }
          if (service.maxBookingHours && !Number.isInteger(service.maxBookingHours)) {
            allIssues.push({
              model: 'Service',
              id: service.id,
              title: service.title,
              field: 'maxBookingHours',
              currentValue: service.maxBookingHours,
              suggestedValue: Math.round(service.maxBookingHours)
            });
          }
        });
      }
    } catch (error) {
      console.log('❌ Error checking services:', error.message);
    }

    // Check Bookings for duration
    console.log('📋 Checking Bookings...');
    const bookingsQuery = `
      query ListBookings {
        listBookings {
          items {
            id
            duration
            serviceId
          }
        }
      }
    `;

    try {
      const bookingsResult = await makeGraphQLRequest(bookingsQuery);
      if (!bookingsResult.errors) {
        const bookings = bookingsResult.data.listBookings.items;
        console.log(`✅ Found ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (booking.duration && !Number.isInteger(booking.duration)) {
            allIssues.push({
              model: 'Booking',
              id: booking.id,
              serviceId: booking.serviceId,
              field: 'duration',
              currentValue: booking.duration,
              suggestedValue: Math.round(booking.duration)
            });
          }
        });
      } else {
        console.log('ℹ️  No bookings table or no data');
      }
    } catch (error) {
      console.log('ℹ️  Bookings not available or empty');
    }

    // Check Transactions for hoursSpent
    console.log('📋 Checking Transactions...');
    const transactionsQuery = `
      query ListTransactions {
        listTransactions {
          items {
            id
            hoursSpent
            serviceId
          }
        }
      }
    `;

    try {
      const transactionsResult = await makeGraphQLRequest(transactionsQuery);
      if (!transactionsResult.errors) {
        const transactions = transactionsResult.data.listTransactions.items;
        console.log(`✅ Found ${transactions.length} transactions`);
        
        transactions.forEach(transaction => {
          if (transaction.hoursSpent && !Number.isInteger(transaction.hoursSpent)) {
            allIssues.push({
              model: 'Transaction',
              id: transaction.id,
              serviceId: transaction.serviceId,
              field: 'hoursSpent',
              currentValue: transaction.hoursSpent,
              suggestedValue: Math.round(transaction.hoursSpent)
            });
          }
        });
      } else {
        console.log('ℹ️  No transactions table or no data');
      }
    } catch (error) {
      console.log('ℹ️  Transactions not available or empty');
    }

    // Check if there's a field called hourlyDuration in services
    console.log('📋 Checking for hourlyDuration field...');
    const hourlyDurationQuery = `
      query ListServices {
        listServices(limit: 1) {
          items {
            id
            hourlyDuration
          }
        }
      }
    `;

    try {
      const hourlyDurationResult = await makeGraphQLRequest(hourlyDurationQuery);
      if (!hourlyDurationResult.errors) {
        console.log('✅ hourlyDuration field exists, checking all services...');
        
        const allServicesQuery = `
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
        
        const allServicesResult = await makeGraphQLRequest(allServicesQuery);
        if (!allServicesResult.errors) {
          const services = allServicesResult.data.listServices.items;
          
          services.forEach(service => {
            if (service.hourlyDuration && !Number.isInteger(service.hourlyDuration)) {
              allIssues.push({
                model: 'Service',
                id: service.id,
                title: service.title,
                field: 'hourlyDuration',
                currentValue: service.hourlyDuration,
                suggestedValue: Math.round(service.hourlyDuration)
              });
            }
          });
        }
      }
    } catch (error) {
      console.log('ℹ️  hourlyDuration field not available');
    }

    // Display results
    console.log('\n📊 Float values that should be integers:');
    console.log('='.repeat(60));
    
    if (allIssues.length === 0) {
      console.log('✅ No float values found that should be integers!');
    } else {
      allIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.model}: ${issue.title || issue.id}`);
        console.log(`   ID: ${issue.id}`);
        console.log(`   Field: ${issue.field}`);
        console.log(`   Current: ${issue.currentValue} → Suggested: ${issue.suggestedValue}`);
        if (issue.serviceId) {
          console.log(`   Service ID: ${issue.serviceId}`);
        }
        console.log('');
      });
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`• Total float issues found: ${allIssues.length}`);
    
    const byModel = {};
    allIssues.forEach(issue => {
      byModel[issue.model] = (byModel[issue.model] || 0) + 1;
    });
    
    Object.keys(byModel).forEach(model => {
      console.log(`• ${model} issues: ${byModel[model]}`);
    });
    
    return allIssues;

  } catch (error) {
    console.log('❌ Failed to check float durations:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank All Models Float Duration Checker');
  console.log('==============================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const issues = await checkAllFloatDurations();
    
    if (issues.length > 0) {
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

module.exports = { checkAllFloatDurations };
