import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleManagementComponent } from '../schedule-management/schedule-management.component';

interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  hourlyRate: number;
  tags: string[];
  isActive: boolean;
  requiresScheduling: boolean;
  minBookingHours?: number;
  maxBookingHours?: number;
  advanceBookingDays?: number;
  cancellationHours?: number;
  createdAt: Date;
  updatedAt: Date;
  totalBookings: number;
  averageRating: number;
  totalEarnings: number;
}

@Component({
  selector: 'app-my-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleManagementComponent],
  template: `
    <div class="my-services-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Services</h1>
          <p class="page-subtitle">Manage your service offerings and track your earnings</p>
        </div>
        <button class="btn btn-primary" (click)="showAddServiceForm = true">
          <span class="btn-icon">➕</span>
          Add New Service
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-number">{{ myServices.length }}</span>
            <span class="stat-label">Active Services</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <span class="stat-number">{{ getTotalEarnings() }}</span>
            <span class="stat-label">Hours Earned</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-number">{{ getTotalBookings() }}</span>
            <span class="stat-label">Total Bookings</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-number">{{ getAverageRating() }}</span>
            <span class="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>

      <!-- Add Service Form -->
      <div *ngIf="showAddServiceForm" class="add-service-form">
        <div class="form-header">
          <h3>Add New Service</h3>
          <button class="close-btn" (click)="cancelAddService()">✕</button>
        </div>
        <form (ngSubmit)="addService()" class="service-form">
          <div class="form-group">
            <label for="title">Service Title *</label>
            <input 
              type="text" 
              id="title"
              [(ngModel)]="newService.title" 
              name="title"
              placeholder="e.g., Web Development, Cooking Lessons"
              required
            >
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description"
              [(ngModel)]="newService.description" 
              name="description"
              placeholder="Describe what you offer and what makes your service unique..."
              rows="4"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category *</label>
              <select 
                id="category"
                [(ngModel)]="newService.category" 
                name="category"
                required
              >
                <option value="">Select Category</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Creative">Creative</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Business">Business</option>
                <option value="Food & Cooking">Food & Cooking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="hourlyRate">Hourly Rate (Hours) *</label>
              <input 
                type="number" 
                id="hourlyRate"
                [(ngModel)]="newService.hourlyRate" 
                name="hourlyRate"
                min="1"
                placeholder="1"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="tags">Tags (comma-separated)</label>
            <input 
              type="text" 
              id="tags"
              [(ngModel)]="newService.tagsString" 
              name="tags"
              placeholder="e.g., react, javascript, frontend"
            >
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancelAddService()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
              <span *ngIf="!isSubmitting">Add Service</span>
              <span *ngIf="isSubmitting">Adding...</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Services List -->
      <div class="services-section">
        <div class="section-header">
          <h2>Your Services</h2>
          <div class="filter-controls">
            <select [(ngModel)]="filterStatus" class="filter-select">
              <option value="all">All Services</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div *ngIf="filteredServices.length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>No Services Yet</h3>
          <p>Start earning hours by adding your first service offering</p>
          <button class="btn btn-primary" (click)="showAddServiceForm = true">
            Add Your First Service
          </button>
        </div>

        <div class="services-grid">
          <div *ngFor="let service of filteredServices" class="service-card">
            <div class="service-header">
              <div class="service-title-section">
                <h3 class="service-title">{{ service.title }}</h3>
                <span class="service-category">{{ service.category }}</span>
              </div>
              <div class="service-status">
                <span 
                  class="status-badge"
                  [class.active]="service.isActive"
                  [class.inactive]="!service.isActive"
                >
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <p class="service-description">{{ service.description }}</p>

            <div class="service-tags">
              <span *ngFor="let tag of service.tags" class="tag">{{ tag }}</span>
            </div>

            <div class="service-stats">
              <div class="stat">
                <span class="stat-label">Rate:</span>
                <span class="stat-value">{{ service.hourlyRate }} hr/hr</span>
              </div>
              <div class="stat">
                <span class="stat-label">Bookings:</span>
                <span class="stat-value">{{ service.totalBookings }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Rating:</span>
                <span class="stat-value">
                  {{ service.averageRating > 0 ? service.averageRating.toFixed(1) : 'N/A' }}
                  <span *ngIf="service.averageRating > 0">⭐</span>
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Earned:</span>
                <span class="stat-value">{{ service.totalEarnings }} hrs</span>
              </div>
            </div>

            <div class="service-actions">
              <button class="btn btn-sm btn-secondary" (click)="editService(service)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button 
                class="btn btn-sm btn-info" 
                (click)="manageSchedule(service)"
                title="Manage Schedule">
                <i class="fas fa-calendar-alt"></i> Schedule
              </button>
              <button 
                class="btn btn-sm"
                [class.btn-warning]="service.isActive"
                [class.btn-success]="!service.isActive"
                (click)="toggleServiceStatus(service)"
              >
                {{ service.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button class="btn btn-sm btn-danger" (click)="deleteService(service)">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Management Modal -->
    <div *ngIf="showScheduleModal" class="modal-overlay" (click)="closeScheduleModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Manage Schedule - {{ selectedService?.title }}</h3>
          <button class="btn-close" (click)="closeScheduleModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <app-schedule-management 
            *ngIf="selectedService"
            [service]="selectedService"
            (scheduleUpdated)="onScheduleUpdated()"
            (cancelled)="closeScheduleModal()">
          </app-schedule-management>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./my-services.component.scss']
})
export class MyServicesComponent implements OnInit {
  myServices: Service[] = [];
  filteredServices: Service[] = [];
  showAddServiceForm = false;
  showScheduleModal = false;
  selectedService: Service | null = null;
  filterStatus = 'all';
  isSubmitting = false;

  newService = {
    title: '',
    description: '',
    category: '',
    hourlyRate: 1,
    tagsString: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMyServices();
  }

  loadMyServices() {
    // Mock data - in real app, fetch from GraphQL API
    this.myServices = [
      {
        id: '1',
        userId: 'user-1',
        title: 'Full-Stack Web Development',
        description: 'I create modern, responsive websites and web applications using React, Angular, Node.js, and cloud technologies.',
        category: 'Technology',
        hourlyRate: 1,
        tags: ['React', 'Angular', 'Node.js', 'AWS', 'TypeScript'],
        isActive: true,
        requiresScheduling: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        totalBookings: 12,
        averageRating: 4.8,
        totalEarnings: 48
      },
      {
        id: '2',
        userId: 'user-1',
        title: 'UI/UX Design Consultation',
        description: 'Help improve your app or website user experience with modern design principles and user research.',
        category: 'Creative',
        hourlyRate: 1,
        tags: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
        isActive: true,
        requiresScheduling: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        totalBookings: 8,
        averageRating: 4.9,
        totalEarnings: 32
      },
      {
        id: '3',
        userId: 'user-1',
        title: 'Photography Lessons',
        description: 'Learn photography basics, composition, and photo editing. Perfect for beginners and hobbyists.',
        category: 'Creative',
        hourlyRate: 1,
        tags: ['Photography', 'Lightroom', 'Composition', 'Portrait'],
        isActive: false,
        requiresScheduling: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        totalBookings: 5,
        averageRating: 4.6,
        totalEarnings: 20
      }
    ];

    this.filterServices();
  }

  filterServices() {
    switch (this.filterStatus) {
      case 'active':
        this.filteredServices = this.myServices.filter(s => s.isActive);
        break;
      case 'inactive':
        this.filteredServices = this.myServices.filter(s => !s.isActive);
        break;
      default:
        this.filteredServices = [...this.myServices];
    }
  }

  addService() {
    if (!this.newService.title || !this.newService.description || !this.newService.category) {
      return;
    }

    this.isSubmitting = true;

    const service: Service = {
      id: Date.now().toString(),
      userId: 'user-1',
      title: this.newService.title,
      description: this.newService.description,
      category: this.newService.category,
      hourlyRate: this.newService.hourlyRate,
      tags: this.newService.tagsString ? this.newService.tagsString.split(',').map(t => t.trim()) : [],
      isActive: true,
      requiresScheduling: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalBookings: 0,
      averageRating: 0,
      totalEarnings: 0
    };

    // In real app, save via GraphQL API
    this.myServices.unshift(service);
    this.filterServices();
    this.cancelAddService();
    this.isSubmitting = false;

    console.log('Service added:', service);
  }

  cancelAddService() {
    this.showAddServiceForm = false;
    this.newService = {
      title: '',
      description: '',
      category: '',
      hourlyRate: 1,
      tagsString: ''
    };
  }

  editService(service: Service) {
    // In real app, navigate to edit form or show modal
    console.log('Edit service:', service);
  }

  toggleServiceStatus(service: Service) {
    service.isActive = !service.isActive;
    this.filterServices();
    // In real app, update via GraphQL API
    console.log('Service status toggled:', service);
  }

  deleteService(service: Service) {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      this.myServices = this.myServices.filter(s => s.id !== service.id);
      this.filterServices();
      // In real app, delete via GraphQL API
      console.log('Service deleted:', service);
    }
  }

  getTotalEarnings(): number {
    return this.myServices.reduce((total, service) => total + service.totalEarnings, 0);
  }

  getTotalBookings(): number {
    return this.myServices.reduce((total, service) => total + service.totalBookings, 0);
  }

  getAverageRating(): string {
    const servicesWithRatings = this.myServices.filter(s => s.averageRating > 0);
    if (servicesWithRatings.length === 0) return 'N/A';
    
    const average = servicesWithRatings.reduce((total, service) => total + service.averageRating, 0) / servicesWithRatings.length;
    return average.toFixed(1);
  }

  ngOnChanges() {
    this.filterServices();
  }

  // Schedule Management Methods
  manageSchedule(service: Service): void {
    this.selectedService = service;
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.selectedService = null;
  }

  onScheduleUpdated(): void {
    this.closeScheduleModal();
    // Show success message
    console.log('Schedule updated successfully');
    // Optionally refresh service data
  }
}
