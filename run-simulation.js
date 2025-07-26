#!/usr/bin/env node

/**
 * HourBank Transaction Simulation Runner
 * Standalone script to generate transaction data from June 2025 to today
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HourBank Transaction Simulation Runner');
console.log('=' .repeat(60));
console.log('📅 Generating transactions from June 1, 2025 to July 26, 2025');
console.log('');

// Simulation parameters
const SIMULATION_CONFIG = {
  startDate: '2025-06-01',
  endDate: '2025-07-26',
  dailyVolume: {
    weekdayMin: 5,
    weekdayMax: 8,
    weekendMin: 8,
    weekendMax: 12
  },
  userDistribution: {
    regular: 0.2,   // 20%
    casual: 0.6,    // 60%
    inactive: 0.2   // 20%
  },
  outcomes: {
    completed: 0.7,   // 70%
    rejected: 0.15,   // 15%
    cancelled: 0.1,   // 10%
    pending: 0.05     // 5%
  },
  ratings: {
    fiveStar: 0.6,    // 60%
    fourStar: 0.25,   // 25%
    threeStar: 0.1,   // 10%
    twoStar: 0.04,    // 4%
    oneStar: 0.01     // 1%
  }
};

/**
 * Generate a random date between two dates
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate business hour time
 */
function generateBusinessHourTime(date) {
  const businessStart = 9; // 9 AM
  const businessEnd = 18;  // 6 PM
  
  const hour = Math.floor(Math.random() * (businessEnd - businessStart)) + businessStart;
  const minute = Math.floor(Math.random() * 60);
  
  const time = new Date(date);
  time.setHours(hour, minute, 0, 0);
  
  return time;
}

/**
 * Generate rating based on distribution
 */
function generateRating() {
  const rand = Math.random();
  
  if (rand < SIMULATION_CONFIG.ratings.fiveStar) return 5;
  if (rand < SIMULATION_CONFIG.ratings.fiveStar + SIMULATION_CONFIG.ratings.fourStar) return 4;
  if (rand < SIMULATION_CONFIG.ratings.fiveStar + SIMULATION_CONFIG.ratings.fourStar + SIMULATION_CONFIG.ratings.threeStar) return 3;
  if (rand < SIMULATION_CONFIG.ratings.fiveStar + SIMULATION_CONFIG.ratings.fourStar + SIMULATION_CONFIG.ratings.threeStar + SIMULATION_CONFIG.ratings.twoStar) return 2;
  
  return 1;
}

/**
 * Generate feedback based on rating
 */
function generateFeedback(rating) {
  const feedbackOptions = {
    5: ['Excellent service!', 'Highly recommended!', 'Perfect experience!', 'Outstanding work!'],
    4: ['Great service', 'Very satisfied', 'Good experience', 'Would recommend'],
    3: ['Decent service', 'Average experience', 'Okay overall', 'Met expectations'],
    2: ['Below expectations', 'Could be better', 'Some issues', 'Not great'],
    1: ['Poor service', 'Very disappointed', 'Many problems', 'Would not recommend']
  };
  
  const options = feedbackOptions[rating] || feedbackOptions[3];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Determine transaction outcome
 */
function determineOutcome() {
  const rand = Math.random();
  
  if (rand < SIMULATION_CONFIG.outcomes.completed) return 'COMPLETED';
  if (rand < SIMULATION_CONFIG.outcomes.completed + SIMULATION_CONFIG.outcomes.rejected) return 'REJECTED';
  if (rand < SIMULATION_CONFIG.outcomes.completed + SIMULATION_CONFIG.outcomes.rejected + SIMULATION_CONFIG.outcomes.cancelled) return 'CANCELLED';
  
  return 'PENDING';
}

/**
 * Generate sample users
 */
function generateSampleUsers() {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Sarah', 'Mike', 'Lisa', 'David', 'Emma', 'James', 'Maria', 'Nina', 'Robert'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Chen', 'Thompson', 'Wilson', 'Kumar', 'Anderson', 'Patel', 'Lee'];
  
  const users = [];
  
  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    users.push({
      id: `sim-user-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hourbank.com`,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i}`,
      bankHours: 10 + Math.floor(Math.random() * 20), // 10-30 hours
      rating: 4.0 + Math.random() * 1.0, // 4.0-5.0 rating
      activityLevel: i < 5 ? 'regular' : (i < 20 ? 'casual' : 'inactive')
    });
  }
  
  return users;
}

/**
 * Generate sample services
 */
function generateSampleServices(users) {
  const serviceTemplates = [
    { title: 'Web Development', category: 'Technology', duration: 2, description: 'Build responsive websites' },
    { title: 'Logo Design', category: 'Design', duration: 1, description: 'Create professional logos' },
    { title: 'Content Writing', category: 'Writing', duration: 1, description: 'Write engaging content' },
    { title: 'Guitar Lessons', category: 'Music', duration: 1, description: 'Learn to play guitar' },
    { title: 'Personal Training', category: 'Fitness', duration: 1, description: 'Get fit with personal trainer' },
    { title: 'Cooking Class', category: 'Food', duration: 2, description: 'Learn to cook delicious meals' },
    { title: 'Photo Session', category: 'Photography', duration: 2, description: 'Professional photo session' },
    { title: 'Math Tutoring', category: 'Education', duration: 1, description: 'Improve your math skills' },
    { title: 'Spanish Lessons', category: 'Language', duration: 1, description: 'Learn Spanish conversation' },
    { title: 'Home Repair', category: 'Handyman', duration: 3, description: 'Fix things around your home' }
  ];
  
  const services = [];
  
  for (let i = 0; i < 40; i++) {
    const template = serviceTemplates[Math.floor(Math.random() * serviceTemplates.length)];
    const provider = users[Math.floor(Math.random() * users.length)];
    
    services.push({
      id: `sim-service-${i + 1}`,
      providerId: provider.id,
      title: `${template.title} ${i + 1}`,
      description: template.description,
      category: template.category,
      hourlyDuration: template.duration,
      isActive: true
    });
  }
  
  return services;
}

/**
 * Simulate transactions for a single day
 */
function simulateDayTransactions(date, users, services, allTransactions) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const minTransactions = isWeekend ? SIMULATION_CONFIG.dailyVolume.weekendMin : SIMULATION_CONFIG.dailyVolume.weekdayMin;
  const maxTransactions = isWeekend ? SIMULATION_CONFIG.dailyVolume.weekendMax : SIMULATION_CONFIG.dailyVolume.weekdayMax;
  
  const transactionCount = Math.floor(Math.random() * (maxTransactions - minTransactions + 1)) + minTransactions;
  
  const dayTransactions = [];
  const activeUsers = users.filter(u => u.activityLevel !== 'inactive' && Math.random() < (u.activityLevel === 'regular' ? 0.8 : 0.3));
  
  for (let i = 0; i < transactionCount && activeUsers.length > 1; i++) {
    const consumer = activeUsers[Math.floor(Math.random() * activeUsers.length)];
    const availableServices = services.filter(s => s.providerId !== consumer.id);
    
    if (availableServices.length === 0) continue;
    
    const service = availableServices[Math.floor(Math.random() * availableServices.length)];
    const provider = users.find(u => u.id === service.providerId);
    
    if (!provider || consumer.bankHours < service.hourlyDuration) continue;
    
    const requestTime = generateBusinessHourTime(date);
    const outcome = determineOutcome();
    
    const transaction = {
      id: `sim-transaction-${allTransactions.length + dayTransactions.length + 1}`,
      providerId: provider.id,
      consumerId: consumer.id,
      serviceId: service.id,
      providerName: `${provider.firstName} ${provider.lastName}`,
      consumerName: `${consumer.firstName} ${consumer.lastName}`,
      serviceTitle: service.title,
      hoursSpent: service.hourlyDuration,
      status: outcome,
      description: `Request for ${service.title}`,
      createdAt: requestTime.toISOString(),
      updatedAt: requestTime.toISOString()
    };
    
    // If completed, add rating and completion details
    if (outcome === 'COMPLETED') {
      const completionTime = new Date(requestTime.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days later
      const rating = generateRating();
      
      transaction.rating = rating;
      transaction.feedback = generateFeedback(rating);
      transaction.completedAt = completionTime.toISOString();
      transaction.updatedAt = completionTime.toISOString();
      
      // Update bank hours
      consumer.bankHours -= service.hourlyDuration;
      provider.bankHours += service.hourlyDuration;
    }
    
    dayTransactions.push(transaction);
  }
  
  return dayTransactions;
}

/**
 * Main simulation function
 */
function runSimulation() {
  console.log('🔧 Initializing simulation data...');
  
  // Generate users and services
  const users = generateSampleUsers();
  const services = generateSampleServices(users);
  
  console.log(`✅ Generated ${users.length} users and ${services.length} services`);
  console.log(`👥 User distribution: ${users.filter(u => u.activityLevel === 'regular').length} regular, ${users.filter(u => u.activityLevel === 'casual').length} casual, ${users.filter(u => u.activityLevel === 'inactive').length} inactive`);
  console.log('');
  
  // Generate transactions day by day
  const startDate = new Date(SIMULATION_CONFIG.startDate);
  const endDate = new Date(SIMULATION_CONFIG.endDate);
  const allTransactions = [];
  
  let currentDate = new Date(startDate);
  let weekTransactions = [];
  
  console.log('📊 Daily Progress:');
  console.log('─'.repeat(60));
  
  while (currentDate <= endDate) {
    const dayTransactions = simulateDayTransactions(currentDate, users, services, allTransactions);
    allTransactions.push(...dayTransactions);
    weekTransactions.push(...dayTransactions);
    
    const completed = dayTransactions.filter(t => t.status === 'COMPLETED').length;
    const bankHoursTransferred = dayTransactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.hoursSpent, 0);
    
    console.log(`📅 ${currentDate.toISOString().split('T')[0]}: ${dayTransactions.length} created, ${completed} completed, ${bankHoursTransferred}h transferred`);
    
    // Weekly summary every Sunday
    if (currentDate.getDay() === 0 && weekTransactions.length > 0) {
      const weekCompleted = weekTransactions.filter(t => t.status === 'COMPLETED').length;
      const weekHours = weekTransactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.hoursSpent, 0);
      
      console.log('📊 WEEKLY SUMMARY:');
      console.log(`   Week ending ${currentDate.toISOString().split('T')[0]}`);
      console.log(`   ${weekTransactions.length} transactions created, ${weekCompleted} completed`);
      console.log(`   ${weekHours} bank hours transferred`);
      console.log('   ' + '─'.repeat(50));
      
      weekTransactions = [];
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Final statistics
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const completedTransactions = allTransactions.filter(t => t.status === 'COMPLETED');
  const rejectedTransactions = allTransactions.filter(t => t.status === 'REJECTED');
  const cancelledTransactions = allTransactions.filter(t => t.status === 'CANCELLED');
  const pendingTransactions = allTransactions.filter(t => t.status === 'PENDING');
  const totalBankHours = completedTransactions.reduce((sum, t) => sum + t.hoursSpent, 0);
  const avgRating = completedTransactions.reduce((sum, t) => sum + (t.rating || 0), 0) / completedTransactions.length;
  
  console.log('');
  console.log('🎉 SIMULATION COMPLETE!');
  console.log('=' .repeat(60));
  console.log(`📊 Final Statistics:`);
  console.log(`   Period: ${SIMULATION_CONFIG.startDate} to ${SIMULATION_CONFIG.endDate}`);
  console.log(`   Total transactions: ${allTransactions.length}`);
  console.log(`   Completed: ${completedTransactions.length} (${(completedTransactions.length / allTransactions.length * 100).toFixed(1)}%)`);
  console.log(`   Rejected: ${rejectedTransactions.length} (${(rejectedTransactions.length / allTransactions.length * 100).toFixed(1)}%)`);
  console.log(`   Cancelled: ${cancelledTransactions.length} (${(cancelledTransactions.length / allTransactions.length * 100).toFixed(1)}%)`);
  console.log(`   Pending: ${pendingTransactions.length} (${(pendingTransactions.length / allTransactions.length * 100).toFixed(1)}%)`);
  console.log(`   Bank hours transferred: ${totalBankHours}`);
  console.log(`   Average rating: ${avgRating.toFixed(1)} stars`);
  console.log(`   Average daily transactions: ${(allTransactions.length / totalDays).toFixed(1)}`);
  console.log(`   Total simulation days: ${totalDays}`);
  console.log('=' .repeat(60));
  
  // Save data to files
  const outputDir = './simulation-output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2));
  fs.writeFileSync(path.join(outputDir, 'services.json'), JSON.stringify(services, null, 2));
  fs.writeFileSync(path.join(outputDir, 'transactions.json'), JSON.stringify(allTransactions, null, 2));
  
  const summary = {
    period: { start: SIMULATION_CONFIG.startDate, end: SIMULATION_CONFIG.endDate },
    totalDays,
    statistics: {
      totalTransactions: allTransactions.length,
      completed: completedTransactions.length,
      rejected: rejectedTransactions.length,
      cancelled: cancelledTransactions.length,
      pending: pendingTransactions.length,
      totalBankHours,
      averageRating: parseFloat(avgRating.toFixed(1)),
      averageDailyTransactions: parseFloat((allTransactions.length / totalDays).toFixed(1))
    },
    config: SIMULATION_CONFIG
  };
  
  fs.writeFileSync(path.join(outputDir, 'simulation-summary.json'), JSON.stringify(summary, null, 2));
  
  console.log('');
  console.log('💾 Simulation data saved to ./simulation-output/');
  console.log('   📄 users.json - Generated user data');
  console.log('   📄 services.json - Generated service data');
  console.log('   📄 transactions.json - Generated transaction data');
  console.log('   📄 simulation-summary.json - Summary statistics');
  console.log('');
  console.log('✨ Simulation completed successfully! ✨');
  
  return {
    users,
    services,
    transactions: allTransactions,
    summary
  };
}

// Run the simulation
try {
  const result = runSimulation();
  process.exit(0);
} catch (error) {
  console.error('❌ Simulation failed:', error);
  process.exit(1);
}
