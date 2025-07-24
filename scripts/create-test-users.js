#!/usr/bin/env node

const { Amplify, Auth, API } = require('aws-amplify');
const awsconfig = require('./src/aws-exports.js');
const { createUser, createService } = require('./src/graphql/mutations.js');

// Configure Amplify
Amplify.configure(awsconfig);

// Sample skills for random selection
const AVAILABLE_SKILLS = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
  'Digital Marketing', 'Content Writing', 'Photography', 'Video Editing',
  'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps',
  'Project Management', 'Business Consulting', 'Financial Planning', 'Legal Advice',
  'Language Translation', 'Tutoring', 'Music Lessons', 'Fitness Training',
  'Cooking', 'Home Repair', 'Gardening', 'Pet Care',
  'Event Planning', 'Social Media Management', 'SEO Optimization', 'Copywriting',
  'Accounting', 'Tax Preparation', 'Real Estate', 'Interior Design',
  'Fashion Styling', 'Makeup Artistry', 'Hair Styling', 'Massage Therapy',
  'Life Coaching', 'Career Counseling', 'Mental Health Support', 'Nutrition Consulting'
];

// Helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSkills(count = 3) {
  const shuffled = [...AVAILABLE_SKILLS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateUserData(index) {
  const skills = getRandomSkills(getRandomInt(2, 5));
  const firstName = `TestUser${index}`;
  const lastName = `Ramji${index}`;
  
  return {
    email: `ramjisreenivasan+${getRandomInt(1000, 9999)}@gmail.com`,
    username: `testuser${index}_${getRandomInt(100, 999)}`,
    firstName,
    lastName,
    skills,
    bio: `I'm ${firstName}, offering services in ${skills.slice(0, 2).join(' and ')}. Looking forward to helping others while earning bank hours!`,
    bankHours: getRandomInt(0, 50),
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
    totalTransactions: getRandomInt(0, 20)
  };
}

function generateServiceData(userId, userSkills, userName) {
  const skill = userSkills[Math.floor(Math.random() * userSkills.length)];
  const categories = ['Technology', 'Design', 'Business', 'Education', 'Health', 'Lifestyle'];
  
  return {
    userId,
    title: `Professional ${skill} Services`,
    description: `Hi! I'm ${userName} and I offer high-quality ${skill.toLowerCase()} services. With years of experience, I can help you achieve your goals efficiently and professionally.`,
    category: categories[Math.floor(Math.random() * categories.length)],
    hourlyRate: parseFloat((Math.random() * 40 + 10).toFixed(2)), // $10-50 per hour
    isActive: true,
    tags: [skill.toLowerCase().replace(/\s+/g, '-'), 'professional', 'experienced']
  };
}

async function createTestUser(userData) {
  try {
    console.log(`\n🔄 Creating user: ${userData.email}`);
    
    // Step 1: Create Cognito user
    console.log('  📝 Creating Cognito user...');
    const tempPassword = 'TempPass123!';
    
    const signUpResult = await Auth.signUp({
      username: userData.email,
      password: tempPassword,
      attributes: {
        email: userData.email,
        given_name: userData.firstName,
        family_name: userData.lastName
      }
    });
    
    const cognitoUserId = signUpResult.userSub;
    console.log(`  ✅ Cognito user created with ID: ${cognitoUserId}`);
    
    // Step 2: Create DynamoDB User record
    console.log('  📊 Creating DynamoDB user record...');
    const userInput = {
      id: cognitoUserId,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      bankHours: userData.bankHours,
      skills: userData.skills,
      bio: userData.bio,
      rating: userData.rating,
      totalTransactions: userData.totalTransactions
    };
    
    const userResult = await API.graphql({
      query: createUser,
      variables: { input: userInput }
    });
    
    console.log(`  ✅ DynamoDB user record created`);
    
    // Step 3: Create services for each skill
    console.log('  🛠️  Creating services...');
    const services = [];
    
    for (let i = 0; i < Math.min(userData.skills.length, 2); i++) {
      const serviceData = generateServiceData(
        cognitoUserId, 
        [userData.skills[i]], 
        userData.firstName
      );
      
      try {
        const serviceResult = await API.graphql({
          query: createService,
          variables: { input: serviceData }
        });
        
        services.push(serviceResult.data.createService);
        console.log(`    ✅ Service created: ${serviceData.title}`);
      } catch (serviceError) {
        console.log(`    ❌ Service creation failed: ${serviceError.message}`);
      }
    }
    
    return {
      success: true,
      user: userResult.data.createUser,
      services,
      cognitoId: cognitoUserId
    };
    
  } catch (error) {
    console.error(`  ❌ Failed to create user ${userData.email}:`, error.message);
    return {
      success: false,
      error: error.message,
      userData
    };
  }
}

async function createMultipleUsers(count = 10) {
  console.log(`🚀 Starting creation of ${count} test users...\n`);
  
  const results = {
    successful: [],
    failed: [],
    total: count
  };
  
  for (let i = 1; i <= count; i++) {
    const userData = generateUserData(i);
    const result = await createTestUser(userData);
    
    if (result.success) {
      results.successful.push(result);
      console.log(`✅ User ${i}/${count} created successfully`);
    } else {
      results.failed.push(result);
      console.log(`❌ User ${i}/${count} failed`);
    }
    
    // Add delay to avoid rate limiting
    if (i < count) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n📊 CREATION SUMMARY');
  console.log('==================');
  console.log(`Total users attempted: ${results.total}`);
  console.log(`Successfully created: ${results.successful.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.successful.length > 0) {
    console.log('\n✅ SUCCESSFUL USERS:');
    results.successful.forEach((result, index) => {
      console.log(`${index + 1}. ${result.user.email} (${result.user.skills.length} skills, ${result.services.length} services)`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED USERS:');
    results.failed.forEach((result, index) => {
      console.log(`${index + 1}. ${result.userData.email} - ${result.error}`);
    });
  }
  
  return results;
}

// Main execution
async function main() {
  try {
    const userCount = process.argv[2] ? parseInt(process.argv[2]) : 5;
    
    if (userCount < 1 || userCount > 50) {
      console.error('❌ Please specify a number between 1 and 50');
      process.exit(1);
    }
    
    console.log('🔧 Checking AWS configuration...');
    
    // Test API connection
    try {
      await API.graphql({
        query: `query { __typename }`
      });
      console.log('✅ API connection successful');
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      console.log('💡 Make sure your API is deployed and aws-exports.js is updated');
      process.exit(1);
    }
    
    await createMultipleUsers(userCount);
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMultipleUsers, createTestUser, generateUserData };
