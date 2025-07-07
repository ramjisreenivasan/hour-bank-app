import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking, BookingStatus, BookingRole, BookingCalendarEvent } from '../../models/user.model';
import { SchedulingService } from '../../services/scheduling.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-management">
      <div class="page-header">
        <h2>Booking Management</h2>
        <p class="text-muted">Manage your service bookings and schedule</p>
      </div>

      <!-- View Toggle -->
      <div class="view-controls mb-4">
        <div class="btn-group" role="group">
          <input 
            type="radio" 
            class="btn-check" 
            name="viewMode" 
            id="list-view" 
            value="list"
            [(ngModel)]="currentView"
            (change)="onViewChange()">
          <label class="btn btn-outline-primary" for="list-view">
            <i class="fas fa-list"></i> List View
          </label>

          <input 
            type="radio" 
            class="btn-check" 
            name="viewMode" 
            id="calendar-view" 
            value="calendar"
            [(ngModel)]="currentView"
            (change)="onViewChange()">
          <label class="btn btn-outline-primary" for="calendar-view">
            <i class="fas fa-calendar"></i> Calendar View
          </label>
        </div>

        <div class="date-range-selector ms-3">
          <select class="form-select" [(ngModel)]="selectedDateRange" (change)="onDateRangeChange()">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="status-filters mb-4">
        <div class="btn-group" role="group">
          <input 
            type="radio" 
            class="btn-check" 
            name="statusFilter" 
            id="all-status" 
            value="all"
            [(ngModel)]="selectedStatus"
            (change)="filterBookings()">
          <label class="btn btn-outline-secondary btn-sm" for="all-status">
            All ({{ getTotalCount() }})
          </label>

          <input 
            type="radio" 
            class="btn-check" 
            name="statusFilter" 
            id="pending-status" 
            value="PENDING"
            [(ngModel)]="selectedStatus"
            (change)="filterBookings()">
          <label class="btn btn-outline-warning btn-sm" for="pending-status">
            Pending ({{ getStatusCount('PENDING') }})
          </label>

          <input 
            type="radio" 
            class="btn-check" 
            name="statusFilter" 
            id="confirmed-status" 
            value="CONFIRMED"
            [(ngModel)]="selectedStatus"
            (change)="filterBookings()">
          <label class="btn btn-outline-success btn-sm" for="confirmed-status">
            Confirmed ({{ getStatusCount('CONFIRMED') }})
          </label>

          <input 
            type="radio" 
            class="btn-check" 
            name="statusFilter" 
            id="completed-status" 
            value="COMPLETED"
            [(ngModel)]="selectedStatus"
            (change)="filterBookings()">
          <label class="btn btn-outline-info btn-sm" for="completed-status">
            Completed ({{ getStatusCount('COMPLETED') }})
          </label>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading bookings...</p>
      </div>

      <!-- List View -->
      <div *ngIf="currentView === 'list' && !isLoading" class="list-view">
        <div *ngIf="filteredBookings.length === 0" class="no-bookings">
          <i class="fas fa-calendar-times"></i>
          <h4>No bookings found</h4>
          <p class="text-muted">
            <span *ngIf="selectedStatus === 'all'">You don't have any bookings yet.</span>
            <span *ngIf="selectedStatus !== 'all'">No bookings with {{ selectedStatus.toLowerCase() }} status.</span>
          </p>
        </div>

        <div class="booking-cards">
          <div 
            *ngFor="let booking of filteredBookings" 
            class="booking-card"
            [class.pending]="booking.status === 'PENDING'"
            [class.confirmed]="booking.status === 'CONFIRMED'"
            [class.completed]="booking.status === 'COMPLETED'">
            
            <div class="booking-header">
              <div class="booking-info">
                <h5 class="service-title">{{ booking.service?.title }}</h5>
                <p class="consumer-name">
                  <i class="fas fa-user"></i>
                  {{ booking.consumer?.firstName }} {{ booking.consumer?.lastName }}
                </p>
              </div>
              <div class="booking-status">
                <span 
                  class="badge"
                  [class.bg-warning]="booking.status === 'PENDING'"
                  [class.bg-success]="booking.status === 'CONFIRMED'"
                  [class.bg-info]="booking.status === 'COMPLETED'"
                  [class.bg-danger]="booking.status.includes('CANCELLED')">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(booking.bookingDate) }}</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-hourglass-half"></i>
                <span>{{ booking.duration }} hours</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-coins"></i>
                <span>{{ booking.totalCost }} bank hours</span>
              </div>
            </div>

            <div *ngIf="booking.notes" class="booking-notes">
              <strong>Consumer Notes:</strong>
              <p>{{ booking.notes }}</p>
            </div>

            <div *ngIf="booking.providerNotes" class="provider-notes">
              <strong>Your Notes:</strong>
              <p>{{ booking.providerNotes }}</p>
            </div>

            <div class="booking-actions">
              <button 
                *ngIf="booking.status === 'PENDING'"
                class="btn btn-success btn-sm me-2"
                (click)="confirmBooking(booking)">
                <i class="fas fa-check"></i> Confirm
              </button>
              
              <button 
                *ngIf="booking.status === 'PENDING'"
                class="btn btn-danger btn-sm me-2"
                (click)="cancelBooking(booking)">
                <i class="fas fa-times"></i> Decline
              </button>

              <button 
                *ngIf="booking.status === 'CONFIRMED'"
                class="btn btn-primary btn-sm me-2"
                (click)="startService(booking)">
                <i class="fas fa-play"></i> Start Service
              </button>

              <button 
                *ngIf="booking.status === 'IN_PROGRESS'"
                class="btn btn-success btn-sm me-2"
                (click)="completeService(booking)">
                <i class="fas fa-check-circle"></i> Complete
              </button>

              <button 
                *ngIf="canCancel(booking)"
                class="btn btn-outline-danger btn-sm me-2"
                (click)="cancelBooking(booking)">
                <i class="fas fa-ban"></i> Cancel
              </button>

              <button 
                class="btn btn-outline-secondary btn-sm"
                (click)="addNotes(booking)">
                <i class="fas fa-sticky-note"></i> Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div *ngIf="currentView === 'calendar' && !isLoading" class="calendar-view">
        <div class="calendar-header">
          <button class="btn btn-outline-secondary" (click)="previousPeriod()">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h4>{{ getCurrentPeriodLabel() }}</h4>
          <button class="btn btn-outline-secondary" (click)="nextPeriod()">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="calendar-grid">
          <!-- Calendar implementation would go here -->
          <!-- For now, showing a simplified day view -->
          <div class="calendar-days">
            <div 
              *ngFor="let day of getCalendarDays()" 
              class="calendar-day"
              [class.today]="isToday(day.date)"
              [class.has-bookings]="day.bookings.length > 0">
              
              <div class="day-header">
                <span class="day-number">{{ day.date.getDate() }}</span>
                <span class="day-name">{{ getDayName(day.date) }}</span>
              </div>

              <div class="day-bookings">
                <div 
                  *ngFor="let booking of day.bookings" 
                  class="calendar-booking"
                  [class]="getBookingClass(booking.status)">
                  <div class="booking-time">{{ formatTime(booking.startTime) }}</div>
                  <div class="booking-title">{{ booking.service?.title }}</div>
                  <div class="booking-consumer">{{ booking.consumer?.firstName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Modal -->
    <div *ngIf="showNotesModal" class="modal-overlay" (click)="closeNotesModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h5>Add Notes</h5>
          <button class="btn-close" (click)="closeNotesModal()"></button>
        </div>
        <div class="modal-body">
          <textarea 
            class="form-control" 
            rows="4" 
            [(ngModel)]="currentNotes"
            placeholder="Add your notes about this booking..."></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeNotesModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveNotes()">Save Notes</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-management {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .view-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .status-filters .btn-group {
      flex-wrap: wrap;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-bookings {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-bookings i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .booking-cards {
      display: grid;
      gap: 1.5rem;
    }

    .booking-card {
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      padding: 1.5rem;
      background: white;
      transition: all 0.2s ease;
    }

    .booking-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .booking-card.pending {
      border-left: 4px solid #ffc107;
    }

    .booking-card.confirmed {
      border-left: 4px solid #28a745;
    }

    .booking-card.completed {
      border-left: 4px solid #6c757d;
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .service-title {
      margin-bottom: 0.5rem;
      color: #212529;
    }

    .consumer-name {
      color: #6c757d;
      margin-bottom: 0;
    }

    .consumer-name i {
      margin-right: 0.5rem;
    }

    .booking-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      color: #6c757d;
    }

    .detail-row i {
      width: 20px;
      margin-right: 0.5rem;
    }

    .booking-notes,
    .provider-notes {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
    }

    .booking-notes p,
    .provider-notes p {
      margin-bottom: 0;
      margin-top: 0.5rem;
    }

    .booking-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .calendar-view {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: #dee2e6;
    }

    .calendar-day {
      background: white;
      min-height: 120px;
      padding: 0.5rem;
    }

    .calendar-day.today {
      background-color: #e3f2fd;
    }

    .calendar-day.has-bookings {
      background-color: #f8f9fa;
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .day-number {
      font-weight: 600;
    }

    .calendar-booking {
      background: #007bff;
      color: white;
      padding: 0.25rem;
      border-radius: 0.25rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
    }

    .calendar-booking.pending {
      background: #ffc107;
      color: #212529;
    }

    .calendar-booking.confirmed {
      background: #28a745;
    }

    .calendar-booking.completed {
      background: #6c757d;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .modal-content {
      background: white;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .booking-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .booking-details {
        grid-template-columns: 1fr;
      }

      .calendar-days {
        grid-template-columns: 1fr;
      }

      .view-controls {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class BookingManagementComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  currentView: 'list' | 'calendar' = 'list';
  selectedStatus: string = 'all';
  selectedDateRange: string = 'upcoming';
  isLoading = false;
  
  // Modal state
  showNotesModal = false;
  currentBooking: Booking | null = null;
  currentNotes = '';

  // Calendar state
  currentDate = new Date();

  constructor(
    private schedulingService: SchedulingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    this.isLoading = true;

    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) return;

      const { startDate, endDate } = this.getDateRange();
      
      this.bookings = await this.schedulingService.getBookingsByDateRange(
        currentUser.id,
        startDate,
        endDate,
        BookingRole.PROVIDER
      );

      this.filterBookings();
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private getDateRange(): { startDate: string; endDate: string } {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'upcoming':
      default:
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 90);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      if (this.selectedStatus === 'all') return true;
      return booking.status === this.selectedStatus;
    });
  }

  onViewChange(): void {
    // View changed, no additional action needed
  }

  onDateRangeChange(): void {
    this.loadBookings();
  }

  // Booking Actions
  async confirmBooking(booking: Booking): Promise<void> {
    try {
      await this.schedulingService.updateBookingStatus(
        booking.id, 
        BookingStatus.CONFIRMED
      );
      booking.status = BookingStatus.CONFIRMED;
      this.filterBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  }

  async cancelBooking(booking: Booking): Promise<void> {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await this.schedulingService.updateBookingStatus(
        booking.id, 
        BookingStatus.CANCELLED_BY_PROVIDER,
        reason
      );
      booking.status = BookingStatus.CANCELLED_BY_PROVIDER;
      booking.cancellationReason = reason;
      this.filterBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  }

  async startService(booking: Booking): Promise<void> {
    try {
      await this.schedulingService.updateBookingStatus(
        booking.id, 
        BookingStatus.IN_PROGRESS
      );
      booking.status = BookingStatus.IN_PROGRESS;
      this.filterBookings();
    } catch (error) {
      console.error('Error starting service:', error);
    }
  }

  async completeService(booking: Booking): Promise<void> {
    try {
      await this.schedulingService.updateBookingStatus(
        booking.id, 
        BookingStatus.COMPLETED
      );
      booking.status = BookingStatus.COMPLETED;
      this.filterBookings();
    } catch (error) {
      console.error('Error completing service:', error);
    }
  }

  canCancel(booking: Booking): boolean {
    const cancellableStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
    return cancellableStatuses.includes(booking.status);
  }

  // Notes Management
  addNotes(booking: Booking): void {
    this.currentBooking = booking;
    this.currentNotes = booking.providerNotes || '';
    this.showNotesModal = true;
  }

  closeNotesModal(): void {
    this.showNotesModal = false;
    this.currentBooking = null;
    this.currentNotes = '';
  }

  async saveNotes(): Promise<void> {
    if (!this.currentBooking) return;

    try {
      await this.schedulingService.updateBookingStatus(
        this.currentBooking.id,
        this.currentBooking.status,
        this.currentNotes
      );
      this.currentBooking.providerNotes = this.currentNotes;
      this.closeNotesModal();
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  // Status Counts
  getTotalCount(): number {
    return this.bookings.length;
  }

  getStatusCount(status: string): number {
    return this.bookings.filter(b => b.status === status).length;
  }

  getStatusLabel(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Pending';
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.IN_PROGRESS:
        return 'In Progress';
      case BookingStatus.COMPLETED:
        return 'Completed';
      case BookingStatus.CANCELLED_BY_CONSUMER:
        return 'Cancelled by Consumer';
      case BookingStatus.CANCELLED_BY_PROVIDER:
        return 'Cancelled by You';
      case BookingStatus.NO_SHOW_CONSUMER:
        return 'Consumer No-Show';
      case BookingStatus.NO_SHOW_PROVIDER:
        return 'Provider No-Show';
      default:
        return status;
    }
  }

  // Calendar Methods
  getCalendarDays(): { date: Date; bookings: Booking[] }[] {
    const days: { date: Date; bookings: Booking[] }[] = [];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayBookings = this.filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.toDateString() === date.toDateString();
      });

      days.push({ date, bookings: dayBookings });
    }

    return days;
  }

  getCurrentPeriodLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  previousPeriod(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
  }

  nextPeriod(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getBookingClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'pending';
      case BookingStatus.CONFIRMED:
        return 'confirmed';
      case BookingStatus.COMPLETED:
        return 'completed';
      default:
        return '';
    }
  }

  // Utility Methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}
