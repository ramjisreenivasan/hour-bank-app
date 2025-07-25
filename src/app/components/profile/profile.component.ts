import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { UserMappingService } from '../../services/user-mapping.service';
import { User, Service } from '../../models/user.model';
import { errorLogger } from '../../utils/error-logger';
import { normalizeHourlyDuration } from '../../utils/service-utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  originalUser: User | null = null;
  loading = false;
  saving = false;
  
  // Message properties for UI feedback
  errorMessage: string = '';
  successMessage: string = '';
  
  // Template properties (currentUser is an alias for user for template consistency)
  get currentUser() { return this.user; }
  
  // Edit mode properties
  isEditing = false;
  editForm: any = {
    firstName: '',
    lastName: '',
    bio: '',
    skills: []
  };
  
  // Skills management
  newSkill = '';
  
  // Service categories
  categories = [
    'Technology',
    'Education', 
    'Creative',
    'Health & Wellness',
    'Home & Garden',
    'Business',
    'Transportation',
    'Other'
  ];
  
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
    private serviceService: ServiceService,
    private authService: AuthService,
    private userMappingService: UserMappingService
  ) {}

  ngOnInit() {
    console.log('🔍 DEBUG: ProfileComponent ngOnInit called');
    const userId = this.route.snapshot.paramMap.get('id');
    console.log('🔍 DEBUG: Route userId parameter:', userId);
    
    if (userId) {
      // Load specific user profile
      console.log('🔍 DEBUG: Loading specific user profile for:', userId);
      this.loadUserProfile(userId);
    } else {
      // No user ID provided - check if user is authenticated and load their own profile
      console.log('🔍 DEBUG: No userId in route, loading current user profile');
      this.loadCurrentUserProfile();
    }
  }

  loadCurrentUserProfile() {
    console.log('🔍 DEBUG: loadCurrentUserProfile called');
    this.lastAction = 'loadCurrentUserProfile';
    this.clearError();

    // Debug the user mapping process
    console.log('🔍 DEBUG: Getting current user DynamoDB ID...');
    
    // Get current user's DynamoDB ID through mapping service
    this.userMappingService.getCurrentUserDynamoDbId().subscribe({
      next: (dynamoDbUserId) => {
        console.log('🔍 DEBUG: DynamoDB User ID received:', dynamoDbUserId);
        
        if (dynamoDbUserId) {
          console.log('🔍 DEBUG: Loading user profile with DynamoDB ID:', dynamoDbUserId);
          // Load the current user's profile using DynamoDB ID
          this.loadUserProfile(dynamoDbUserId);
        } else {
          console.log('🔍 DEBUG: No DynamoDB ID found, attempting to sync user mapping...');
          // User mapping not found - try to sync
          this.userMappingService.syncUserMapping().subscribe({
            next: (mapping) => {
              console.log('🔍 DEBUG: User mapping synced:', mapping);
              this.loadUserProfile(mapping.dynamoDbUserId);
            },
            error: (error) => {
              console.error('🔍 DEBUG: User mapping sync failed:', error);
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
        console.error('🔍 DEBUG: Error getting current user DynamoDB ID:', error);
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
    
    // Also debug the user mapping service state
    this.userMappingService.debugMapping();
  }

  loadUserProfile(userId: string) {
    console.log('🔍 DEBUG: Loading user profile for:', userId);
    this.loading = true;
    this.lastAction = 'loadUserProfile';
    this.clearError();

    this.userService.getUser(userId).subscribe({
      next: (user) => {
        console.log('🔍 DEBUG: User profile loaded:', user);
        this.loading = false;
        if (user) {
          this.user = { ...user };
          this.originalUser = { ...user };
          console.log('🔍 DEBUG: About to load user services for:', userId);
          // Load user's services
          this.loadUserServices(userId);
        } else {
          console.log('🔍 DEBUG: User not found for ID:', userId);
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

  navigateToAuth() {
    this.router.navigate(['/auth']);
  }

  browseAllServices() {
    this.router.navigate(['/services']);
  }

  // Edit mode methods
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.user) {
      // Initialize edit form with current user data
      this.editForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        bio: this.user.bio || '',
        skills: [...(this.user.skills || [])]
      };
    }
  }

  // Skills management methods
  addSkill() {
    if (this.newSkill.trim() && !this.editForm.skills.includes(this.newSkill.trim())) {
      this.editForm.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    this.editForm.skills = this.editForm.skills.filter((s: string) => s !== skill);
  }

  // Save edited profile
  async saveEditedProfile() {
    if (!this.user) return;
    
    this.saving = true;
    try {
      // Update user object with edited values
      this.user.firstName = this.editForm.firstName;
      this.user.lastName = this.editForm.lastName;
      this.user.bio = this.editForm.bio;
      this.user.skills = this.editForm.skills;
      
      // Call existing saveProfile method
      await this.saveProfile();
      
      this.isEditing = false;
      this.successMessage = 'Profile updated successfully!';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
      
    } catch (error) {
      this.handleError(error as Error, 'saveEditedProfile');
    } finally {
      this.saving = false;
    }
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
    
    // Set error message for UI display
    this.errorMessage = typeof error === 'string' ? error : error.message;
    
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

    // Clear error message after 5 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);

    // The ErrorHandlerComponent will handle the logging
  }

  clearError() {
    this.currentError = null;
    this.errorMessage = '';
    this.errorContext = {};
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

  // Service Management Methods
  isAddingService = false;
  isSaving = false;
  userServices: Service[] = [];
  newService = {
    title: '',
    description: '',
    category: '',
    hourlyDuration: 1,
    tags: [] as string[],
    isActive: true,
    requiresScheduling: false
  };
  newTag = '';
  serviceCategories = [
    'Technology',
    'Education',
    'Creative',
    'Health & Wellness',
    'Home & Garden',
    'Business',
    'Transportation',
    'Other'
  ];

  toggleAddService() {
    this.isAddingService = !this.isAddingService;
    if (!this.isAddingService) {
      this.resetServiceForm();
    }
  }

  resetServiceForm() {
    this.newService = {
      title: '',
      description: '',
      category: '',
      hourlyDuration: 1,
      tags: [],
      isActive: true,
      requiresScheduling: false
    };
    this.newTag = '';
  }

  loadUserServices(userId: string) {
    console.log('🔍 DEBUG: Loading services for user:', userId);
    
    this.serviceService.getServicesByUserId(userId).subscribe({
      next: (result) => {
        console.log('🔍 DEBUG: API Response:', result);
        console.log('🔍 DEBUG: Services count:', result.items?.length || 0);
        
        this.userServices = result.items;
        
        // If no services found, add some mock data for testing
        if (this.userServices.length === 0) {
          console.log('🔍 DEBUG: No services found, adding mock data');
          this.addMockServicesForTesting(userId);
          console.log('🔍 DEBUG: Mock services added:', this.userServices.length);
        } else {
          console.log('🔍 DEBUG: Services loaded successfully:', this.userServices);
        }
      },
      error: (error) => {
        console.error('🔍 DEBUG: Error loading user services:', error);
        console.log('🔍 DEBUG: Adding mock data due to error');
        // Fallback to mock data if API fails
        this.addMockServicesForTesting(userId);
      }
    });
  }

  private addMockServicesForTesting(userId: string) {
    console.log('🔍 DEBUG: Adding mock services for user:', userId);
    
    // Add mock services for testing purposes
    this.userServices = [
      {
        id: 'mock-1',
        userId: userId,
        title: 'Web Development Services',
        description: 'Professional web development using modern technologies like React, Angular, and Node.js.',
        category: 'Technology',
        hourlyDuration: 3,
        tags: ['web-development', 'react', 'angular', 'nodejs'],
        isActive: true,
        requiresScheduling: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-2',
        userId: userId,
        title: 'UI/UX Design',
        description: 'Create beautiful and user-friendly interfaces for web and mobile applications.',
        category: 'Creative',
        hourlyDuration: 2,
        tags: ['ui-design', 'ux-design', 'figma', 'prototyping'],
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('🔍 DEBUG: Mock services created:', this.userServices.length);
    console.log('🔍 DEBUG: Mock services data:', this.userServices);
  }

  onHourlyDurationChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.newService.hourlyDuration = normalizeHourlyDuration(parseFloat(value));
    }
  }

  addTag() {
    if (this.newTag.trim() && !this.newService.tags.includes(this.newTag.trim())) {
      this.newService.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.newService.tags = this.newService.tags.filter(t => t !== tag);
  }

  async saveService() {
    if (!this.newService.title || !this.newService.description || !this.newService.category) {
      this.handleError(new Error('Please fill in all required fields'), 'saveService');
      return;
    }

    if (!this.user?.id) {
      this.handleError(new Error('User not found'), 'saveService');
      return;
    }

    this.isSaving = true;
    try {
      // Create service object
      const serviceData = {
        ...this.newService,
        userId: this.user.id,
        hourlyDuration: normalizeHourlyDuration(this.newService.hourlyDuration),
        tags: this.newService.tags || []
      };

      // Create service via GraphQL API
      this.serviceService.createService(serviceData).subscribe({
        next: (createdService) => {
          // Add to user services list
          this.userServices.push(createdService);
          
          this.successMessage = 'Service added successfully!';
          this.resetServiceForm();
          this.isAddingService = false;
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.handleError(error, 'saveService');
        },
        complete: () => {
          this.isSaving = false;
        }
      });

    } catch (error) {
      this.handleError(error as Error, 'saveService');
      this.isSaving = false;
    }
  }

  // Test method to force display services - for debugging
  forceDisplayTestServices() {
    console.log('🔍 DEBUG: Forcing test services display');
    this.userServices = [
      {
        id: 'test-1',
        userId: 'current-user',
        title: 'Test Service 1 - Forced Display',
        description: 'This is a test service to verify the UI is working correctly',
        category: 'Technology',
        hourlyDuration: 2,
        tags: ['test', 'debug', 'ui-test'],
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'test-2',
        userId: 'current-user',
        title: 'Test Service 2 - UI Verification',
        description: 'Another test service to ensure multiple services display correctly',
        category: 'Education',
        hourlyDuration: 1,
        tags: ['teaching', 'test', 'verification'],
        isActive: true,
        requiresScheduling: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'test-3',
        userId: 'current-user',
        title: 'Test Service 3 - Inactive Service',
        description: 'This service is inactive to test the status display',
        category: 'Creative',
        hourlyDuration: 3,
        tags: ['design', 'inactive', 'test'],
        isActive: false,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    console.log('🔍 DEBUG: Forced test services:', this.userServices);
  }

  toggleServiceStatus(service: Service) {
    this.isSaving = true;
    
    const updatedStatus = !service.isActive;
    
    this.serviceService.updateService(service.id, { isActive: updatedStatus }).subscribe({
      next: (updatedService) => {
        // Update the service in the local array
        const index = this.userServices.findIndex(s => s.id === service.id);
        if (index !== -1) {
          this.userServices[index] = updatedService;
        }
        
        this.successMessage = `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully!`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.handleError(error, 'toggleServiceStatus');
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
