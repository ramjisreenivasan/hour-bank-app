import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from '../navigation/navigation.component';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  hourlyRate: number;
  tags: string[];
  provider: {
    firstName: string;
    lastName: string;
    rating: number;
    totalTransactions: number;
  };
  isActive: boolean;
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

      <!-- Services Grid -->
      <div class="services-section">
        <div class="container">
          <div class="services-grid">
            <div 
              *ngFor="let service of filteredServices" 
              class="service-card"
              [routerLink]="['/services', service.id]"
            >
              <div class="service-header">
                <h3 class="service-title">{{ service.title }}</h3>
                <div class="service-rate">\${{ service.hourlyRate }}/hr</div>
              </div>
              
              <p class="service-description">{{ service.description }}</p>
              
              <div class="service-tags">
                <span *ngFor="let tag of service.tags" class="tag">{{ tag }}</span>
              </div>
              
              <div class="service-provider">
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
          <div *ngIf="filteredServices.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No services found</h3>
            <p>Try adjusting your search or category filters</p>
          </div>

          <!-- Load More -->
          <div class="load-more" *ngIf="hasMoreServices">
            <button class="btn btn-secondary" (click)="loadMoreServices()">
              Load More Services
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
              <a routerLink="/how-it-works" class="btn btn-secondary">Learn How It Works</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./services-browse.component.scss']
})
export class ServicesBrowseComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: string[] = ['All', 'Technology', 'Design', 'Business', 'Education', 'Health', 'Lifestyle'];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  hasMoreServices: boolean = true;

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    // Mock data - in real app, this would come from your GraphQL API
    this.services = [
      {
        id: '1',
        title: 'Professional Web Development',
        description: 'Full-stack web development using modern technologies like React, Node.js, and AWS.',
        category: 'Technology',
        hourlyRate: 75,
        tags: ['web-development', 'react', 'nodejs', 'aws'],
        provider: {
          firstName: 'Ramji',
          lastName: 'Sreenivasan',
          rating: 4.9,
          totalTransactions: 15
        },
        isActive: true
      },
      {
        id: '2',
        title: 'Graphic Design Services',
        description: 'Creative graphic design for logos, branding, and marketing materials.',
        category: 'Design',
        hourlyRate: 45,
        tags: ['graphic-design', 'branding', 'logos'],
        provider: {
          firstName: 'Sarah',
          lastName: 'Chen',
          rating: 4.8,
          totalTransactions: 23
        },
        isActive: true
      },
      {
        id: '3',
        title: 'Business Consulting',
        description: 'Strategic business advice and planning for startups and small businesses.',
        category: 'Business',
        hourlyRate: 85,
        tags: ['consulting', 'strategy', 'planning'],
        provider: {
          firstName: 'Mike',
          lastName: 'Johnson',
          rating: 4.7,
          totalTransactions: 31
        },
        isActive: true
      },
      {
        id: '4',
        title: 'Language Tutoring',
        description: 'Spanish and French language lessons for all skill levels.',
        category: 'Education',
        hourlyRate: 35,
        tags: ['spanish', 'french', 'tutoring'],
        provider: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          rating: 4.9,
          totalTransactions: 18
        },
        isActive: true
      },
      {
        id: '5',
        title: 'Fitness Training',
        description: 'Personal fitness training and wellness coaching.',
        category: 'Health',
        hourlyRate: 55,
        tags: ['fitness', 'training', 'wellness'],
        provider: {
          firstName: 'David',
          lastName: 'Kim',
          rating: 4.6,
          totalTransactions: 27
        },
        isActive: true
      },
      {
        id: '6',
        title: 'Home Cooking Classes',
        description: 'Learn to cook delicious and healthy meals at home.',
        category: 'Lifestyle',
        hourlyRate: 40,
        tags: ['cooking', 'healthy', 'recipes'],
        provider: {
          firstName: 'Emily',
          lastName: 'Watson',
          rating: 4.8,
          totalTransactions: 12
        },
        isActive: true
      }
    ];

    this.filteredServices = [...this.services];
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
        service.tags.some(tag => tag.toLowerCase().includes(term)) ||
        service.category.toLowerCase().includes(term)
      );
    }

    this.filteredServices = filtered;
  }

  loadMoreServices() {
    // In real app, load more services from API
    this.hasMoreServices = false;
  }
}
