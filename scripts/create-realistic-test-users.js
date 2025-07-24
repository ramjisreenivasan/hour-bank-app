#!/usr/bin/env node

const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/api');
const awsconfig = require('./src/aws-exports.js');

// Configure Amplify
Amplify.configure(awsconfig);
const client = generateClient();

// Realistic user data pools
const REALISTIC_USERS = [
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen.dev@gmail.com',
    username: 'sarahc_dev',
    skills: ['Web Development', 'React', 'Node.js', 'TypeScript'],
    bio: 'Full-stack developer with 5 years of experience building scalable web applications. Passionate about clean code and user experience.',
    specialties: ['Frontend Development', 'API Design', 'Database Optimization']
  },
  {
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson.design@gmail.com',
    username: 'marcusj_design',
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
    bio: 'Creative designer focused on human-centered design. I help businesses create intuitive digital experiences that users love.',
    specialties: ['Mobile App Design', 'Brand Identity', 'Prototyping']
  },
  {
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez.marketing@gmail.com',
    username: 'elenar_marketing',
    skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media'],
    bio: 'Marketing strategist with expertise in growing online presence. I help small businesses reach their target audience effectively.',
    specialties: ['Content Marketing', 'Email Campaigns', 'Analytics']
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim.data@gmail.com',
    username: 'davidk_data',
    skills: ['Data Analysis', 'Python', 'Machine Learning', 'SQL'],
    bio: 'Data scientist passionate about turning data into actionable insights. Experienced in predictive modeling and business intelligence.',
    specialties: ['Data Visualization', 'Statistical Analysis', 'ML Models']
  },
  {
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.okafor.writer@gmail.com',
    username: 'amarao_writer',
    skills: ['Content Writing', 'Copywriting', 'Technical Writing', 'Editing'],
    bio: 'Professional writer specializing in tech content and marketing copy. I help businesses communicate their value clearly and persuasively.',
    specialties: ['Blog Writing', 'Documentation', 'Brand Voice']
  },
  {
    firstName: 'James',
    lastName: 'Thompson',
    email: 'james.thompson.photo@gmail.com',
    username: 'jamest_photo',
    skills: ['Photography', 'Photo Editing', 'Lightroom', 'Event Photography'],
    bio: 'Professional photographer with 8 years of experience. I capture moments that tell stories and create lasting memories.',
    specialties: ['Portrait Photography', 'Product Photography', 'Photo Retouching']
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel.business@gmail.com',
    username: 'priyap_business',
    skills: ['Business Consulting', 'Project Management', 'Strategy', 'Operations'],
    bio: 'Business consultant helping startups and small businesses optimize their operations and achieve sustainable growth.',
    specialties: ['Business Strategy', 'Process Improvement', 'Team Leadership']
  },
  {
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera.music@gmail.com',
    username: 'alexr_music',
    skills: ['Music Production', 'Guitar Lessons', 'Audio Engineering', 'Songwriting'],
    bio: 'Music producer and instructor with 10+ years in the industry. I help aspiring musicians develop their sound and skills.',
    specialties: ['Music Composition', 'Recording', 'Music Theory']
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson.fitness@gmail.com',
    username: 'lisaa_fitness',
    skills: ['Personal Training', 'Nutrition Coaching', 'Yoga', 'Wellness'],
    bio: 'Certified personal trainer and wellness coach. I help people achieve their fitness goals through personalized training and nutrition guidance.',
    specialties: ['Strength Training', 'Weight Loss', 'Mindfulness']
  },
  {
    firstName: 'Omar',
    lastName: 'Hassan',
    email: 'omar.hassan.lang@gmail.com',
    username: 'omarh_lang',
    skills: ['Language Translation', 'Arabic', 'French', 'Tutoring'],
    bio: 'Multilingual translator and language instructor fluent in Arabic, French, and English. I help bridge communication gaps.',
    specialties: ['Document Translation', 'Language Tutoring', 'Cultural Consulting']
  },
  {
    firstName: 'Rachel',
    lastName: 'Green',
    email: 'rachel.green.finance@gmail.com',
    username: 'rachelg_finance',
    skills: ['Financial Planning', 'Accounting', 'Tax Preparation', 'Investment Advice'],
    bio: 'CPA with 12 years of experience helping individuals and small businesses manage their finances and plan for the future.',
    specialties: ['Tax Strategy', 'Retirement Planning', 'Business Finance']
  },
  {
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza.repair@gmail.com',
    username: 'carlosm_repair',
    skills: ['Home Repair', 'Plumbing', 'Electrical Work', 'Carpentry'],
    bio: 'Experienced handyman with 15 years in home improvement. I help homeowners with repairs, maintenance, and small renovations.',
    specialties: ['Kitchen Repairs', 'Bathroom Renovations', 'Electrical Fixes']
  },
  {
    firstName: 'Nina',
    lastName: 'Kowalski',
    email: 'nina.kowalski.garden@gmail.com',
    username: 'ninak_garden',
    skills: ['Gardening', 'Landscaping', 'Plant Care', 'Organic Farming'],
    bio: 'Master gardener passionate about sustainable growing practices. I help people create beautiful, productive gardens.',
    specialties: ['Vegetable Gardens', 'Native Plants', 'Composting']
  },
  {
    firstName: 'Tyler',
    lastName: 'Brooks',
    email: 'tyler.brooks.video@gmail.com',
    username: 'tylerb_video',
    skills: ['Video Editing', 'Motion Graphics', 'YouTube Content', 'Storytelling'],
    bio: 'Video editor and content creator with expertise in crafting compelling visual stories for brands and creators.',
    specialties: ['Social Media Videos', 'Corporate Videos', 'Animation']
  },
  {
    firstName: 'Sophia',
    lastName: 'Nakamura',
    email: 'sophia.nakamura.legal@gmail.com',
    username: 'sophian_legal',
    skills: ['Legal Consulting', 'Contract Review', 'Business Law', 'Compliance'],
    bio: 'Business attorney specializing in small business legal needs. I help entrepreneurs navigate legal requirements and protect their interests.',
    specialties: ['Contract Drafting', 'Business Formation', 'Intellectual Property']
  },
  {
    firstName: 'Michael',
    lastName: 'O\'Connor',
    email: 'michael.oconnor.coach@gmail.com',
    username: 'michaelo_coach',
    skills: ['Life Coaching', 'Career Counseling', 'Leadership Development', 'Motivation'],
    bio: 'Certified life coach helping professionals overcome challenges and achieve their personal and career goals.',
    specialties: ['Career Transitions', 'Goal Setting', 'Confidence Building']
  },
  {
    firstName: 'Zara',
    lastName: 'Ali',
    email: 'zara.ali.fashion@gmail.com',
    username: 'zaraa_fashion',
    skills: ['Fashion Styling', 'Personal Shopping', 'Color Analysis', 'Wardrobe Consulting'],
    bio: 'Personal stylist helping clients discover their unique style and build confidence through fashion choices.',
    specialties: ['Wardrobe Makeovers', 'Special Event Styling', 'Professional Attire']
  },
  {
    firstName: 'Benjamin',
    lastName: 'Clark',
    email: 'benjamin.clark.chef@gmail.com',
    username: 'benjaminc_chef',
    skills: ['Cooking', 'Meal Planning', 'Nutrition', 'Culinary Arts'],
    bio: 'Professional chef and culinary instructor. I teach cooking techniques and help people develop healthy eating habits.',
    specialties: ['Healthy Cooking', 'Meal Prep', 'International Cuisine']
  },
  {
    firstName: 'Isabella',
    lastName: 'Santos',
    email: 'isabella.santos.therapy@gmail.com',
    username: 'isabellas_therapy',
    skills: ['Massage Therapy', 'Wellness', 'Stress Relief', 'Holistic Health'],
    bio: 'Licensed massage therapist focused on helping clients achieve physical and mental wellness through therapeutic touch.',
    specialties: ['Deep Tissue Massage', 'Relaxation Therapy', 'Pain Management']
  },
  {
    firstName: 'Kevin',
    lastName: 'Walsh',
    email: 'kevin.walsh.pets@gmail.com',
    username: 'kevinw_pets',
    skills: ['Pet Care', 'Dog Training', 'Animal Behavior', 'Pet Sitting'],
    bio: 'Professional pet care specialist and dog trainer. I help pet owners build strong, healthy relationships with their furry friends.',
    specialties: ['Puppy Training', 'Behavioral Issues', 'Pet Grooming']
  }
];

// Service categories and their typical hourly rates
const SERVICE_CATEGORIES = {
  'Technology': { min: 50, max: 120 },
  'Design': { min: 40, max: 100 },
  'Business': { min: 60, max: 150 },
  'Education': { min: 25, max: 80 },
  'Health': { min: 30, max: 90 },
  'Lifestyle': { min: 20, max: 70 },
  'Creative': { min: 35, max: 85 },
  'Home Services': { min: 25, max: 65 }
};

// Helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateRealisticUserData(userTemplate, index) {
  const baseEmail = userTemplate.email.replace('@gmail.com', '');
  const uniqueEmail = `${baseEmail}+${getRandomInt(100, 999)}@gmail.com`;
  
  return {
    email: uniqueEmail,
    username: `${userTemplate.username}_${getRandomInt(10, 99)}`,
    firstName: userTemplate.firstName,
    lastName: userTemplate.lastName,
    skills: userTemplate.skills,
    bio: userTemplate.bio,
    bankHours: getRandomFloat(5, 75, 1),
    rating: getRandomFloat(3.5, 5.0, 1),
    totalTransactions: getRandomInt(0, 25),
    specialties: userTemplate.specialties
  };
}

function generateServiceForUser(userData) {
  const services = [];
  const numServices = getRandomInt(1, 3);
  
  for (let i = 0; i < numServices; i++) {
    const skill = userData.skills[i] || userData.skills[0];
    const specialty = userData.specialties[i] || userData.specialties[0];
    
    // Determine category based on skill
    let category = 'Other';
    if (['Web Development', 'React', 'Node.js', 'TypeScript', 'Python', 'Data Analysis', 'Machine Learning'].some(tech => userData.skills.includes(tech))) {
      category = 'Technology';
    } else if (['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Photography', 'Video Editing'].some(design => userData.skills.includes(design))) {
      category = 'Design';
    } else if (['Business Consulting', 'Project Management', 'Financial Planning', 'Legal Consulting'].some(biz => userData.skills.includes(biz))) {
      category = 'Business';
    } else if (['Tutoring', 'Language Translation', 'Music Lessons', 'Cooking'].some(edu => userData.skills.includes(edu))) {
      category = 'Education';
    } else if (['Personal Training', 'Massage Therapy', 'Wellness', 'Nutrition'].some(health => userData.skills.includes(health))) {
      category = 'Health';
    } else if (['Home Repair', 'Gardening', 'Pet Care', 'Fashion Styling'].some(lifestyle => userData.skills.includes(lifestyle))) {
      category = 'Lifestyle';
    }
    
    const rateRange = SERVICE_CATEGORIES[category] || { min: 30, max: 80 };
    const hourlyRate = getRandomFloat(rateRange.min, rateRange.max, 2);
    
    services.push({
      title: `Professional ${specialty || skill} Services`,
      description: `Hi! I'm ${userData.firstName} and I specialize in ${specialty || skill.toLowerCase()}. ${userData.bio.split('.')[1] || 'I bring years of experience and dedication to every project.'} Let me help you achieve your goals with quality service and attention to detail.`,
      category: category,
      hourlyRate: hourlyRate,
      isActive: Math.random() > 0.1, // 90% chance of being active
      tags: [
        skill.toLowerCase().replace(/\s+/g, '-'),
        specialty ? specialty.toLowerCase().replace(/\s+/g, '-') : null,
        'professional',
        'experienced',
        category.toLowerCase()
      ].filter(Boolean)
    });
  }
  
  return services;
}

async function createRealisticUser(userData) {
  try {
    console.log(`\n🔄 Creating user: ${userData.firstName} ${userData.lastName}`);
    
    // Create user record
    console.log('  📊 Creating user record...');
    const userResult = await client.graphql({
      query: `
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
      `,
      variables: {
        input: {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          bankHours: userData.bankHours,
          skills: userData.skills,
          bio: userData.bio,
          rating: userData.rating,
          totalTransactions: userData.totalTransactions
        }
      }
    });
    
    const createdUser = userResult.data.createUser;
    console.log(`  ✅ User created with ID: ${createdUser.id}`);
    
    // Create services
    console.log('  🛠️  Creating services...');
    const servicesToCreate = generateServiceForUser(userData);
    const createdServices = [];
    
    for (const serviceData of servicesToCreate) {
      try {
        const serviceResult = await client.graphql({
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
              }
            }
          `,
          variables: {
            input: {
              userId: createdUser.id,
              ...serviceData
            }
          }
        });
        
        createdServices.push(serviceResult.data.createService);
        console.log(`    ✅ Service created: ${serviceData.title}`);
      } catch (serviceError) {
        console.log(`    ❌ Service creation failed: ${serviceError.message}`);
      }
    }
    
    return {
      success: true,
      user: createdUser,
      services: createdServices
    };
    
  } catch (error) {
    console.error(`  ❌ Failed to create user ${userData.firstName} ${userData.lastName}:`, error.message);
    return {
      success: false,
      error: error.message,
      userData
    };
  }
}

async function createRealisticTestUsers(count = 10) {
  console.log(`🚀 Creating ${count} realistic test users...\n`);
  
  const results = {
    successful: [],
    failed: [],
    total: count
  };
  
  // Shuffle the realistic users array and take the requested count
  const shuffledUsers = [...REALISTIC_USERS].sort(() => 0.5 - Math.random());
  const usersToCreate = shuffledUsers.slice(0, Math.min(count, REALISTIC_USERS.length));
  
  // If we need more users than we have templates, repeat some with variations
  while (usersToCreate.length < count) {
    const randomUser = REALISTIC_USERS[Math.floor(Math.random() * REALISTIC_USERS.length)];
    usersToCreate.push(randomUser);
  }
  
  for (let i = 0; i < count; i++) {
    const userTemplate = usersToCreate[i];
    const userData = generateRealisticUserData(userTemplate, i + 1);
    const result = await createRealisticUser(userData);
    
    if (result.success) {
      results.successful.push(result);
      console.log(`✅ User ${i + 1}/${count} created successfully`);
    } else {
      results.failed.push(result);
      console.log(`❌ User ${i + 1}/${count} failed`);
    }
    
    // Add delay to avoid rate limiting
    if (i < count - 1) {
      console.log('⏳ Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      const user = result.user;
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (@${user.username})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Skills: ${user.skills.join(', ')}`);
      console.log(`   Services: ${result.services.length}`);
      console.log(`   Bank Hours: ${user.bankHours}`);
      console.log(`   Rating: ${user.rating}/5.0`);
      console.log('');
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED USERS:');
    results.failed.forEach((result, index) => {
      console.log(`${index + 1}. ${result.userData.firstName} ${result.userData.lastName} - ${result.error}`);
    });
  }
  
  return results;
}

async function testApiConnection() {
  try {
    console.log('🔧 Testing API connection...');
    await client.graphql({
      query: `query { __typename }`
    });
    console.log('✅ API connection successful');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    console.log('💡 Make sure your API is deployed and aws-exports.js is updated');
    return false;
  }
}

// Main execution
async function main() {
  try {
    const userCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
    
    if (userCount < 1 || userCount > 50) {
      console.error('❌ Please specify a number between 1 and 50');
      process.exit(1);
    }
    
    // Test API connection
    if (!(await testApiConnection())) {
      process.exit(1);
    }
    
    const results = await createRealisticTestUsers(userCount);
    
    console.log(`\n🎉 Process completed! Created ${results.successful.length} realistic users successfully.`);
    
    if (results.successful.length > 0) {
      console.log('\n📋 SUMMARY STATISTICS:');
      console.log('=' * 50);
      const totalServices = results.successful.reduce((sum, r) => sum + r.services.length, 0);
      const totalSkills = results.successful.reduce((sum, r) => sum + r.user.skills.length, 0);
      const avgBankHours = results.successful.reduce((sum, r) => sum + r.user.bankHours, 0) / results.successful.length;
      const avgRating = results.successful.reduce((sum, r) => sum + r.user.rating, 0) / results.successful.length;
      
      console.log(`👥 Total Users: ${results.successful.length}`);
      console.log(`🛠️  Total Services: ${totalServices}`);
      console.log(`🎯 Total Skills: ${totalSkills}`);
      console.log(`💰 Average Bank Hours: ${avgBankHours.toFixed(1)}`);
      console.log(`⭐ Average Rating: ${avgRating.toFixed(1)}/5.0`);
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createRealisticTestUsers, REALISTIC_USERS };
