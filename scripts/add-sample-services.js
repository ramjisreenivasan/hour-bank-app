#!/usr/bin/env node

/**
 * Utility script to add sample services for user Ramji
 * Usage: node scripts/add-sample-services.js [userId]
 */

const { generateClient } = require('aws-amplify/api');
const { Amplify } = require('aws-amplify');
const amplifyconfig = require('../src/amplifyconfiguration.json');

// Configure Amplify
Amplify.configure(amplifyconfig);

const client = generateClient();

// Sample services for Ramji
const sampleServices = [
  {
    title: "Web Development & Angular Consulting",
    description: "Full-stack web development using Angular, TypeScript, and AWS. Help with application architecture, code reviews, and best practices. Perfect for startups and small businesses looking to build modern web applications.",
    category: "Technology",
    hourlyRate: 8,
    isActive: true,
    tags: ["angular", "typescript", "aws", "web-development", "consulting", "full-stack"]
  },
  {
    title: "AWS Cloud Architecture & Deployment",
    description: "Design and implement scalable cloud solutions using AWS services. Amplify setup, serverless architecture, and DevOps practices. Help migrate existing applications to the cloud.",
    category: "Technology",
    hourlyRate: 10,
    isActive: true,
    tags: ["aws", "cloud", "amplify", "serverless", "devops", "architecture"]
  },
  {
    title: "Programming Tutoring (JavaScript/TypeScript)",
    description: "One-on-one tutoring for JavaScript, TypeScript, and modern web development. Perfect for beginners to intermediate developers looking to improve their skills.",
    category: "Education",
    hourlyRate: 5,
    isActive: true,
    tags: ["tutoring", "javascript", "typescript", "programming", "mentoring", "education"]
  },
  {
    title: "Code Review & Technical Mentoring",
    description: "Professional code review services and technical mentoring. Help improve code quality, identify best practices, and provide guidance on software architecture decisions.",
    category: "Technology",
    hourlyRate: 6,
    isActive: true,
    tags: ["code-review", "mentoring", "best-practices", "architecture", "quality-assurance"]
  },
  {
    title: "Database Design & Optimization",
    description: "Design efficient database schemas and optimize query performance. Experience with SQL, NoSQL, and GraphQL. Help with data modeling and migration strategies.",
    category: "Technology",
    hourlyRate: 7,
    isActive: true,
    tags: ["database", "sql", "nosql", "graphql", "optimization", "data-modeling"]
  },
  {
    title: "API Development & Integration",
    description: "Build robust REST and GraphQL APIs. Help with third-party integrations, authentication, and API security best practices. Experience with Node.js and serverless functions.",
    category: "Technology",
    hourlyRate: 8,
    isActive: true,
    tags: ["api", "rest", "graphql", "integration", "nodejs", "serverless"]
  }
];

const CREATE_SERVICE_MUTATION = `
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
`;

const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      username
      firstName
      lastName
      bankHours
      rating
      totalTransactions
    }
  }
`;

async function verifyUser(userId) {
  try {
    console.log(`🔍 Verifying user exists: ${userId}`);
    
    const result = await client.graphql({
      query: GET_USER_QUERY,
      variables: { id: userId }
    });

    const user = result.data?.getUser;
    if (user) {
      console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Bank Hours: ${user.bankHours}`);
      console.log(`   Rating: ${user.rating}`);
      return true;
    } else {
      console.log(`❌ User not found with ID: ${userId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error verifying user:`, error);
    return false;
  }
}

async function createService(serviceData) {
  try {
    console.log(`📝 Creating service: "${serviceData.title}"`);
    
    const result = await client.graphql({
      query: CREATE_SERVICE_MUTATION,
      variables: {
        input: serviceData
      }
    });

    const createdService = result.data?.createService;
    if (createdService) {
      console.log(`✅ Service created successfully:`);
      console.log(`   ID: ${createdService.id}`);
      console.log(`   Title: ${createdService.title}`);
      console.log(`   Category: ${createdService.category}`);
      console.log(`   Rate: ${createdService.hourlyRate} hours`);
      console.log(`   Tags: ${createdService.tags.join(', ')}`);
      console.log(`   Active: ${createdService.isActive}`);
      return true;
    } else {
      console.log(`❌ Failed to create service: ${serviceData.title}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error creating service "${serviceData.title}":`, error);
    if (error.errors) {
      error.errors.forEach((err, index) => {
        console.error(`   Error ${index + 1}: ${err.message}`);
      });
    }
    return false;
  }
}

async function addServicesForUser(userId) {
  console.log(`🚀 Starting service creation for user: ${userId}`);
  console.log(`📊 Total services to create: ${sampleServices.length}`);
  console.log('='.repeat(60));

  // Verify user exists
  const userExists = await verifyUser(userId);
  if (!userExists) {
    console.log(`❌ Cannot proceed - user not found`);
    process.exit(1);
  }

  console.log('\n🔧 Creating services...\n');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < sampleServices.length; i++) {
    const serviceData = {
      userId,
      ...sampleServices[i]
    };

    console.log(`\n[${i + 1}/${sampleServices.length}] Processing service...`);
    console.log('-'.repeat(40));

    const success = await createService(serviceData);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Add a small delay between requests to avoid rate limiting
    if (i < sampleServices.length - 1) {
      console.log('⏳ Waiting 1 second before next service...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${successCount} services`);
  console.log(`❌ Failed to create: ${failureCount} services`);
  console.log(`📊 Total processed: ${successCount + failureCount} services`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Services have been added for user Ramji!`);
    console.log(`💡 You can now view these services in the dashboard or profile page.`);
  }

  if (failureCount > 0) {
    console.log(`\n⚠️  Some services failed to create. Check the error messages above.`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const userId = process.argv[2] || '6438e458-e0f1-700c-cdd1-e15a4cecd6e5';
  
  console.log('🏦 HourBank Service Creation Utility');
  console.log('=====================================');
  console.log(`Target User ID: ${userId}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    await addServicesForUser(userId);
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
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

module.exports = { addServicesForUser, sampleServices };
