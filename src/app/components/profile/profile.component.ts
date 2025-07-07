import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserMappingService } from '../../services/user-mapping.service';
import { User } from '../../models/user.model';
import { ErrorHandlerComponent } from '../error-handler/error-handler.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { errorLogger } from '../../utils/error-logger';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorHandlerComponent, NavigationComponent],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>User Profile</h1>
      </div>

      <!-- Error Handler Component -->
      <app-error-handler
        [error]="currentError"
        [context]="errorContext"
        [severity]="errorSeverity"
        [category]="errorCategory"
        [retryable]="true"
        [onRetry]="retryLastAction.bind(this)"
        [onDismiss]="clearError.bind(this)">
      </app-error-handler>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Profile Content -->
      <div *ngIf="!loading && user" class="profile-content">
        <div class="profile-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              [(ngModel)]="user.firstName"
              class="form-control"
              (blur)="validateField('firstName')"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              [(ngModel)]="user.lastName"
              class="form-control"
              (blur)="validateField('lastName')"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="user.email"
              class="form-control"
              (blur)="validateField('email')"
            />
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              [(ngModel)]="user.bio"
              class="form-control"
              rows="4"
              (blur)="validateField('bio')"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="skills">Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              [value]="user.skills.join(', ')"
              (input)="updateSkills($event)"
              class="form-control"
              placeholder="JavaScript, React, Node.js"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="saveProfile()"
              [disabled]="saving"
              class="btn btn-primary"
            >
              <i class="fas fa-save"></i>
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>

            <button
              type="button"
              (click)="resetForm()"
              class="btn btn-secondary"
            >
              <i class="fas fa-undo"></i>
              Reset
            </button>
          </div>
        </div>

        <div class="profile-stats">
          <h3>Account Statistics</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ user.bankHours }}</span>
              <span class="stat-label">Bank Hours</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.rating }}</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.totalTransactions }}</span>
              <span class="stat-label">Transactions</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Authentication Required State -->
      <div *ngIf="!loading && !user && currentError && errorCategory === 'auth'" class="auth-required-container">
        <div class="auth-required-content">
          <i class="fas fa-user-lock"></i>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your profile or access user profiles.</p>
          <div class="auth-actions">
            <button (click)="navigateToAuth()" class="btn btn-primary">
              <i class="fas fa-sign-in-alt"></i>
              Sign In
            </button>
            <button (click)="navigateToDashboard()" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>

      <!-- No User Found State -->
      <div *ngIf="!loading && !user && !currentError" class="no-user-container">
        <div class="no-user-content">
          <i class="fas fa-user-slash"></i>
          <h2>Profile Not Found</h2>
          <p>The requested user profile could not be found.</p>
          <button (click)="navigateToDashboard()" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  originalUser: User | null = null;
  loading = false;
  saving = false;
  
  // Error handling properties
  currentError: Error | string | null = null;
  errorContext: any = {};
  errorSeverity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  errorCategory: 'user' | 'service' | 'transaction' | 'booking' | 'auth' | 'api' | 'ui' | 'system' = 'user';
  lastAction: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private userMappingService: UserMappingService
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      // Load specific user profile
      this.loadUserProfile(userId);
    } else {
      // No user ID provided - check if user is authenticated and load their own profile
      this.loadCurrentUserProfile();
    }
  }

  loadCurrentUserProfile() {
    this.lastAction = 'loadCurrentUserProfile';
    this.clearError();

    // Get current user's DynamoDB ID through mapping service
    this.userMappingService.getCurrentUserDynamoDbId().subscribe({
      next: (dynamoDbUserId) => {
        if (dynamoDbUserId) {
          // Load the current user's profile using DynamoDB ID
          this.loadUserProfile(dynamoDbUserId);
        } else {
          // User mapping not found - try to sync
          this.userMappingService.syncUserMapping().subscribe({
            next: (mapping) => {
              this.loadUserProfile(mapping.dynamoDbUserId);
            },
            error: (error) => {
              this.handleError(
                new Error('Please sign in to view your profile'),
                'loadCurrentUserProfile',
                {
                  authenticationRequired: true,
                  redirectSuggestion: '/auth',
                  currentUrl: window.location.href,
                  mappingError: error.message,
                  timestamp: new Date().toISOString()
                },
                'medium',
                'auth'
              );
            }
          });
        }
      },
      error: (error) => {
        this.handleError(
          error,
          'loadCurrentUserProfile',
          {
            userMappingService: 'getCurrentUserDynamoDbId failed',
            timestamp: new Date().toISOString()
          }
        );
      }
    });
  }

  loadUserProfile(userId: string) {
    this.loading = true;
    this.lastAction = 'loadUserProfile';
    this.clearError();

    this.userService.getUser(userId).subscribe({
      next: (user) => {
        this.loading = false;
        if (user) {
          this.user = { ...user };
          this.originalUser = { ...user };
        } else {
          // User not found - this will be logged by the UserService
          this.handleError(
            new Error(`User not found: ${userId}`),
            'loadUserProfile',
            {
              userId,
              searchType: 'byId',
              timestamp: new Date().toISOString()
            }
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.handleError(
          error,
          'loadUserProfile',
          {
            userId,
            operation: 'getUser',
            timestamp: new Date().toISOString()
          }
        );
      }
    });
  }

  saveProfile() {
    if (!this.user) return;

    this.saving = true;
    this.lastAction = 'saveProfile';
    this.clearError();

    // Log the save attempt
    errorLogger.logError({
      error: 'Profile save initiated',
      context: {
        userId: this.user.id,
        operation: 'saveProfile',
        component: 'ProfileComponent',
        additionalData: {
          changedFields: this.getChangedFields(),
          timestamp: new Date().toISOString()
        }
      },
      severity: 'low',
      category: 'user'
    });

    this.userService.updateUser(this.user.id, this.user).subscribe({
      next: (updatedUser) => {
        this.saving = false;
        this.user = updatedUser;
        this.originalUser = { ...updatedUser };
        
        // Success notification could go here
        console.log('✅ Profile updated successfully');
      },
      error: (error) => {
        this.saving = false;
        this.handleError(
          error,
          'saveProfile',
          {
            userId: this.user?.id,
            updateData: this.getChangedFields(),
            timestamp: new Date().toISOString()
          }
        );
      }
    });
  }

  validateField(fieldName: string) {
    if (!this.user) return;

    const value = (this.user as any)[fieldName];
    
    // Example validation with error logging
    if (fieldName === 'email' && value && !this.isValidEmail(value)) {
      this.handleError(
        new Error(`Invalid email format: ${value}`),
        'validateField',
        {
          fieldName,
          fieldValue: value,
          validationType: 'email',
          timestamp: new Date().toISOString()
        },
        'low',
        'ui'
      );
    }
  }

  updateSkills(event: any) {
    if (!this.user) return;
    
    const skillsText = event.target.value;
    this.user.skills = skillsText
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  resetForm() {
    if (this.originalUser) {
      this.user = { ...this.originalUser };
      this.clearError();
    }
  }

  retryLastAction() {
    switch (this.lastAction) {
      case 'loadUserProfile':
        const userId = this.route.snapshot.paramMap.get('id');
        if (userId) {
          this.loadUserProfile(userId);
        }
        break;
      case 'loadCurrentUserProfile':
        this.loadCurrentUserProfile();
        break;
      case 'saveProfile':
        this.saveProfile();
        break;
      default:
        console.log('No action to retry');
    }
  }

  clearError() {
    this.currentError = null;
    this.errorContext = {};
  }

  navigateToAuth() {
    this.router.navigate(['/auth']);
  }

  browseAllServices() {
    this.router.navigate(['/services']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private handleError(
    error: Error | string,
    operation: string,
    additionalData: any = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    category: 'user' | 'service' | 'transaction' | 'booking' | 'auth' | 'api' | 'ui' | 'system' = 'user'
  ) {
    this.currentError = error;
    this.errorSeverity = severity;
    this.errorCategory = category;
    this.errorContext = {
      userId: this.user?.id,
      operation,
      component: 'ProfileComponent',
      additionalData: {
        ...additionalData,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    // The ErrorHandlerComponent will handle the logging
  }

  private getChangedFields(): any {
    if (!this.user || !this.originalUser) return {};
    
    const changes: any = {};
    Object.keys(this.user).forEach(key => {
      if (JSON.stringify((this.user as any)[key]) !== JSON.stringify((this.originalUser as any)[key])) {
        changes[key] = {
          from: (this.originalUser as any)[key],
          to: (this.user as any)[key]
        };
      }
    });
    
    return changes;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
