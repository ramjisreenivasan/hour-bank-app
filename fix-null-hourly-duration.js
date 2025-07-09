#!/usr/bin/env node

console.log('🔧 Fixing null hourlyDuration values...\n');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

// GraphQL queries and mutations
const listServicesQuery = `
  query ListServices {
    listServices(limit: 100) {
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

// Default hourly duration values based on service categories
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
    
    return categoryDefaults[service.category] || 2;
};

async function fixNullHourlyDuration() {
    console.log('📋 Step 1: Fetching all services...');
    
    try {
        const data = await graphqlRequest(listServicesQuery);
        const services = data.listServices.items;
        
        console.log(`✅ Found ${services.length} services`);
        
        if (services.length === 0) {
            console.log('No services found');
            return;
        }
        
        // Find services with null hourlyDuration
        const servicesToFix = services.filter(service => 
            service.hourlyDuration === null || service.hourlyDuration === undefined
        );
        
        console.log(`📊 Services with null hourlyDuration: ${servicesToFix.length}`);
        
        if (servicesToFix.length === 0) {
            console.log('✅ All services already have hourlyDuration values');
            
            // Show current state
            console.log('\n📋 Current Services:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ${service.title}`);
                console.log(`     - Category: ${service.category}`);
                console.log(`     - Duration: ${service.hourlyDuration || 'null'} hours`);
                console.log(`     - Active: ${service.isActive}`);
                console.log('');
            });
            
            return;
        }
        
        console.log('\n📋 Services to fix:');
        servicesToFix.forEach((service, index) => {
            const defaultDuration = getDefaultHourlyDuration(service);
            console.log(`  ${index + 1}. ${service.title} (${service.category})`);
            console.log(`     - Current hourlyDuration: ${service.hourlyDuration || 'null'}`);
            console.log(`     - Will set to: ${defaultDuration} hours`);
            console.log('');
        });
        
        console.log('🔄 Step 2: Updating services with default hourlyDuration values...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const service of servicesToFix) {
            try {
                const defaultDuration = getDefaultHourlyDuration(service);
                console.log(`🔄 Updating: ${service.title} → ${defaultDuration} hours...`);
                
                const updateInput = {
                    id: service.id,
                    hourlyDuration: defaultDuration
                };
                
                await graphqlRequest(updateServiceMutation, { input: updateInput });
                
                console.log(`✅ Updated: ${service.title} (${defaultDuration} hours)`);
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
        
        if (successCount > 0) {
            console.log('\n🎉 Update completed successfully!');
            console.log('\nNext steps:');
            console.log('1. Test the profile page');
            console.log('2. Verify services load correctly');
            console.log('3. Adjust hourlyDuration values as needed');
        }
        
    } catch (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
    }
}

async function verifyFix() {
    console.log('\n🔍 Step 3: Verifying fix...');
    
    try {
        const data = await graphqlRequest(listServicesQuery);
        const services = data.listServices.items;
        
        console.log('📋 Post-update service state:');
        services.forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.title}`);
            console.log(`     - Category: ${service.category}`);
            console.log(`     - Duration: ${service.hourlyDuration || 'null'} hours`);
            console.log(`     - Active: ${service.isActive}`);
            
            if (service.hourlyDuration && service.hourlyDuration > 0) {
                console.log('     ✅ Has valid hourlyDuration');
            } else {
                console.log('     ⚠️  Still has null/invalid hourlyDuration');
            }
            console.log('');
        });
        
        const servicesWithValidDuration = services.filter(s => s.hourlyDuration && s.hourlyDuration > 0);
        console.log(`✅ Services with valid hourlyDuration: ${servicesWithValidDuration.length}/${services.length}`);
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

async function main() {
    console.log('🔧 Fix Null HourlyDuration Tool');
    console.log('================================');
    console.log('Setting default hourlyDuration values for existing services\n');
    
    await fixNullHourlyDuration();
    await verifyFix();
    
    console.log('\n✅ Fix process complete!');
    console.log('\n📋 Default Duration Values Used:');
    console.log('- Technology: 4 hours');
    console.log('- Creative: 3 hours');
    console.log('- Education: 2 hours');
    console.log('- Business: 3 hours');
    console.log('- Health & Wellness: 2 hours');
    console.log('- Home & Garden: 3 hours');
    console.log('- Other: 2 hours');
    console.log('\nYou can adjust these values in the profile page as needed.');
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Fix process failed:', error);
    process.exit(1);
});
