import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Observable, from, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { errorLogger } from '../utils/error-logger';
import { getAppConfig } from '../config/app-config';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

export interface UserMapping {
  cognitoUserId: string;    // Cognito User Pool ID (sub)
  dynamoDbUserId: string;   // DynamoDB User table ID
  email: string;
  username: string;
  createdAt: string;
  lastSyncAt: string;
}

export interface CognitoUserInfo {
  userId: string;           // Cognito User Pool ID
  username: string;
  email?: string | null;
  emailVerified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserMappingService {
  private client = generateClient();
  private config = getAppConfig();
  private userMappingCache = new BehaviorSubject<UserMapping | null>(null);
  public currentUserMapping$ = this.userMappingCache.asObservable();

  constructor() {
    this.initializeUserMapping();
  }

  /**
   * Initialize user mapping on service startup
   */
  private async initializeUserMapping(): Promise<void> {
    try {
      const cognitoUser = await getCurrentUser();
      if (cognitoUser) {
        this.syncUserMapping(cognitoUser).subscribe({
          next: (mapping) => {
            console.log('✅ User mapping initialized:', mapping);
          },
          error: (error) => {
            errorLogger.logError({
              error: error,
              context: {
                operation: 'initializeUserMapping',
                component: 'UserMappingService',
                additionalData: {
                  cognitoUserId: cognitoUser.userId,
                  username: cognitoUser.username
                }
              },
              severity: 'medium',
              category: 'auth'
            });
          }
        });
      }
    } catch (error) {
      // User not authenticated - this is normal
      console.log('No authenticated user found for mapping initialization');
    }
  }

  /**
   * Get current Cognito user information
   */
  getCurrentCognitoUser(): Observable<CognitoUserInfo | null> {
    return from(getCurrentUser()).pipe(
      switchMap(async (cognitoUser): Promise<CognitoUserInfo | null> => {
        if (!cognitoUser) return null;
        
        try {
          // Get user attributes to access preferred_username
          const session = await fetchAuthSession();
          const userAttributes = session.tokens?.idToken?.payload;
          
          // Helper function to safely extract string from token payload
          const extractString = (value: any): string | null => {
            return typeof value === 'string' ? value : null;
          };
          
          // Safely extract username with proper type handling
          const preferredUsername = extractString(userAttributes?.['preferred_username']);
          const cognitoUsername = extractString(userAttributes?.['cognito:username']);
          const email = extractString(userAttributes?.['email']);
          
          // Use preferred_username if available, otherwise fall back to username
          const displayUsername = preferredUsername || cognitoUsername || cognitoUser.username;
          const userEmail = email || cognitoUser.signInDetails?.loginId || null;
          
          return {
            userId: cognitoUser.userId,
            username: displayUsername,
            email: userEmail,
            emailVerified: true // Assume verified if they can sign in
          };
        } catch (error) {
          // Fallback to basic user info if session fetch fails
          return {
            userId: cognitoUser.userId,
            username: cognitoUser.username,
            email: cognitoUser.signInDetails?.loginId || null,
            emailVerified: true
          };
        }
      }),
      catchError((error) => {
        errorLogger.logAuthError('getCurrentCognitoUser', error, undefined, {
          operation: 'getCurrentUser',
          context: 'UserMappingService'
        });
        return of(null);
      })
    );
  }

  /**
   * Sync user mapping between Cognito and DynamoDB
   */
  syncUserMapping(cognitoUser?: any): Observable<UserMapping> {
    return this.getCurrentCognitoUser().pipe(
      switchMap((cognitoUserInfo) => {
        if (!cognitoUserInfo) {
          throw new Error('No authenticated Cognito user found');
        }

        // First, try to find existing mapping by Cognito ID
        return this.findUserByCognitoId(cognitoUserInfo.userId).pipe(
          switchMap((existingUser) => {
            if (existingUser) {
              // User exists in DynamoDB, update mapping cache
              const mapping: UserMapping = {
                cognitoUserId: cognitoUserInfo.userId,
                dynamoDbUserId: existingUser.id,
                email: existingUser.email,
                username: existingUser.username,
                createdAt: existingUser.createdAt,
                lastSyncAt: new Date().toISOString()
              };
              
              this.userMappingCache.next(mapping);
              return of(mapping);
            } else {
              // User doesn't exist in DynamoDB, create new user
              return this.createDynamoDbUser(cognitoUserInfo);
            }
          })
        );
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'syncUserMapping',
            component: 'UserMappingService',
            additionalData: {
              cognitoUser: cognitoUser ? {
                userId: cognitoUser.userId,
                username: cognitoUser.username
              } : null
            }
          },
          severity: 'high',
          category: 'auth'
        });
        throw error;
      })
    );
  }

  /**
   * Find user in DynamoDB by Cognito ID
   * We'll search by username since that's typically the link
   */
  private findUserByCognitoId(cognitoUserId: string): Observable<any> {
    // First try to find by a cognitoId field if it exists
    return from(this.client.graphql({
      query: `
        query FindUserByCognitoId($cognitoId: String!) {
          listUsers(filter: { cognitoId: { eq: $cognitoId } }) {
            items {
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
              cognitoId
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: { cognitoId: cognitoUserId }
    })).pipe(
      map((result: any) => {
        const users = result.data?.listUsers?.items || [];
        return users.length > 0 ? users[0] : null;
      }),
      catchError((error) => {
        // If cognitoId field doesn't exist, try finding by username
        console.log('CognitoId field not found, trying username lookup');
        return this.findUserByUsername(cognitoUserId);
      })
    );
  }

  /**
   * Find user by username (fallback method)
   */
  private findUserByUsername(username: string): Observable<any> {
    return from(this.client.graphql({
      query: queries.usersByUsername,
      variables: { username: username }
    })).pipe(
      map((result: any) => {
        const users = result.data?.usersByUsername?.items || [];
        return users.length > 0 ? users[0] : null;
      }),
      catchError((error) => {
        errorLogger.logApiError('/graphql', 'POST', error, {
          query: 'usersByUsername',
          variables: { username }
        });
        return of(null);
      })
    );
  }

  /**
   * Create new DynamoDB user from Cognito user info
   */
  private createDynamoDbUser(cognitoUserInfo: CognitoUserInfo): Observable<UserMapping> {
    const newUser = {
      email: cognitoUserInfo.email || `${cognitoUserInfo.username}@example.com`,
      username: cognitoUserInfo.username,
      firstName: 'User', // Default values
      lastName: 'Name',
      bankHours: this.config.user.defaultBankHours,
      skills: [],
      bio: 'Welcome to HourBank!',
      rating: this.config.user.defaultRating,
      totalTransactions: this.config.user.defaultTotalTransactions,
      cognitoId: cognitoUserInfo.userId // Store the mapping
    };

    return from(this.client.graphql({
      query: mutations.createUser,
      variables: { input: newUser }
    })).pipe(
      map((result: any) => {
        const createdUser = result.data?.createUser;
        if (!createdUser) {
          throw new Error('Failed to create DynamoDB user');
        }

        const mapping: UserMapping = {
          cognitoUserId: cognitoUserInfo.userId,
          dynamoDbUserId: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
          createdAt: createdUser.createdAt,
          lastSyncAt: new Date().toISOString()
        };

        this.userMappingCache.next(mapping);
        
        errorLogger.logError({
          error: 'User mapping created successfully',
          context: {
            operation: 'createDynamoDbUser',
            component: 'UserMappingService',
            additionalData: {
              mapping,
              newUserData: newUser
            }
          },
          severity: 'low',
          category: 'user'
        });

        return mapping;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'createDynamoDbUser',
            component: 'UserMappingService',
            additionalData: {
              cognitoUserInfo,
              newUserData: newUser,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              }
            }
          },
          severity: 'critical',
          category: 'user'
        });
        throw error;
      })
    );
  }

  /**
   * Get DynamoDB user ID from Cognito user ID
   */
  getDynamoDbUserId(cognitoUserId?: string): Observable<string | null> {
    if (cognitoUserId) {
      return this.findUserByCognitoId(cognitoUserId).pipe(
        map((user) => user ? user.id : null)
      );
    }

    // Use current user mapping
    return this.currentUserMapping$.pipe(
      map((mapping) => mapping ? mapping.dynamoDbUserId : null)
    );
  }

  /**
   * Get Cognito user ID from DynamoDB user ID
   */
  getCognitoUserId(dynamoDbUserId: string): Observable<string | null> {
    return from(this.client.graphql({
      query: queries.getUser,
      variables: { id: dynamoDbUserId }
    })).pipe(
      map((result: any) => {
        const user = result.data?.getUser;
        return user ? (user.cognitoId || user.username) : null;
      }),
      catchError((error) => {
        errorLogger.logApiError('/graphql', 'POST', error, {
          query: 'getUser',
          variables: { id: dynamoDbUserId }
        });
        return of(null);
      })
    );
  }

  /**
   * Get current user's DynamoDB ID
   */
  getCurrentUserDynamoDbId(): Observable<string | null> {
    return this.currentUserMapping$.pipe(
      switchMap((mapping) => {
        if (mapping) {
          return of(mapping.dynamoDbUserId);
        }

        // No cached mapping, try to sync
        return this.syncUserMapping().pipe(
          map((newMapping) => newMapping.dynamoDbUserId),
          catchError(() => of(null))
        );
      })
    );
  }

  /**
   * Clear user mapping cache (for sign out)
   */
  clearUserMapping(): void {
    this.userMappingCache.next(null);
  }

  /**
   * Debug method to log current mapping state
   */
  debugMapping(): void {
    console.group('🔍 User Mapping Debug Info');
    
    this.getCurrentCognitoUser().subscribe({
      next: (cognitoUser) => {
        console.log('Cognito User:', cognitoUser);
      }
    });

    this.currentUserMapping$.subscribe({
      next: (mapping) => {
        console.log('Current Mapping:', mapping);
      }
    });

    console.groupEnd();
  }
}
