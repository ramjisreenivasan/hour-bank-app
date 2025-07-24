import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { signUp, signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { User } from '../models/user.model';
import { UserMappingService } from './user-mapping.service';
import { UserService } from './user.service';
import { errorLogger } from '../utils/error-logger';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private userMappingService: UserMappingService,
    private userService: UserService
  ) {
    this.checkAuthStatus();
  }

  async checkAuthStatus(): Promise<void> {
    try {
      console.log('Checking auth status...');
      const cognitoUser = await getCurrentUser();
      if (cognitoUser) {
        console.log('Cognito user found:', cognitoUser.username);
        // Sync user mapping and get DynamoDB user data
        this.userMappingService.syncUserMapping(cognitoUser).subscribe({
          next: (mapping) => {
            console.log('User mapping synced:', mapping);
            // Fetch complete user data from DynamoDB using the mapped ID
            this.userService.getUser(mapping.dynamoDbUserId).subscribe({
              next: (dynamoUser) => {
                if (dynamoUser) {
                  console.log('DynamoDB user data loaded');
                  // Use the complete user data from DynamoDB
                  this.currentUserSubject.next(dynamoUser);
                  this.isAuthenticatedSubject.next(true);
                } else {
                  console.log('Creating fallback user data');
                  // Fallback: create minimal user object if DynamoDB fetch fails
                  const userData: User = {
                    id: mapping.dynamoDbUserId,
                    email: mapping.email,
                    username: mapping.username,
                    firstName: '',
                    lastName: '',
                    bankHours: 10,
                    skills: [],
                    rating: 0,
                    totalTransactions: 0,
                    cognitoId: mapping.cognitoUserId,
                    createdAt: new Date(mapping.createdAt),
                    updatedAt: new Date(mapping.lastSyncAt)
                  };
                  
                  this.currentUserSubject.next(userData);
                  this.isAuthenticatedSubject.next(true);
                }
              },
              error: (error) => {
                console.error('Failed to fetch user from DynamoDB:', error);
                // Fallback: create minimal user object
                const userData: User = {
                  id: mapping.dynamoDbUserId,
                  email: mapping.email,
                  username: mapping.username,
                  firstName: '',
                  lastName: '',
                  bankHours: 10,
                  skills: [],
                  rating: 0,
                  totalTransactions: 0,
                  cognitoId: mapping.cognitoUserId,
                  createdAt: new Date(mapping.createdAt),
                  updatedAt: new Date(mapping.lastSyncAt)
                };
                
                this.currentUserSubject.next(userData);
                this.isAuthenticatedSubject.next(true);
              }
            });
          },
          error: (error) => {
            console.error('User mapping sync failed:', error);
            this.isAuthenticatedSubject.next(false);
            errorLogger.logAuthError(
              'checkAuthStatus_userMapping',
              error,
              cognitoUser.userId,
              {
                context: 'User mapping synchronization failed',
                cognitoUserId: cognitoUser.userId,
                username: cognitoUser.username,
                timestamp: new Date().toISOString()
              }
            );
          }
        });
      } else {
        console.log('No Cognito user found');
        this.isAuthenticatedSubject.next(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      this.isAuthenticatedSubject.next(false);
      errorLogger.logAuthError(
        'checkAuthStatus',
        error as Error,
        undefined,
        {
          context: 'Application startup',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          amplifyConfig: 'Auth configuration check'
        }
      );
    }
  }

  async signUp(email: string, password: string, username: string): Promise<any> {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: username
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      // First check if there's already a signed in user
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // If there's already a user signed in, sign them out first
          await signOut();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        }
      } catch (error) {
        // No user signed in, continue with sign in
      }

      const result = await signIn({
        username: email,
        password
      });
      
      if (result.isSignedIn) {
        await this.checkAuthStatus();
        
        // Wait for authentication state to be properly set
        return new Promise((resolve, reject) => {
          const subscription = this.isAuthenticated$.subscribe(isAuthenticated => {
            if (isAuthenticated) {
              subscription.unsubscribe();
              resolve();
            }
          });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            reject(new Error('Authentication state update timeout'));
          }, 10000);
        });
      }
    } catch (error: any) {
      // Handle specific "already signed in" error
      if (error.message && error.message.includes('already a signed in user')) {
        try {
          // Force sign out and try again
          await signOut();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          
          // Retry sign in
          const result = await signIn({
            username: email,
            password
          });
          
          if (result.isSignedIn) {
            await this.checkAuthStatus();
            
            // Wait for authentication state to be properly set
            return new Promise((resolve, reject) => {
              const subscription = this.isAuthenticated$.subscribe(isAuthenticated => {
                if (isAuthenticated) {
                  subscription.unsubscribe();
                  resolve();
                }
              });
              
              // Timeout after 10 seconds
              setTimeout(() => {
                subscription.unsubscribe();
                reject(new Error('Authentication state update timeout'));
              }, 10000);
            });
          }
        } catch (retryError) {
          errorLogger.logAuthError(
            'signIn_retry',
            retryError as Error,
            undefined,
            {
              email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
              errorType: 'retry_failed',
              originalError: error.message,
              retryAttempt: true,
              timestamp: new Date().toISOString()
            }
          );
          throw retryError;
        }
      } else {
        errorLogger.logAuthError(
          'signIn',
          error as Error,
          undefined,
          {
            email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
            errorType: error.name || 'unknown',
            errorCode: error.code || 'unknown',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        );
        throw error;
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.userMappingService.clearUserMapping(); // Clear user mapping cache
    } catch (error) {
      // Even if signOut fails, clear local state
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.userMappingService.clearUserMapping(); // Clear user mapping cache
      console.warn('Sign out error:', error);
    }
  }

  async forceSignOut(): Promise<void> {
    try {
      // Force sign out with global sign out
      await signOut({ global: true });
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      // Clear local state even if global sign out fails
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      console.warn('Force sign out error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Refresh current user data from DynamoDB
   * Useful after profile updates
   */
  refreshCurrentUser(): Observable<User | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of(null);
    }

    return this.userService.getUser(currentUser.id).pipe(
      map((updatedUser: User | null) => {
        if (updatedUser) {
          this.currentUserSubject.next(updatedUser);
        }
        return updatedUser;
      }),
      catchError((error) => {
        console.error('Failed to refresh user data:', error);
        return of(currentUser); // Return current user if refresh fails
      })
    );
  }
}
