import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from '../navigation/navigation.component';
import { ServiceService } from '../../services/service.service';
import { UserService } from '../../services/user.service';
import { Service, User } from '../../models/user.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ServiceWithProvider extends Service {
  provider?: {
    firstName: string;
    lastName: string;
    rating: number;
    totalTransactions: number;
  };
}

@Component({
  selector: 'app-services-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="services-browse">
      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">Browse Services</h1>
          <p class="page-subtitle">
            Discover amazing skills and services offered by our community members
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="container">
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                placeholder="Search services..." 
                [(ngModel)]="searchTerm"
                (input)="filterServices()"
                class="search-input"
              >
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="category-filters">
              <button 
                *ngFor="let category of categories" 
                [class.active]="selectedCategory === category"
                (click)="selectCategory(category)"
                class="category-btn"
              >
                {{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-section">
        <div class="container">
          <div class="loading-spinner">Loading services...</div>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="services-section" *ngIf="!loading">
        <div class="container">
          <div class="services-grid">
            <div 
              *ngFor="let service of filteredServices" 
              class="service-card"
              [routerLink]="['/services', service.id]"
            >
              <div class="service-header">
                <h3 class="service-title">{{ service.title }}</h3>
                <div class="service-rate">{{ service.hourlyRate }} hrs/hr</div>
              </div>
              
              <p class="service-description">{{ service.description }}</p>
              
              <div class="service-tags" *ngIf="service.tags && service.tags.length > 0">
                <span *ngFor="let tag of service.tags" class="tag">{{ tag }}</span>
              </div>
              
              <div class="service-provider" *ngIf="service.provider">
                <div class="provider-info">
                  <div class="provider-name">
                    {{ service.provider.firstName }} {{ service.provider.lastName }}
                  </div>
                  <div class="provider-stats">
                    <span class="rating">⭐ {{ service.provider.rating }}/5</span>
                    <span class="transactions">{{ service.provider.totalTransactions }} transactions</span>
                  </div>
                </div>
              </div>
              
              <div class="service-category">
                <span class="category-badge">{{ service.category }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredServices.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No services found</h3>
            <p>Try adjusting your search or category filters</p>
          </div>

          <!-- Load More -->
          <div class="load-more" *ngIf="hasMoreServices && !loading">
            <button class="btn btn-secondary" (click)="loadMoreServices()" [disabled]="loadingMore">
              {{ loadingMore ? 'Loading...' : 'Load More Services' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Join Our Community?</h2>
            <p>Start offering your skills or request services from our amazing community</p>
            <div class="cta-buttons">
              <a routerLink="/auth" class="btn btn-primary">Sign Up Now</a>
              <a routerLink="/about" class="btn btn-secondary">Learn How It Works</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./services-browse.component.scss']
})
export class ServicesBrowseComponent implements OnInit {
  services: ServiceWithProvider[] = [];
  filteredServices: ServiceWithProvider[] = [];
  categories: string[] = ['All', 'Technology', 'Education', 'Creative', 'Health & Wellness', 'Home & Garden', 'Business', 'Transportation', 'Other'];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  hasMoreServices: boolean = true;
  loading: boolean = false;
  loadingMore: boolean = false;
  nextToken?: string;

  constructor(
    private serviceService: ServiceService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    
    this.serviceService.listServices(20).subscribe({
      next: (result) => {
        this.services = result.items;
        this.nextToken = result.nextToken;
        this.hasMoreServices = !!result.nextToken;
        
        // Load provider information for each service
        this.loadProviderInfo();
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.loading = false;
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  loadProviderInfo() {
    if (this.services.length === 0) {
      this.loading = false;
      this.filteredServices = [];
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(this.services.map(service => service.userId))];
    
    // Fetch user information for all providers
    const userRequests = userIds.map(userId => 
      this.userService.getUser(userId).pipe(
        catchError(error => {
          console.error(`Failed to load user ${userId}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(userRequests).subscribe({
      next: (users: (User | null)[]) => {
        // Create a map of userId to user data
        const userMap = new Map<string, User>();
        users.forEach((user, index) => {
          if (user) {
            userMap.set(userIds[index], user);
          }
        });

        // Add provider information to services
        this.services = this.services.map(service => ({
          ...service,
          provider: userMap.get(service.userId) ? {
            firstName: userMap.get(service.userId)!.firstName,
            lastName: userMap.get(service.userId)!.lastName,
            rating: userMap.get(service.userId)!.rating,
            totalTransactions: userMap.get(service.userId)!.totalTransactions
          } : undefined
        }));

        this.filteredServices = [...this.services];
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load provider information:', error);
        this.filteredServices = [...this.services];
        this.loading = false;
      }
    });
  }

  loadMockData() {
    // Enhanced mock data with more services
    this.services = [
      {
        id: '1',
        userId: 'mock-user-1',
        title: 'Professional Web Development',
        description: 'Full-stack web development using modern technologies like React, Node.js, and AWS.',
        category: 'Technology',
        hourlyRate: 3,
        tags: ['web-development', 'react', 'nodejs', 'aws'],
        provider: {
          firstName: 'Ramji',
          lastName: 'Sreenivasan',
          rating: 4.9,
          totalTransactions: 15
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: 'mock-user-2',
        title: 'Graphic Design Services',
        description: 'Creative graphic design for logos, branding, and marketing materials.',
        category: 'Creative',
        hourlyRate: 2,
        tags: ['graphic-design', 'branding', 'logos'],
        provider: {
          firstName: 'Sarah',
          lastName: 'Chen',
          rating: 4.8,
          totalTransactions: 23
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        userId: 'mock-user-3',
        title: 'Business Consulting',
        description: 'Strategic business advice and planning for startups and small businesses.',
        category: 'Business',
        hourlyRate: 4,
        tags: ['consulting', 'strategy', 'planning'],
        provider: {
          firstName: 'Mike',
          lastName: 'Johnson',
          rating: 4.7,
          totalTransactions: 31
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        userId: 'mock-user-4',
        title: 'Language Tutoring',
        description: 'Spanish and French language lessons for all skill levels.',
        category: 'Education',
        hourlyRate: 1,
        tags: ['spanish', 'french', 'tutoring'],
        provider: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          rating: 4.9,
          totalTransactions: 18
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        userId: 'mock-user-5',
        title: 'Fitness Training',
        description: 'Personal fitness training and wellness coaching.',
        category: 'Health & Wellness',
        hourlyRate: 2,
        tags: ['fitness', 'training', 'wellness'],
        provider: {
          firstName: 'David',
          lastName: 'Kim',
          rating: 4.6,
          totalTransactions: 27
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        userId: 'mock-user-6',
        title: 'Home Cooking Classes',
        description: 'Learn to cook delicious and healthy meals at home.',
        category: 'Other',
        hourlyRate: 1,
        tags: ['cooking', 'healthy', 'recipes'],
        provider: {
          firstName: 'Emily',
          lastName: 'Watson',
          rating: 4.8,
          totalTransactions: 12
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '7',
        userId: 'mock-user-7',
        title: 'Digital Marketing Strategy',
        description: 'Comprehensive digital marketing services including SEO, content strategy, and social media management.',
        category: 'Business',
        hourlyRate: 2,
        tags: ['digital-marketing', 'seo', 'content-strategy', 'social-media'],
        provider: {
          firstName: 'Alex',
          lastName: 'Thompson',
          rating: 4.7,
          totalTransactions: 19
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '8',
        userId: 'mock-user-8',
        title: 'Photography Services',
        description: 'Professional photography for events, portraits, and commercial projects.',
        category: 'Creative',
        hourlyRate: 2,
        tags: ['photography', 'portraits', 'events', 'commercial'],
        provider: {
          firstName: 'Lisa',
          lastName: 'Park',
          rating: 4.9,
          totalTransactions: 25
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '9',
        userId: 'mock-user-9',
        title: 'Data Analysis & Visualization',
        description: 'Turn your data into actionable insights with advanced analytics and visualization.',
        category: 'Technology',
        hourlyRate: 3,
        tags: ['data-analysis', 'python', 'visualization', 'sql'],
        provider: {
          firstName: 'James',
          lastName: 'Wilson',
          rating: 4.8,
          totalTransactions: 22
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '10',
        userId: 'mock-user-10',
        title: 'Guitar Lessons',
        description: 'Learn to play guitar with personalized lessons for all skill levels.',
        category: 'Education',
        hourlyRate: 1,
        tags: ['guitar', 'music-lessons', 'beginner', 'advanced'],
        provider: {
          firstName: 'Carlos',
          lastName: 'Martinez',
          rating: 4.6,
          totalTransactions: 14
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '11',
        userId: 'mock-user-11',
        title: 'Mobile App Development',
        description: 'Native and cross-platform mobile app development for iOS and Android.',
        category: 'Technology',
        hourlyRate: 4,
        tags: ['mobile-development', 'ios', 'android', 'react-native', 'flutter'],
        provider: {
          firstName: 'Priya',
          lastName: 'Patel',
          rating: 4.9,
          totalTransactions: 28
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '12',
        userId: 'mock-user-12',
        title: 'Content Writing & Copywriting',
        description: 'Professional content writing for websites, blogs, and marketing materials.',
        category: 'Creative',
        hourlyRate: 1,
        tags: ['content-writing', 'copywriting', 'blogging', 'seo-writing'],
        provider: {
          firstName: 'Rachel',
          lastName: 'Green',
          rating: 4.7,
          totalTransactions: 33
        },
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.filteredServices = [...this.services];
    this.loading = false;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterServices();
  }

  filterServices() {
    let filtered = [...this.services];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        (service.tags && service.tags.some(tag => tag.toLowerCase().includes(term))) ||
        service.category.toLowerCase().includes(term)
      );
    }

    this.filteredServices = filtered;
  }

  loadMoreServices() {
    if (!this.nextToken || this.loadingMore) return;
    
    this.loadingMore = true;
    
    this.serviceService.listServices(20, this.nextToken).subscribe({
      next: (result) => {
        this.services = [...this.services, ...result.items];
        this.nextToken = result.nextToken;
        this.hasMoreServices = !!result.nextToken;
        
        // Load provider info for new services
        this.loadProviderInfo();
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Failed to load more services:', error);
        this.loadingMore = false;
        this.hasMoreServices = false;
      }
    });
  }
}
