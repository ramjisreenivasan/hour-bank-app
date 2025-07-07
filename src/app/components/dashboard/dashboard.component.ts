import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserGraphQLService } from '../../services/user-graphql.service';
import { TransactionGraphQLService } from '../../services/transaction-graphql.service';
import { UserDisplayService } from '../../services/user-display.service';
import { UserMappingService } from '../../services/user-mapping.service';
import { User, Service, Transaction } from '../../models/user.model';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, NavigationComponent],
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
    private router: Router
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

      // Load available services from GraphQL
      const services = await this.userGraphQLService.getServices();
      this.availableServices = services.filter(service => 
        service.isActive && service.userId !== this.currentUser?.id
      );

      // Load users for the services to populate cache
      const userIds = [...new Set(this.availableServices.map(s => s.userId))];
      await this.loadUsersToCache(userIds);

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
    const promises = userIds.map(async (userId) => {
      if (!this.usersCache.has(userId)) {
        const user = await this.userGraphQLService.getUserById(userId);
        if (user) {
          this.usersCache.set(userId, user);
        }
      }
    });
    
    await Promise.all(promises);
  }

  async requestService(service: Service): Promise<void> {
    if (!this.currentUser) return;

    try {
      const transaction = await this.transactionGraphQLService.createTransaction({
        providerId: service.userId,
        consumerId: this.currentUser.id,
        serviceId: service.id,
        hoursSpent: 1, // Default to 1 hour, can be modified later
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
    return this.usersCache.get(userId) || null;
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
    return this.userDisplayService.getFullNameOrUsername(user);
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
}
