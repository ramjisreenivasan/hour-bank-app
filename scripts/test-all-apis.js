#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🧪 Comprehensive API Testing for HourBank\n');
console.log('==========================================\n');

async function makeGraphQLRequest(query, variables = {}, testName = '') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    
    const options = {
      hostname: 'fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ response, testName });
        } catch (error) {
          reject({ error, testName, rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error, testName });
    });

    req.write(postData);
    req.end();
  });
}

// Test queries
const tests = [
  {
    name: 'List Services',
    query: `
      query ListServices {
        listServices(limit: 3) {
          items {
            id
            title
            description
            category
            hourlyDuration
            isActive
            tags
            userId
            createdAt
            updatedAt
          }
        }
      }
    `
  },
  {
    name: 'List Users',
    query: `
      query ListUsers {
        listUsers(limit: 3) {
          items {
            id
            email
            username
            firstName
            lastName
            bankHours
            skills
            bio
            rating
            totalTransactions
            createdAt
            updatedAt
          }
        }
      }
    `
  },
  {
    name: 'List Transactions',
    query: `
      query ListTransactions {
        listTransactions(limit: 3) {
          items {
            id
            providerId
            consumerId
            serviceId
            hoursSpent
            status
            description
            rating
            feedback
            createdAt
            completedAt
            updatedAt
          }
        }
      }
    `
  },
  {
    name: 'List Service Schedules',
    query: `
      query ListServiceSchedules {
        listServiceSchedules(limit: 3) {
          items {
            id
            serviceId
            userId
            dayOfWeek
            startTime
            endTime
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `
  },
  {
    name: 'List Bookings',
    query: `
      query ListBookings {
        listBookings(limit: 3) {
          items {
            id
            serviceId
            providerId
            consumerId
            bookingDate
            startTime
            endTime
            duration
            totalCost
            status
            notes
            createdAt
            updatedAt
          }
        }
      }
    `
  }
];

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}...`);
      
      const { response, testName } = await makeGraphQLRequest(test.query, {}, test.name);
      
      if (response.errors) {
        console.log(`❌ ${test.name} - GraphQL Errors:`);
        response.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.message}`);
          if (error.path) {
            console.log(`      Path: ${error.path.join(' -> ')}`);
          }
        });
        failedTests++;
        results.push({ test: test.name, status: 'FAILED', errors: response.errors });
      } else if (response.data) {
        const dataKeys = Object.keys(response.data);
        const firstKey = dataKeys[0];
        const items = response.data[firstKey]?.items || [];
        
        console.log(`✅ ${test.name} - Success (${items.length} items)`);
        
        if (items.length > 0) {
          console.log(`   Sample item keys: ${Object.keys(items[0]).join(', ')}`);
        }
        
        passedTests++;
        results.push({ test: test.name, status: 'PASSED', itemCount: items.length });
      } else {
        console.log(`⚠️  ${test.name} - No data returned`);
        failedTests++;
        results.push({ test: test.name, status: 'NO_DATA' });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ ${test.name} - Request Error:`, error.error?.message || error.message);
      failedTests++;
      results.push({ test: test.name, status: 'ERROR', error: error.error?.message || error.message });
    }
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / tests.length) * 100)}%\n`);

  // Detailed results
  console.log('📋 Detailed Results');
  console.log('===================');
  results.forEach(result => {
    const statusIcon = result.status === 'PASSED' ? '✅' : 
                      result.status === 'FAILED' ? '❌' : 
                      result.status === 'ERROR' ? '🔥' : '⚠️';
    
    console.log(`${statusIcon} ${result.test}: ${result.status}`);
    
    if (result.itemCount !== undefined) {
      console.log(`   Items returned: ${result.itemCount}`);
    }
    
    if (result.errors) {
      console.log(`   Errors: ${result.errors.length}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n🎯 Recommendations');
  console.log('==================');
  
  if (failedTests === 0) {
    console.log('🎉 All API endpoints are working correctly!');
    console.log('✅ Dashboard should now load services properly');
    console.log('✅ Profile page should display user services');
    console.log('✅ Transaction history should be accessible');
  } else {
    console.log('⚠️  Some API endpoints have issues:');
    
    const failedResults = results.filter(r => r.status !== 'PASSED');
    failedResults.forEach(result => {
      console.log(`   - ${result.test}: ${result.status}`);
      if (result.errors) {
        result.errors.forEach(error => {
          console.log(`     * ${error.message}`);
        });
      }
    });
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check GraphQL schema deployment');
    console.log('   2. Verify data migration completed');
    console.log('   3. Test individual components in the browser');
  }
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
