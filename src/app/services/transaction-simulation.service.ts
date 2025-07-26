import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { User, Service, Transaction, TransactionStatus } from '../models/user.model';
import { getAppConfig } from '../config/app-config';
import { UserGraphQLService } from './user-graphql.service';
import { TransactionGraphQLService } from './transaction-graphql.service';
import { DataSimulationService } from './data-simulation.service';
import { bankHoursTransferService } from '../utils/bank-hours-transfer';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

export interface SimulationProgress {
  currentDate: string;
  totalTransactions: number;
  completedTransactions: number;
  rejectedTransactions: number;
  cancelledTransactions: number;
  pendingTransactions: number;
  totalBankHoursTransferred: number;
  averageRating: number;
}

export interface DailySummary {
  date: string;
  transactionsCreated: number;
  transactionsCompleted: number;
  bankHoursTransferred: number;
  activeUsers: number;
  topServices: string[];
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalTransactions: number;
  completedTransactions: number;
  totalBankHoursTransferred: number;
  activeUsers: number;
  topCategories: { category: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionSimulationService {
  private client = generateClient();
  private config = getAppConfig();
  
  // User activity levels
  private readonly USER_ACTIVITY = {
    REGULAR: 0.2,    // 20% regular users
    CASUAL: 0.6,     // 60% casual users  
    INACTIVE: 0.2    // 20% inactive users
  };
  
  // Transaction outcomes
  private readonly TRANSACTION_OUTCOMES = {
    COMPLETED: 0.7,   // 70% completed
    REJECTED: 0.15,   // 15% rejected
    CANCELLED: 0.1,   // 10% cancelled
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

  private users: User[] = [];
  private services: Service[] = [];
  private userActivityLevels: Map<string, 'regular' | 'casual' | 'inactive'> = new Map();
  private userBankHours: Map<string, number> = new Map();

  constructor(
    private userGraphQLService: UserGraphQLService,
    private transactionGraphQLService: TransactionGraphQLService,
    private dataSimulationService: DataSimulationService
  ) {}

  /**
   * Main simulation method - generates transactions from June 2025 to today
   */
  async runSimulation(): Promise<SimulationProgress> {
    console.log('🚀 Starting HourBank Transaction Simulation');
    console.log('📅 Period: June 1, 2025 to July 26, 2025');
    console.log('=' .repeat(60));

    try {
      // Initialize data
      await this.initializeSimulationData();
      
      // Generate transactions day by day
      const startDate = new Date('2025-06-01');
      const endDate = new Date('2025-07-26');
      
      let totalProgress: SimulationProgress = {
        currentDate: '',
        totalTransactions: 0,
        completedTransactions: 0,
        rejectedTransactions: 0,
        cancelledTransactions: 0,
        pendingTransactions: 0,
        totalBankHoursTransferred: 0,
        averageRating: 0
      };

      const dailySummaries: DailySummary[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dailySummary = await this.simulateDayTransactions(currentDate);
        dailySummaries.push(dailySummary);
        
        // Update total progress
        totalProgress.totalTransactions += dailySummary.transactionsCreated;
        totalProgress.completedTransactions += dailySummary.transactionsCompleted;
        totalProgress.totalBankHoursTransferred += dailySummary.bankHoursTransferred;
        totalProgress.currentDate = dailySummary.date;
        
        // Show daily summary
        this.logDailySummary(dailySummary);
        
        // Show weekly summary every Sunday
        if (currentDate.getDay() === 0 && dailySummaries.length >= 7) {
          const weekSummaries = dailySummaries.slice(-7);
          this.logWeeklySummary(weekSummaries);
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Final summary
      this.logFinalSummary(totalProgress, dailySummaries);
      
      return totalProgress;
      
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Initialize users, services, and activity levels
   */
  private async initializeSimulationData(): Promise<void> {
    console.log('🔄 Initializing simulation data...');
    
    // Load existing users and services
    await this.loadExistingData();
    
    // Create additional test data if needed
    await this.ensureMinimumTestData();
    
    // Assign activity levels to users
    this.assignUserActivityLevels();
    
    // Initialize bank hour tracking
    this.initializeBankHourTracking();
    
    console.log(`✅ Initialized with ${this.users.length} users and ${this.services.length} services`);
    console.log(`👥 User distribution: ${this.getUserDistributionSummary()}`);
  }

  /**
   * Load existing users and services from the database
   */
  private async loadExistingData(): Promise<void> {
    try {
      // Load users
      const usersResult = await this.client.graphql({
        query: queries.listUsers,
        variables: { limit: this.config.admin.queryLimit }
      });
      this.users = (usersResult as any).data?.listUsers?.items || [];
      
      // Load services
      const servicesResult = await this.client.graphql({
        query: queries.listServices,
        variables: { limit: this.config.admin.queryLimit }
      });
      this.services = (servicesResult as any).data?.listServices?.items || [];
      
    } catch (error) {
      console.warn('⚠️ Could not load existing data, will use simulation data:', error);
      // Fallback to simulation data
      const simulationData = this.dataSimulationService.getSimulatedData();
      this.users = simulationData.users;
      this.services = simulationData.services;
    }
  }

  /**
   * Ensure we have minimum test data for simulation
   */
  private async ensureMinimumTestData(): Promise<void> {
    const minUsers = 20;
    const minServices = 30;
    
    // Add more users if needed
    if (this.users.length < minUsers) {
      const additionalUsers = this.dataSimulationService.generateAdditionalUsers(minUsers - this.users.length);
      this.users.push(...additionalUsers);
    }
    
    // Add more services if needed
    if (this.services.length < minServices) {
      const additionalServices = this.dataSimulationService.generateAdditionalServices(
        minServices - this.services.length,
        this.users
      );
      this.services.push(...additionalServices);
    }
  }

  /**
   * Assign activity levels to users
   */
  private assignUserActivityLevels(): void {
    const shuffledUsers = [...this.users].sort(() => Math.random() - 0.5);
    
    const regularCount = Math.floor(this.users.length * this.USER_ACTIVITY.REGULAR);
    const casualCount = Math.floor(this.users.length * this.USER_ACTIVITY.CASUAL);
    
    // Assign regular users
    for (let i = 0; i < regularCount; i++) {
      this.userActivityLevels.set(shuffledUsers[i].id, 'regular');
    }
    
    // Assign casual users
    for (let i = regularCount; i < regularCount + casualCount; i++) {
      this.userActivityLevels.set(shuffledUsers[i].id, 'casual');
    }
    
    // Remaining are inactive
    for (let i = regularCount + casualCount; i < shuffledUsers.length; i++) {
      this.userActivityLevels.set(shuffledUsers[i].id, 'inactive');
    }
  }

  /**
   * Initialize bank hour tracking for realistic economy
   */
  private initializeBankHourTracking(): void {
    this.users.forEach(user => {
      this.userBankHours.set(user.id, user.bankHours || this.config.user.defaultBankHours);
    });
  }

  /**
   * Simulate transactions for a single day
   */
  private async simulateDayTransactions(date: Date): Promise<DailySummary> {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const minTransactions = isWeekend ? this.DAILY_VOLUME.WEEKEND_MIN : this.DAILY_VOLUME.WEEKDAY_MIN;
    const maxTransactions = isWeekend ? this.DAILY_VOLUME.WEEKEND_MAX : this.DAILY_VOLUME.WEEKDAY_MAX;
    
    const transactionCount = Math.floor(Math.random() * (maxTransactions - minTransactions + 1)) + minTransactions;
    
    const dailySummary: DailySummary = {
      date: date.toISOString().split('T')[0],
      transactionsCreated: 0,
      transactionsCompleted: 0,
      bankHoursTransferred: 0,
      activeUsers: 0,
      topServices: []
    };

    const activeUsersToday = new Set<string>();
    const serviceUsageCount = new Map<string, number>();

    // Generate transactions for the day
    for (let i = 0; i < transactionCount; i++) {
      try {
        const transaction = await this.createRandomTransaction(date);
        if (transaction) {
          dailySummary.transactionsCreated++;
          activeUsersToday.add(transaction.consumerId);
          activeUsersToday.add(transaction.providerId);
          
          // Track service usage
          const service = this.services.find(s => s.id === transaction.serviceId);
          if (service) {
            serviceUsageCount.set(service.title, (serviceUsageCount.get(service.title) || 0) + 1);
          }
          
          // Process transaction outcome
          const outcome = this.determineTransactionOutcome();
          if (outcome === 'completed') {
            await this.completeTransaction(transaction, date);
            dailySummary.transactionsCompleted++;
            dailySummary.bankHoursTransferred += transaction.hoursSpent;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create transaction ${i + 1} for ${date.toDateString()}:`, error);
      }
    }

    dailySummary.activeUsers = activeUsersToday.size;
    dailySummary.topServices = Array.from(serviceUsageCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([service]) => service);

    return dailySummary;
  }

  /**
   * Create a random transaction between users
   */
  private async createRandomTransaction(date: Date): Promise<Transaction | null> {
    // Select active consumer
    const consumer = this.selectActiveUser();
    if (!consumer) return null;
    
    // Select random service (not from the consumer)
    const availableServices = this.services.filter(s => s.userId !== consumer.id && s.isActive);
    if (availableServices.length === 0) return null;
    
    const service = availableServices[Math.floor(Math.random() * availableServices.length)];
    const provider = this.users.find(u => u.id === service.userId);
    if (!provider) return null;
    
    // Check if consumer has sufficient bank hours
    const consumerBalance = this.userBankHours.get(consumer.id) || 0;
    if (consumerBalance < service.hourlyDuration) {
      return null; // Skip if insufficient balance
    }
    
    // Generate realistic request time (business hours)
    const requestTime = this.generateBusinessHourTime(date);
    
    try {
      const transaction = await this.transactionGraphQLService.createTransaction({
        providerId: provider.id,
        consumerId: consumer.id,
        serviceId: service.id,
        hoursSpent: service.hourlyDuration,
        description: `Request for ${service.title}`
      });
      
      return transaction;
    } catch (error) {
      console.warn('Failed to create transaction:', error);
      return null;
    }
  }

  /**
   * Select an active user based on activity levels
   */
  private selectActiveUser(): User | null {
    const activeUsers = this.users.filter(user => {
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
  private determineTransactionOutcome(): 'completed' | 'rejected' | 'cancelled' | 'pending' {
    const rand = Math.random();
    
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED) return 'completed';
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED + this.TRANSACTION_OUTCOMES.REJECTED) return 'rejected';
    if (rand < this.TRANSACTION_OUTCOMES.COMPLETED + this.TRANSACTION_OUTCOMES.REJECTED + this.TRANSACTION_OUTCOMES.CANCELLED) return 'cancelled';
    
    return 'pending';
  }

  /**
   * Complete a transaction with rating and bank hour transfer
   */
  private async completeTransaction(transaction: Transaction, baseDate: Date): Promise<void> {
    try {
      // Generate completion time (same day to few days later)
      const completionTime = this.generateCompletionTime(baseDate);
      
      // Generate rating
      const rating = this.generateRating();
      
      // Update transaction status
      await this.transactionGraphQLService.updateTransactionWithDetails(transaction.id, {
        status: 'COMPLETED' as TransactionStatus,
        rating: rating,
        feedback: this.generateFeedback(rating),
        updatedAt: completionTime
      });
      
      // Transfer bank hours
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
      console.warn('Failed to complete transaction:', error);
    }
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
   * Get user distribution summary
   */
  private getUserDistributionSummary(): string {
    const regular = Array.from(this.userActivityLevels.values()).filter(level => level === 'regular').length;
    const casual = Array.from(this.userActivityLevels.values()).filter(level => level === 'casual').length;
    const inactive = Array.from(this.userActivityLevels.values()).filter(level => level === 'inactive').length;
    
    return `Regular: ${regular}, Casual: ${casual}, Inactive: ${inactive}`;
  }

  /**
   * Log daily summary
   */
  private logDailySummary(summary: DailySummary): void {
    console.log(`📅 ${summary.date}: ${summary.transactionsCreated} created, ${summary.transactionsCompleted} completed, ${summary.bankHoursTransferred}h transferred, ${summary.activeUsers} active users`);
  }

  /**
   * Log weekly summary
   */
  private logWeeklySummary(weekSummaries: DailySummary[]): void {
    const totalTransactions = weekSummaries.reduce((sum, day) => sum + day.transactionsCreated, 0);
    const totalCompleted = weekSummaries.reduce((sum, day) => sum + day.transactionsCompleted, 0);
    const totalHours = weekSummaries.reduce((sum, day) => sum + day.bankHoursTransferred, 0);
    const uniqueUsers = new Set(weekSummaries.flatMap(day => [day.activeUsers])).size;
    
    console.log('📊 WEEKLY SUMMARY:');
    console.log(`   Week ending ${weekSummaries[weekSummaries.length - 1].date}`);
    console.log(`   ${totalTransactions} transactions created, ${totalCompleted} completed`);
    console.log(`   ${totalHours} bank hours transferred`);
    console.log(`   Average daily activity: ${(totalTransactions / 7).toFixed(1)} transactions`);
    console.log('   ' + '─'.repeat(50));
  }

  /**
   * Log final summary
   */
  private logFinalSummary(progress: SimulationProgress, dailySummaries: DailySummary[]): void {
    const totalDays = dailySummaries.length;
    const avgDaily = progress.totalTransactions / totalDays;
    const completionRate = (progress.completedTransactions / progress.totalTransactions * 100).toFixed(1);
    
    console.log('🎉 SIMULATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`📊 Final Statistics:`);
    console.log(`   Period: ${dailySummaries[0].date} to ${dailySummaries[dailySummaries.length - 1].date}`);
    console.log(`   Total transactions: ${progress.totalTransactions}`);
    console.log(`   Completed: ${progress.completedTransactions} (${completionRate}%)`);
    console.log(`   Bank hours transferred: ${progress.totalBankHoursTransferred}`);
    console.log(`   Average daily transactions: ${avgDaily.toFixed(1)}`);
    console.log(`   Total simulation days: ${totalDays}`);
    console.log('=' .repeat(60));
  }
}
