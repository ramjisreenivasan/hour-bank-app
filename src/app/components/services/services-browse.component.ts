import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { UserService } from '../../services/user.service';
import { Service, User } from '../../models/user.model';
import { getAppConfig } from '../../config/app-config';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ServiceWithProvider extends Omit<Service, 'provider'> {
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
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="services-browse">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="container">
          <div class="hero-content">
            <div class="hero-title-section">
              <h1 class="hero-title">Discover Amazing Services</h1>
              <span class="sample-data-badge">SAMPLE DATA</span>
            </div>
            <p class="hero-subtitle">
              Connect with skilled professionals in our time-based marketplace
            </p>
            <div class="hero-stats" *ngIf="!loading">
              <div class="stat">
                <div class="stat-number">{{ totalServices }}</div>
                <div class="stat-label">Services</div>
              </div>
              <div class="stat">
                <div class="stat-number">{{ uniqueProviders }}</div>
                <div class="stat-label">Providers</div>
              </div>
              <div class="stat">
                <div class="stat-number">{{ categories.length - 1 }}</div>
                <div class="stat-label">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="container">
          <div class="search-filter-row">
            <!-- Search Bar -->
            <div class="search-container">
              <div class="search-box">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search services, skills, or providers..." 
                  [(ngModel)]="searchTerm"
                  (input)="filterServices()"
                  class="search-input"
                >
                <button *ngIf="searchTerm" (click)="clearSearch()" class="clear-search">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- View Toggle -->
            <div class="view-toggle">
              <button 
                [class.active]="viewMode === 'grid'"
                (click)="setViewMode('grid')"
                class="view-btn"
                title="Grid View">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button 
                [class.active]="viewMode === 'list'"
                (click)="setViewMode('list')"
                class="view-btn"
                title="List View">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Category Filters -->
          <div class="category-filters">
            <button 
              *ngFor="let category of categories" 
              [class.active]="selectedCategory === category"
              (click)="selectCategory(category)"
              class="category-btn">
              <span class="category-icon">{{ getCategoryIcon(category) }}</span>
              {{ category }}
              <span class="category-count" *ngIf="getCategoryCount(category) > 0">
                {{ getCategoryCount(category) }}
              </span>
            </button>
          </div>

          <!-- Sort Options -->
          <div class="sort-options">
            <label for="sortBy">Sort by:</label>
            <select id="sortBy" [(ngModel)]="sortBy" (change)="sortServices()" class="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="duration-low">Duration: Short to Long</option>
              <option value="duration-high">Duration: Long to Short</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="!loading">
        <div class="container">
          <div class="summary-text">
            <span class="results-count">{{ filteredServices.length }}</span>
            <span class="results-label">
              {{ filteredServices.length === 1 ? 'service' : 'services' }} found
            </span>
            <span *ngIf="selectedCategory !== 'All'" class="filter-info">
              in <strong>{{ selectedCategory }}</strong>
            </span>
            <span *ngIf="searchTerm" class="search-info">
              for "<strong>{{ searchTerm }}</strong>"
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-section">
        <div class="container">
          <div class="loading-grid">
            <div class="loading-card" *ngFor="let item of [1,2,3,4,5,6]">
              <div class="loading-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Grid/List -->
      <div class="services-section" *ngIf="!loading">
        <div class="container">
          <!-- Grid View -->
          <div *ngIf="viewMode === 'grid'" class="services-grid">
            <div 
              *ngFor="let service of paginatedServices" 
              class="service-card"
              [routerLink]="['/services', service.id]">
              
              <div class="card-header">
                <div class="service-category">
                  <span class="category-badge">{{ service.category }}</span>
                </div>
                <div class="service-duration">{{ service.hourlyDuration }} hours</div>
              </div>

              <div class="card-content">
                <h3 class="service-title">{{ service.title }}</h3>
                <p class="service-description">{{ service.description }}</p>
                
                <div class="service-tags" *ngIf="service.tags && service.tags.length > 0">
                  <span *ngFor="let tag of service.tags.slice(0, 3)" class="tag">{{ tag }}</span>
                  <span *ngIf="service.tags.length > 3" class="tag-more">+{{ service.tags.length - 3 }}</span>
                </div>
              </div>

              <div class="card-footer" *ngIf="service.provider">
                <div class="provider-info">
                  <div class="provider-avatar">
                    {{ service.provider.firstName.charAt(0) }}{{ service.provider.lastName.charAt(0) }}
                  </div>
                  <div class="provider-details">
                    <div class="provider-name">
                      {{ service.provider.firstName }} {{ service.provider.lastName }}
                    </div>
                    <div class="provider-stats">
                      <span class="rating">
                        <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        {{ service.provider.rating.toFixed(1) }}
                      </span>
                      <span class="transactions">{{ service.provider.totalTransactions }} jobs</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn-contact">Contact</button>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div *ngIf="viewMode === 'list'" class="services-list">
            <div 
              *ngFor="let service of paginatedServices" 
              class="service-list-item"
              [routerLink]="['/services', service.id]">
              
              <div class="list-item-content">
                <div class="list-item-header">
                  <h3 class="service-title">{{ service.title }}</h3>
                  <div class="service-duration">{{ service.hourlyDuration }} hours</div>
                </div>
                
                <p class="service-description">{{ service.description }}</p>
                
                <div class="list-item-meta">
                  <span class="category-badge">{{ service.category }}</span>
                  <div class="service-tags" *ngIf="service.tags && service.tags.length > 0">
                    <span *ngFor="let tag of service.tags.slice(0, 4)" class="tag">{{ tag }}</span>
                  </div>
                </div>
              </div>

              <div class="list-item-provider" *ngIf="service.provider">
                <div class="provider-avatar">
                  {{ service.provider.firstName.charAt(0) }}{{ service.provider.lastName.charAt(0) }}
                </div>
                <div class="provider-details">
                  <div class="provider-name">
                    {{ service.provider.firstName }} {{ service.provider.lastName }}
                  </div>
                  <div class="provider-stats">
                    <span class="rating">★ {{ service.provider.rating.toFixed(1) }}</span>
                    <span class="transactions">{{ service.provider.totalTransactions }} jobs</span>
                  </div>
                </div>
                <button class="btn-contact">Contact</button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredServices.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No services found</h3>
            <p>Try adjusting your search terms or category filters</p>
            <button (click)="clearAllFilters()" class="btn-clear-filters">Clear All Filters</button>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button 
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1"
              class="pagination-btn">
              Previous
            </button>
            
            <div class="pagination-numbers">
              <button 
                *ngFor="let page of getVisiblePages()"
                (click)="goToPage(page)"
                [class.active]="page === currentPage"
                class="pagination-number">
                {{ page }}
              </button>
            </div>
            
            <button 
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages"
              class="pagination-btn">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Join Our Community?</h2>
            <p>Start offering your skills or request services from our amazing community of professionals</p>
            <div class="cta-buttons">
              <a routerLink="/auth" class="btn btn-primary">Get Started</a>
              <a routerLink="/about" class="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./services-browse.component.scss']
})
export class ServicesBrowseComponent implements OnInit {
  private config = getAppConfig();
  services: ServiceWithProvider[] = [];
  filteredServices: ServiceWithProvider[] = [];
  paginatedServices: ServiceWithProvider[] = [];
  
  categories: string[] = ['All', 'Technology', 'Education', 'Creative', 'Health & Wellness', 'Home & Garden', 'Business', 'Transportation', 'Other'];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  sortBy: string = 'newest';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Loading and stats
  loading: boolean = false;
  loadingMore: boolean = false;
  hasMoreServices: boolean = true;
  nextToken?: string;
  
  // Stats
  totalServices: number = 0;
  uniqueProviders: number = 0;

  constructor(
    private serviceService: ServiceService,
    private userService: UserService
  ) {}

  /**
   * Generate random duration between 1-4 hours for services
   */
  private getRandomHours(): number {
    return Math.floor(Math.random() * 4) + 1; // Returns 1, 2, 3, or 4
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    
    // Try to load all services without pagination limit first
    this.serviceService.listServices(100).subscribe({
      next: (result) => {
        this.services = result.items;
        this.nextToken = result.nextToken;
        this.hasMoreServices = !!result.nextToken;
        
        // If we have more services, keep loading them
        if (this.hasMoreServices) {
          this.loadAllServices();
        } else {
          this.loadProviderInfo();
        }
      },
      error: (error) => {
        console.error('Failed to load services:', error);
        this.loading = false;
        // Fallback to enhanced mock data
        this.loadEnhancedMockData();
      }
    });
  }

  loadAllServices() {
    if (!this.nextToken) {
      this.loadProviderInfo();
      return;
    }

    this.serviceService.listServices(100, this.nextToken).subscribe({
      next: (result) => {
        this.services = [...this.services, ...result.items];
        this.nextToken = result.nextToken;
        this.hasMoreServices = !!result.nextToken;
        
        if (this.hasMoreServices) {
          // Continue loading more services
          this.loadAllServices();
        } else {
          this.loadProviderInfo();
        }
      },
      error: (error) => {
        console.error('Failed to load more services:', error);
        this.loadProviderInfo();
      }
    });
  }

  loadProviderInfo() {
    if (this.services.length === 0) {
      this.loading = false;
      this.updateStats();
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

        this.updateStats();
        this.filteredServices = [...this.services];
        this.sortServices();
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load provider information:', error);
        this.filteredServices = [...this.services];
        this.updateStats();
        this.updatePagination();
        this.loading = false;
      }
    });
  }

  loadEnhancedMockData() {
    // Enhanced mock data with 20+ services
    this.services = [
      {
        id: '1', userId: 'mock-user-1', title: 'Professional Web Development',
        description: 'Full-stack web development using modern technologies like React, Node.js, and AWS. I specialize in creating responsive, scalable applications.',
        category: 'Technology', hourlyDuration: this.getRandomHours(), tags: ['web-development', 'react', 'nodejs', 'aws'],
        provider: { firstName: 'Ramji', lastName: 'Sreenivasan', rating: 4.9, totalTransactions: 15 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '2', userId: 'mock-user-2', title: 'UI/UX Design Services',
        description: 'Creative design solutions for web and mobile applications. From wireframes to high-fidelity prototypes.',
        category: 'Creative', hourlyDuration: this.getRandomHours(), tags: ['ui-design', 'ux-design', 'figma', 'prototyping'],
        provider: { firstName: 'Sarah', lastName: 'Chen', rating: 4.8, totalTransactions: 23 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '3', userId: 'mock-user-3', title: 'Digital Marketing Strategy',
        description: 'Comprehensive digital marketing services including SEO, content strategy, and social media management.',
        category: 'Business', hourlyDuration: this.getRandomHours(), tags: ['digital-marketing', 'seo', 'content-strategy'],
        provider: { firstName: 'Mike', lastName: 'Johnson', rating: 4.7, totalTransactions: 31 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '4', userId: 'mock-user-4', title: 'Spanish Language Tutoring',
        description: 'Native Spanish speaker offering personalized language lessons for all levels.',
        category: 'Education', hourlyDuration: this.getRandomHours(), tags: ['spanish', 'language-tutoring', 'conversation'],
        provider: { firstName: 'Maria', lastName: 'Rodriguez', rating: 4.9, totalTransactions: 18 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '5', userId: 'mock-user-5', title: 'Personal Fitness Training',
        description: 'Certified personal trainer offering customized workout plans and nutrition guidance.',
        category: 'Health & Wellness', hourlyDuration: this.getRandomHours(), tags: ['fitness', 'personal-training', 'nutrition'],
        provider: { firstName: 'David', lastName: 'Kim', rating: 4.6, totalTransactions: 27 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '6', userId: 'mock-user-6', title: 'Home Cooking Classes',
        description: 'Learn to cook delicious and healthy meals with hands-on cooking instruction.',
        category: 'Other', hourlyDuration: this.getRandomHours(), tags: ['cooking', 'healthy-eating', 'recipes'],
        provider: { firstName: 'Emily', lastName: 'Watson', rating: 4.8, totalTransactions: 12 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '7', userId: 'mock-user-7', title: 'Photography Services',
        description: 'Professional photography for events, portraits, and commercial projects.',
        category: 'Creative', hourlyDuration: this.getRandomHours(), tags: ['photography', 'portraits', 'events'],
        provider: { firstName: 'Lisa', lastName: 'Park', rating: 4.9, totalTransactions: 25 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '8', userId: 'mock-user-8', title: 'Data Analysis & Visualization',
        description: 'Turn your data into actionable insights with advanced analytics and visualization.',
        category: 'Technology', hourlyDuration: this.getRandomHours(), tags: ['data-analysis', 'python', 'visualization'],
        provider: { firstName: 'James', lastName: 'Wilson', rating: 4.8, totalTransactions: 22 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '9', userId: 'mock-user-9', title: 'Guitar Lessons',
        description: 'Learn to play guitar with personalized lessons for all skill levels.',
        category: 'Education', hourlyDuration: this.getRandomHours(), tags: ['guitar', 'music-lessons', 'beginner'],
        provider: { firstName: 'Carlos', lastName: 'Martinez', rating: 4.6, totalTransactions: 14 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '10', userId: 'mock-user-10', title: 'Mobile App Development',
        description: 'Native and cross-platform mobile app development for iOS and Android.',
        category: 'Technology', hourlyDuration: this.getRandomHours(), tags: ['mobile-development', 'ios', 'android'],
        provider: { firstName: 'Priya', lastName: 'Patel', rating: 4.9, totalTransactions: 28 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '11', userId: 'mock-user-11', title: 'Content Writing & Copywriting',
        description: 'Professional content writing for websites, blogs, and marketing materials.',
        category: 'Creative', hourlyDuration: this.getRandomHours(), tags: ['content-writing', 'copywriting', 'blogging'],
        provider: { firstName: 'Rachel', lastName: 'Green', rating: 4.7, totalTransactions: 33 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '12', userId: 'mock-user-12', title: 'Business Consulting',
        description: 'Strategic business advice and planning for startups and small businesses.',
        category: 'Business', hourlyDuration: this.getRandomHours(), tags: ['consulting', 'strategy', 'planning'],
        provider: { firstName: 'Alex', lastName: 'Thompson', rating: 4.8, totalTransactions: 19 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '13', userId: 'mock-user-13', title: 'Yoga & Meditation Classes',
        description: 'Certified yoga instructor offering classes for stress relief and flexibility.',
        category: 'Health & Wellness', hourlyDuration: this.getRandomHours(), tags: ['yoga', 'meditation', 'wellness'],
        provider: { firstName: 'Sophia', lastName: 'Lee', rating: 4.9, totalTransactions: 21 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '14', userId: 'mock-user-14', title: 'Home Organization Services',
        description: 'Professional organizing services to declutter and optimize your living space.',
        category: 'Home & Garden', hourlyDuration: this.getRandomHours(), tags: ['organization', 'decluttering', 'home-improvement'],
        provider: { firstName: 'Jennifer', lastName: 'Brown', rating: 4.7, totalTransactions: 16 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '15', userId: 'mock-user-15', title: 'French Language Tutoring',
        description: 'Native French speaker offering conversational and academic French lessons.',
        category: 'Education', hourlyDuration: this.getRandomHours(), tags: ['french', 'language-tutoring', 'conversation'],
        provider: { firstName: 'Pierre', lastName: 'Dubois', rating: 4.8, totalTransactions: 13 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '16', userId: 'mock-user-16', title: 'Graphic Design & Branding',
        description: 'Creative graphic design services for logos, branding, and marketing materials.',
        category: 'Creative', hourlyDuration: this.getRandomHours(), tags: ['graphic-design', 'branding', 'logos'],
        provider: { firstName: 'Anna', lastName: 'Smith', rating: 4.6, totalTransactions: 24 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '17', userId: 'mock-user-17', title: 'Piano Lessons',
        description: 'Classical and contemporary piano instruction for students of all ages.',
        category: 'Education', hourlyDuration: this.getRandomHours(), tags: ['piano', 'music-lessons', 'classical'],
        provider: { firstName: 'Michael', lastName: 'Chang', rating: 4.9, totalTransactions: 17 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '18', userId: 'mock-user-18', title: 'Social Media Management',
        description: 'Complete social media management including content creation and strategy.',
        category: 'Business', hourlyDuration: this.getRandomHours(), tags: ['social-media', 'content-creation', 'marketing'],
        provider: { firstName: 'Jessica', lastName: 'Taylor', rating: 4.7, totalTransactions: 20 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '19', userId: 'mock-user-19', title: 'Garden Design & Landscaping',
        description: 'Professional garden design and landscaping services for residential properties.',
        category: 'Home & Garden', hourlyDuration: this.getRandomHours(), tags: ['landscaping', 'garden-design', 'plants'],
        provider: { firstName: 'Robert', lastName: 'Miller', rating: 4.8, totalTransactions: 15 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      },
      {
        id: '20', userId: 'mock-user-20', title: 'Video Editing & Production',
        description: 'Professional video editing and production services for content creators.',
        category: 'Creative', hourlyDuration: this.getRandomHours(), tags: ['video-editing', 'production', 'content-creation'],
        provider: { firstName: 'Kevin', lastName: 'Davis', rating: 4.9, totalTransactions: 26 },
        isActive: true, requiresScheduling: false, createdAt: new Date(), updatedAt: new Date()
      }
    ];

    this.updateStats();
    this.filteredServices = [...this.services];
    this.sortServices();
    this.updatePagination();
    this.loading = false;
  }

  // Filter and Search Methods
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
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
        service.category.toLowerCase().includes(term) ||
        (service.provider && 
          (service.provider.firstName.toLowerCase().includes(term) ||
           service.provider.lastName.toLowerCase().includes(term)))
      );
    }

    this.filteredServices = filtered;
    this.currentPage = 1;
    this.sortServices();
    this.updatePagination();
  }

  sortServices() {
    switch (this.sortBy) {
      case 'newest':
        this.filteredServices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        this.filteredServices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        this.filteredServices.sort((a, b) => (b.provider?.rating || 0) - (a.provider?.rating || 0));
        break;
      case 'duration-low':
        this.filteredServices.sort((a, b) => a.hourlyDuration - b.hourlyDuration);
        break;
      case 'duration-high':
        this.filteredServices.sort((a, b) => b.hourlyDuration - a.hourlyDuration);
        break;
      case 'popular':
        this.filteredServices.sort((a, b) => (b.provider?.totalTransactions || 0) - (a.provider?.totalTransactions || 0));
        break;
    }
    this.updatePagination();
  }

  // View and Utility Methods
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterServices();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.sortBy = 'newest';
    this.filterServices();
  }

  // Category Helper Methods
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'All': '🌟',
      'Technology': '💻',
      'Education': '📚',
      'Creative': '🎨',
      'Health & Wellness': '🏃‍♂️',
      'Home & Garden': '🏡',
      'Business': '💼',
      'Transportation': '🚗',
      'Other': '🔧'
    };
    return icons[category] || '📋';
  }

  getCategoryCount(category: string): number {
    if (category === 'All') return this.services.length;
    return this.services.filter(service => service.category === category).length;
  }

  // Pagination Methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredServices.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedServices = this.filteredServices.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      // Scroll to top of services section
      document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = this.config.ui.maxVisibleServices;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Stats Methods
  updateStats() {
    this.totalServices = this.services.length;
    this.uniqueProviders = new Set(this.services.map(s => s.userId)).size;
  }

  // Legacy method for compatibility
  loadMoreServices() {
    // This method is kept for compatibility but not used in the new design
    // All services are loaded at once now
  }
}
