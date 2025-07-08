import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
      const cognitoUser = await getCurrentUser();
      if (cognitoUser) {
        // Sync user mapping and get DynamoDB user data
        this.userMappingService.syncUserMapping(cognitoUser).subscribe({
          next: (mapping) => {
            // Fetch complete user data from DynamoDB using the mapped ID
            this.userService.getUser(mapping.dynamoDbUserId).subscribe({
              next: (dynamoUser) => {
                if (dynamoUser) {
                  // Use the complete user data from DynamoDB
                  this.currentUserSubject.next(dynamoUser);
                  this.isAuthenticatedSubject.next(true);
                } else {
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
      }
    } catch (error) {
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
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.userService.getUser(currentUser.id).pipe(
      map((updatedUser) => {
        if (updatedUser) {
          this.currentUserSubject.next(updatedUser);
        }
        return updatedUser;
      }),
      catchError((error) => {
        console.error('Failed to refresh user data:', error);
        return new Observable(observer => {
          observer.next(currentUser); // Return current user if refresh fails
          observer.complete();
        });
      })
    );
  }
}
