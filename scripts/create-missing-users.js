#!/usr/bin/env node

const https = require('https');

const API_ENDPOINT = 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-7p4lacsjwbdabgmhywkvhc7wwi';

console.log('👥 Creating missing users for existing services...');
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

// User profiles based on their services
const userProfiles = {
  '54e749cd-20b5-45fe-8045-41b2b3c8efb5': {
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@example.com',
    username: 'maria_chef',
    skills: ['Cooking', 'Healthy Cooking', 'Meal Planning', 'Nutrition'],
    bio: 'Professional chef specializing in healthy cooking and meal preparation. I love teaching others how to create nutritious and delicious meals at home.'
  },
  '4e5482d0-3d2e-454e-8d79-351a3bdaaac4': {
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@example.com',
    username: 'david_analyst',
    skills: ['Python', 'Statistical Analysis', 'Data Science', 'Machine Learning'],
    bio: 'Data scientist with expertise in statistical analysis and Python programming. I help businesses make data-driven decisions.'
  },
  'cd82f41d-e77c-4751-88a9-4caeca3c9869': {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    username: 'dr_sarah',
    skills: ['Pain Management', 'Stress Relief', 'Health Consulting', 'Wellness'],
    bio: 'Licensed healthcare professional specializing in pain management and stress relief techniques. Focused on holistic wellness approaches.'
  },
  'faa3fd57-5de7-44c9-99f0-348e921532db': {
    firstName: 'Tom',
    lastName: 'Green',
    email: 'tom.green@example.com',
    username: 'tom_gardener',
    skills: ['Gardening', 'Vegetable Gardens', 'Sustainable Living', 'Organic Farming'],
    bio: 'Master gardener with 15+ years of experience in vegetable gardening and sustainable living practices. Love sharing knowledge about growing your own food.'
  },
  '2670c6ec-aa07-4f58-a4b6-a8966828b7fe': {
    firstName: 'Amira',
    lastName: 'Hassan',
    email: 'amira.hassan@example.com',
    username: 'amira_linguist',
    skills: ['Arabic', 'French', 'Language Translation', 'Cultural Consulting', 'Language Tutoring'],
    bio: 'Multilingual translator and cultural consultant fluent in Arabic, French, and English. Passionate about bridging cultural gaps through language.'
  },
  '36fcf291-9dca-4ac0-82a3-c801114a2c18': {
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.thompson@example.com',
    username: 'alex_marketer',
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics', 'Email Campaigns'],
    bio: 'Digital marketing specialist with expertise in SEO, content strategy, and analytics. I help businesses grow their online presence.'
  },
  '6ef0cd8f-f2c0-4cf1-8962-3ca002d215f2': {
    firstName: 'Jessica',
    lastName: 'Miller',
    email: 'jessica.miller@example.com',
    username: 'jessica_digital',
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics', 'Email Campaigns'],
    bio: 'Senior digital marketing consultant specializing in comprehensive marketing strategies and campaign optimization.'
  },
  'd490b836-70e8-45a3-88d4-fc41a7c1df78': {
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@example.com',
    username: 'mike_trainer',
    skills: ['Dog Training', 'Pet Care', 'Animal Behavior', 'Puppy Training'],
    bio: 'Certified dog trainer with expertise in behavioral issues and puppy training. I help create harmonious relationships between pets and their families.'
  },
  'd6b8d34f-cc40-47d9-bd7a-5ae2ea7ae571': {
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.martinez@example.com',
    username: 'carlos_handyman',
    skills: ['Home Repair', 'Plumbing', 'Electrical Work', 'Kitchen Repairs', 'Bathroom Renovations'],
    bio: 'Licensed contractor specializing in home repairs and renovations. From plumbing to electrical work, I help keep your home in perfect condition.'
  },
  'c84eb2b8-3865-4234-8bd4-257046d1304f': {
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@example.com',
    username: 'lisa_developer',
    skills: ['React', 'Node.js', 'API Design', 'Database Optimization', 'Full Stack Development'],
    bio: 'Full-stack developer with expertise in React and Node.js. I specialize in API design and database optimization for scalable applications.'
  },
  '2ddf7654-46f6-4dc3-9f47-d97746437e30': {
    firstName: 'Robert',
    lastName: 'Kim',
    email: 'robert.kim@example.com',
    username: 'robert_architect',
    skills: ['Cloud Architecture', 'DevOps', 'AWS', 'Docker', 'AI/ML', 'Machine Learning', 'Data Science'],
    bio: 'Senior cloud architect and AI/ML consultant with extensive experience in AWS and DevOps practices. I help organizations modernize their infrastructure.'
  },
  '44161d54-c08a-4642-9d06-591da663919f': {
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@example.com',
    username: 'emma_photographer',
    skills: ['Photography', 'Portrait Photography', 'Photo Editing', 'Creative Direction'],
    bio: 'Professional photographer specializing in portrait photography. I capture authentic moments and create stunning visual stories.'
  },
  'dfc2bd6d-6f75-47e1-a7d2-ba2ef1c261c7': {
    firstName: 'Jake',
    lastName: 'Brown',
    email: 'jake.brown@example.com',
    username: 'jake_pettrainer',
    skills: ['Dog Training', 'Pet Care', 'Animal Behavior', 'Puppy Training'],
    bio: 'Professional dog trainer with a passion for helping dogs and their owners build strong, positive relationships through effective training methods.'
  },
  'af2e4534-bb53-423d-b6ad-632b954706df': {
    firstName: 'Rachel',
    lastName: 'Taylor',
    email: 'rachel.taylor@example.com',
    username: 'rachel_consultant',
    skills: ['Business Consulting', 'Business Strategy', 'Strategic Planning', 'Management'],
    bio: 'Business strategy consultant helping startups and small businesses develop effective growth strategies and optimize their operations.'
  },
  'a1850d4b-6c14-4a04-8fa1-8638dd6f59de': {
    firstName: 'Kevin',
    lastName: 'Lee',
    email: 'kevin.lee@example.com',
    username: 'kevin_datascientist',
    skills: ['Python', 'Statistical Analysis', 'Data Analysis', 'Data Visualization', 'Machine Learning'],
    bio: 'Data scientist specializing in statistical analysis and data visualization. I transform complex data into actionable insights for businesses.'
  }
};

async function createUser(userId, profile) {
  try {
    console.log(`👤 Creating user: ${profile.firstName} ${profile.lastName}`);
    
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
          rating
          totalTransactions
          createdAt
        }
      }
    `;

    const userInput = {
      id: userId,
      email: profile.email,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bankHours: 10.0,
      skills: profile.skills,
      bio: profile.bio,
      rating: 5.0,
      totalTransactions: 0
    };

    const result = await makeGraphQLRequest(createUserMutation, { input: userInput });
    
    if (result.errors) {
      console.log(`❌ Error creating user ${profile.firstName} ${profile.lastName}:`, JSON.stringify(result.errors, null, 2));
      return false;
    }

    const createdUser = result.data?.createUser;
    if (createdUser) {
      console.log(`✅ User created successfully:`);
      console.log(`   ID: ${createdUser.id}`);
      console.log(`   Name: ${createdUser.firstName} ${createdUser.lastName}`);
      console.log(`   Username: ${createdUser.username}`);
      console.log(`   Email: ${createdUser.email}`);
      console.log(`   Skills: ${createdUser.skills.join(', ')}`);
      console.log(`   Bank Hours: ${createdUser.bankHours}`);
      console.log('');
      return true;
    } else {
      console.log(`❌ Failed to create user: ${profile.firstName} ${profile.lastName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error creating user ${profile.firstName} ${profile.lastName}:`, error.message);
    return false;
  }
}

async function createMissingUsers() {
  console.log(`🚀 Starting creation of ${Object.keys(userProfiles).length} missing users...`);
  console.log('='.repeat(60));

  let successCount = 0;
  let failureCount = 0;

  for (const [userId, profile] of Object.entries(userProfiles)) {
    const success = await createUser(userId, profile);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Failed to create: ${failureCount} users`);
  console.log(`📊 Total processed: ${successCount + failureCount} users`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Missing users have been created!`);
    console.log(`💡 All services should now have corresponding user profiles.`);
  }

  if (failureCount > 0) {
    console.log(`\n⚠️  Some users failed to create. Check the error messages above.`);
    return false;
  }

  return true;
}

// Main execution
async function main() {
  console.log('🏦 HourBank Missing Users Creation Utility');
  console.log('==========================================');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const success = await createMissingUsers();
    if (success) {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Script completed with errors!');
      process.exit(1);
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

module.exports = { createMissingUsers, userProfiles };
