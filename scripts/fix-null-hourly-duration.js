#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔧 Fixing null hourlyDuration values...\n');

// Query to get services without the problematic hourlyDuration field first
const listServicesBasicQuery = `
  query ListServicesBasic {
    listServices(limit: 100) {
      items {
        id
        userId
        title
        category
        description
        isActive
        tags
        createdAt
        updatedAt
      }
    }
  }
`;

// Mutation to update service with default hourlyDuration
const updateServiceMutation = `
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      id
      title
      hourlyDuration
      isActive
    }
  }
`;

async function makeGraphQLRequest(query, variables = {}) {
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
          
          if (response.errors) {
            console.log('GraphQL Errors:', response.errors);
            reject(new Error(response.errors[0].message));
          } else {
            resolve(response.data);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function fixNullHourlyDuration() {
  try {
    console.log('📋 Step 1: Fetching services (without hourlyDuration field)...');
    
    const data = await makeGraphQLRequest(listServicesBasicQuery);
    const services = data.listServices.items;
    
    console.log(`✅ Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('No services found');
      return;
    }
    
    console.log('\n📋 Services found:');
    services.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.title} (${service.category})`);
      console.log(`     - ID: ${service.id}`);
      console.log(`     - Active: ${service.isActive}`);
      console.log('');
    });
    
    console.log('🔄 Step 2: Updating services with default hourlyDuration...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const service of services) {
      try {
        console.log(`🔄 Updating: ${service.title}...`);
        
        // Set a default hourlyDuration based on category or use 1.0 as default
        let defaultDuration = 1.0;
        
        // Set different defaults based on category
        switch (service.category?.toLowerCase()) {
          case 'technology':
          case 'programming':
          case 'software':
            defaultDuration = 2.0;
            break;
          case 'tutoring':
          case 'education':
          case 'teaching':
            defaultDuration = 1.5;
            break;
          case 'consulting':
          case 'business':
            defaultDuration = 1.0;
            break;
          case 'creative':
          case 'design':
          case 'art':
            defaultDuration = 2.0;
            break;
          case 'fitness':
          case 'health':
          case 'wellness':
            defaultDuration = 1.0;
            break;
          case 'home services':
          case 'maintenance':
          case 'repair':
            defaultDuration = 2.0;
            break;
          default:
            defaultDuration = 1.5;
        }
        
        const updateInput = {
          id: service.id,
          hourlyDuration: defaultDuration
        };
        
        await makeGraphQLRequest(updateServiceMutation, { input: updateInput });
        
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
      console.log('\n🎉 Fix completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Test the dashboard page to see if services load correctly');
      console.log('2. Check the profile page for service management');
      console.log('3. Verify no GraphQL errors in browser console');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

async function verifyFix() {
  console.log('\n🔍 Step 3: Verifying the fix...');
  
  // Try to query with hourlyDuration to see if it works now
  const testQuery = `
    query TestHourlyDuration {
      listServices(limit: 5) {
        items {
          id
          title
          category
          hourlyDuration
          isActive
        }
      }
    }
  `;
  
  try {
    const data = await makeGraphQLRequest(testQuery);
    const services = data.listServices.items;
    
    console.log('✅ Services now loading correctly with hourlyDuration:');
    services.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.title}`);
      console.log(`     - Category: ${service.category}`);
      console.log(`     - Hourly Duration: ${service.hourlyDuration} hours`);
      console.log(`     - Active: ${service.isActive}`);
      console.log('');
    });
    
    console.log(`✅ Successfully loaded ${services.length} services with hourlyDuration`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('The services may still have null hourlyDuration values');
  }
}

async function main() {
  console.log('🔧 HourBank Service Fix Tool');
  console.log('============================');
  console.log('Fixing null hourlyDuration values\n');
  
  await fixNullHourlyDuration();
  await verifyFix();
  
  console.log('\n✅ Fix process complete!');
  console.log('\nYou can now test the dashboard page to see if services load correctly.');
}

main().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
