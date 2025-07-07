#!/usr/bin/env node

const readline = require('readline');

const TARGET_USER_ID = '64083428-a041-702c-2e7e-7e4b2c4ba1f4';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

const services = [
  {
    title: "Full-Stack Web Development",
    description: "Professional web development using React, Node.js, and AWS. I can help build modern, scalable web applications from scratch or improve existing ones.",
    category: "Technology",
    hourlyRate: 75,
    tags: ["react", "nodejs", "aws", "javascript", "typescript", "fullstack"]
  },
  {
    title: "UI/UX Design Consultation",
    description: "User interface and experience design services. I help create intuitive, beautiful designs that users love.",
    category: "Design",
    hourlyRate: 60,
    tags: ["ui", "ux", "design", "figma", "prototyping", "user-research"]
  },
  {
    title: "Technical Writing & Documentation",
    description: "Clear, comprehensive technical documentation for software projects, APIs, and user guides.",
    category: "Writing",
    hourlyRate: 45,
    tags: ["technical-writing", "documentation", "api-docs", "user-guides"]
  },
  {
    title: "Code Review & Mentoring",
    description: "Professional code review services and mentoring for junior developers. Help improve code quality and best practices.",
    category: "Education",
    hourlyRate: 50,
    tags: ["code-review", "mentoring", "best-practices", "clean-code"]
  },
  {
    title: "AWS Cloud Architecture",
    description: "Design and implement scalable cloud solutions on AWS. Help with serverless architecture, microservices, and DevOps.",
    category: "Technology",
    hourlyRate: 85,
    tags: ["aws", "cloud", "serverless", "devops", "architecture"]
  }
];

function generateServiceMutation(service, index) {
  return `
mutation CreateService${index + 1} {
  createService(input: {
    userId: "${TARGET_USER_ID}"
    title: "${service.title}"
    description: "${service.description}"
    category: "${service.category}"
    hourlyRate: ${service.hourlyRate}
    isActive: true
    tags: ${JSON.stringify(service.tags)}
  }) {
    id
    title
    category
    hourlyRate
    tags
  }
}`;
}

function generateConsumerMutation() {
  return `
mutation CreateTestConsumer {
  createUser(input: {
    email: "testconsumer@hourbank.com"
    username: "test_consumer_001"
    firstName: "Sarah"
    lastName: "Johnson"
    bankHours: 100
    skills: ["project-management", "testing", "feedback"]
    bio: "Experienced project manager who loves trying new services and providing detailed feedback."
  }) {
    id
    username
    firstName
    lastName
    bankHours
  }
}`;
}

function generateTransactionMutations(serviceIds, consumerId) {
  const transactions = [
    {
      serviceIndex: 0,
      hoursSpent: 8,
      status: "COMPLETED",
      description: "Built a complete e-commerce website with React and Node.js backend",
      rating: 5,
      feedback: "Excellent work! Very professional and delivered exactly what was promised. Great communication throughout the project."
    },
    {
      serviceIndex: 1,
      hoursSpent: 4,
      status: "COMPLETED",
      description: "Redesigned mobile app interface for better user experience",
      rating: 4.8,
      feedback: "Amazing design skills! The new interface is so much more intuitive. Users love it!"
    },
    {
      serviceIndex: 2,
      hoursSpent: 3,
      status: "IN_PROGRESS",
      description: "Creating comprehensive API documentation for REST endpoints"
    },
    {
      serviceIndex: 3,
      hoursSpent: 2,
      status: "COMPLETED",
      description: "Code review and mentoring session for React components and best practices",
      rating: 5,
      feedback: "Incredibly helpful! Learned so much about clean code practices. Will definitely book again."
    },
    {
      serviceIndex: 4,
      hoursSpent: 6,
      status: "PENDING",
      description: "Design serverless architecture for data processing pipeline using AWS Lambda and DynamoDB"
    }
  ];

  return transactions.map((transaction, index) => {
    let mutation = `
mutation CreateTransaction${index + 1} {
  createTransaction(input: {
    providerId: "${TARGET_USER_ID}"
    consumerId: "${consumerId}"
    serviceId: "${serviceIds[transaction.serviceIndex]}"
    hoursSpent: ${transaction.hoursSpent}
    status: ${transaction.status}
    description: "${transaction.description}"`;

    if (transaction.rating) {
      mutation += `
    rating: ${transaction.rating}`;
    }
    if (transaction.feedback) {
      mutation += `
    feedback: "${transaction.feedback}"`;
    }

    mutation += `
  }) {
    id
    description
    status
    rating
    feedback
  }
}`;

    return mutation;
  });
}

async function main() {
  console.log('🚀 Interactive Test Data Creator for HourBank');
  console.log('==============================================');
  console.log(`Target User ID: ${TARGET_USER_ID}`);
  console.log('');

  try {
    // Step 1: Create Services
    console.log('📝 STEP 1: CREATE SERVICES');
    console.log('==========================');
    
    const serviceIds = [];
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      console.log(`\n🛠️  Service ${i + 1}: ${service.title}`);
      console.log(`   Category: ${service.category} | Rate: $${service.hourlyRate}/hr`);
      
      const mutation = generateServiceMutation(service, i);
      console.log('\n📋 GraphQL Mutation:');
      console.log('-------------------');
      console.log(mutation);
      
      const serviceId = await askQuestion(`\n✏️  Enter the service ID returned from the mutation (or press Enter to skip): `);
      if (serviceId.trim()) {
        serviceIds.push(serviceId.trim());
        console.log(`✅ Service ${i + 1} ID recorded: ${serviceId.trim()}`);
      } else {
        console.log(`⏭️  Skipping service ${i + 1}`);
      }
    }

    if (serviceIds.length === 0) {
      console.log('\n⚠️  No service IDs provided. Skipping transaction creation.');
      rl.close();
      return;
    }

    // Step 2: Create Consumer
    console.log('\n\n👤 STEP 2: CREATE TEST CONSUMER');
    console.log('===============================');
    
    const consumerMutation = generateConsumerMutation();
    console.log('\n📋 GraphQL Mutation:');
    console.log('-------------------');
    console.log(consumerMutation);
    
    const consumerId = await askQuestion('\n✏️  Enter the consumer ID returned from the mutation: ');
    
    if (!consumerId.trim()) {
      console.log('\n⚠️  No consumer ID provided. Skipping transaction creation.');
      rl.close();
      return;
    }

    console.log(`✅ Consumer ID recorded: ${consumerId.trim()}`);

    // Step 3: Create Transactions
    console.log('\n\n💼 STEP 3: CREATE TRANSACTIONS');
    console.log('==============================');
    
    const transactionMutations = generateTransactionMutations(serviceIds, consumerId.trim());
    
    for (let i = 0; i < transactionMutations.length && i < serviceIds.length; i++) {
      console.log(`\n💼 Transaction ${i + 1}: ${services[i].title}`);
      console.log('\n📋 GraphQL Mutation:');
      console.log('-------------------');
      console.log(transactionMutations[i]);
      
      await askQuestion('\n⏸️  Press Enter to continue to next transaction...');
    }

    console.log('\n\n🎉 TEST DATA CREATION COMPLETE!');
    console.log('===============================');
    console.log(`👤 Target User: ${TARGET_USER_ID}`);
    console.log(`🛠️  Services: ${serviceIds.length} created`);
    console.log(`👥 Consumer: ${consumerId.trim()}`);
    console.log(`💼 Transactions: ${Math.min(transactionMutations.length, serviceIds.length)} mutations provided`);
    console.log('\n✅ Your user now has comprehensive test data!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateServiceMutation, generateConsumerMutation, generateTransactionMutations };
