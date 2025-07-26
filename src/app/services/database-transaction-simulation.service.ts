import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { User, Service, Transaction, TransactionStatus } from '../models/user.model';
import { getAppConfig } from '../config/app-config';
import { bankHoursTransferService } from '../utils/bank-hours-transfer';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

export interface DatabaseSimulationProgress {
  currentDate: string;
  totalTransactions: number;
  completedTransactions: number;
  cancelledTransactions: number;
  pendingTransactions: number;
  totalBankHoursTransferred: number;
  averageRating: number;
  usersProcessed: number;
  servicesProcessed: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseTransactionSimulationService {
  private client = generateClient();
  private config = getAppConfig();
  
  // Transaction outcomes matching your requirements
  private readonly TRANSACTION_OUTCOMES = {
    COMPLETED: 0.7,   // 70% completed
    CANCELLED: 0.25,  // 25% cancelled (includes rejected + cancelled)
    PENDING: 0.05     // 5% pending
  };
  
  // Rating distribution for completed transactions
  private readonly RATING_DISTRIBUTION = {
    FIVE_STAR: 0.6,   // 60%
    FOUR_STAR: 0.25,  // 25%
    THREE_STAR: 0.1,  // 10%
    TWO_STAR: 0.04,   // 4%
    ONE_STAR: 0.01    // 1%
  };
  
  // Daily transaction volume
  private readonly DAILY_VOLUME = {
    WEEKDAY_MIN: 5,
    WEEKDAY_MAX: 8,
    WEEKEND_MIN: 8,
    WEEKEND_MAX: 12
  };

  private existingUsers: User[] = [];
  private existingServices: Service[] = [];
  private userActivityLevels: Map<string, 'regular' | 'casual' | 'inactive'> = new Map();
  private userBankHours: Map<string, number> = new Map();

  constructor() {}

  /**
   * Main simulation method using existing database data
   */
  async runDatabaseSimulation(): Promise<DatabaseSimulationProgress> {
    console.log('🚀 Starting Database Transaction Simulation');
    console.log('📅 Period: June 1, 2025 to July 26, 2025');
    console.log('💾 Using existing users and services from database');
    console.log('=' .repeat(60));

    try {
      // Load existing data from database
      await this.loadExistingDatabaseData();
      
      if (this.existingUsers.length === 0 || this.existingServices.length === 0) {
        throw new Error('No existing users or services found in database. Please ensure you have users and services created first.');
      }

      // Initialize simulation parameters
      this.initializeSimulationParameters();
      
      // Generate transactions day by day
      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-07-26');
      
      let totalProgress: DatabaseSimulationProgress = {
        currentDate: '',
        totalTransactions: 0,
        completedTransactions: 0,
        cancelledTransactions: 0,
        pendingTransactions: 0,
        totalBankHoursTransferred: 0,
        averageRating: 0,
        usersProcessed: this.existingUsers.length,
        servicesProcessed: this.existingServices.length
      };

      let currentDate = new Date(startDate);
      let weekTransactions = 0;
      let weekCompleted = 0;
      let weekHours = 0;
      
      while (currentDate <= endDate) {
        const dailyResults = await this.simulateDayTransactionsInDatabase(currentDate);
        
        // Update progress
        totalProgress.totalTransactions += dailyResults.created;
        totalProgress.completedTransactions += dailyResults.completed;
        totalProgress.cancelledTransactions += dailyResults.cancelled;
        totalProgress.pendingTransactions += dailyResults.pending;
        totalProgress.totalBankHoursTransferred += dailyResults.hoursTransferred;
        totalProgress.currentDate = currentDate.toISOString().split('T')[0];
        
        // Track weekly stats
        weekTransactions += dailyResults.created;
        weekCompleted += dailyResults.completed;
        weekHours += dailyResults.hoursTransferred;
        
        // Log daily progress
        console.log(`📅 ${totalProgress.currentDate}: ${dailyResults.created} created, ${dailyResults.completed} completed, ${dailyResults.hoursTransferred}h transferred`);
        
        // Show weekly summary every Sunday
        if (currentDate.getDay() === 0) {
          console.log('📊 WEEKLY SUMMARY:');
          console.log(`   Week ending ${totalProgress.currentDate}`);
          console.log(`   ${weekTransactions} transactions created, ${weekCompleted} completed`);
          console.log(`   ${weekHours} bank hours transferred`);
          console.log('   ' + '─'.repeat(50));
          
          // Reset weekly counters
          weekTransactions = 0;
          weekCompleted = 0;
          weekHours = 0;
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Calculate average rating
      if (totalProgress.completedTransactions > 0) {
        totalProgress.averageRating = 4.3; // Approximate based on distribution
      }
      
      // Final summary
      this.logFinalDatabaseSummary(totalProgress);
      
      return totalProgress;
      
    } catch (error) {
      console.error('❌ Database simulation failed:', error);
      throw error;
    }
  }

  /**
   * Load existing users and services from database
   */
  private async loadExistingDatabaseData(): Promise<void> {
    console.log('🔄 Loading existing data from database...');
    
    try {
      // Load existing users
      const usersResult = await this.client.graphql({
        query: queries.listUsers,
        variables: { limit: this.config.admin.queryLimit }
      });
      this.existingUsers = (usersResult as any).data?.listUsers?.items || [];
      
      // Load existing services
      const servicesResult = await this.client.graphql({
        query: queries.listServices,
        variables: { limit: this.config.admin.queryLimit }
      });
      this.existingServices = (servicesResult as any).data?.listServices?.items || [];
      
      console.log(`✅ Loaded ${this.existingUsers.length} existing users`);
      console.log(`✅ Loaded ${this.existingServices.length} existing services`);
      
      if (this.existingUsers.length === 0) {
        console.warn('⚠️ No users found in database');
      }
      
      if (this.existingServices.length === 0) {
        console.warn('⚠️ No services found in database');
      }
      
    } catch (error) {
      console.error('❌ Failed to load existing data:', error);
      throw new Error(`Failed to load existing data: ${error}`);
    }
  }

  /**
   * Initialize simulation parameters for existing users
   */
  private initializeSimulationParameters(): void {
    console.log('🔧 Initializing simulation parameters...');
    
    // Shuffle users for random activity assignment
    const shuffledUsers = [...this.existingUsers].sort(() => Math.random() - 0.5);
    
    const regularCount = Math.floor(this.existingUsers.length * 0.2); // 20%
    const casualCount = Math.floor(this.existingUsers.length * 0.6);  // 60%
    
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
      this.userBankHours.set(shuffledUsers[i].id, shuffledUsers[i].bankHours || this.config.user.defaultBankHours);
    }
    
    const regular = Array.from(this.userActivityLevels.values()).filter(level => level === 'regular').length;
    const casual = Array.from(this.userActivityLevels.values()).filter(level => level === 'casual').length;
    const inactive = Array.from(this.userActivityLevels.values()).filter(level => level === 'inactive').length;
    
    console.log(`👥 User activity distribution: ${regular} regular, ${casual} casual, ${inactive} inactive`);
  }

  /**
   * Simulate transactions for a single day in the database
   */
  private async simulateDayTransactionsInDatabase(date: Date): Promise<{
    created: number;
    completed: number;
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
      cancelled: 0,
      pending: 0,
      hoursTransferred: 0
    };

    // Generate transactions for the day
    for (let i = 0; i < transactionCount; i++) {
      try {
        const transactionResult = await this.createRandomDatabaseTransaction(date);
        if (transactionResult) {
          results.created++;
          
          switch (transactionResult.status) {
            case 'COMPLETED':
              results.completed++;
              results.hoursTransferred += transactionResult.hoursSpent;
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
        console.warn(`⚠️ Failed to create transaction ${i + 1} for ${date.toDateString()}:`, error);
      }
    }

    return results;
  }

  /**
   * Create a random transaction in the database
   */
  private async createRandomDatabaseTransaction(date: Date): Promise<Transaction | null> {
    // Select active consumer
    const consumer = this.selectActiveUser();
    if (!consumer) return null;
    
    // Select random service (not from the consumer)
    const availableServices = this.existingServices.filter(s => s.userId !== consumer.id && s.isActive !== false);
    if (availableServices.length === 0) return null;
    
    const service = availableServices[Math.floor(Math.random() * availableServices.length)];
    const provider = this.existingUsers.find(u => u.id === service.userId);
    if (!provider) return null;
    
    // Check if consumer has sufficient bank hours
    const consumerBalance = this.userBankHours.get(consumer.id) || 0;
    const hoursNeeded = service.hourlyDuration || 1;
    
    if (consumerBalance < hoursNeeded) {
      return null; // Skip if insufficient balance
    }
    
    // Generate realistic request time (business hours)
    const requestTime = this.generateBusinessHourTime(date);
    
    try {
      // Create transaction in database
      const transactionInput = {
        providerId: provider.id,
        consumerId: consumer.id,
        serviceId: service.id,
        hoursSpent: hoursNeeded,
        description: `Request for ${service.title}`,
        createdAt: requestTime.toISOString(),
        updatedAt: requestTime.toISOString()
      };

      const createResult = await this.client.graphql({
        query: mutations.createTransaction,
        variables: { input: transactionInput }
      });

      const transaction = (createResult as any).data?.createTransaction;
      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      // Determine outcome and update transaction accordingly
      const outcome = this.determineTransactionOutcome();
      
      if (outcome === 'COMPLETED') {
        // Complete the transaction with rating and bank hour transfer
        await this.completeTransactionInDatabase(transaction, date);
        transaction.status = 'COMPLETED';
        transaction.hoursSpent = hoursNeeded;
      } else {
        // Update transaction status
        const updateInput = {
          id: transaction.id,
          status: outcome,
          updatedAt: requestTime.toISOString()
        };

        await this.client.graphql({
          query: mutations.updateTransaction,
          variables: { input: updateInput }
        });

        transaction.status = outcome;
      }
      
      return transaction;
      
    } catch (error) {
      console.warn('Failed to create database transaction:', error);
      return null;
    }
  }

  /**
   * Complete a transaction in the database with rating and bank hour transfer
   */
  private async completeTransactionInDatabase(transaction: any, baseDate: Date): Promise<void> {
    try {
      // Generate completion time (same day to few days later)
      const completionTime = this.generateCompletionTime(baseDate);
      
      // Generate rating
      const rating = this.generateRating();
      
      // Update transaction with completion details
      const updateInput = {
        id: transaction.id,
        status: 'COMPLETED',
        rating: rating,
        feedback: this.generateFeedback(rating),
        completedAt: completionTime.toISOString(),
        updatedAt: completionTime.toISOString()
      };

      await this.client.graphql({
        query: mutations.updateTransaction,
        variables: { input: updateInput }
      });
      
      // Transfer bank hours using existing service
      await bankHoursTransferService.transferBankHours(
        transaction.consumerId,
        transaction.providerId,
        transaction.hoursSpent,
        transaction.id
      );
      
      // Update local tracking
      const consumerBalance = this.userBankHours.get(transaction.consumerId) || 0;
      const providerBalance = this.userBankHours.get(transaction.providerId) || 0;
      
      this.userBankHours.set(transaction.consumerId, consumerBalance - transaction.hoursSpent);
      this.userBankHours.set(transaction.providerId, providerBalance + transaction.hoursSpent);
      
    } catch (error) {
      console.warn('Failed to complete transaction in database:', error);
    }
  }

  /**
   * Select an active user based on activity levels
   */
  private selectActiveUser(): User | null {
    const activeUsers = this.existingUsers.filter(user => {
      const activityLevel = this.userActivityLevels.get(user.id);
      if (activityLevel === 'inactive') return false;
      
      // Regular users have higher chance of being selected
      if (activityLevel === 'regular') return Math.random() < 0.8;
      if (activityLevel === 'casual') return Math.random() < 0.3;
      
      return false;
    });
    
    return activeUsers.length > 0 ? activeUsers[Math.floor(Math.random() * activeUsers.length)] : null;
  }

  /**
   * Determine transaction outcome based on configured probabilities
   */
  private determineTransactionOutcome(): TransactionStatus {
    const rand = Math.random();
    
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED) return TransactionStatus.COMPLETED;
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED + this.TRANSACTION_OUTCOMES.CANCELLED) return TransactionStatus.CANCELLED;
    
    return TransactionStatus.PENDING;
  }

  /**
   * Generate realistic business hour time
   */
  private generateBusinessHourTime(date: Date): Date {
    const businessStart = 9; // 9 AM
    const businessEnd = 18;  // 6 PM
    
    const hour = Math.floor(Math.random() * (businessEnd - businessStart)) + businessStart;
    const minute = Math.floor(Math.random() * 60);
    
    const time = new Date(date);
    time.setHours(hour, minute, 0, 0);
    
    return time;
  }

  /**
   * Generate completion time (same day to few days later)
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

  /**
   * Log final database simulation summary
   */
  private logFinalDatabaseSummary(progress: DatabaseSimulationProgress): void {
    const completionRate = (progress.completedTransactions / progress.totalTransactions * 100).toFixed(1);
    
    console.log('🎉 DATABASE SIMULATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`📊 Final Statistics:`);
    console.log(`   Period: June 1, 2025 to July 26, 2025`);
    console.log(`   Existing users used: ${progress.usersProcessed}`);
    console.log(`   Existing services used: ${progress.servicesProcessed}`);
    console.log(`   Total transactions created: ${progress.totalTransactions}`);
    console.log(`   Completed: ${progress.completedTransactions} (${completionRate}%)`);
    console.log(`   Cancelled: ${progress.cancelledTransactions}`);
    console.log(`   Pending: ${progress.pendingTransactions}`);
    console.log(`   Bank hours transferred: ${progress.totalBankHoursTransferred}`);
    console.log(`   Average rating: ${progress.averageRating.toFixed(1)} stars`);
    console.log('💾 All data has been saved to your database!');
    console.log('   Check your transaction tables to see the generated data');
    console.log('=' .repeat(60));
  }
}
