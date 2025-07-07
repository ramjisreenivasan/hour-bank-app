const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const MISSING_USER_ID = '64083428-a041-702c-2e7e-7e4b2c4ba1f4';

console.log('🔧 Fixing User Profile Update Issue');
console.log('=====================================');
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

async function fixUserProfile() {
  try {
    console.log('🔍 Problem Analysis:');
    console.log(`   User ID ${MISSING_USER_ID} does not exist in the database.`);
    console.log('   This is why profile updates are failing.');
    console.log('');

    // Option 1: Create the missing user
    console.log('💡 Solution 1: Create the missing user');
    console.log('=====================================');
    
    const createUserMutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          username
          firstName
          lastName
          bankHours
          skills
          bio
          profilePicture
          rating
          totalTransactions
          createdAt
          updatedAt
        }
      }
    `;

    // Create user with the specific ID
    const createInput = {
      id: MISSING_USER_ID,
      email: "user@hourbank.com",
      username: "hourbank_user",
      firstName: "HourBank",
      lastName: "User",
      bankHours: 50.0,
      skills: ["General Services"],
      bio: "Welcome to HourBank! This profile was created to fix the update issue.",
      rating: 5.0,
      totalTransactions: 0
    };

    console.log('🚀 Creating user with ID:', MISSING_USER_ID);
    const createResult = await makeGraphQLRequest(createUserMutation, { input: createInput });
    
    if (createResult.errors) {
      console.log('❌ Error creating user:');
      console.log(JSON.stringify(createResult.errors, null, 2));
      
      // Check if it's a duplicate ID error
      const isDuplicateError = createResult.errors.some(error => 
        error.message.includes('already exists') || 
        error.message.includes('duplicate') ||
        error.message.includes('ConditionalCheckFailedException')
      );
      
      if (isDuplicateError) {
        console.log('');
        console.log('ℹ️  The user might already exist. Let me try to get it...');
        
        const getUserQuery = `
          query GetUser($id: ID!) {
            getUser(id: $id) {
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
            }
          }
        `;
        
        const getUserResult = await makeGraphQLRequest(getUserQuery, { id: MISSING_USER_ID });
        
        if (getUserResult.data && getUserResult.data.getUser) {
          console.log('✅ User found! Here are the details:');
          console.log(JSON.stringify(getUserResult.data.getUser, null, 2));
        } else {
          console.log('❌ User still not found. There might be a different issue.');
        }
      }
    } else {
      console.log('✅ User created successfully!');
      console.log(JSON.stringify(createResult.data.createUser, null, 2));
      console.log('');
      
      // Now try to update the user
      console.log('🔄 Testing profile update...');
      
      const updateUserMutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            firstName
            lastName
            bio
            skills
            updatedAt
          }
        }
      `;
      
      const updateInput = {
        id: MISSING_USER_ID,
        firstName: "Updated",
        lastName: "Profile",
        bio: "This profile has been successfully updated! " + new Date().toISOString(),
        skills: ["JavaScript", "React", "Node.js", "AWS", "GraphQL"]
      };
      
      const updateResult = await makeGraphQLRequest(updateUserMutation, { input: updateInput });
      
      if (updateResult.errors) {
        console.log('❌ Update still failed:');
        console.log(JSON.stringify(updateResult.errors, null, 2));
      } else {
        console.log('✅ Profile update successful!');
        console.log(JSON.stringify(updateResult.data.updateUser, null, 2));
      }
    }

    console.log('');
    console.log('📋 Alternative Solution: Use Existing User');
    console.log('==========================================');
    console.log('If you want to update an existing user instead, here are some options:');
    console.log('');
    console.log('• Ramji Sreenivasan: 2ddf7654-46f6-4dc3-9f47-d97746437e30');
    console.log('• Sarah Johnson: 587fbf91-fa90-45f4-94e1-a5e7f690ba5f');
    console.log('• Sarah Chen: c84eb2b8-3865-4234-8bd4-257046d1304f');
    console.log('');
    console.log('Example update for existing user:');
    console.log('```javascript');
    console.log('const updateInput = {');
    console.log('  id: "2ddf7654-46f6-4dc3-9f47-d97746437e30", // Ramji\'s ID');
    console.log('  bio: "Updated bio text",');
    console.log('  skills: ["New", "Skills", "List"]');
    console.log('};');
    console.log('```');

  } catch (error) {
    console.log('❌ Script failed:', error.message);
  }
}

// Run the fix
fixUserProfile();
