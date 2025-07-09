#!/usr/bin/env node

console.log('🔍 Verifying GraphQL Schema and Deployment...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// Introspection query to check schema
const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
`;

// Test basic queries to verify deployment
const testQueries = {
    // Test if Service type exists and has correct fields
    testServiceType: `
      query TestServiceType {
        __type(name: "Service") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `,
    
    // Test if servicesByUserId query exists
    testServicesByUserIdQuery: `
      query TestServicesByUserIdQuery {
        __schema {
          queryType {
            fields {
              name
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `,
    
    // Simple test query
    testConnection: `
      query TestConnection {
        __typename
      }
    `
};

async function testQuery(query, description) {
    console.log(`📋 ${description}...`);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            return false;
        }
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:');
            result.errors.forEach((error, index) => {
                console.error(`  Error ${index + 1}: ${error.message}`);
                if (error.extensions) {
                    console.error(`    Extensions:`, error.extensions);
                }
            });
            return false;
        }
        
        console.log('✅ Success');
        return result.data;
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return false;
    }
}

async function verifySchema() {
    console.log('🔍 GraphQL Schema Verification Tool');
    console.log('====================================\n');
    
    // Test 1: Basic connection
    console.log('=== Test 1: API Connection ===');
    const connectionResult = await testQuery(testQueries.testConnection, 'Testing API connection');
    
    if (!connectionResult) {
        console.log('❌ Cannot connect to GraphQL API');
        console.log('Check:');
        console.log('- API endpoint URL');
        console.log('- API key validity');
        console.log('- Network connectivity');
        return;
    }
    
    console.log('✅ API connection successful\n');
    
    // Test 2: Check Service type
    console.log('=== Test 2: Service Type Structure ===');
    const serviceTypeResult = await testQuery(testQueries.testServiceType, 'Checking Service type');
    
    if (serviceTypeResult && serviceTypeResult.__type) {
        const serviceType = serviceTypeResult.__type;
        console.log(`✅ Service type found with ${serviceType.fields.length} fields:`);
        
        const expectedFields = [
            'id', 'userId', 'title', 'description', 'category', 
            'hourlyDuration', 'isActive', 'tags', 'requiresScheduling',
            'createdAt', 'updatedAt'
        ];
        
        expectedFields.forEach(fieldName => {
            const field = serviceType.fields.find(f => f.name === fieldName);
            if (field) {
                console.log(`   ✅ ${fieldName}: ${field.type.name || field.type.kind}`);
            } else {
                console.log(`   ❌ ${fieldName}: MISSING`);
            }
        });
        
        // Check for hourlyRate (should not exist)
        const hourlyRateField = serviceType.fields.find(f => f.name === 'hourlyRate');
        if (hourlyRateField) {
            console.log('   ⚠️  hourlyRate field still exists (should be hourlyDuration)');
        }
        
    } else {
        console.log('❌ Service type not found in schema');
    }
    
    console.log('');
    
    // Test 3: Check available queries
    console.log('=== Test 3: Available Queries ===');
    const queryTypeResult = await testQuery(testQueries.testServicesByUserIdQuery, 'Checking available queries');
    
    if (queryTypeResult && queryTypeResult.__schema && queryTypeResult.__schema.queryType) {
        const queries = queryTypeResult.__schema.queryType.fields;
        console.log(`✅ Found ${queries.length} available queries`);
        
        const serviceQueries = queries.filter(q => q.name.toLowerCase().includes('service'));
        console.log(`   Service-related queries: ${serviceQueries.length}`);
        
        serviceQueries.forEach(query => {
            console.log(`   - ${query.name}`);
            if (query.args && query.args.length > 0) {
                console.log(`     Args: ${query.args.map(arg => `${arg.name}: ${arg.type.name || arg.type.kind}`).join(', ')}`);
            }
        });
        
        // Specifically check for servicesByUserId
        const servicesByUserIdQuery = queries.find(q => q.name === 'servicesByUserId');
        if (servicesByUserIdQuery) {
            console.log('   ✅ servicesByUserId query exists');
            console.log(`     Args: ${servicesByUserIdQuery.args.map(arg => `${arg.name}: ${arg.type.name || arg.type.kind}`).join(', ')}`);
        } else {
            console.log('   ❌ servicesByUserId query NOT FOUND');
        }
        
    } else {
        console.log('❌ Could not retrieve query information');
    }
    
    console.log('');
    
    // Recommendations
    console.log('=== Recommendations ===');
    
    if (!serviceTypeResult || !serviceTypeResult.__type) {
        console.log('🔧 Service type missing:');
        console.log('   - GraphQL schema may not be deployed');
        console.log('   - Run: amplify push');
        console.log('   - Check AWS AppSync console');
    }
    
    if (queryTypeResult && queryTypeResult.__schema) {
        const queries = queryTypeResult.__schema.queryType.fields;
        const servicesByUserIdQuery = queries.find(q => q.name === 'servicesByUserId');
        
        if (!servicesByUserIdQuery) {
            console.log('🔧 servicesByUserId query missing:');
            console.log('   - Check GraphQL schema has @index(name: "byUserId") on Service.userId');
            console.log('   - Verify schema deployment with amplify push');
            console.log('   - Check DynamoDB GSI creation');
        }
    }
    
    console.log('\n=== Manual Verification Steps ===');
    console.log('1. Go to AWS AppSync Console');
    console.log('2. Select your hourbankapp API');
    console.log('3. Check "Schema" tab for Service type definition');
    console.log('4. Check "Data Sources" tab for DynamoDB connections');
    console.log('5. Test queries in "Queries" tab');
    
    console.log('\n✅ Schema verification complete!');
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('\nAlternative: Run these queries in AWS AppSync Console:');
    
    Object.entries(testQueries).forEach(([name, query]) => {
        console.log(`\n${name}:`);
        console.log(query);
    });
    
    process.exit(1);
}

verifySchema().catch(error => {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
});
