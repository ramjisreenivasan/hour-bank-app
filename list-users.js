const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('📋 Listing all users in the database...');
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

async function listUsers() {
  try {
    const listUsersQuery = `
      query ListUsers {
        listUsers {
          items {
            id
            email
            username
            firstName
            lastName
            bankHours
            rating
            totalTransactions
            createdAt
            updatedAt
          }
          nextToken
        }
      }
    `;

    const result = await makeGraphQLRequest(listUsersQuery);
    
    if (result.errors) {
      console.log('❌ Error listing users:', JSON.stringify(result.errors, null, 2));
      return;
    }

    const users = result.data.listUsers.items;
    
    if (users.length === 0) {
      console.log('📭 No users found in the database.');
      console.log('');
      console.log('💡 You may need to create a user first. Here\'s how:');
      console.log('');
      console.log('```javascript');
      console.log('const createUserMutation = `');
      console.log('  mutation CreateUser($input: CreateUserInput!) {');
      console.log('    createUser(input: $input) {');
      console.log('      id');
      console.log('      email');
      console.log('      username');
      console.log('      firstName');
      console.log('      lastName');
      console.log('    }');
      console.log('  }');
      console.log('`;');
      console.log('');
      console.log('const input = {');
      console.log('  email: "user@example.com",');
      console.log('  username: "testuser",');
      console.log('  firstName: "Test",');
      console.log('  lastName: "User",');
      console.log('  bankHours: 10.0,');
      console.log('  skills: ["JavaScript", "React"],');
      console.log('  rating: 5.0,');
      console.log('  totalTransactions: 0');
      console.log('};');
      console.log('```');
    } else {
      console.log(`✅ Found ${users.length} user(s):`);
      console.log('');
      
      users.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Bank Hours: ${user.bankHours}`);
        console.log(`   Rating: ${user.rating}`);
        console.log(`   Total Transactions: ${user.totalTransactions}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);
        console.log('');
      });
      
      console.log('💡 To update a user profile, use one of the IDs above.');
    }

  } catch (error) {
    console.log('❌ Failed to list users:', error.message);
  }
}

// Run the function
listUsers();
