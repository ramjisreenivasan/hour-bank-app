import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, Service, Transaction, Booking } from '../models/user.model';
import { getAppConfig } from '../config/app-config';

export interface SimulationData {
  users: User[];
  services: Service[];
  transactions: Transaction[];
  bookings: Booking[];
}

@Injectable({
  providedIn: 'root'
})
export class SimulationDataService {
  private config = getAppConfig();
  private simulationDataSubject = new BehaviorSubject<SimulationData | null>(null);
  public simulationData$ = this.simulationDataSubject.asObservable();

  private isLoaded = false;

  constructor(private http: HttpClient) {}

  /**
   * Load simulation data from JSON files
   */
  loadSimulationData(): Observable<SimulationData> {
    if (this.isLoaded && this.simulationDataSubject.value) {
      return of(this.simulationDataSubject.value);
    }

    return this.http.get<SimulationData>('/assets/simulation-data/simulation-data.json')
      .pipe(
        map(data => {
          // Convert date strings back to Date objects
          data.users = data.users.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }));

          data.services = data.services.map(service => ({
            ...service,
            createdAt: new Date(service.createdAt),
            updatedAt: new Date(service.updatedAt)
          }));

          data.transactions = data.transactions.map(transaction => ({
            ...transaction,
            createdAt: new Date(transaction.createdAt),
            completedAt: transaction.completedAt ? new Date(transaction.completedAt) : undefined
          }));

          data.bookings = data.bookings.map(booking => ({
            ...booking,
            createdAt: new Date(booking.createdAt),
            confirmedAt: booking.confirmedAt ? new Date(booking.confirmedAt) : undefined,
            completedAt: booking.completedAt ? new Date(booking.completedAt) : undefined,
            cancelledAt: booking.cancelledAt ? new Date(booking.cancelledAt) : undefined,
            updatedAt: new Date(booking.updatedAt)
          }));

          this.simulationDataSubject.next(data);
          this.isLoaded = true;
          return data;
        }),
        catchError(error => {
          console.error('Error loading simulation data:', error);
          return of({
            users: [],
            services: [],
            transactions: [],
            bookings: []
          });
        })
      );
  }

  /**
   * Get all users from simulation data
   */
  getUsers(): Observable<User[]> {
    return this.simulationData$.pipe(
      map(data => data?.users || [])
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User | undefined> {
    return this.simulationData$.pipe(
      map(data => data?.users.find(user => user.id === id))
    );
  }

  /**
   * Get all services from simulation data
   */
  getServices(): Observable<Service[]> {
    return this.simulationData$.pipe(
      map(data => data?.services || [])
    );
  }

  /**
   * Get services by user ID
   */
  getServicesByUserId(userId: string): Observable<Service[]> {
    return this.simulationData$.pipe(
      map(data => data?.services.filter(service => service.userId === userId) || [])
    );
  }

  /**
   * Get all transactions from simulation data
   */
  getTransactions(): Observable<Transaction[]> {
    return this.simulationData$.pipe(
      map(data => data?.transactions || [])
    );
  }

  /**
   * Get transactions by user ID (as provider or consumer)
   */
  getTransactionsByUserId(userId: string): Observable<Transaction[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.transactions.filter(transaction => 
          transaction.providerId === userId || transaction.consumerId === userId
        ) || []
      )
    );
  }

  /**
   * Get transactions where user is the provider
   */
  getTransactionsAsProvider(userId: string): Observable<Transaction[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.transactions.filter(transaction => transaction.providerId === userId) || []
      )
    );
  }

  /**
   * Get transactions where user is the consumer
   */
  getTransactionsAsConsumer(userId: string): Observable<Transaction[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.transactions.filter(transaction => transaction.consumerId === userId) || []
      )
    );
  }

  /**
   * Get all bookings from simulation data
   */
  getBookings(): Observable<Booking[]> {
    return this.simulationData$.pipe(
      map(data => data?.bookings || [])
    );
  }

  /**
   * Get bookings by user ID (as provider or consumer)
   */
  getBookingsByUserId(userId: string): Observable<Booking[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.bookings.filter(booking => 
          booking.providerId === userId || booking.consumerId === userId
        ) || []
      )
    );
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(): Observable<{
    totalTransactions: number;
    totalHours: number;
    averageRating: number;
    categoryStats: { [category: string]: { count: number; totalHours: number } };
    topProviders: { user: User; earnings: number; transactionCount: number }[];
    topConsumers: { user: User; spending: number; transactionCount: number }[];
  }> {
    return this.simulationData$.pipe(
      map(data => {
        if (!data) {
          return {
            totalTransactions: 0,
            totalHours: 0,
            averageRating: 0,
            categoryStats: {},
            topProviders: [],
            topConsumers: []
          };
        }

        const { users, services, transactions } = data;

        // Basic stats
        const totalTransactions = transactions.length;
        const totalHours = transactions.reduce((sum, t) => sum + t.hoursSpent, 0);
        const averageRating = transactions.reduce((sum, t) => sum + (t.rating || 0), 0) / totalTransactions;

        // Category stats
        const categoryStats: { [category: string]: { count: number; totalHours: number } } = {};
        transactions.forEach(transaction => {
          const service = services.find(s => s.id === transaction.serviceId);
          if (service) {
            if (!categoryStats[service.category]) {
              categoryStats[service.category] = { count: 0, totalHours: 0 };
            }
            categoryStats[service.category].count++;
            categoryStats[service.category].totalHours += transaction.hoursSpent;
          }
        });

        // Top providers
        const providerStats: { [userId: string]: { earnings: number; transactionCount: number } } = {};
        transactions.forEach(transaction => {
          if (!providerStats[transaction.providerId]) {
            providerStats[transaction.providerId] = { earnings: 0, transactionCount: 0 };
          }
          providerStats[transaction.providerId].earnings += transaction.hoursSpent;
          providerStats[transaction.providerId].transactionCount++;
        });

        const topProviders = Object.entries(providerStats)
          .map(([userId, stats]) => ({
            user: users.find(u => u.id === userId)!,
            earnings: stats.earnings,
            transactionCount: stats.transactionCount
          }))
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5);

        // Top consumers
        const consumerStats: { [userId: string]: { spending: number; transactionCount: number } } = {};
        transactions.forEach(transaction => {
          if (!consumerStats[transaction.consumerId]) {
            consumerStats[transaction.consumerId] = { spending: 0, transactionCount: 0 };
          }
          consumerStats[transaction.consumerId].spending += transaction.hoursSpent;
          consumerStats[transaction.consumerId].transactionCount++;
        });

        const topConsumers = Object.entries(consumerStats)
          .map(([userId, stats]) => ({
            user: users.find(u => u.id === userId)!,
            spending: stats.spending,
            transactionCount: stats.transactionCount
          }))
          .sort((a, b) => b.spending - a.spending)
          .slice(0, 5);

        return {
          totalTransactions,
          totalHours,
          averageRating,
          categoryStats,
          topProviders,
          topConsumers
        };
      })
    );
  }

  /**
   * Get recent transactions (last N transactions)
   */
  getRecentTransactions(limit: number = this.config.ui.recentTransactionsLimit): Observable<Transaction[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.transactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit) || []
      )
    );
  }

  /**
   * Search services by title, description, or tags
   */
  searchServices(query: string): Observable<Service[]> {
    return this.simulationData$.pipe(
      map(data => {
        if (!data || !query.trim()) return data?.services || [];
        
        const searchTerm = query.toLowerCase();
        return data.services.filter(service =>
          service.title.toLowerCase().includes(searchTerm) ||
          service.description.toLowerCase().includes(searchTerm) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          service.category.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string): Observable<Service[]> {
    return this.simulationData$.pipe(
      map(data => 
        data?.services.filter(service => service.category === category) || []
      )
    );
  }

  /**
   * Get unique service categories
   */
  getServiceCategories(): Observable<string[]> {
    return this.simulationData$.pipe(
      map(data => {
        if (!data) return [];
        const categories = [...new Set(data.services.map(service => service.category))];
        return categories.sort();
      })
    );
  }
}
