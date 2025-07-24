#!/usr/bin/env node

const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/api');
const awsconfig = require('./src/aws-exports.js');

// Configure Amplify
Amplify.configure(awsconfig);
const client = generateClient();

const TARGET_USER_ID = '64083428-a041-702c-2e7e-7e4b2c4ba1f4';

// Test services to create for the user
const testServices = [
  {
    title: 'Full-Stack Web Development',
    description: 'Professional web development using React, Node.js, and AWS. I can help build modern, scalable web applications from scratch or improve existing ones.',
    category: 'Technology',
    hourlyRate: 75,
    tags: ['react', 'nodejs', 'aws', 'javascript', 'typescript', 'fullstack']
  },
  {
    title: 'UI/UX Design Consultation',
    description: 'User interface and experience design services. I help create intuitive, beautiful designs that users love.',
    category: 'Design',
    hourlyRate: 60,
    tags: ['ui', 'ux', 'design', 'figma', 'prototyping', 'user-research']
  },
  {
    title: 'Technical Writing & Documentation',
    description: 'Clear, comprehensive technical documentation for software projects, APIs, and user guides.',
    category: 'Writing',
    hourlyRate: 45,
    tags: ['technical-writing', 'documentation', 'api-docs', 'user-guides']
  },
  {
    title: 'Code Review & Mentoring',
    description: 'Professional code review services and mentoring for junior developers. Help improve code quality and best practices.',
    category: 'Education',
    hourlyRate: 50,
    tags: ['code-review', 'mentoring', 'best-practices', 'clean-code']
  },
  {
    title: 'AWS Cloud Architecture',
    description: 'Design and implement scalable cloud solutions on AWS. Help with serverless architecture, microservices, and DevOps.',
    category: 'Technology',
    hourlyRate: 85,
    tags: ['aws', 'cloud', 'serverless', 'devops', 'architecture']
  }
];

// Function to create a service
async function createService(serviceData) {
  try {
    const result = await client.graphql({
      query: `
        mutation CreateService($input: CreateServiceInput!) {
          createService(input: $input) {
            id
            userId
            title
            description
            category
            hourlyRate
            isActive
            tags
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          userId: TARGET_USER_ID,
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          hourlyRate: serviceData.hourlyRate,
          isActive: true,
          tags: serviceData.tags
        }
      }
    });
    
    console.log(`✅ Created service: ${serviceData.title}`);
    return result.data.createService;
  } catch (error) {
    console.error(`❌ Error creating service "${serviceData.title}":`, error);
    return null;
  }
}

// Function to get or create a test consumer user
async function getOrCreateTestConsumer() {
  try {
    // First try to find an existing user (not the target user)
    const result = await client.graphql({
      query: `
        query ListUsers {
          listUsers(limit: 10) {
            items {
              id
              username
              firstName
              lastName
            }
          }
        }
      `
    });
    
    const users = result.data.listUsers.items;
    const otherUser = users.find(user => user.id !== TARGET_USER_ID);
    
    if (otherUser) {
      console.log(`📋 Using existing user as consumer: ${otherUser.username}`);
      return otherUser;
    }
    
    // If no other user exists, create a test consumer
    const testConsumer = {
      email: 'testconsumer@example.com',
      username: 'test_consumer',
      firstName: 'Test',
      lastName: 'Consumer',
      bankHours: 50,
      skills: ['testing', 'feedback'],
      bio: 'Test user for consuming services'
    };
    
    const createResult = await client.graphql({
      query: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            username
            firstName
            lastName
          }
        }
      `,
      variables: {
        input: testConsumer
      }
    });
    
    console.log(`✅ Created test consumer user: ${testConsumer.username}`);
    return createResult.data.createUser;
  } catch (error) {
    console.error('❌ Error getting/creating test consumer:', error);
    return null;
  }
}

// Function to create a transaction
async function createTransaction(serviceId, consumerId, transactionData) {
  try {
    const result = await client.graphql({
      query: `
        mutation CreateTransaction($input: CreateTransactionInput!) {
          createTransaction(input: $input) {
            id
            providerId
            consumerId
            serviceId
            hoursSpent
            status
            description
            rating
            feedback
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          providerId: TARGET_USER_ID,
          consumerId: consumerId,
          serviceId: serviceId,
          hoursSpent: transactionData.hoursSpent,
          status: transactionData.status,
          description: transactionData.description,
          rating: transactionData.rating,
          feedback: transactionData.feedback
        }
      }
    });
    
    console.log(`✅ Created transaction: ${transactionData.description}`);
    return result.data.createTransaction;
  } catch (error) {
    console.error(`❌ Error creating transaction:`, error);
    return null;
  }
}

// Main function to create all test data
async function createTestData() {
  console.log(`🚀 Creating test data for user: ${TARGET_USER_ID}`);
  console.log('');
  
  try {
    // Step 1: Create services
    console.log('📝 Creating services...');
    const createdServices = [];
    
    for (const serviceData of testServices) {
      const service = await createService(serviceData);
      if (service) {
        createdServices.push(service);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Created ${createdServices.length} services\n`);
    
    // Step 2: Get or create test consumer
    console.log('👤 Setting up test consumer...');
    const testConsumer = await getOrCreateTestConsumer();
    
    if (!testConsumer) {
      console.error('❌ Could not set up test consumer. Skipping transactions.');
      return;
    }
    
    console.log('');
    
    // Step 3: Create transactions
    console.log('💼 Creating transactions...');
    
    const testTransactions = [
      {
        serviceId: createdServices[0]?.id, // Web Development
        hoursSpent: 8,
        status: 'COMPLETED',
        description: 'Built a complete e-commerce website with React and Node.js',
        rating: 5,
        feedback: 'Excellent work! Very professional and delivered on time.'
      },
      {
        serviceId: createdServices[1]?.id, // UI/UX Design
        hoursSpent: 4,
        status: 'COMPLETED',
        description: 'Redesigned mobile app interface for better user experience',
        rating: 4.8,
        feedback: 'Great design skills and attention to detail.'
      },
      {
        serviceId: createdServices[2]?.id, // Technical Writing
        hoursSpent: 3,
        status: 'IN_PROGRESS',
        description: 'Creating API documentation for REST endpoints',
        rating: null,
        feedback: null
      },
      {
        serviceId: createdServices[3]?.id, // Code Review
        hoursSpent: 2,
        status: 'COMPLETED',
        description: 'Code review and mentoring session for React components',
        rating: 5,
        feedback: 'Very helpful feedback and great teaching approach.'
      },
      {
        serviceId: createdServices[4]?.id, // AWS Architecture
        hoursSpent: 6,
        status: 'PENDING',
        description: 'Design serverless architecture for data processing pipeline',
        rating: null,
        feedback: null
      }
    ];
    
    const createdTransactions = [];
    
    for (const transactionData of testTransactions) {
      if (transactionData.serviceId) {
        const transaction = await createTransaction(
          transactionData.serviceId,
          testConsumer.id,
          transactionData
        );
        if (transaction) {
          createdTransactions.push(transaction);
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n✅ Created ${createdTransactions.length} transactions\n`);
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`👤 Target User ID: ${TARGET_USER_ID}`);
    console.log(`🛠️  Services Created: ${createdServices.length}`);
    console.log(`💼 Transactions Created: ${createdTransactions.length}`);
    console.log(`👥 Test Consumer: ${testConsumer.username} (${testConsumer.id})`);
    console.log('');
    console.log('🎉 Test data creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Run the script
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestData, TARGET_USER_ID };
