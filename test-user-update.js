const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';
const USER_ID = '64083428-a041-702c-2e7e-7e4b2c4ba1f4';

console.log('🧪 Testing User Update for ID:', USER_ID);
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

async function testUserOperations() {
  try {
    // 1. First, check if user exists
    console.log('1️⃣ Checking if user exists...');
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
          profilePicture
          rating
          totalTransactions
          createdAt
          updatedAt
        }
      }
    `;

    const userResult = await makeGraphQLRequest(getUserQuery, { id: USER_ID });
    
    if (userResult.errors) {
      console.log('❌ Error getting user:', JSON.stringify(userResult.errors, null, 2));
      return;
    }

    if (!userResult.data.getUser) {
      console.log('❌ User not found with ID:', USER_ID);
      return;
    }

    console.log('✅ User found:');
    console.log(JSON.stringify(userResult.data.getUser, null, 2));
    console.log('');

    // 2. Try to update the user
    console.log('2️⃣ Attempting to update user...');
    const updateUserMutation = `
      mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
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
          updatedAt
        }
      }
    `;

    const updateInput = {
      id: USER_ID,
      bio: "Updated bio - " + new Date().toISOString(),
      skills: ["JavaScript", "React", "Node.js", "Updated Skill"]
    };

    const updateResult = await makeGraphQLRequest(updateUserMutation, { input: updateInput });
    
    if (updateResult.errors) {
      console.log('❌ Error updating user:');
      console.log(JSON.stringify(updateResult.errors, null, 2));
      
      // Analyze the error
      updateResult.errors.forEach((error, index) => {
        console.log(`\nError ${index + 1}:`);
        console.log('Message:', error.message);
        console.log('Path:', error.path);
        console.log('Extensions:', error.extensions);
      });
    } else {
      console.log('✅ User updated successfully:');
      console.log(JSON.stringify(updateResult.data.updateUser, null, 2));
    }

    console.log('');

    // 3. Try a minimal update to test required fields
    console.log('3️⃣ Attempting minimal update (bio only)...');
    const minimalUpdateInput = {
      id: USER_ID,
      bio: "Minimal update test - " + new Date().toISOString()
    };

    const minimalResult = await makeGraphQLRequest(updateUserMutation, { input: minimalUpdateInput });
    
    if (minimalResult.errors) {
      console.log('❌ Error with minimal update:');
      console.log(JSON.stringify(minimalResult.errors, null, 2));
    } else {
      console.log('✅ Minimal update successful:');
      console.log('New bio:', minimalResult.data.updateUser.bio);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testUserOperations();
