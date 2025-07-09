#!/usr/bin/env node

console.log('🔄 Migrating hourlyRate to hourlyDuration...\n');

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
        hourlyRate
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

async function migrateServices() {
    console.log('📋 Step 1: Fetching all services...');
    
    try {
        const data = await graphqlRequest(listServicesQuery);
        const services = data.listServices.items;
        
        console.log(`✅ Found ${services.length} services`);
        
        if (services.length === 0) {
            console.log('No services to migrate');
            return;
        }
        
        // Check which services need migration
        const servicesToMigrate = services.filter(service => {
            // Service has hourlyRate but no hourlyDuration, or hourlyDuration is null/undefined
            return service.hourlyRate !== undefined && 
                   service.hourlyRate !== null && 
                   (service.hourlyDuration === undefined || service.hourlyDuration === null);
        });
        
        console.log(`📊 Services needing migration: ${servicesToMigrate.length}`);
        
        if (servicesToMigrate.length === 0) {
            console.log('✅ All services already have hourlyDuration field');
            
            // Show current state
            console.log('\n📋 Current Services:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ${service.title}`);
                console.log(`     - hourlyRate: ${service.hourlyRate || 'undefined'}`);
                console.log(`     - hourlyDuration: ${service.hourlyDuration || 'undefined'}`);
                console.log('');
            });
            
            return;
        }
        
        console.log('\n📋 Services to migrate:');
        servicesToMigrate.forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.title} (${service.category})`);
            console.log(`     - Current hourlyRate: ${service.hourlyRate}`);
            console.log(`     - Will set hourlyDuration: ${service.hourlyRate}`);
            console.log('');
        });
        
        console.log('🔄 Step 2: Migrating services...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const service of servicesToMigrate) {
            try {
                console.log(`🔄 Migrating: ${service.title}...`);
                
                const updateInput = {
                    id: service.id,
                    hourlyDuration: service.hourlyRate
                };
                
                await graphqlRequest(updateServiceMutation, { input: updateInput });
                
                console.log(`✅ Migrated: ${service.title} (${service.hourlyRate} hours)`);
                successCount++;
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to migrate ${service.title}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully migrated: ${successCount} services`);
        console.log(`❌ Failed to migrate: ${errorCount} services`);
        
        if (successCount > 0) {
            console.log('\n🎉 Migration completed successfully!');
            console.log('\nNext steps:');
            console.log('1. Deploy the updated GraphQL schema with hourlyDuration');
            console.log('2. Test the profile page to ensure services load correctly');
            console.log('3. Remove any references to hourlyRate from the codebase');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

async function verifyMigration() {
    console.log('\n🔍 Step 3: Verifying migration...');
    
    try {
        const data = await graphqlRequest(listServicesQuery);
        const services = data.listServices.items;
        
        console.log('📋 Post-migration service state:');
        services.forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.title}`);
            console.log(`     - hourlyRate: ${service.hourlyRate || 'undefined'}`);
            console.log(`     - hourlyDuration: ${service.hourlyDuration || 'undefined'}`);
            
            if (service.hourlyDuration) {
                console.log('     ✅ Has hourlyDuration');
            } else {
                console.log('     ⚠️  Missing hourlyDuration');
            }
            console.log('');
        });
        
        const servicesWithDuration = services.filter(s => s.hourlyDuration !== undefined && s.hourlyDuration !== null);
        console.log(`✅ Services with hourlyDuration: ${servicesWithDuration.length}/${services.length}`);
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

async function main() {
    console.log('🔄 Service Data Migration Tool');
    console.log('==============================');
    console.log('Converting hourlyRate → hourlyDuration\n');
    
    await migrateServices();
    await verifyMigration();
    
    console.log('\n✅ Migration process complete!');
}

// Check if we have fetch available
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('\nAlternative: Run the migration manually in AWS AppSync Console');
    console.log('Use the updateService mutation to set hourlyDuration for each service');
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
