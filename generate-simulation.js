const fs = require('fs');
const path = require('path');

// Simulation data generation
class DataSimulationService {
  constructor() {
    // Sample users with diverse skills and backgrounds
    this.sampleUsers = [
      {
        id: 'user-001',
        email: 'sarah.developer@email.com',
        username: 'sarah_codes',
        firstName: 'Sarah',
        lastName: 'Johnson',
        bankHours: 10,
        skills: ['Web Development', 'React', 'Node.js', 'UI/UX Design'],
        bio: 'Full-stack developer with 5 years experience. Love helping others learn to code!',
        rating: 4.8,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-01T10:00:00Z'),
        updatedAt: new Date('2025-06-01T10:00:00Z')
      },
      {
        id: 'user-002',
        email: 'mike.tutor@email.com',
        username: 'mike_teaches',
        firstName: 'Mike',
        lastName: 'Chen',
        bankHours: 10,
        skills: ['Language Tutoring', 'Mandarin', 'English', 'Translation'],
        bio: 'Native Mandarin speaker, fluent in English. Passionate about language learning!',
        rating: 4.9,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-01T11:30:00Z'),
        updatedAt: new Date('2025-06-01T11:30:00Z')
      },
      {
        id: 'user-003',
        email: 'lisa.designer@email.com',
        username: 'lisa_creates',
        firstName: 'Lisa',
        lastName: 'Rodriguez',
        bankHours: 10,
        skills: ['Graphic Design', 'Logo Design', 'Branding', 'Adobe Creative Suite'],
        bio: 'Creative designer with expertise in branding and visual identity.',
        rating: 4.7,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-01T14:15:00Z'),
        updatedAt: new Date('2025-06-01T14:15:00Z')
      },
      {
        id: 'user-004',
        email: 'david.handyman@email.com',
        username: 'david_fixes',
        firstName: 'David',
        lastName: 'Thompson',
        bankHours: 10,
        skills: ['Home Repair', 'Plumbing', 'Electrical', 'Carpentry'],
        bio: 'Experienced handyman ready to help with your home improvement projects.',
        rating: 4.6,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-01T16:45:00Z'),
        updatedAt: new Date('2025-06-01T16:45:00Z')
      },
      {
        id: 'user-005',
        email: 'emma.chef@email.com',
        username: 'emma_cooks',
        firstName: 'Emma',
        lastName: 'Wilson',
        bankHours: 10,
        skills: ['Cooking Lessons', 'Baking', 'Meal Planning', 'Nutrition'],
        bio: 'Professional chef offering cooking lessons and meal planning services.',
        rating: 4.9,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-02T09:20:00Z'),
        updatedAt: new Date('2025-06-02T09:20:00Z')
      },
      {
        id: 'user-006',
        email: 'alex.fitness@email.com',
        username: 'alex_trains',
        firstName: 'Alex',
        lastName: 'Kumar',
        bankHours: 10,
        skills: ['Personal Training', 'Yoga', 'Nutrition Coaching', 'Wellness'],
        bio: 'Certified personal trainer and wellness coach. Let\'s achieve your fitness goals!',
        rating: 4.8,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-02T13:10:00Z'),
        updatedAt: new Date('2025-06-02T13:10:00Z')
      },
      {
        id: 'user-007',
        email: 'maria.music@email.com',
        username: 'maria_music',
        firstName: 'Maria',
        lastName: 'Garcia',
        bankHours: 10,
        skills: ['Music Lessons', 'Piano', 'Guitar', 'Music Theory'],
        bio: 'Music teacher with 10+ years experience. All skill levels welcome!',
        rating: 4.9,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-03T11:00:00Z'),
        updatedAt: new Date('2025-06-03T11:00:00Z')
      },
      {
        id: 'user-008',
        email: 'james.writer@email.com',
        username: 'james_writes',
        firstName: 'James',
        lastName: 'Anderson',
        bankHours: 10,
        skills: ['Writing', 'Editing', 'Content Creation', 'Copywriting'],
        bio: 'Professional writer and editor. Help with blogs, articles, and creative writing.',
        rating: 4.7,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-03T15:30:00Z'),
        updatedAt: new Date('2025-06-03T15:30:00Z')
      },
      {
        id: 'user-009',
        email: 'nina.photographer@email.com',
        username: 'nina_captures',
        firstName: 'Nina',
        lastName: 'Patel',
        bankHours: 10,
        skills: ['Photography', 'Photo Editing', 'Event Photography', 'Portraits'],
        bio: 'Professional photographer specializing in events and portraits.',
        rating: 4.8,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-04T10:45:00Z'),
        updatedAt: new Date('2025-06-04T10:45:00Z')
      },
      {
        id: 'user-010',
        email: 'robert.gardener@email.com',
        username: 'robert_grows',
        firstName: 'Robert',
        lastName: 'Lee',
        bankHours: 10,
        skills: ['Gardening', 'Landscaping', 'Plant Care', 'Organic Farming'],
        bio: 'Master gardener with expertise in sustainable gardening practices.',
        rating: 4.6,
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date('2025-06-04T14:20:00Z'),
        updatedAt: new Date('2025-06-04T14:20:00Z')
      }
    ];

    // Sample services offered by users
    this.sampleServices = [
      {
        id: 'service-001',
        userId: 'user-001',
        title: 'React Web Development Tutoring',
        description: 'Learn React from basics to advanced concepts. Perfect for beginners and intermediate developers.',
        category: 'Technology',
        hourlyDuration: 2,
        isActive: true,
        tags: ['React', 'JavaScript', 'Web Development', 'Frontend'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 4,
        advanceBookingDays: 2,
        cancellationHours: 24,
        createdAt: new Date('2025-06-01T10:30:00Z'),
        updatedAt: new Date('2025-06-01T10:30:00Z')
      },
      {
        id: 'service-002',
        userId: 'user-002',
        title: 'Mandarin Language Lessons',
        description: 'Native speaker offering conversational Mandarin lessons for all levels.',
        category: 'Education',
        hourlyDuration: 1,
        isActive: true,
        tags: ['Mandarin', 'Language', 'Conversation', 'Chinese Culture'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 3,
        advanceBookingDays: 1,
        cancellationHours: 12,
        createdAt: new Date('2025-06-01T12:00:00Z'),
        updatedAt: new Date('2025-06-01T12:00:00Z')
      },
      {
        id: 'service-003',
        userId: 'user-003',
        title: 'Logo Design & Branding',
        description: 'Professional logo design and brand identity creation for small businesses.',
        category: 'Design',
        hourlyDuration: 3,
        isActive: true,
        tags: ['Logo Design', 'Branding', 'Graphic Design', 'Business'],
        requiresScheduling: false,
        createdAt: new Date('2025-06-01T14:45:00Z'),
        updatedAt: new Date('2025-06-01T14:45:00Z')
      },
      {
        id: 'service-004',
        userId: 'user-004',
        title: 'Home Plumbing Repairs',
        description: 'Fix leaky faucets, unclog drains, and handle basic plumbing issues.',
        category: 'Home Services',
        hourlyDuration: 2,
        isActive: true,
        tags: ['Plumbing', 'Home Repair', 'Maintenance', 'Handyman'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 6,
        advanceBookingDays: 1,
        cancellationHours: 4,
        createdAt: new Date('2025-06-01T17:00:00Z'),
        updatedAt: new Date('2025-06-01T17:00:00Z')
      },
      {
        id: 'service-005',
        userId: 'user-005',
        title: 'Italian Cooking Class',
        description: 'Learn to cook authentic Italian dishes from scratch. Ingredients provided.',
        category: 'Culinary',
        hourlyDuration: 3,
        isActive: true,
        tags: ['Cooking', 'Italian Cuisine', 'Culinary Skills', 'Food'],
        requiresScheduling: true,
        minBookingHours: 2,
        maxBookingHours: 4,
        advanceBookingDays: 3,
        cancellationHours: 48,
        createdAt: new Date('2025-06-02T09:45:00Z'),
        updatedAt: new Date('2025-06-02T09:45:00Z')
      },
      {
        id: 'service-006',
        userId: 'user-006',
        title: 'Personal Fitness Training',
        description: 'One-on-one fitness training sessions tailored to your goals and fitness level.',
        category: 'Health & Fitness',
        hourlyDuration: 1,
        isActive: true,
        tags: ['Personal Training', 'Fitness', 'Health', 'Exercise'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 2,
        advanceBookingDays: 1,
        cancellationHours: 12,
        createdAt: new Date('2025-06-02T13:30:00Z'),
        updatedAt: new Date('2025-06-02T13:30:00Z')
      },
      {
        id: 'service-007',
        userId: 'user-007',
        title: 'Piano Lessons for Beginners',
        description: 'Learn piano fundamentals, music theory, and play your favorite songs.',
        category: 'Arts & Music',
        hourlyDuration: 1,
        isActive: true,
        tags: ['Piano', 'Music Lessons', 'Music Theory', 'Beginner Friendly'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 2,
        advanceBookingDays: 2,
        cancellationHours: 24,
        createdAt: new Date('2025-06-03T11:30:00Z'),
        updatedAt: new Date('2025-06-03T11:30:00Z')
      },
      {
        id: 'service-008',
        userId: 'user-008',
        title: 'Blog Writing & Content Creation',
        description: 'Professional blog posts, articles, and web content for your business.',
        category: 'Writing',
        hourlyDuration: 2,
        isActive: true,
        tags: ['Blog Writing', 'Content Creation', 'SEO Writing', 'Marketing'],
        requiresScheduling: false,
        createdAt: new Date('2025-06-03T16:00:00Z'),
        updatedAt: new Date('2025-06-03T16:00:00Z')
      },
      {
        id: 'service-009',
        userId: 'user-009',
        title: 'Portrait Photography Session',
        description: 'Professional portrait photography for individuals, families, or business headshots.',
        category: 'Photography',
        hourlyDuration: 2,
        isActive: true,
        tags: ['Portrait Photography', 'Professional Photos', 'Headshots', 'Family Photos'],
        requiresScheduling: true,
        minBookingHours: 1,
        maxBookingHours: 4,
        advanceBookingDays: 5,
        cancellationHours: 48,
        createdAt: new Date('2025-06-04T11:15:00Z'),
        updatedAt: new Date('2025-06-04T11:15:00Z')
      },
      {
        id: 'service-010',
        userId: 'user-010',
        title: 'Garden Design Consultation',
        description: 'Professional garden design and landscaping consultation for your outdoor space.',
        category: 'Gardening',
        hourlyDuration: 2,
        isActive: true,
        tags: ['Garden Design', 'Landscaping', 'Plant Selection', 'Outdoor Spaces'],
        requiresScheduling: true,
        minBookingHours: 2,
        maxBookingHours: 6,
        advanceBookingDays: 3,
        cancellationHours: 24,
        createdAt: new Date('2025-06-04T14:45:00Z'),
        updatedAt: new Date('2025-06-04T14:45:00Z')
      }
    ];
  }

  generateTransactionHistory() {
    const users = JSON.parse(JSON.stringify(this.sampleUsers));
    const services = JSON.parse(JSON.stringify(this.sampleServices));
    const transactions = [];
    const bookings = [];

    const startDate = new Date('2025-06-01T00:00:00Z');
    const endDate = new Date('2025-07-25T19:00:00Z');
    
    let transactionId = 1;
    let bookingId = 1;

    const numTransactions = Math.floor(Math.random() * 31) + 50;

    for (let i = 0; i < numTransactions; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const provider = users.find(u => u.id === service.userId);
      
      const availableConsumers = users.filter(u => u.id !== provider.id);
      const consumer = availableConsumers[Math.floor(Math.random() * availableConsumers.length)];

      const transactionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      
      const baseHours = service.hourlyDuration;
      const hoursSpent = Math.max(1, baseHours + (Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0));

      if (consumer.bankHours < hoursSpent) {
        continue;
      }

      let booking;
      if (service.requiresScheduling) {
        const bookingDate = new Date(transactionDate);
        bookingDate.setHours(9 + Math.floor(Math.random() * 8));
        
        booking = {
          id: `booking-${String(bookingId).padStart(3, '0')}`,
          serviceId: service.id,
          providerId: provider.id,
          consumerId: consumer.id,
          bookingDate: bookingDate.toISOString().split('T')[0],
          startTime: `${bookingDate.getHours()}:00`,
          endTime: `${bookingDate.getHours() + hoursSpent}:00`,
          duration: hoursSpent,
          totalCost: hoursSpent,
          status: 'COMPLETED',
          notes: this.generateBookingNotes(service.category),
          createdAt: new Date(transactionDate.getTime() - 24 * 60 * 60 * 1000),
          confirmedAt: new Date(transactionDate.getTime() - 12 * 60 * 60 * 1000),
          completedAt: transactionDate,
          updatedAt: transactionDate
        };
        bookings.push(booking);
        bookingId++;
      }

      const transaction = {
        id: `transaction-${String(transactionId).padStart(3, '0')}`,
        providerId: provider.id,
        consumerId: consumer.id,
        serviceId: service.id,
        bookingId: booking?.id,
        hoursSpent: hoursSpent,
        status: 'COMPLETED',
        description: `${service.title} - ${hoursSpent} hour${hoursSpent > 1 ? 's' : ''}`,
        rating: this.generateRating(),
        feedback: this.generateFeedback(service.category),
        createdAt: transactionDate,
        completedAt: transactionDate
      };

      transactions.push(transaction);

      consumer.bankHours -= hoursSpent;
      provider.bankHours += hoursSpent;
      consumer.totalTransactions++;
      provider.totalTransactions++;

      if (transaction.rating) {
        provider.rating = ((provider.rating * (provider.totalTransactions - 1)) + transaction.rating) / provider.totalTransactions;
        provider.rating = Math.round(provider.rating * 10) / 10;
      }

      transactionId++;
    }

    users.forEach(user => {
      user.updatedAt = new Date();
    });

    return { users, services, transactions, bookings };
  }

  generateBookingNotes(category) {
    const notesByCategory = {
      'Technology': ['Please bring your laptop', 'We\'ll work on a real project', 'Beginner-friendly session', 'Advanced concepts covered'],
      'Education': ['Bring notebook for practice', 'Conversational focus', 'Grammar and vocabulary', 'Cultural context included'],
      'Design': ['Initial consultation included', 'Revisions included', 'Brand guidelines provided', 'Multiple concepts presented'],
      'Home Services': ['Tools and materials included', 'Safety assessment first', 'Clean-up included', 'Warranty on work provided'],
      'Culinary': ['All ingredients provided', 'Recipes to take home', 'Dietary restrictions accommodated', 'Hands-on cooking experience'],
      'Health & Fitness': ['Fitness assessment included', 'Customized workout plan', 'Proper form instruction', 'Progress tracking'],
      'Arts & Music': ['Sheet music provided', 'Practice exercises included', 'Performance tips', 'Music theory basics'],
      'Writing': ['SEO optimization included', 'Multiple revisions', 'Research included', 'Content strategy discussion'],
      'Photography': ['Multiple outfit changes', 'Edited photos included', 'Various poses and styles', 'Digital delivery'],
      'Gardening': ['Site assessment included', 'Plant recommendations', 'Seasonal planning', 'Maintenance tips']
    };

    const notes = notesByCategory[category] || ['Great service experience'];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  generateRating() {
    const rand = Math.random();
    if (rand < 0.6) return 5;
    if (rand < 0.85) return 4;
    if (rand < 0.95) return 3;
    if (rand < 0.99) return 2;
    return 1;
  }

  generateFeedback(category) {
    const feedbackByCategory = {
      'Technology': ['Excellent teacher! Explained complex concepts clearly.', 'Very patient and knowledgeable. Highly recommend!', 'Great hands-on approach to learning React.', 'Helped me understand concepts I was struggling with.', 'Professional and well-prepared session.'],
      'Education': ['Native speaker with great teaching skills!', 'Very patient and encouraging. Made learning fun!', 'Excellent pronunciation and cultural insights.', 'Structured lessons that build on each other.', 'Flexible teaching style adapted to my needs.'],
      'Design': ['Amazing creativity and professional results!', 'Understood my vision perfectly and delivered beyond expectations.', 'Quick turnaround and excellent communication.', 'Professional quality work at great value.', 'Creative solutions and attention to detail.'],
      'Home Services': ['Fixed the problem quickly and efficiently!', 'Professional, clean, and reliable service.', 'Explained the issue and how to prevent it.', 'Fair pricing and quality workmanship.', 'Punctual and well-prepared with tools.'],
      'Culinary': ['Learned so much! The food was delicious.', 'Great teacher with excellent techniques.', 'Fun, interactive, and educational experience.', 'Professional chef with great personality.', 'Will definitely book again for more lessons!'],
      'Health & Fitness': ['Motivating trainer who pushes you to succeed!', 'Knowledgeable about proper form and safety.', 'Customized workout perfect for my fitness level.', 'Encouraging and professional approach.', 'Saw results after just a few sessions!'],
      'Arts & Music': ['Patient teacher who makes learning enjoyable!', 'Excellent technique and music theory knowledge.', 'Inspiring lessons that build confidence.', 'Great at adapting to different learning styles.', 'Professional musician and skilled teacher.'],
      'Writing': ['Excellent writing quality and fast delivery!', 'Understood the brief perfectly and delivered great content.', 'Professional, engaging, and SEO-optimized content.', 'Great communication throughout the project.', 'Will definitely work together again!'],
      'Photography': ['Amazing photos! Professional quality work.', 'Made me feel comfortable during the shoot.', 'Creative eye and excellent technical skills.', 'Quick delivery of beautifully edited photos.', 'Exceeded my expectations completely!'],
      'Gardening': ['Transformed my garden with expert advice!', 'Knowledgeable about plants and design principles.', 'Practical solutions within my budget.', 'Great follow-up support and maintenance tips.', 'Beautiful results that neighbors admire!']
    };

    const feedback = feedbackByCategory[category] || ['Great service, very satisfied!'];
    return feedback[Math.floor(Math.random() * feedback.length)];
  }
}

// Run the simulation
const simulationService = new DataSimulationService();

console.log('🚀 Generating HourBank simulation data...\n');

const simulatedData = simulationService.generateTransactionHistory();

console.log('📊 Simulation Results:');
console.log(`👥 Users: ${simulatedData.users.length}`);
console.log(`🛍️ Services: ${simulatedData.services.length}`);
console.log(`💳 Transactions: ${simulatedData.transactions.length}`);
console.log(`📅 Bookings: ${simulatedData.bookings.length}\n`);

// Display user bank hours summary
console.log('💰 User Bank Hours Summary:');
console.log('─'.repeat(60));
simulatedData.users.forEach(user => {
  const earned = simulatedData.transactions
    .filter(t => t.providerId === user.id && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.hoursSpent, 0);
  
  const spent = simulatedData.transactions
    .filter(t => t.consumerId === user.id && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.hoursSpent, 0);

  console.log(`${user.firstName} ${user.lastName}: ${user.bankHours} hours (Earned: ${earned + 10}, Spent: ${spent})`);
});

// Display transaction summary by category
console.log('\n📈 Transaction Summary by Category:');
console.log('─'.repeat(60));
const categoryStats = {};

simulatedData.transactions.forEach(transaction => {
  const service = simulatedData.services.find(s => s.id === transaction.serviceId);
  if (service) {
    if (!categoryStats[service.category]) {
      categoryStats[service.category] = { count: 0, totalHours: 0 };
    }
    categoryStats[service.category].count++;
    categoryStats[service.category].totalHours += transaction.hoursSpent;
  }
});

Object.entries(categoryStats)
  .sort(([,a], [,b]) => b.count - a.count)
  .forEach(([category, stats]) => {
    console.log(`${category}: ${stats.count} transactions, ${stats.totalHours} hours`);
  });

// Display recent transactions
console.log('\n🕒 Recent Transactions (Last 10):');
console.log('─'.repeat(80));
const recentTransactions = simulatedData.transactions
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);

recentTransactions.forEach(transaction => {
  const provider = simulatedData.users.find(u => u.id === transaction.providerId);
  const consumer = simulatedData.users.find(u => u.id === transaction.consumerId);
  const service = simulatedData.services.find(s => s.id === transaction.serviceId);
  
  const date = new Date(transaction.createdAt).toLocaleDateString();
  console.log(`${date}: ${consumer?.firstName} → ${provider?.firstName} | ${service?.title} | ${transaction.hoursSpent}h | ⭐${transaction.rating}`);
});

// Create data directory
const dataDir = path.join(__dirname, 'src/assets/simulation-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write data files
fs.writeFileSync(
  path.join(dataDir, 'users.json'),
  JSON.stringify(simulatedData.users, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'services.json'),
  JSON.stringify(simulatedData.services, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'transactions.json'),
  JSON.stringify(simulatedData.transactions, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'bookings.json'),
  JSON.stringify(simulatedData.bookings, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'simulation-data.json'),
  JSON.stringify(simulatedData, null, 2)
);

console.log('\n✅ Simulation data generated and saved to src/assets/simulation-data/');
console.log('📁 Files created:');
console.log('   - users.json');
console.log('   - services.json');
console.log('   - transactions.json');
console.log('   - bookings.json');
console.log('   - simulation-data.json (combined)');

console.log('\n🎯 Key Insights:');
console.log(`• Total hours in circulation: ${simulatedData.users.reduce((sum, u) => sum + u.bankHours, 0)}`);
console.log(`• Average user rating: ${(simulatedData.users.reduce((sum, u) => sum + u.rating, 0) / simulatedData.users.length).toFixed(1)}`);
console.log(`• Most active category: ${Object.entries(categoryStats).sort(([,a], [,b]) => b.count - a.count)[0][0]}`);
console.log(`• Average transaction rating: ${(simulatedData.transactions.reduce((sum, t) => sum + (t.rating || 0), 0) / simulatedData.transactions.length).toFixed(1)}`);
