#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('🔍 Checking for name mismatches in user bios and service descriptions...');
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

// Function to extract names from text (looking for patterns like "Hi! I'm [Name]" or "I'm [Name]")
function extractNamesFromText(text) {
  if (!text) return [];
  
  const patterns = [
    /Hi!\s*I'm\s+([A-Z][a-z]+)/gi,
    /Hello!\s*I'm\s+([A-Z][a-z]+)/gi,
    /I'm\s+([A-Z][a-z]+)\s+and/gi,
    /My name is\s+([A-Z][a-z]+)/gi,
    /I am\s+([A-Z][a-z]+)\s+and/gi,
    /This is\s+([A-Z][a-z]+)/gi
  ];
  
  const foundNames = [];
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      foundNames.push(match[1]);
    }
  });
  
  return foundNames;
}

async function checkNameMismatches() {
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

    let totalIssues = 0;
    const issuesFound = [];

    // Check user bios for name mismatches
    console.log('🔍 Checking user bios for name mismatches...');
    users.forEach(user => {
      if (user.bio) {
        const namesInBio = extractNamesFromText(user.bio);
        if (namesInBio.length > 0) {
          const correctFirstName = user.firstName.replace('Dr. ', ''); // Handle "Dr. Sarah" case
          const hasCorrectName = namesInBio.some(name => 
            name.toLowerCase() === correctFirstName.toLowerCase()
          );
          
          if (!hasCorrectName) {
            totalIssues++;
            issuesFound.push({
              type: 'USER_BIO',
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              correctName: user.firstName,
              foundNames: namesInBio,
              text: user.bio
            });
            
            console.log(`❌ User Bio Mismatch:`);
            console.log(`   User: ${user.firstName} ${user.lastName} (${user.id})`);
            console.log(`   Found names in bio: ${namesInBio.join(', ')}`);
            console.log(`   Expected: ${user.firstName}`);
            console.log(`   Bio: ${user.bio}`);
            console.log('');
          }
        }
      }
    });

    // Check service descriptions for name mismatches
    console.log('🔍 Checking service descriptions for name mismatches...');
    services.forEach(service => {
      const user = userLookup[service.userId];
      if (user && service.description) {
        const namesInDescription = extractNamesFromText(service.description);
        if (namesInDescription.length > 0) {
          const correctFirstName = user.firstName.replace('Dr. ', ''); // Handle "Dr. Sarah" case
          const hasCorrectName = namesInDescription.some(name => 
            name.toLowerCase() === correctFirstName.toLowerCase()
          );
          
          if (!hasCorrectName) {
            totalIssues++;
            issuesFound.push({
              type: 'SERVICE_DESCRIPTION',
              userId: user.id,
              serviceId: service.id,
              userName: `${user.firstName} ${user.lastName}`,
              serviceTitle: service.title,
              correctName: user.firstName,
              foundNames: namesInDescription,
              text: service.description
            });
            
            console.log(`❌ Service Description Mismatch:`);
            console.log(`   User: ${user.firstName} ${user.lastName} (${user.id})`);
            console.log(`   Service: ${service.title} (${service.id})`);
            console.log(`   Found names in description: ${namesInDescription.join(', ')}`);
            console.log(`   Expected: ${user.firstName}`);
            console.log(`   Description: ${service.description}`);
            console.log('');
          }
        }
      }
    });

    // Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total issues found: ${totalIssues}`);
    
    const bioIssues = issuesFound.filter(issue => issue.type === 'USER_BIO');
    const serviceIssues = issuesFound.filter(issue => issue.type === 'SERVICE_DESCRIPTION');
    
    console.log(`• User bio issues: ${bioIssues.length}`);
    console.log(`• Service description issues: ${serviceIssues.length}`);
    
    if (totalIssues === 0) {
      console.log('✅ No name mismatches found!');
    } else {
      console.log('\n💡 Run the fix script to correct these issues.');
    }

    return issuesFound;

  } catch (error) {
    console.log('❌ Failed to check name mismatches:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('🏦 HourBank Name Mismatch Checker');
  console.log('==================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const issues = await checkNameMismatches();
    
    if (issues.length > 0) {
      console.log('\n🔧 Issues found that need fixing.');
      process.exit(1);
    } else {
      console.log('\n✨ No issues found!');
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

module.exports = { checkNameMismatches, extractNamesFromText };
