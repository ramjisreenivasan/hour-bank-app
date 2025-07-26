/**
 * Direct API Transaction Simulation
 * Calls GraphQL APIs directly to create real transactions in the database
 * No UI dependency - pure API calls
 */

import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../amplifyconfiguration.json';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

// Initialize Amplify
Amplify.configure(amplifyconfig);

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bankHours: number;
  rating: number;
  totalTransactions: number;
}

interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  hourlyDuration: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  providerId: string;
  consumerId: string;
  serviceId: string;
  hoursSpent: number;
  status: string;
  rating?: number;
  feedback?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

class APITransactionSimulation {
  private client = generateClient();
  
  // Simulation parameters
  private readonly TRANSACTION_OUTCOMES = {
    COMPLETED: 0.7,   // 70%
    REJECTED: 0.15,   // 15%
    CANCELLED: 0.1,   // 10%
    PENDING: 0.05     // 5%
  };
  
  private readonly RATING_DISTRIBUTION = {
    FIVE_STAR: 0.6,   // 60%
    FOUR_STAR: 0.25,  // 25%
    THREE_STAR: 0.1,  // 10%
    TWO_STAR: 0.04,   // 4%
    ONE_STAR: 0.01    // 1%
  };
  
  private readonly DAILY_VOLUME = {
    WEEKDAY_MIN: 5,
    WEEKDAY_MAX: 8,
    WEEKEND_MIN: 8,
    WEEKEND_MAX: 12
  };

  private users: User[] = [];
  private services: Service[] = [];
  private userActivityLevels: Map<string, 'regular' | 'casual' | 'inactive'> = new Map();
  private userBankHours: Map<string, number> = new Map();

  /**
   * Main simulation runner
   */
  async runSimulation(): Promise<void> {
    console.log('🚀 Starting API Transaction Simulation');
    console.log('📅 Period: June 1, 2025 to July 26, 2025');
    console.log('💾 Creating real transactions via GraphQL API');
    console.log('=' .repeat(60));

    try {
      // Load existing data
      await this.loadExistingData();
      
      if (this.users.length === 0 || this.services.length === 0) {
        throw new Error('No existing users or services found. Please create some users and services first.');
      }

      // Initialize simulation parameters
      this.initializeSimulationParameters();
      
      // Run day-by-day simulation
      await this.runDailySimulation();
      
      console.log('🎉 API Simulation completed successfully!');
      
    } catch (error) {
      console.error('❌ API Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Load existing users and services from database
   */
  private async loadExistingData(): Promise<void> {
    console.log('🔄 Loading existing data from database...');
    
    try {
      // Load users
      const usersResult = await this.client.graphql({
        query: queries.listUsers,
        variables: { limit: 1000 }
      });
      
      const usersData = (usersResult as any).data?.listUsers?.items || [];
      this.users = usersData.map((user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bankHours: user.bankHours || 10,
        rating: user.rating || 5.0,
        totalTransactions: user.totalTransactions || 0
      }));
      
      // Load services
      const servicesResult = await this.client.graphql({
        query: queries.listServices,
        variables: { limit: 1000 }
      });
      
      const servicesData = (servicesResult as any).data?.listServices?.items || [];
      this.services = servicesData.map((service: any) => ({
        id: service.id,
        userId: service.userId,
        title: service.title,
        description: service.description,
        category: service.category,
        hourlyDuration: service.hourlyDuration || 1,
        isActive: service.isActive !== false
      }));
      
      console.log(`✅ Loaded ${this.users.length} users and ${this.services.length} services`);
      
    } catch (error) {
      console.error('❌ Failed to load existing data:', error);
      throw error;
    }
  }

  /**
   * Initialize simulation parameters
   */
  private initializeSimulationParameters(): void {
    console.log('🔧 Initializing simulation parameters...');
    
    // Shuffle users for random activity assignment
    const shuffledUsers = [...this.users].sort(() => Math.random() - 0.5);
    
    const regularCount = Math.floor(this.users.length * 0.2); // 20%
    const casualCount = Math.floor(this.users.length * 0.6);  // 60%
    
    // Assign activity levels
    for (let i = 0; i < shuffledUsers.length; i++) {
      let activityLevel: 'regular' | 'casual' | 'inactive';
      
      if (i < regularCount) {
        activityLevel = 'regular';
      } else if (i < regularCount + casualCount) {
        activityLevel = 'casual';
      } else {
        activityLevel = 'inactive';
      }
      
      this.userActivityLevels.set(shuffledUsers[i].id, activityLevel);
      this.userBankHours.set(shuffledUsers[i].id, shuffledUsers[i].bankHours);
    }
    
    const regular = Array.from(this.userActivityLevels.values()).filter(level => level === 'regular').length;
    const casual = Array.from(this.userActivityLevels.values()).filter(level => level === 'casual').length;
    const inactive = Array.from(this.userActivityLevels.values()).filter(level => level === 'inactive').length;
    
    console.log(`👥 User activity distribution: ${regular} regular, ${casual} casual, ${inactive} inactive`);
  }

  /**
   * Run daily simulation from June to July 2025
   */
  private async runDailySimulation(): Promise<void> {
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-07-26');
    
    let totalStats = {
      totalTransactions: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      pending: 0,
      totalBankHours: 0
    };

    let currentDate = new Date(startDate);
    let weekStats = { transactions: 0, completed: 0, hours: 0 };
    
    console.log('📊 Daily Progress:');
    console.log('─'.repeat(60));
    
    while (currentDate <= endDate) {
      const dayStats = await this.simulateDayTransactions(currentDate);
      
      // Update totals
      totalStats.totalTransactions += dayStats.created;
      totalStats.completed += dayStats.completed;
      totalStats.rejected += dayStats.rejected;
      totalStats.cancelled += dayStats.cancelled;
      totalStats.pending += dayStats.pending;
      totalStats.totalBankHours += dayStats.hoursTransferred;
      
      // Update weekly stats
      weekStats.transactions += dayStats.created;
      weekStats.completed += dayStats.completed;
      weekStats.hours += dayStats.hoursTransferred;
      
      console.log(`📅 ${currentDate.toISOString().split('T')[0]}: ${dayStats.created} created, ${dayStats.completed} completed, ${dayStats.hoursTransferred}h transferred`);
      
      // Weekly summary on Sundays
      if (currentDate.getDay() === 0) {
        console.log('📊 WEEKLY SUMMARY:');
        console.log(`   Week ending ${currentDate.toISOString().split('T')[0]}`);
        console.log(`   ${weekStats.transactions} transactions, ${weekStats.completed} completed, ${weekStats.hours}h transferred`);
        console.log('   ' + '─'.repeat(50));
        weekStats = { transactions: 0, completed: 0, hours: 0 };
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Final summary
    const completionRate = (totalStats.completed / totalStats.totalTransactions * 100).toFixed(1);
    
    console.log('');
    console.log('🎉 SIMULATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total transactions: ${totalStats.totalTransactions}`);
    console.log(`   Completed: ${totalStats.completed} (${completionRate}%)`);
    console.log(`   Rejected: ${totalStats.rejected}`);
    console.log(`   Cancelled: ${totalStats.cancelled}`);
    console.log(`   Pending: ${totalStats.pending}`);
    console.log(`   Bank hours transferred: ${totalStats.totalBankHours}`);
    console.log('💾 All data saved to database via GraphQL API');
    console.log('=' .repeat(60));
  }

  /**
   * Simulate transactions for a single day
   */
  private async simulateDayTransactions(date: Date): Promise<{
    created: number;
    completed: number;
    rejected: number;
    cancelled: number;
    pending: number;
    hoursTransferred: number;
  }> {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const minTransactions = isWeekend ? this.DAILY_VOLUME.WEEKEND_MIN : this.DAILY_VOLUME.WEEKDAY_MIN;
    const maxTransactions = isWeekend ? this.DAILY_VOLUME.WEEKEND_MAX : this.DAILY_VOLUME.WEEKDAY_MAX;
    
    const transactionCount = Math.floor(Math.random() * (maxTransactions - minTransactions + 1)) + minTransactions;
    
    const results = {
      created: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      pending: 0,
      hoursTransferred: 0
    };

    for (let i = 0; i < transactionCount; i++) {
      try {
        const transaction = await this.createRandomTransaction(date);
        if (transaction) {
          results.created++;
          
          switch (transaction.status) {
            case 'COMPLETED':
              results.completed++;
              results.hoursTransferred += transaction.hoursSpent;
              break;
            case 'REJECTED':
              results.rejected++;
              break;
            case 'CANCELLED':
              results.cancelled++;
              break;
            case 'PENDING':
              results.pending++;
              break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create transaction ${i + 1}:`, error);
      }
    }

    return results;
  }

  /**
   * Create a random transaction via API
   */
  private async createRandomTransaction(date: Date): Promise<Transaction | null> {
    // Select active consumer
    const consumer = this.selectActiveUser();
    if (!consumer) return null;
    
    // Select random service (not from consumer)
    const availableServices = this.services.filter(s => s.userId !== consumer.id && s.isActive);
    if (availableServices.length === 0) return null;
    
    const service = availableServices[Math.floor(Math.random() * availableServices.length)];
    const provider = this.users.find(u => u.id === service.userId);
    if (!provider) return null;
    
    // Check consumer balance
    const consumerBalance = this.userBankHours.get(consumer.id) || 0;
    if (consumerBalance < service.hourlyDuration) return null;
    
    // Generate request time
    const requestTime = this.generateBusinessHourTime(date);
    
    try {
      // Create transaction via API
      const transactionInput = {
        providerId: provider.id,
        consumerId: consumer.id,
        serviceId: service.id,
        hoursSpent: service.hourlyDuration,
        status: 'PENDING', // Add required status field
        description: `Request for ${service.title}`,
        createdAt: requestTime.toISOString(),
        updatedAt: requestTime.toISOString()
      };

      const createResult = await this.client.graphql({
        query: mutations.createTransaction,
        variables: { input: transactionInput }
      });

      const transaction = (createResult as any).data?.createTransaction;
      if (!transaction) return null;

      // Determine outcome and update
      const outcome = this.determineTransactionOutcome();
      
      if (outcome === 'COMPLETED') {
        await this.completeTransaction(transaction, date);
        transaction.status = 'COMPLETED';
      } else {
        // Update status
        await this.client.graphql({
          query: mutations.updateTransaction,
          variables: {
            input: {
              id: transaction.id,
              status: outcome,
              updatedAt: requestTime.toISOString()
            }
          }
        });
        transaction.status = outcome;
      }
      
      return transaction;
      
    } catch (error) {
      console.warn('Failed to create transaction:', error);
      return null;
    }
  }

  /**
   * Complete transaction with rating and bank hour transfer
   */
  private async completeTransaction(transaction: any, baseDate: Date): Promise<void> {
    try {
      const completionTime = this.generateCompletionTime(baseDate);
      const rating = this.generateRating();
      
      // Update transaction with completion details
      await this.client.graphql({
        query: mutations.updateTransaction,
        variables: {
          input: {
            id: transaction.id,
            status: 'COMPLETED',
            rating: rating,
            feedback: this.generateFeedback(rating),
            completedAt: completionTime.toISOString(),
            updatedAt: completionTime.toISOString()
          }
        }
      });
      
      // Update user bank hours via API
      const consumerBalance = this.userBankHours.get(transaction.consumerId) || 0;
      const providerBalance = this.userBankHours.get(transaction.providerId) || 0;
      
      // Update consumer (subtract hours)
      await this.client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: transaction.consumerId,
            bankHours: Math.max(0, consumerBalance - transaction.hoursSpent)
          }
        }
      });
      
      // Update provider (add hours)
      await this.client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: transaction.providerId,
            bankHours: providerBalance + transaction.hoursSpent
          }
        }
      });
      
      // Update local tracking
      this.userBankHours.set(transaction.consumerId, Math.max(0, consumerBalance - transaction.hoursSpent));
      this.userBankHours.set(transaction.providerId, providerBalance + transaction.hoursSpent);
      
    } catch (error) {
      console.warn('Failed to complete transaction:', error);
    }
  }

  /**
   * Select active user based on activity level
   */
  private selectActiveUser(): User | null {
    const activeUsers = this.users.filter(user => {
      const activityLevel = this.userActivityLevels.get(user.id);
      if (activityLevel === 'inactive') return false;
      
      if (activityLevel === 'regular') return Math.random() < 0.8;
      if (activityLevel === 'casual') return Math.random() < 0.3;
      
      return false;
    });
    
    return activeUsers.length > 0 ? activeUsers[Math.floor(Math.random() * activeUsers.length)] : null;
  }

  /**
   * Determine transaction outcome
   */
  private determineTransactionOutcome(): string {
    const rand = Math.random();
    
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED) return 'COMPLETED';
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED + this.TRANSACTION_OUTCOMES.REJECTED) return 'REJECTED';
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED + this.TRANSACTION_OUTCOMES.REJECTED + this.TRANSACTION_OUTCOMES.CANCELLED) return 'CANCELLED';
    
    return 'PENDING';
  }

  /**
   * Generate business hour time
   */
  private generateBusinessHourTime(date: Date): Date {
    const hour = Math.floor(Math.random() * 9) + 9; // 9 AM - 6 PM
    const minute = Math.floor(Math.random() * 60);
    
    const time = new Date(date);
    time.setHours(hour, minute, 0, 0);
    return time;
  }

  /**
   * Generate completion time
   */
  private generateCompletionTime(baseDate: Date): Date {
    const daysToAdd = Math.floor(Math.random() * 4); // 0-3 days later
    const completionDate = new Date(baseDate);
    completionDate.setDate(completionDate.getDate() + daysToAdd);
    return this.generateBusinessHourTime(completionDate);
  }

  /**
   * Generate rating based on distribution
   */
  private generateRating(): number {
    const rand = Math.random();
    
    if (rand < this.RATING_DISTRIBUTION.FIVE_STAR) return 5;
    if (rand < this.RATING_DISTRIBUTION.FIVE_STAR + this.RATING_DISTRIBUTION.FOUR_STAR) return 4;
    if (rand < this.RATING_DISTRIBUTION.FIVE_STAR + this.RATING_DISTRIBUTION.FOUR_STAR + this.RATING_DISTRIBUTION.THREE_STAR) return 3;
    if (rand < this.RATING_DISTRIBUTION.FIVE_STAR + this.RATING_DISTRIBUTION.FOUR_STAR + this.RATING_DISTRIBUTION.THREE_STAR + this.RATING_DISTRIBUTION.TWO_STAR) return 2;
    
    return 1;
  }

  /**
   * Generate feedback based on rating
   */
  private generateFeedback(rating: number): string {
    const feedbackOptions = {
      5: ['Excellent service!', 'Highly recommended!', 'Perfect experience!', 'Outstanding work!'],
      4: ['Great service', 'Very satisfied', 'Good experience', 'Would recommend'],
      3: ['Decent service', 'Average experience', 'Okay overall', 'Met expectations'],
      2: ['Below expectations', 'Could be better', 'Some issues', 'Not great'],
      1: ['Poor service', 'Very disappointed', 'Many problems', 'Would not recommend']
    };
    
    const options = feedbackOptions[rating as keyof typeof feedbackOptions] || feedbackOptions[3];
    return options[Math.floor(Math.random() * options.length)];
  }
}

/**
 * Run the API simulation
 */
export async function runAPITransactionSimulation(): Promise<void> {
  const simulation = new APITransactionSimulation();
  await simulation.runSimulation();
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAPITransactionSimulation().catch(console.error);
} else {
  // Browser environment - make function available globally
  (window as any).runAPITransactionSimulation = runAPITransactionSimulation;
}
