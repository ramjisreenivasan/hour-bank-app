#!/usr/bin/env node

const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/api');
const awsconfig = require('./src/aws-exports.js');

// Configure Amplify
Amplify.configure(awsconfig);
const client = generateClient();

// GraphQL mutations and queries
const listUsers = /* GraphQL */ `
  query ListUsers($limit: Int) {
    listUsers(limit: $limit) {
      items {
        id
        firstName
        lastName
        email
        username
        skills
      }
    }
  }
`;

const createService = /* GraphQL */ `
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      userId
      title
      description
      category
      hourlyRate
      tags
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Test services data
const TEST_SERVICES = [
  {
    title: 'Professional Web Development',
    description: 'Full-stack web development using modern technologies like React, Angular, Node.js, and AWS. I can help you build responsive, scalable web applications from concept to deployment.',
    category: 'Technology',
    hourlyRate: 3,
    tags: ['web-development', 'react', 'angular', 'nodejs', 'aws', 'javascript', 'typescript'],
    requiresScheduling: true,
    skills: ['Web Development', 'React', 'Node.js', 'TypeScript', 'JavaScript']
  },
  {
    title: 'UI/UX Design Services',
    description: 'Create beautiful, user-friendly interfaces and experiences. From wireframes to high-fidelity prototypes, I help bring your digital products to life with thoughtful design.',
    category: 'Creative',
    hourlyRate: 2,
    tags: ['ui-design', 'ux-design', 'figma', 'prototyping', 'user-research'],
    requiresScheduling: true,
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research']
  },
  {
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing services including SEO, content strategy, social media management, and campaign optimization to grow your online presence.',
    category: 'Business',
    hourlyRate: 2,
    tags: ['digital-marketing', 'seo', 'content-strategy', 'social-media', 'analytics'],
    requiresScheduling: false,
    skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media']
  },
  {
    title: 'Data Analysis & Insights',
    description: 'Turn your data into actionable insights with advanced analytics, visualization, and machine learning. I help businesses make data-driven decisions.',
    category: 'Technology',
    hourlyRate: 3,
    tags: ['data-analysis', 'python', 'machine-learning', 'sql', 'visualization'],
    requiresScheduling: true,
    skills: ['Data Analysis', 'Python', 'Machine Learning', 'SQL']
  },
  {
    title: 'Business Consulting',
    description: 'Strategic business advice for startups and small businesses. I help with business planning, process optimization, and growth strategies.',
    category: 'Business',
    hourlyRate: 4,
    tags: ['business-consulting', 'strategy', 'planning', 'optimization', 'growth'],
    requiresScheduling: true,
    skills: ['Business Strategy', 'Consulting', 'Planning']
  },
  {
    title: 'Language Tutoring - Spanish',
    description: 'Native Spanish speaker offering personalized language lessons for all levels. Focus on conversation, grammar, and cultural understanding.',
    category: 'Education',
    hourlyRate: 1,
    tags: ['spanish', 'language-tutoring', 'conversation', 'grammar', 'culture'],
    requiresScheduling: true,
    skills: ['Spanish', 'Teaching', 'Language']
  },
  {
    title: 'Photography Services',
    description: 'Professional photography for events, portraits, and commercial projects. Experienced in both studio and outdoor photography.',
    category: 'Creative',
    hourlyRate: 2,
    tags: ['photography', 'portraits', 'events', 'commercial', 'editing'],
    requiresScheduling: true,
    skills: ['Photography', 'Photo Editing', 'Creative']
  },
  {
    title: 'Fitness Training',
    description: 'Personal fitness training and wellness coaching. Customized workout plans and nutrition guidance to help you reach your health goals.',
    category: 'Health & Wellness',
    hourlyRate: 2,
    tags: ['fitness', 'personal-training', 'wellness', 'nutrition', 'health'],
    requiresScheduling: true,
    skills: ['Fitness Training', 'Wellness', 'Health']
  },
  {
    title: 'Guitar Lessons',
    description: 'Learn to play guitar with personalized lessons for beginners to advanced players. Covering various styles from classical to rock.',
    category: 'Education',
    hourlyRate: 1,
    tags: ['guitar', 'music-lessons', 'beginner', 'advanced', 'classical', 'rock'],
    requiresScheduling: true,
    skills: ['Guitar', 'Music', 'Teaching']
  },
  {
    title: 'Home Cooking Classes',
    description: 'Learn to cook delicious and healthy meals at home. Focus on practical techniques, meal planning, and nutritious recipes.',
    category: 'Other',
    hourlyRate: 1,
    tags: ['cooking', 'healthy-eating', 'meal-planning', 'recipes', 'nutrition'],
    requiresScheduling: true,
    skills: ['Cooking', 'Nutrition', 'Teaching']
  }
];

async function createTestServices() {
  try {
    console.log('🔍 Fetching existing users...');
    
    // Get existing users
    const usersResult = await client.graphql({
      query: listUsers,
      variables: { limit: 50 }
    });
    
    const users = usersResult.data.listUsers.items;
    console.log(`📊 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    
    console.log('🎯 Creating services for users...');
    
    let servicesCreated = 0;
    
    for (const user of users) {
      console.log(`\n👤 Creating services for ${user.firstName} ${user.lastName} (${user.username})`);
      
      // Find services that match user's skills
      const matchingServices = TEST_SERVICES.filter(service => {
        if (!user.skills || user.skills.length === 0) return false;
        
        return service.skills.some(skill => 
          user.skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
      });
      
      // If no matching services, assign 1-2 random services
      const servicesToCreate = matchingServices.length > 0 
        ? matchingServices.slice(0, Math.min(3, matchingServices.length))
        : TEST_SERVICES.slice(0, Math.floor(Math.random() * 2) + 1);
      
      for (const serviceTemplate of servicesToCreate) {
        try {
          const serviceInput = {
            userId: user.id,
            title: serviceTemplate.title,
            description: serviceTemplate.description,
            category: serviceTemplate.category,
            hourlyRate: serviceTemplate.hourlyRate,
            tags: serviceTemplate.tags,
            requiresScheduling: serviceTemplate.requiresScheduling,
            isActive: true
          };
          
          const result = await client.graphql({
            query: createService,
            variables: { input: serviceInput }
          });
          
          console.log(`  ✅ Created: ${serviceTemplate.title}`);
          servicesCreated++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`  ❌ Failed to create service "${serviceTemplate.title}":`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${servicesCreated} services!`);
    console.log('\n📋 Summary:');
    console.log(`   • Total users: ${users.length}`);
    console.log(`   • Services created: ${servicesCreated}`);
    console.log(`   • Average services per user: ${(servicesCreated / users.length).toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error creating test services:', error);
    
    if (error.errors) {
      console.error('GraphQL Errors:');
      error.errors.forEach((err, index) => {
        console.error(`  ${index + 1}. ${err.message}`);
      });
    }
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting test service creation...\n');
  createTestServices()
    .then(() => {
      console.log('\n✨ Test service creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestServices };
