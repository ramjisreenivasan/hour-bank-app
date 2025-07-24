#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔧 Fixing name mismatches in user bios and service descriptions...');
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

// Function to extract names from text and replace them
function fixNamesInText(text, correctName) {
  if (!text) return text;
  
  // Handle "Dr. Sarah" case - use just the first name part
  const nameToUse = correctName.replace('Dr. ', '');
  
  const patterns = [
    /Hi!\s*I'm\s+([A-Z][a-z]+)/gi,
    /Hello!\s*I'm\s+([A-Z][a-z]+)/gi,
    /I'm\s+([A-Z][a-z]+)\s+and/gi,
    /My name is\s+([A-Z][a-z]+)/gi,
    /I am\s+([A-Z][a-z]+)\s+and/gi,
    /This is\s+([A-Z][a-z]+)/gi
  ];
  
  let fixedText = text;
  patterns.forEach(pattern => {
    fixedText = fixedText.replace(pattern, (match, foundName) => {
      return match.replace(foundName, nameToUse);
    });
  });
  
  return fixedText;
}

async function fixNameMismatches() {
  try {
    // Get all users with full details
    const listUsersQuery = `
      query ListUsers {
        listUsers {
          items {
            id
            firstName
            lastName
            username
            email
            bio
          }
        }
      }
    `;

    console.log('📋 Fetching all users...');
    const usersResult = await makeGraphQLRequest(listUsersQuery);
    
    if (usersResult.errors) {
      console.log('❌ Error fetching users:', JSON.stringify(usersResult.errors, null, 2));
      return;
    }

    const users = usersResult.data.listUsers.items;
    console.log(`✅ Found ${users.length} users`);

    // Get all services
    const listServicesQuery = `
      query ListServices {
        listServices {
          items {
            id
            userId
            title
            description
          }
        }
      }
    `;

    console.log('📋 Fetching all services...');
    const servicesResult = await makeGraphQLRequest(listServicesQuery);
    
    if (servicesResult.errors) {
      console.log('❌ Error fetching services:', JSON.stringify(servicesResult.errors, null, 2));
      return;
    }

    const services = servicesResult.data.listServices.items;
    console.log(`✅ Found ${services.length} services`);
    console.log('');

    // Create user lookup
    const userLookup = {};
    users.forEach(user => {
      userLookup[user.id] = user;
    });

    let totalFixed = 0;
    let totalErrors = 0;

    // Update service descriptions
    const updateServiceMutation = `
      mutation UpdateService($input: UpdateServiceInput!) {
        updateService(input: $input) {
          id
          title
          description
          updatedAt
        }
      }
    `;

    console.log('🔧 Fixing service descriptions...');
    for (const service of services) {
      const user = userLookup[service.userId];
      if (user && service.description) {
        const originalDescription = service.description;
        const fixedDescription = fixNamesInText(service.description, user.firstName);
        
        if (originalDescription !== fixedDescription) {
          try {
            console.log(`🔄 Updating service: ${service.title}`);
            console.log(`   User: ${user.firstName} ${user.lastName}`);
            console.log(`   Before: ${originalDescription.substring(0, 100)}...`);
            console.log(`   After:  ${fixedDescription.substring(0, 100)}...`);
            
            const updateInput = {
              id: service.id,
              description: fixedDescription
            };

            const updateResult = await makeGraphQLRequest(updateServiceMutation, { input: updateInput });
            
            if (updateResult.errors) {
              console.log(`❌ Error updating service ${service.title}:`, JSON.stringify(updateResult.errors, null, 2));
              totalErrors++;
            } else {
              console.log(`✅ Successfully updated: ${service.title}`);
              totalFixed++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.error(`❌ Error updating service ${service.title}:`, error.message);
            totalErrors++;
          }
        }
      }
    }

    // Update user bios if needed
    const updateUserMutation = `
      mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          firstName
          lastName
          bio
          updatedAt
        }
      }
    `;

    console.log('\n🔧 Checking user bios...');
    for (const user of users) {
      if (user.bio) {
        const originalBio = user.bio;
        const fixedBio = fixNamesInText(user.bio, user.firstName);
        
        if (originalBio !== fixedBio) {
          try {
            console.log(`🔄 Updating user bio: ${user.firstName} ${user.lastName}`);
            console.log(`   Before: ${originalBio.substring(0, 100)}...`);
            console.log(`   After:  ${fixedBio.substring(0, 100)}...`);
            
            const updateInput = {
              id: user.id,
              bio: fixedBio
            };

            const updateResult = await makeGraphQLRequest(updateUserMutation, { input: updateInput });
            
            if (updateResult.errors) {
              console.log(`❌ Error updating user bio for ${user.firstName} ${user.lastName}:`, JSON.stringify(updateResult.errors, null, 2));
              totalErrors++;
            } else {
              console.log(`✅ Successfully updated bio for: ${user.firstName} ${user.lastName}`);
              totalFixed++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            console.error(`❌ Error updating user bio for ${user.firstName} ${user.lastName}:`, error.message);
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
      console.log(`\n🎉 Name mismatches have been fixed!`);
      console.log(`💡 All names in bios and service descriptions now match user first names.`);
    }

    return totalFixed > 0;

  } catch (error) {
    console.log('❌ Failed to fix name mismatches:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Name Mismatch Fixer');
  console.log('================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const success = await fixNameMismatches();
    
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

module.exports = { fixNameMismatches, fixNamesInText };
