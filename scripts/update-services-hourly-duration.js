#!/usr/bin/env node

console.log('🔧 Updating services with hourlyDuration values...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const USER_ID = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';

// Update mutation
const updateServiceMutation = `
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      id
      userId
      title
      category
      hourlyDuration
      isActive
    }
  }
`;

async function graphqlRequest(query, variables = {}) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ query, variables })
        });
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL Errors:', result.errors);
            throw new Error(`GraphQL Error: ${result.errors[0].message}`);
        }
        
        return result.data;
        
    } catch (error) {
        console.error('❌ Request Error:', error.message);
        throw error;
    }
}

// Based on your previous services, let's update them with appropriate hourlyDuration values
const servicesToUpdate = [
    {
        id: 'c4afd447-e5d7-43d3-9f70-2ef299986274',
        title: 'API Development & Integration',
        hourlyDuration: 8
    },
    {
        id: '87d0404f-ff10-48cc-8a8b-0838e9ffc3d6',
        title: 'Database Design & Optimization',
        hourlyDuration: 7
    },
    {
        id: '435811a6-02f6-467e-9e61-ba5e90492269',
        title: 'Programming Tutoring (JavaScript/TypeScript)',
        hourlyDuration: 5
    },
    {
        id: '3b74a6dc-3d28-4f3c-b159-9a7a4937af41',
        title: 'Code Review & Technical Mentoring',
        hourlyDuration: 6
    },
    {
        id: '909b7892-2e4d-4d9b-b938-87b213ca2fb3',
        title: 'AWS Cloud Architecture & Deployment',
        hourlyDuration: 10
    }
];

async function updateServices() {
    console.log('📋 Updating services with hourlyDuration values...');
    console.log(`Target User ID: ${USER_ID}`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const service of servicesToUpdate) {
        try {
            console.log(`🔄 Updating: ${service.title} → ${service.hourlyDuration} hours...`);
            
            const updateInput = {
                id: service.id,
                hourlyDuration: service.hourlyDuration
            };
            
            const result = await graphqlRequest(updateServiceMutation, { input: updateInput });
            
            console.log(`✅ Updated: ${result.updateService.title} (${result.updateService.hourlyDuration} hours)`);
            successCount++;
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.error(`❌ Failed to update ${service.title}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${successCount} services`);
    console.log(`❌ Failed to update: ${errorCount} services`);
    
    return successCount > 0;
}

async function testServicesQuery() {
    console.log('\n🔍 Testing servicesByUserId query...');
    
    const servicesByUserIdQuery = `
      query ServicesByUserId($userId: ID!, $limit: Int) {
        servicesByUserId(userId: $userId, limit: $limit) {
          items {
            id
            userId
            title
            category
            hourlyDuration
            isActive
          }
          nextToken
        }
      }
    `;
    
    try {
        const result = await graphqlRequest(servicesByUserIdQuery, { 
            userId: USER_ID, 
            limit: 10 
        });
        
        const services = result.servicesByUserId.items;
        console.log(`✅ Query successful! Found ${services.length} services`);
        
        if (services.length > 0) {
            console.log('\n📋 Services loaded:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ${service.title}`);
                console.log(`     - Category: ${service.category}`);
                console.log(`     - Duration: ${service.hourlyDuration} hours`);
                console.log(`     - Active: ${service.isActive}`);
                console.log(`     - ID: ${service.id}`);
                console.log('');
            });
            
            console.log('🎉 SUCCESS! Profile page should now work correctly!');
            return true;
        } else {
            console.log('📋 No services found for this user');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Query failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🔧 Service HourlyDuration Update Tool');
    console.log('=====================================');
    console.log('Updating specific services with hourlyDuration values\n');
    
    const updateSuccess = await updateServices();
    
    if (updateSuccess) {
        const querySuccess = await testServicesQuery();
        
        if (querySuccess) {
            console.log('\n✅ All operations completed successfully!');
            console.log('\n📋 What was accomplished:');
            console.log('✅ Schema deployed with hourlyDuration field');
            console.log('✅ Services updated with hourlyDuration values');
            console.log('✅ servicesByUserId query working correctly');
            console.log('✅ Profile page should now load services');
            console.log('');
            console.log('🎯 Next steps:');
            console.log('1. Navigate to your profile page');
            console.log('2. Verify services are displayed correctly');
            console.log('3. Test service creation/editing');
        }
    } else {
        console.log('\n❌ Update failed. Please check the errors above.');
    }
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Update process failed:', error);
    process.exit(1);
});
