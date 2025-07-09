#!/usr/bin/env node

console.log('🔍 Testing Data Structure via GraphQL API...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// Test queries
const queries = {
    listUsers: `
        query ListUsers {
            listUsers(limit: 5) {
                items {
                    id
                    cognitoId
                    email
                    username
                    firstName
                    lastName
                    bankHours
                }
            }
        }
    `,
    
    listServices: `
        query ListServices {
            listServices(limit: 5) {
                items {
                    id
                    userId
                    title
                    description
                    category
                    hourlyDuration
                    isActive
                }
            }
        }
    `,
    
    servicesByUserId: (userId) => `
        query ServicesByUserId {
            servicesByUserId(userId: "${userId}", limit: 10) {
                items {
                    id
                    userId
                    title
                    category
                    hourlyDuration
                    isActive
                }
            }
        }
    `
};

async function testGraphQLQuery(query, description) {
    console.log(`📋 Testing: ${description}`);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:', result.errors);
            return null;
        }
        
        console.log('✅ Query successful');
        console.log('📊 Data:', JSON.stringify(result.data, null, 2));
        console.log('');
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return null;
    }
}

async function analyzeDataStructure() {
    console.log('🔍 Analyzing Data Structure...\n');
    
    // Test 1: List users
    const usersData = await testGraphQLQuery(queries.listUsers, 'List Users');
    
    // Test 2: List services
    const servicesData = await testGraphQLQuery(queries.listServices, 'List Services');
    
    // Test 3: Analyze relationships
    if (usersData && servicesData) {
        console.log('📋 Analyzing User/Service Relationships...\n');
        
        const users = usersData.listUsers?.items || [];
        const services = servicesData.listServices?.items || [];
        
        console.log(`Found ${users.length} users and ${services.length} services`);
        
        // Check for ID mapping issues
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  - DynamoDB ID: ${user.id}`);
            console.log(`  - Cognito ID: ${user.cognitoId || 'MISSING'}`);
            console.log(`  - Username: ${user.username}`);
            console.log(`  - Email: ${user.email}`);
            
            // Find services for this user
            const userServices = services.filter(service => service.userId === user.id);
            console.log(`  - Services: ${userServices.length}`);
            
            if (userServices.length > 0) {
                userServices.forEach(service => {
                    console.log(`    * ${service.title} (${service.category})`);
                });
            }
            
            console.log('');
        });
        
        // Check for orphaned services
        const orphanedServices = services.filter(service => 
            !users.some(user => user.id === service.userId)
        );
        
        if (orphanedServices.length > 0) {
            console.log(`⚠️  Found ${orphanedServices.length} orphaned services:`);
            orphanedServices.forEach(service => {
                console.log(`  - ${service.title} (userId: ${service.userId})`);
            });
            console.log('');
        }
        
        // Test servicesByUserId for each user
        for (const user of users) {
            console.log(`Testing servicesByUserId for user: ${user.username} (${user.id})`);
            await testGraphQLQuery(
                queries.servicesByUserId(user.id), 
                `Services for ${user.username}`
            );
        }
    }
}

async function provideDiagnosticSummary() {
    console.log('📋 Diagnostic Summary and Recommendations...\n');
    
    console.log('Common Issues to Check:');
    console.log('1. Services with userId pointing to cognitoId instead of User.id');
    console.log('2. Users missing cognitoId field for proper mapping');
    console.log('3. Multiple user records for the same person');
    console.log('4. Services orphaned due to incorrect userId references');
    console.log('');
    
    console.log('Next Steps:');
    console.log('1. Review the data output above');
    console.log('2. Identify any ID mapping issues');
    console.log('3. Run the fix-id-mapping.js script if needed');
    console.log('4. Test the profile page again');
    console.log('');
    
    console.log('Manual Testing:');
    console.log('1. Copy the GraphQL queries above');
    console.log('2. Go to AWS AppSync Console');
    console.log('3. Run the queries in the GraphQL explorer');
    console.log('4. Verify the data relationships');
}

// Main execution
async function main() {
    console.log('🔍 Data Structure Analysis Tool');
    console.log('================================\n');
    
    await analyzeDataStructure();
    await provideDiagnosticSummary();
    
    console.log('✅ Analysis complete!');
}

// Check if we have fetch available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('');
    console.log('Alternative: Copy these queries and run them in AWS AppSync Console:');
    console.log('');
    Object.entries(queries).forEach(([name, query]) => {
        if (typeof query === 'string') {
            console.log(`${name}:`);
            console.log(query);
            console.log('');
        }
    });
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
});
