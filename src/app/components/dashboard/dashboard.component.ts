import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserGraphQLService } from '../../services/user-graphql.service';
import { TransactionGraphQLService } from '../../services/transaction-graphql.service';
import { UserDisplayService } from '../../services/user-display.service';
import { UserMappingService } from '../../services/user-mapping.service';
import { User, Service, Transaction } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  availableServices: Service[] = [];
  recentTransactions: Transaction[] = [];
  loading = true;
  
  // Cache for users to avoid async issues in templates
  usersCache: Map<string, User> = new Map();

  constructor(
    private authService: AuthService,
    private userGraphQLService: UserGraphQLService,
    private transactionGraphQLService: TransactionGraphQLService,
    private userDisplayService: UserDisplayService,
    private userMappingService: UserMappingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    try {
      // Get the current user's DynamoDB ID through mapping service
      const dynamoDbUserId = await firstValueFrom(this.userMappingService.getCurrentUserDynamoDbId());
      
      console.log('Dashboard: DynamoDB User ID:', dynamoDbUserId);
      
      if (!dynamoDbUserId) {
        console.error('No DynamoDB user ID found');
        this.router.navigate(['/auth']);
        return;
      }

      // Load the full user profile from DynamoDB
      this.currentUser = await this.userGraphQLService.getUserById(dynamoDbUserId);
      
      console.log('Dashboard: Loaded current user:', this.currentUser);
      
      if (!this.currentUser) {
        console.error('User profile not found in DynamoDB');
        this.router.navigate(['/auth']);
        return;
      }

      // Add current user to cache for helper methods
      this.usersCache.set(this.currentUser.id, this.currentUser);

      // Debug: Test user loading functionality
      await this.testUserLoading();

      // Load available services from GraphQL
      console.log('Dashboard: Loading services...');
      const services = await this.userGraphQLService.getServices();
      console.log('Dashboard: Total services loaded:', services.length);
      
      // Debug: Log all services with their user IDs
      console.log('Dashboard: All services:', services.map(s => ({
        id: s.id,
        title: s.title,
        userId: s.userId,
        isActive: s.isActive
      })));
      
      this.availableServices = services.filter(service => 
        service.isActive && service.userId !== this.currentUser?.id
      );
      console.log('Dashboard: Available services after filtering:', this.availableServices.length);
      console.log('Dashboard: Current user ID for filtering:', this.currentUser?.id);
      
      // Debug: Show filtered services with user IDs
      console.log('Dashboard: Filtered services:', this.availableServices.map(s => ({
        id: s.id,
        title: s.title,
        userId: s.userId
      })));

      // Load users for the services to populate cache
      const userIds = [...new Set(this.availableServices.map(s => s.userId))];
      console.log('Dashboard: Unique user IDs from services:', userIds);
      
      if (userIds.length > 0) {
        // Test: Try to fetch the first user directly to verify GraphQL is working
        if (userIds[0]) {
          console.log('Dashboard: Testing direct user fetch for:', userIds[0]);
          try {
            const testUser = await this.userGraphQLService.getUserById(userIds[0]);
            console.log('Dashboard: Direct fetch test result:', testUser ? (testUser.username || testUser.email) : 'NULL');
          } catch (error) {
            console.error('Dashboard: Direct fetch test failed:', error);
          }
        }
        
        await this.loadUsersToCache(userIds);
        
        // Verify cache population and retry failed loads
        console.log('Dashboard: Cache verification after loading users:');
        const missingUsers: string[] = [];
        
        userIds.forEach(userId => {
          const user = this.usersCache.get(userId);
          if (user) {
            console.log(`  User ${userId}: ${user.username || user.email}`);
          } else {
            console.log(`  User ${userId}: NOT FOUND - will retry`);
            missingUsers.push(userId);
          }
        });
        
        // Retry loading missing users once more
        if (missingUsers.length > 0) {
          console.log('Dashboard: Retrying missing users:', missingUsers);
          await this.loadUsersToCache(missingUsers);
          
          // Final verification
          const stillMissing = missingUsers.filter(userId => !this.usersCache.has(userId));
          if (stillMissing.length > 0) {
            console.warn('Dashboard: Some users could not be loaded:', stillMissing);
          }
        }
        
        // Force change detection after all users are loaded
        this.cdr.detectChanges();
      }

      // Load recent transactions from GraphQL
      const transactions = await this.transactionGraphQLService.getTransactions();
      this.recentTransactions = transactions
        .filter(t => t.providerId === this.currentUser?.id || t.consumerId === this.currentUser?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Load users for transactions to populate cache
      const transactionUserIds = [
        ...this.recentTransactions.map(t => t.providerId),
        ...this.recentTransactions.map(t => t.consumerId)
      ];
      await this.loadUsersToCache([...new Set(transactionUserIds)]);

      this.loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    }
  }

  private async loadUsersToCache(userIds: string[]): Promise<void> {
    console.log('Dashboard: Loading users to cache:', userIds);
    
    const promises = userIds.map(async (userId) => {
      if (!this.usersCache.has(userId)) {
        console.log('Dashboard: Fetching user:', userId);
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<User | null>((_, reject) => 
            setTimeout(() => reject(new Error('User fetch timeout')), 10000)
          );
          
          const userPromise = this.userGraphQLService.getUserById(userId);
          const user = await Promise.race([userPromise, timeoutPromise]);
          
          if (user) {
            console.log('Dashboard: Successfully loaded user:', user.username || user.email);
            this.usersCache.set(userId, user);
          } else {
            console.warn('Dashboard: User not found:', userId);
          }
        } catch (error) {
          console.error('Dashboard: Error fetching user:', userId, error);
          // Don't throw - continue with other users
        }
      }
    });
    
    await Promise.allSettled(promises); // Use allSettled to continue even if some fail
    console.log('Dashboard: Users cache now contains:', Array.from(this.usersCache.keys()));
  }

  async requestService(service: Service): Promise<void> {
    if (!this.currentUser) return;

    try {
      const transaction = await this.transactionGraphQLService.createTransaction({
        providerId: service.userId,
        consumerId: this.currentUser.id,
        serviceId: service.id,
        hoursSpent: service.hourlyDuration, // Use actual service duration
        description: `Request for ${service.title}`
      });

      alert(`Service request sent! Transaction ID: ${transaction.id}`);
      await this.loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error requesting service:', error);
      alert('Failed to request service. Please try again.');
    }
  }

  // Template helper methods - synchronous for template use
  getUserFromCache(userId: string): User | null {
    console.log('Dashboard: getUserFromCache called for:', userId);
    const user = this.usersCache.get(userId);
    
    if (user) {
      console.log('Dashboard: User found in cache:', user.username || user.email);
    } else {
      console.warn('Dashboard: User not found in cache:', userId);
      console.log('Dashboard: Current cache keys:', Array.from(this.usersCache.keys()));
      
      // Try to fetch the user asynchronously and update cache for next time
      this.userGraphQLService.getUserById(userId).then(fetchedUser => {
        if (fetchedUser) {
          console.log('Dashboard: Fetched missing user:', fetchedUser.username || fetchedUser.email);
          this.usersCache.set(userId, fetchedUser);
          // Trigger change detection to update the template
          this.cdr.detectChanges();
        } else {
          console.error('Dashboard: Failed to fetch user from GraphQL:', userId);
        }
      }).catch(error => {
        console.error('Dashboard: Error fetching missing user:', userId, error);
      });
    }
    return user || null;
  }

  getServiceById(serviceId: string): Service | undefined {
    return this.userGraphQLService.getServiceById(serviceId);
  }

  getUserDisplayName(userId: string): string {
    const user = this.getUserFromCache(userId);
    return this.userDisplayService.getDisplayName(user);
  }

  getUserFullName(userId: string): string {
    const user = this.getUserFromCache(userId);
    if (!user) {
      // Return a more informative fallback that includes the user ID
      return `User (${userId.substring(0, 8)}...)`;
    }
    
    // Direct implementation instead of relying on UserDisplayService
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.username) {
      return user.username;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return `User (${userId.substring(0, 8)}...)`;
  }

  getUserUsername(userId: string): string {
    const user = this.getUserFromCache(userId);
    return this.userDisplayService.getUsername(user);
  }

  getUserRating(userId: string): number {
    const user = this.getUserFromCache(userId);
    return user?.rating || 0;
  }

  getWelcomeDisplayName(): string {
    if (!this.currentUser) return 'User';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    
    if (this.currentUser.firstName) {
      return this.currentUser.firstName;
    }
    
    return this.currentUser.username || 'User';
  }

  browseServices(): void {
    this.router.navigate(['/services']);
  }

  // Debug method to test user loading
  async testUserLoading(): Promise<void> {
    console.log('Dashboard: Testing user loading...');
    
    try {
      // Test loading all users
      const allUsers = await this.userGraphQLService.getUsers();
      console.log('Dashboard: All users from GraphQL:', allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName
      })));
      
      // Test loading a specific user if any exist
      if (allUsers.length > 0) {
        const testUserId = allUsers[0].id;
        console.log('Dashboard: Testing getUserById for:', testUserId);
        const specificUser = await this.userGraphQLService.getUserById(testUserId);
        console.log('Dashboard: Specific user result:', specificUser);
      }
    } catch (error) {
      console.error('Dashboard: Error in testUserLoading:', error);
    }
  }
}
