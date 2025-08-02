import { Injectable } from '@angular/core';
import { User, Service, Transaction, Booking, TransactionStatus, BookingStatus } from '../models/user.model';
import { getAppConfig } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class DataSimulationService {
  private config = getAppConfig();

  // Sample users with diverse skills and backgrounds
  private sampleUsers: User[] = [
    {
      id: 'user-001',
      email: 'sarah.developer@email.com',
      username: 'sarah_codes',
      firstName: 'Sarah',
      lastName: 'Johnson',
      bankHours: this.config.simulation.testUserBankHours, // Will be updated after transactions
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
      bankHours: this.config.simulation.testUserBankHours,
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
      bankHours: this.config.simulation.testUserBankHours,
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
      bankHours: this.config.simulation.testUserBankHours,
      skills: ['Garden Maintenance', 'Landscaping', 'Lawn Care', 'Outdoor Services'],
      bio: 'Experienced landscaper ready to help with your outdoor garden and lawn care needs.',
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
      bankHours: this.config.simulation.testUserBankHours,
      skills: ['Cooking Workshops', 'Community Teaching', 'Meal Planning', 'Nutrition'],
      bio: 'Professional chef offering cooking workshops in community kitchens and group settings.',
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
      bankHours: this.config.simulation.testUserBankHours,
      skills: ['Outdoor Fitness', 'Group Training', 'Wellness Coaching', 'Park Workouts'],
      bio: 'Certified fitness trainer specializing in outdoor group workouts and wellness coaching.',
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
      bankHours: this.config.simulation.testUserBankHours,
      skills: ['Music Theory', 'Composition', 'Digital Music Production', 'Group Teaching'],
      bio: 'Music theory instructor with 10+ years experience. Specializing in composition and digital music production.',
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
      bankHours: this.config.simulation.testUserBankHours,
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
      bankHours: this.config.simulation.testUserBankHours,
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
      bankHours: this.config.simulation.testUserBankHours,
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
  private sampleServices: Service[] = [
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
      title: 'Outdoor Garden Maintenance',
      description: 'Professional garden maintenance, lawn care, and outdoor landscaping services.',
      category: 'Outdoor Services',
      hourlyDuration: 2,
      isActive: true,
      tags: ['Garden Maintenance', 'Lawn Care', 'Landscaping', 'Outdoor Work'],
      requiresScheduling: true,
      minBookingHours: 2,
      maxBookingHours: 6,
      advanceBookingDays: 1,
      cancellationHours: 4,
      createdAt: new Date('2025-06-01T17:00:00Z'),
      updatedAt: new Date('2025-06-01T17:00:00Z')
    },
    {
      id: 'service-005',
      userId: 'user-005',
      title: 'Cooking Workshop at Community Center',
      description: 'Learn to cook authentic Italian dishes in a community kitchen setting. All ingredients provided.',
      category: 'Culinary',
      hourlyDuration: 3,
      isActive: true,
      tags: ['Cooking Workshop', 'Italian Cuisine', 'Community Kitchen', 'Group Learning'],
      requiresScheduling: true,
      minBookingHours: 3,
      maxBookingHours: 4,
      advanceBookingDays: 3,
      cancellationHours: 48,
      createdAt: new Date('2025-06-02T09:45:00Z'),
      updatedAt: new Date('2025-06-02T09:45:00Z')
    },
    {
      id: 'service-006',
      userId: 'user-006',
      title: 'Outdoor Fitness Training',
      description: 'Group fitness training sessions in parks and outdoor spaces. Fresh air workouts tailored to all fitness levels.',
      category: 'Health & Fitness',
      hourlyDuration: 1,
      isActive: true,
      tags: ['Outdoor Fitness', 'Group Training', 'Park Workouts', 'Fresh Air Exercise'],
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
      title: 'Music Theory & Composition Tutoring',
      description: 'Learn music theory, composition, and digital music production in a library or community center setting.',
      category: 'Arts & Music',
      hourlyDuration: 1,
      isActive: true,
      tags: ['Music Theory', 'Composition', 'Digital Music', 'Public Space Learning'],
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

  constructor() {}

  /**
   * Generate realistic transaction history for the past few weeks
   */
  generateTransactionHistory(): { users: User[], services: Service[], transactions: Transaction[], bookings: Booking[] } {
    const users = JSON.parse(JSON.stringify(this.sampleUsers)); // Deep copy
    const services = JSON.parse(JSON.stringify(this.sampleServices)); // Deep copy
    const transactions: Transaction[] = [];
    const bookings: Booking[] = [];

    // Generate transactions over the past 3 weeks (since 6/1/2025)
    const startDate = new Date('2025-06-01T00:00:00Z');
    const endDate = new Date('2025-07-25T19:00:00Z'); // Current date
    
    let transactionId = 1;
    let bookingId = 1;

    // Generate 50-80 realistic transactions
    const numTransactions = Math.floor(Math.random() * 31) + 50; // 50-80 transactions

    for (let i = 0; i < numTransactions; i++) {
      // Pick random service and users
      const service = services[Math.floor(Math.random() * services.length)];
      const provider = users.find((u: User) => u.id === service.userId)!;
      
      // Pick a different user as consumer
      const availableConsumers = users.filter((u: User) => u.id !== provider.id);
      const consumer = availableConsumers[Math.floor(Math.random() * availableConsumers.length)];

      // Generate random date between start and end
      const transactionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      
      // Determine hours spent (based on service duration with some variation)
      const baseHours = service.hourlyDuration;
      const hoursSpent = Math.max(1, baseHours + (Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0));

      // Check if consumer has enough hours
      if (consumer.bankHours < hoursSpent) {
        continue; // Skip this transaction if consumer doesn't have enough hours
      }

      // Create booking if service requires scheduling
      let booking: Booking | undefined;
      if (service.requiresScheduling) {
        const bookingDate = new Date(transactionDate);
        bookingDate.setHours(9 + Math.floor(Math.random() * 8)); // 9 AM to 5 PM
        
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
          status: BookingStatus.COMPLETED,
          notes: this.generateBookingNotes(service.category),
          createdAt: new Date(transactionDate.getTime() - 24 * 60 * 60 * 1000), // Created 1 day before
          confirmedAt: new Date(transactionDate.getTime() - 12 * 60 * 60 * 1000), // Confirmed 12 hours before
          completedAt: transactionDate,
          updatedAt: transactionDate
        };
        bookings.push(booking);
        bookingId++;
      }

      // Create transaction
      const transaction: Transaction = {
        id: `transaction-${String(transactionId).padStart(3, '0')}`,
        providerId: provider.id,
        consumerId: consumer.id,
        serviceId: service.id,
        bookingId: booking?.id,
        hoursSpent: hoursSpent,
        status: TransactionStatus.COMPLETED,
        description: `${service.title} - ${hoursSpent} hour${hoursSpent > 1 ? 's' : ''}`,
        rating: this.generateRating(),
        feedback: this.generateFeedback(service.category),
        createdAt: transactionDate,
        completedAt: transactionDate
      };

      transactions.push(transaction);

      // Update user bank hours and transaction counts
      consumer.bankHours -= hoursSpent;
      provider.bankHours += hoursSpent;
      consumer.totalTransactions++;
      provider.totalTransactions++;

      // Update user ratings (weighted average)
      if (transaction.rating) {
        provider.rating = ((provider.rating * (provider.totalTransactions - 1)) + transaction.rating) / provider.totalTransactions;
        provider.rating = Math.round(provider.rating * 10) / 10; // Round to 1 decimal
      }

      transactionId++;
    }

    // Update user updatedAt timestamps
    users.forEach((user: User) => {
      user.updatedAt = new Date();
    });

    return { users, services, transactions, bookings };
  }

  private generateBookingNotes(category: string): string {
    const notesByCategory: { [key: string]: string[] } = {
      'Technology': [
        'Please bring your laptop',
        'We\'ll work on a real project',
        'Beginner-friendly session',
        'Advanced concepts covered'
      ],
      'Education': [
        'Bring notebook for practice',
        'Conversational focus',
        'Grammar and vocabulary',
        'Cultural context included'
      ],
      'Design': [
        'Initial consultation included',
        'Revisions included',
        'Brand guidelines provided',
        'Multiple concepts presented'
      ],
      'Outdoor Services': [
        'Tools and equipment provided',
        'Weather-dependent scheduling',
        'Site assessment included',
        'Eco-friendly practices used'
      ],
      'Culinary': [
        'All ingredients provided',
        'Recipes to take home',
        'Dietary restrictions accommodated',
        'Hands-on cooking experience'
      ],
      'Health & Fitness': [
        'Fitness assessment included',
        'Customized workout plan',
        'Proper form instruction',
        'Progress tracking'
      ],
      'Arts & Music': [
        'Sheet music provided',
        'Practice exercises included',
        'Performance tips',
        'Music theory basics'
      ],
      'Writing': [
        'SEO optimization included',
        'Multiple revisions',
        'Research included',
        'Content strategy discussion'
      ],
      'Photography': [
        'Multiple outfit changes',
        'Edited photos included',
        'Various poses and styles',
        'Digital delivery'
      ],
      'Gardening': [
        'Site assessment included',
        'Plant recommendations',
        'Seasonal planning',
        'Maintenance tips'
      ]
    };

    const notes = notesByCategory[category] || ['Great service experience'];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  private generateRating(): number {
    // Generate ratings with realistic distribution (mostly 4-5 stars)
    const rand = Math.random();
    if (rand < 0.6) return 5; // 60% five stars
    if (rand < 0.85) return 4; // 25% four stars
    if (rand < 0.95) return 3; // 10% three stars
    if (rand < 0.99) return 2; // 4% two stars
    return 1; // 1% one star
  }

  private generateFeedback(category: string): string {
    const feedbackByCategory: { [key: string]: string[] } = {
      'Technology': [
        'Excellent teacher! Explained complex concepts clearly.',
        'Very patient and knowledgeable. Highly recommend!',
        'Great hands-on approach to learning React.',
        'Helped me understand concepts I was struggling with.',
        'Professional and well-prepared session.'
      ],
      'Education': [
        'Native speaker with great teaching skills!',
        'Very patient and encouraging. Made learning fun!',
        'Excellent pronunciation and cultural insights.',
        'Structured lessons that build on each other.',
        'Flexible teaching style adapted to my needs.'
      ],
      'Design': [
        'Amazing creativity and professional results!',
        'Understood my vision perfectly and delivered beyond expectations.',
        'Quick turnaround and excellent communication.',
        'Professional quality work at great value.',
        'Creative solutions and attention to detail.'
      ],
      'Outdoor Services': [
        'Transformed our garden beautifully and efficiently!',
        'Professional, knowledgeable, and eco-friendly approach.',
        'Great advice on plant selection and maintenance.',
        'Reliable service with attention to detail.',
        'Punctual and well-prepared with quality tools.'
      ],
      'Culinary': [
        'Learned so much! The food was delicious.',
        'Great teacher with excellent techniques.',
        'Fun, interactive, and educational experience.',
        'Professional chef with great personality.',
        'Will definitely book again for more lessons!'
      ],
      'Health & Fitness': [
        'Motivating trainer who pushes you to succeed!',
        'Knowledgeable about proper form and safety.',
        'Customized workout perfect for my fitness level.',
        'Encouraging and professional approach.',
        'Saw results after just a few sessions!'
      ],
      'Arts & Music': [
        'Patient teacher who makes learning enjoyable!',
        'Excellent technique and music theory knowledge.',
        'Inspiring lessons that build confidence.',
        'Great at adapting to different learning styles.',
        'Professional musician and skilled teacher.'
      ],
      'Writing': [
        'Excellent writing quality and fast delivery!',
        'Understood the brief perfectly and delivered great content.',
        'Professional, engaging, and SEO-optimized content.',
        'Great communication throughout the project.',
        'Will definitely work together again!'
      ],
      'Photography': [
        'Amazing photos! Professional quality work.',
        'Made me feel comfortable during the shoot.',
        'Creative eye and excellent technical skills.',
        'Quick delivery of beautifully edited photos.',
        'Exceeded my expectations completely!'
      ],
      'Gardening': [
        'Transformed my garden with expert advice!',
        'Knowledgeable about plants and design principles.',
        'Practical solutions within my budget.',
        'Great follow-up support and maintenance tips.',
        'Beautiful results that neighbors admire!'
      ]
    };

    const feedback = feedbackByCategory[category] || ['Great service, very satisfied!'];
    return feedback[Math.floor(Math.random() * feedback.length)];
  }

  /**
   * Get the simulated data
   */
  getSimulatedData() {
    return this.generateTransactionHistory();
  }

  /**
   * Generate additional users for simulation
   */
  generateAdditionalUsers(count: number): User[] {
    const additionalUsers: User[] = [];
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const skillSets = [
      ['Programming', 'Web Development', 'JavaScript'],
      ['Design', 'Photoshop', 'UI/UX'],
      ['Writing', 'Content Creation', 'Editing'],
      ['Music Theory', 'Composition', 'Digital Music'],
      ['Outdoor Fitness', 'Group Training', 'Wellness'],
      ['Cooking Workshops', 'Community Teaching', 'Nutrition'],
      ['Photography', 'Photo Editing', 'Portraits'],
      ['Tutoring', 'Math', 'Science'],
      ['Language', 'Spanish', 'French'],
      ['Landscaping', 'Garden Maintenance', 'Outdoor Work']
    ];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const skills = skillSets[Math.floor(Math.random() * skillSets.length)];
      
      additionalUsers.push({
        id: `sim-user-${Date.now()}-${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@simulation.com`,
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i}`,
        firstName,
        lastName,
        bankHours: this.config.simulation.testUserBankHours,
        skills,
        bio: `Simulated user specializing in ${skills[0].toLowerCase()}.`,
        rating: this.config.simulation.testUserRatings.good + (Math.random() * 0.3),
        totalTransactions: 0,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return additionalUsers;
  }

  /**
   * Generate additional services for simulation
   */
  generateAdditionalServices(count: number, users: User[]): Service[] {
    const additionalServices: Service[] = [];
    const serviceTemplates = [
      { title: 'Web Development', category: 'Technology', duration: 2, description: 'Build responsive websites' },
      { title: 'Logo Design', category: 'Design', duration: 1, description: 'Create professional logos' },
      { title: 'Content Writing', category: 'Writing', duration: 1, description: 'Write engaging content' },
      { title: 'Music Theory Tutoring', category: 'Music', duration: 1, description: 'Learn music theory and composition' },
      { title: 'Outdoor Group Fitness', category: 'Fitness', duration: 1, description: 'Get fit with outdoor group training' },
      { title: 'Community Cooking Workshop', category: 'Food', duration: 2, description: 'Learn to cook in community kitchen' },
      { title: 'Photo Session', category: 'Photography', duration: 2, description: 'Professional photo session' },
      { title: 'Math Tutoring', category: 'Education', duration: 1, description: 'Improve your math skills' },
      { title: 'Spanish Lessons', category: 'Language', duration: 1, description: 'Learn Spanish conversation' },
      { title: 'Garden Maintenance', category: 'Outdoor', duration: 3, description: 'Professional garden and lawn care' }
    ];

    for (let i = 0; i < count; i++) {
      const template = serviceTemplates[Math.floor(Math.random() * serviceTemplates.length)];
      const provider = users[Math.floor(Math.random() * users.length)];
      
      additionalServices.push({
        id: `sim-service-${Date.now()}-${i}`,
        userId: provider.id,
        title: `${template.title} ${i + 1}`,
        description: template.description,
        category: template.category,
        hourlyDuration: template.duration,
        isActive: true,
        tags: [template.category.toLowerCase(), template.title.toLowerCase().replace(' ', '-')],
        requiresScheduling: Math.random() > 0.5,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return additionalServices;
  }
}
