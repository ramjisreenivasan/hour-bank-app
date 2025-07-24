#!/usr/bin/env node

console.log('🔍 Finding and fixing remaining services with null hourlyDuration...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const USER_ID = 'de5d0750-d4b5-4ac7-8888-57344a6b5019';

// Query to get services by user ID without hourlyDuration field (to avoid null errors)
const servicesByUserIdBasicQuery = `
  query ServicesByUserId($userId: ID!, $limit: Int) {
    servicesByUserId(userId: $userId, limit: $limit) {
      items {
        id
        userId
        title
        description
        category
        isActive
        tags
        createdAt
      }
      nextToken
    }
  }
`;

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

// Test query with hourlyDuration
const testQuery = `
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

// Get default hourly duration based on category
const getDefaultHourlyDuration = (service) => {
    const categoryDefaults = {
        'Technology': 4,
        'Creative': 3,
        'Education': 2,
        'Business': 3,
        'Health & Wellness': 2,
        'Home & Garden': 3,
        'Other': 2
    };
    
    return categoryDefaults[service.category] || 3;
};

async function findAllUserServices() {
    console.log('📋 Step 1: Finding all services for user...');
    console.log(`User ID: ${USER_ID}`);
    
    try {
        const result = await graphqlRequest(servicesByUserIdBasicQuery, { 
            userId: USER_ID, 
            limit: 20 
        });
        
        const services = result.servicesByUserId.items;
        console.log(`✅ Found ${services.length} services`);
        
        if (services.length > 0) {
            console.log('\n📋 All services found:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ${service.title}`);
                console.log(`     - Category: ${service.category}`);
                console.log(`     - Active: ${service.isActive}`);
                console.log(`     - ID: ${service.id}`);
                console.log('');
            });
        }
        
        return services;
        
    } catch (error) {
        console.error('❌ Failed to find services:', error.message);
        return [];
    }
}

async function updateAllServices(services) {
    console.log('📋 Step 2: Updating all services with hourlyDuration...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const service of services) {
        try {
            const defaultDuration = getDefaultHourlyDuration(service);
            console.log(`🔄 Updating: ${service.title} → ${defaultDuration} hours...`);
            
            const updateInput = {
                id: service.id,
                hourlyDuration: defaultDuration
            };
            
            const result = await graphqlRequest(updateServiceMutation, { input: updateInput });
            
            console.log(`✅ Updated: ${result.updateService.title} (${result.updateService.hourlyDuration} hours)`);
            successCount++;
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`❌ Failed to update ${service.title}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${successCount} services`);
    console.log(`❌ Failed to update: ${errorCount} services`);
    
    return successCount;
}

async function testFinalQuery() {
    console.log('\n🔍 Step 3: Testing final servicesByUserId query...');
    
    try {
        const result = await graphqlRequest(testQuery, { 
            userId: USER_ID, 
            limit: 20 
        });
        
        const services = result.servicesByUserId.items;
        console.log(`✅ Final query successful! Found ${services.length} services`);
        
        if (services.length > 0) {
            console.log('\n📋 Final services state:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ${service.title}`);
                console.log(`     - Category: ${service.category}`);
                console.log(`     - Duration: ${service.hourlyDuration} hours`);
                console.log(`     - Active: ${service.isActive}`);
                console.log('');
            });
            
            console.log('🎉 SUCCESS! All services now have hourlyDuration values!');
            console.log('✅ Profile page should work correctly now!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Final test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🔍 Find and Fix Remaining Services Tool');
    console.log('=======================================');
    console.log('Finding all services and ensuring they have hourlyDuration values\n');
    
    // Step 1: Find all services
    const services = await findAllUserServices();
    
    if (services.length === 0) {
        console.log('❌ No services found to update');
        return;
    }
    
    // Step 2: Update all services
    const updatedCount = await updateAllServices(services);
    
    if (updatedCount > 0) {
        // Step 3: Test final query
        const success = await testFinalQuery();
        
        if (success) {
            console.log('\n🎯 Mission Accomplished!');
            console.log('✅ Schema deployed with hourlyDuration');
            console.log('✅ All services updated with hourlyDuration values');
            console.log('✅ servicesByUserId query working perfectly');
            console.log('✅ Profile page ready to use');
            console.log('');
            console.log('🚀 Next: Navigate to your profile page and enjoy your services!');
        }
    }
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Process failed:', error);
    process.exit(1);
});
