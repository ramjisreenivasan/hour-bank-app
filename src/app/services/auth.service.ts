import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { signUp, signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
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
    private router: Router,
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

  async signUp(contact: string, password: string, username: string, contactMethod: 'email' | 'phone' = 'email'): Promise<any> {
    try {
      const userAttributes: any = {
        preferred_username: username // Store the chosen username as preferred_username
      };

      // Set the appropriate attribute based on contact method
      if (contactMethod === 'email') {
        userAttributes.email = contact;
      } else {
        // Ensure phone number is in E.164 format
        const formattedPhone = contact.startsWith('+') ? contact : `+1${contact.replace(/\D/g, '')}`;
        userAttributes.phone_number = formattedPhone;
      }

      const result = await signUp({
        username: contact, // Use contact (email/phone) as Cognito username since that's what Cognito expects
        password,
        options: {
          userAttributes
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmSignUp(contact: string, confirmationCode: string): Promise<any> {
    try {
      // Use the contact (email/phone) since that's what we used as Cognito username
      const result = await confirmSignUp({
        username: contact,
        confirmationCode
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async resendConfirmationCode(contact: string): Promise<any> {
    try {
      // Use the contact (email/phone) since that's what we used as Cognito username
      const result = await resendSignUpCode({
        username: contact
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signIn(emailOrUsername: string, password: string): Promise<void> {
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

      // Try to sign in with the provided input
      let signInResult;
      try {
        // First attempt: try as-is (works for email or preferred_username)
        signInResult = await signIn({
          username: emailOrUsername,
          password
        });
      } catch (firstError: any) {
        // If the first attempt fails, try different approaches
        if (emailOrUsername.includes('@')) {
          // If it's an email format, try extracting username part
          const possibleUsername = emailOrUsername.split('@')[0];
          try {
            signInResult = await signIn({
              username: possibleUsername,
              password
            });
          } catch (secondError) {
            // Both email and username part failed, throw original error
            throw firstError;
          }
        } else {
          // If it's not email format, it might be a preferred_username
          // Try to find the user's actual Cognito username by their preferred_username
          try {
            // Look up user by preferred_username in our database
            const userByUsername = await this.userMappingService.findUserByPreferredUsername(emailOrUsername);
            if (userByUsername && (userByUsername.cognitoId || userByUsername.email)) {
              // Try signing in with the found cognitoId (actual Cognito username) or fallback to email
              const cognitoUsername = userByUsername.cognitoId || userByUsername.email;
              signInResult = await signIn({
                username: cognitoUsername,
                password
              });
            } else {
              throw firstError;
            }
          } catch (lookupError) {
            // Lookup failed, throw original error
            throw firstError;
          }
        }
      }
      
      if (signInResult.isSignedIn) {
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
          
          // Retry sign in with original input
          const result = await signIn({
            username: emailOrUsername,
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
              emailOrUsername: emailOrUsername.includes('@') 
                ? emailOrUsername.replace(/(.{2}).*(@.*)/, '$1***$2') 
                : emailOrUsername.replace(/(.{2}).*/, '$1***'), // Mask for privacy
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
            emailOrUsername: emailOrUsername.includes('@') 
              ? emailOrUsername.replace(/(.{2}).*(@.*)/, '$1***$2') 
              : emailOrUsername.replace(/(.{2}).*/, '$1***'), // Mask for privacy
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
      
      // Redirect to auth page after successful sign out
      this.router.navigate(['/auth']);
    } catch (error) {
      // Even if signOut fails, clear local state and redirect
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.userMappingService.clearUserMapping(); // Clear user mapping cache
      console.warn('Sign out error:', error);
      
      // Still redirect to auth page even if there was an error
      this.router.navigate(['/auth']);
    }
  }

  async forceSignOut(): Promise<void> {
    try {
      // Force sign out with global sign out
      await signOut({ global: true });
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      
      // Redirect to auth page after successful force sign out
      this.router.navigate(['/auth']);
    } catch (error) {
      // Clear local state even if global sign out fails and redirect
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      console.warn('Force sign out error:', error);
      
      // Still redirect to auth page even if there was an error
      this.router.navigate(['/auth']);
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

  /**
   * Check if current user has admin privileges
   * Uses same logic as AdminGuard for consistency
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      const session = await fetchAuthSession();
      const cognitoUser = await getCurrentUser();
      
      // Check for admin group membership in Cognito
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
      const isAdminGroup = groups.includes('admin') || groups.includes('Admin');
      
      // Check for admin email patterns
      const adminEmails = [
        'admin@hourbank.com',
        'administrator@hourbank.com',
        'ramjisreenivasan@gmail.com'
      ];
      const userEmail = cognitoUser.signInDetails?.loginId || '';
      const isAdminEmail = adminEmails.includes(userEmail.toLowerCase());
      
      // Check for admin username patterns
      const username = cognitoUser.username || '';
      const isAdminUsername = username.toLowerCase().includes('admin');
      
      // Check for admin first name or last name
      const userAttributes = cognitoUser.signInDetails?.loginId ? session.tokens?.idToken?.payload : {};
      const firstName = (userAttributes?.['given_name'] || userAttributes?.['custom:firstName'] || '').toString().toLowerCase();
      const lastName = (userAttributes?.['family_name'] || userAttributes?.['custom:lastName'] || '').toString().toLowerCase();
      const isAdminName = firstName === 'admin' || lastName === 'admin';
      
      // Also check the current user from AuthService if available
      const authUser = this.getCurrentUser();
      const isAdminFirstName = authUser?.firstName?.toLowerCase() === 'admin';
      const isAdminLastName = authUser?.lastName?.toLowerCase() === 'admin';
      
      return isAdminGroup || isAdminEmail || isAdminUsername || isAdminName || isAdminFirstName || isAdminLastName;
    } catch (error) {
      console.error('Error checking admin privileges:', error);
      return false;
    }
  }
}
