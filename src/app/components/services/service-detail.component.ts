import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SampleDataWatermarkComponent } from '../sample-data-watermark/sample-data-watermark.component';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  hourlyDuration: number;
  tags: string[];
  requiresScheduling: boolean;
  minBookingHours?: number;
  maxBookingHours?: number;
  advanceBookingDays?: number;
  cancellationHours?: number;
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    totalTransactions: number;
    bio: string;
    skills: string[];
    joinedDate: string;
  };
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SampleDataWatermarkComponent],
  template: `
    <div class="service-detail" *ngIf="service">
      <!-- Sample Data Watermark -->
      <app-sample-data-watermark position="corner"></app-sample-data-watermark>
      
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <div class="container">
          <a routerLink="/services" class="breadcrumb-link">Services</a>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">{{ service.title }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container">
        <div class="service-content">
          <!-- Service Header -->
          <div class="service-header">
            <div class="service-title-section">
              <h1 class="service-title">{{ service.title }}</h1>
              <div class="service-meta">
                <span class="category-badge">{{ service.category }}</span>
                <span class="duration-display">{{ service.hourlyDuration }} hours</span>
              </div>
            </div>
            
            <div class="service-actions" *ngIf="isAuthenticated">
              <button class="btn btn-primary btn-lg" (click)="openBookingModal()">
                <i class="fas fa-calendar-plus"></i>
                Book Service
              </button>
            </div>
          </div>

          <!-- Service Description -->
          <div class="service-description">
            <h2>About This Service</h2>
            <p>{{ service.description }}</p>
          </div>

          <!-- Service Tags -->
          <div class="service-tags" *ngIf="service.tags && service.tags.length > 0">
            <h3>Skills & Technologies</h3>
            <div class="tags-container">
              <span *ngFor="let tag of service.tags" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- Provider Info -->
          <div class="provider-section" *ngIf="service.provider">
            <h2>About the Provider</h2>
            <div class="provider-card">
              <div class="provider-info">
                <h3>{{ service.provider.firstName }} {{ service.provider.lastName }}</h3>
                <div class="provider-stats">
                  <div class="stat">
                    <span class="stat-value">{{ service.provider.rating }}/5</span>
                    <span class="stat-label">Rating</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ service.provider.totalTransactions }}</span>
                    <span class="stat-label">Completed</span>
                  </div>
                </div>
                <p class="provider-bio">{{ service.provider.bio }}</p>
              </div>
            </div>
          </div>

          <!-- Service Details -->
          <div class="service-details">
            <h2>Service Details</h2>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">{{ service.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ service.hourlyDuration }} hours</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Available</span>
                <span class="detail-value" [class.active]="service.isActive">
                  {{ service.isActive ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Listed</span>
                <span class="detail-value">{{ formatDate(service.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Call to Action for Non-Authenticated Users -->
          <div *ngIf="!isAuthenticated" class="cta-section">
            <div class="cta-card">
              <h2>Join HourBank to Book This Service</h2>
              <p>Sign up to request services and offer your own skills to the community</p>
              <div class="cta-actions">
                <a routerLink="/auth" class="btn btn-primary btn-lg">Sign Up Free</a>
                <a routerLink="/services" class="btn btn-secondary">Browse More Services</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div *ngIf="showBookingModal && service" class="modal-overlay" (click)="closeBookingModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Book {{ service.title }}</h3>
          <button class="btn-close" (click)="closeBookingModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Booking functionality will be available soon.</p>
          <p>You'll be able to select specific time slots and confirm your booking.</p>
          <button class="btn btn-secondary" (click)="closeBookingModal()">Close</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!service" class="loading-state">
      <div class="container">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <p>Loading service details...</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service: Service | null = null;
  isAuthenticated: boolean = false;
  showBookingModal = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  /**
   * Generate random duration between 1-4 hours for services
   */
  private getRandomHours(): number {
    return Math.floor(Math.random() * 4) + 1; // Returns 1, 2, 3, or 4
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.loadServiceDetails();
  }

  private checkAuthStatus() {
    this.authService.isAuthenticated$.subscribe(
      (authenticated: boolean) => {
        this.isAuthenticated = authenticated;
      }
    );
  }

  private loadServiceDetails() {
    // Get service ID from route
    const serviceId = this.route.snapshot.paramMap.get('id');
    
    if (serviceId) {
      // Mock service data - in real app, fetch from GraphQL API
      this.service = {
        id: serviceId,
        title: 'Full-Stack Web Development',
        description: 'I create modern, responsive websites and web applications using React, Angular, Node.js, and cloud technologies. With over 5 years of experience, I can help you build everything from simple landing pages to complex web applications.',
        category: 'Technology',
        hourlyDuration: this.getRandomHours(),
        tags: ['React', 'Angular', 'Node.js', 'AWS', 'TypeScript', 'JavaScript', 'HTML/CSS'],
        requiresScheduling: false,
        isActive: true,
        createdAt: '2024-01-15',
        provider: {
          id: 'provider-1',
          firstName: 'John',
          lastName: 'Doe',
          rating: 4.8,
          totalTransactions: 24,
          bio: 'Experienced full-stack developer with a passion for creating efficient, scalable web solutions. I specialize in modern JavaScript frameworks and cloud technologies.',
          skills: ['React', 'Angular', 'Node.js', 'AWS', 'TypeScript'],
          joinedDate: 'January 2024'
        }
      };
    }
  }

  openBookingModal() {
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  onBookingCreated() {
    this.closeBookingModal();
    // Handle successful booking
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }
}
