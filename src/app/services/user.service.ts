import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { errorLogger } from '../utils/error-logger';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private client = generateClient();

  constructor() {}

  /**
   * Get user by ID with comprehensive error logging
   */
  getUser(userId: string): Observable<User | null> {
    return from(this.client.graphql({
      query: queries.getUser,
      variables: { id: userId }
    })).pipe(
      map((result: any) => {
        if (!result.data?.getUser) {
          // Log "User not found" error with context
          errorLogger.logUserNotFound(
            userId,
            'getUser',
            'UserService',
            {
              queryType: 'getUser',
              requestedFields: ['id', 'email', 'username', 'firstName', 'lastName'],
              searchCriteria: { id: userId },
              timestamp: new Date().toISOString()
            }
          );
          return null;
        }
        return result.data.getUser as User;
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'getUser',
            variables: { id: userId }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to get user ${userId}: ${error.message}`));
      })
    );
  }

  /**
   * Get user by email with error logging
   */
  getUserByEmail(email: string): Observable<User | null> {
    return from(this.client.graphql({
      query: queries.usersByEmail,
      variables: { email: email }
    })).pipe(
      map((result: any) => {
        const users = result.data?.usersByEmail?.items || [];
        if (users.length === 0) {
          errorLogger.logUserNotFound(
            email,
            'getUserByEmail',
            'UserService',
            {
              queryType: 'usersByEmail',
              searchCriteria: { email },
              resultCount: 0,
              timestamp: new Date().toISOString()
            }
          );
          return null;
        }
        return users[0] as User;
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'usersByEmail',
            variables: { email: email.replace(/(.{2}).*(@.*)/, '$1***$2') } // Mask email
          },
          error.response
        );
        return throwError(() => new Error(`Failed to get user by email: ${error.message}`));
      })
    );
  }

  /**
   * Update user profile with comprehensive error logging
   */
  updateUser(userId: string, updateData: Partial<User>): Observable<User> {
    const input = {
      id: userId,
      ...updateData
    };

    return from(this.client.graphql({
      query: mutations.updateUser,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.updateUser) {
          errorLogger.logError({
            error: new Error(`Update user failed: No data returned for user ${userId}`),
            context: {
              userId,
              operation: 'updateUser',
              component: 'UserService',
              additionalData: {
                updateFields: Object.keys(updateData),
                inputData: input,
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'user'
          });
          throw new Error(`Failed to update user ${userId}`);
        }
        return result.data.updateUser as User;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId,
            operation: 'updateUser',
            component: 'UserService',
            additionalData: {
              updateFields: Object.keys(updateData),
              inputData: input,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'user'
        });
        return throwError(() => new Error(`Failed to update user ${userId}: ${error.message}`));
      })
    );
  }

  /**
   * Create user with error logging
   */
  createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Observable<User> {
    return from(this.client.graphql({
      query: mutations.createUser,
      variables: { input: userData }
    })).pipe(
      map((result: any) => {
        if (!result.data?.createUser) {
          errorLogger.logError({
            error: new Error('Create user failed: No data returned'),
            context: {
              operation: 'createUser',
              component: 'UserService',
              additionalData: {
                inputData: {
                  ...userData,
                  email: userData.email?.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email
                },
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'user'
          });
          throw new Error('Failed to create user');
        }
        return result.data.createUser as User;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'createUser',
            component: 'UserService',
            additionalData: {
              inputData: {
                ...userData,
                email: userData.email?.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email
              },
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'user'
        });
        return throwError(() => new Error(`Failed to create user: ${error.message}`));
      })
    );
  }

  /**
   * List all users with error logging
   */
  listUsers(limit?: number, nextToken?: string): Observable<{items: User[], nextToken?: string}> {
    return from(this.client.graphql({
      query: queries.listUsers,
      variables: { limit, nextToken }
    })).pipe(
      map((result: any) => {
        const data = result.data?.listUsers;
        if (!data) {
          errorLogger.logError({
            error: new Error('List users failed: No data returned'),
            context: {
              operation: 'listUsers',
              component: 'UserService',
              additionalData: {
                queryParams: { limit, nextToken },
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'user'
          });
          return { items: [], nextToken: undefined };
        }
        return {
          items: data.items || [],
          nextToken: data.nextToken
        };
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'listUsers',
            variables: { limit, nextToken }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to list users: ${error.message}`));
      })
    );
  }

  /**
   * Delete user with error logging
   */
  deleteUser(userId: string): Observable<boolean> {
    return from(this.client.graphql({
      query: mutations.deleteUser,
      variables: { input: { id: userId } }
    })).pipe(
      map((result: any) => {
        if (!result.data?.deleteUser) {
          errorLogger.logError({
            error: new Error(`Delete user failed: No confirmation for user ${userId}`),
            context: {
              userId,
              operation: 'deleteUser',
              component: 'UserService',
              additionalData: {
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'user'
          });
          return false;
        }
        return true;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId,
            operation: 'deleteUser',
            component: 'UserService',
            additionalData: {
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'critical',
          category: 'user'
        });
        return throwError(() => new Error(`Failed to delete user ${userId}: ${error.message}`));
      })
    );
  }
}
