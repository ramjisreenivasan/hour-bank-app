import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { Observable, from, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, Service, Transaction } from '../models/user.model';
import { errorLogger } from '../utils/error-logger';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

export interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalTransactions: number;
  totalBankHours: number;
  activeUsers: number;
  recentSignups: number;
}

export interface UserWithStats extends User {
  servicesCount: number;
  transactionsCount: number;
  lastActivity?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private client = generateClient();

  constructor() {}

  /**
   * Get comprehensive admin dashboard statistics
   */
  getAdminStats(): Observable<AdminStats> {
    const usersQuery = from(this.client.graphql({
      query: queries.listUsers,
      variables: { limit: 1000 }
    }));

    const servicesQuery = from(this.client.graphql({
      query: queries.listServices,
      variables: { limit: 1000 }
    }));

    const transactionsQuery = from(this.client.graphql({
      query: queries.listTransactions,
      variables: { limit: 1000 }
    }));

    return forkJoin({
      users: usersQuery,
      services: servicesQuery,
      transactions: transactionsQuery
    }).pipe(
      map((results: any) => {
        const users = results.users.data?.listUsers?.items || [];
        const services = results.services.data?.listServices?.items || [];
        const transactions = results.transactions.data?.listTransactions?.items || [];

        // Calculate statistics
        const totalBankHours = users.reduce((sum: number, user: User) => sum + (user.bankHours || 0), 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSignups = users.filter((user: User) => 
          new Date(user.createdAt) > thirtyDaysAgo
        ).length;

        const activeUsers = users.filter((user: User) => 
          user.totalTransactions > 0 || services.some((service: Service) => service.userId === user.id)
        ).length;

        return {
          totalUsers: users.length,
          totalServices: services.length,
          totalTransactions: transactions.length,
          totalBankHours,
          activeUsers,
          recentSignups
        };
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'getAdminStats',
            component: 'AdminService',
            additionalData: {
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              timestamp: new Date().toISOString()
            }
          },
          severity: 'medium',
          category: 'admin'
        });
        return throwError(() => new Error(`Failed to get admin stats: ${error.message}`));
      })
    );
  }

  /**
   * Get all users with additional statistics for admin view
   */
  getAllUsersWithStats(): Observable<UserWithStats[]> {
    const usersQuery = from(this.client.graphql({
      query: queries.listUsers,
      variables: { limit: 1000 }
    }));

    const servicesQuery = from(this.client.graphql({
      query: queries.listServices,
      variables: { limit: 1000 }
    }));

    const transactionsQuery = from(this.client.graphql({
      query: queries.listTransactions,
      variables: { limit: 1000 }
    }));

    return forkJoin({
      users: usersQuery,
      services: servicesQuery,
      transactions: transactionsQuery
    }).pipe(
      map((results: any) => {
        const users = results.users.data?.listUsers?.items || [];
        const services = results.services.data?.listServices?.items || [];
        const transactions = results.transactions.data?.listTransactions?.items || [];

        return users.map((user: User) => {
          const userServices = services.filter((service: Service) => service.userId === user.id);
          const userTransactions = transactions.filter((transaction: Transaction) => 
            transaction.providerId === user.id || transaction.consumerId === user.id
          );

          // Determine user status
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const hasRecentActivity = userTransactions.some((transaction: Transaction) => 
            new Date(transaction.createdAt) > thirtyDaysAgo
          );

          const status = hasRecentActivity || userServices.length > 0 ? 'active' : 'inactive';

          // Find last activity
          const lastTransactionDate = userTransactions.length > 0 
            ? new Date(Math.max(...userTransactions.map((t: Transaction) => new Date(t.createdAt).getTime())))
            : undefined;

          return {
            ...user,
            servicesCount: userServices.length,
            transactionsCount: userTransactions.length,
            lastActivity: lastTransactionDate,
            status: status as 'active' | 'inactive' | 'suspended'
          };
        });
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'getAllUsersWithStats',
            component: 'AdminService',
            additionalData: {
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              timestamp: new Date().toISOString()
            }
          },
          severity: 'medium',
          category: 'admin'
        });
        return throwError(() => new Error(`Failed to get users with stats: ${error.message}`));
      })
    );
  }

  /**
   * Update user bank hours (admin only)
   */
  updateUserBankHours(userId: string, newBankHours: number, reason: string): Observable<User> {
    const input = {
      id: userId,
      bankHours: newBankHours
    };

    return from(this.client.graphql({
      query: mutations.updateUser,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.updateUser) {
          throw new Error(`Failed to update bank hours for user ${userId}`);
        }
        
        // Log admin action
        errorLogger.logError({
          error: new Error('Admin Action: Bank Hours Updated'),
          context: {
            operation: 'updateUserBankHours',
            component: 'AdminService',
            additionalData: {
              userId,
              newBankHours,
              reason,
              adminAction: true,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'low',
          category: 'admin'
        });

        return result.data.updateUser as User;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId,
            operation: 'updateUserBankHours',
            component: 'AdminService',
            additionalData: {
              newBankHours,
              reason,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'admin'
        });
        return throwError(() => new Error(`Failed to update bank hours: ${error.message}`));
      })
    );
  }

  /**
   * Suspend or activate a user (admin only)
   */
  updateUserStatus(userId: string, status: 'active' | 'suspended', reason: string): Observable<User> {
    // Note: This would require adding a status field to the User model
    // For now, we'll use a custom attribute or handle it differently
    const input = {
      id: userId,
      // Add status field when schema is updated
    };

    return from(this.client.graphql({
      query: mutations.updateUser,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.updateUser) {
          throw new Error(`Failed to update status for user ${userId}`);
        }
        
        // Log admin action
        errorLogger.logError({
          error: new Error(`Admin Action: User Status Changed to ${status}`),
          context: {
            operation: 'updateUserStatus',
            component: 'AdminService',
            additionalData: {
              userId,
              newStatus: status,
              reason,
              adminAction: true,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'medium',
          category: 'admin'
        });

        return result.data.updateUser as User;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId,
            operation: 'updateUserStatus',
            component: 'AdminService',
            additionalData: {
              newStatus: status,
              reason,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'admin'
        });
        return throwError(() => new Error(`Failed to update user status: ${error.message}`));
      })
    );
  }

  /**
   * Get detailed user information including all related data
   */
  getUserDetails(userId: string): Observable<any> {
    const userQuery = from(this.client.graphql({
      query: queries.getUser,
      variables: { id: userId }
    }));

    const userServicesQuery = from(this.client.graphql({
      query: queries.servicesByUserId,
      variables: { userId: userId }
    }));

    // Get transactions where user is provider
    const providerTransactionsQuery = from(this.client.graphql({
      query: queries.transactionsByProviderId,
      variables: { providerId: userId }
    }));

    // Get transactions where user is consumer
    const consumerTransactionsQuery = from(this.client.graphql({
      query: queries.transactionsByConsumerId,
      variables: { consumerId: userId }
    }));

    return forkJoin({
      user: userQuery,
      services: userServicesQuery,
      providerTransactions: providerTransactionsQuery,
      consumerTransactions: consumerTransactionsQuery
    }).pipe(
      map((results: any) => {
        const providerTransactions = results.providerTransactions.data?.transactionsByProviderId?.items || [];
        const consumerTransactions = results.consumerTransactions.data?.transactionsByConsumerId?.items || [];
        const allTransactions = [...providerTransactions, ...consumerTransactions];

        return {
          user: results.user.data?.getUser,
          services: results.services.data?.servicesByUserId?.items || [],
          transactions: allTransactions
        };
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId,
            operation: 'getUserDetails',
            component: 'AdminService',
            additionalData: {
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              timestamp: new Date().toISOString()
            }
          },
          severity: 'medium',
          category: 'admin'
        });
        return throwError(() => new Error(`Failed to get user details: ${error.message}`));
      })
    );
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): Observable<any> {
    return this.getAdminStats().pipe(
      map((stats) => {
        const healthScore = this.calculateHealthScore(stats);
        return {
          ...stats,
          healthScore,
          status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
          lastChecked: new Date()
        };
      })
    );
  }

  private calculateHealthScore(stats: AdminStats): number {
    let score = 100;
    
    // Reduce score if no recent activity
    if (stats.recentSignups === 0) score -= 20;
    if (stats.activeUsers < stats.totalUsers * 0.3) score -= 30;
    if (stats.totalTransactions === 0) score -= 25;
    if (stats.totalServices === 0) score -= 25;
    
    return Math.max(0, score);
  }
}
