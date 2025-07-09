import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service, TimeSlot, CreateBookingInput, User } from '../../models/user.model';
import { SchedulingService } from '../../services/scheduling.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="booking-component">
      <div class="booking-header">
        <h3>Book {{ service.title }}</h3>
        <div class="service-info">
          <p class="provider-name">
            <i class="fas fa-user"></i>
            Provider: {{ service.provider?.firstName }} {{ service.provider?.lastName }}
          </p>
          <p class="hourly-rate">
            <i class="fas fa-clock"></i>
            {{ service.hourlyDuration }} bank hours per hour
          </p>
        </div>
      </div>

      <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
        <!-- Date Selection -->
        <div class="form-group mb-3">
          <label for="bookingDate" class="form-label">Select Date</label>
          <input 
            type="date" 
            class="form-control" 
            id="bookingDate"
            formControlName="bookingDate"
            [min]="minDate"
            [max]="maxDate"
            (change)="onDateChange()">
          <small class="form-text text-muted">
            Available dates: {{ getAvailableDateRange() }}
          </small>
        </div>

        <!-- Duration Selection -->
        <div class="form-group mb-3">
          <label for="duration" class="form-label">Duration (hours)</label>
          <select 
            class="form-select" 
            id="duration"
            formControlName="duration"
            (change)="onDurationChange()">
            <option value="">Select duration</option>
            <option 
              *ngFor="let option of durationOptions" 
              [value]="option.value">
              {{ option.label }}
            </option>
          </select>
          <small class="form-text text-muted">
            <span *ngIf="service.minBookingHours">
              Minimum: {{ service.minBookingHours }} hours
            </span>
            <span *ngIf="service.maxBookingHours" class="ms-2">
              Maximum: {{ service.maxBookingHours }} hours
            </span>
          </small>
        </div>

        <!-- Time Slot Selection -->
        <div *ngIf="availableTimeSlots.length > 0" class="form-group mb-3">
          <label class="form-label">Available Time Slots</label>
          <div class="time-slots">
            <div 
              *ngFor="let slot of availableTimeSlots" 
              class="time-slot"
              [class.available]="slot.isAvailable"
              [class.unavailable]="!slot.isAvailable">
              
              <input 
                type="radio" 
                [id]="'slot-' + slot.startTime"
                name="timeSlot"
                [value]="slot.startTime + '-' + slot.endTime"
                [disabled]="!slot.isAvailable"
                (change)="onTimeSlotSelect(slot)">
              
              <label [for]="'slot-' + slot.startTime" class="time-slot-label">
                <div class="time-range">
                  {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                </div>
                <div *ngIf="!slot.isAvailable" class="conflict-reason">
                  {{ slot.conflictReason }}
                </div>
              </label>
            </div>
          </div>
          
          <div *ngIf="selectedDate && availableTimeSlots.length === 0" class="no-slots">
            <i class="fas fa-calendar-times"></i>
            <p>No available time slots for the selected date and duration.</p>
            <p class="text-muted">Try selecting a different date or shorter duration.</p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoadingSlots" class="loading-slots">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Loading available time slots...
        </div>

        <!-- Booking Summary -->
        <div *ngIf="selectedTimeSlot" class="booking-summary">
          <h5>Booking Summary</h5>
          <div class="summary-details">
            <div class="summary-row">
              <span class="label">Service:</span>
              <span class="value">{{ service.title }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedDate) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Time:</span>
              <span class="value">{{ formatTime(selectedTimeSlot.startTime) }} - {{ formatTime(selectedTimeSlot.endTime) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Duration:</span>
              <span class="value">{{ selectedDuration }} hours</span>
            </div>
            <div class="summary-row total">
              <span class="label">Total Cost:</span>
              <span class="value">{{ totalCost }} bank hours</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group mb-3">
          <label for="notes" class="form-label">Notes (Optional)</label>
          <textarea 
            class="form-control" 
            id="notes"
            formControlName="notes"
            rows="3"
            placeholder="Any special requirements or notes for the provider..."></textarea>
        </div>

        <!-- Bank Hours Check -->
        <div *ngIf="currentUser && totalCost > 0" class="bank-hours-check">
          <div 
            class="alert"
            [class.alert-success]="currentUser.bankHours >= totalCost"
            [class.alert-warning]="currentUser.bankHours < totalCost">
            
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>Your Bank Hours:</strong> {{ currentUser.bankHours }}
                <br>
                <strong>Required:</strong> {{ totalCost }}
              </div>
              <div class="balance-status">
                <i 
                  class="fas"
                  [class.fa-check-circle]="currentUser.bankHours >= totalCost"
                  [class.fa-exclamation-triangle]="currentUser.bankHours < totalCost"></i>
              </div>
            </div>
            
            <div *ngIf="currentUser.bankHours < totalCost" class="mt-2">
              <small>
                You need {{ totalCost - currentUser.bankHours }} more bank hours to book this service.
                <a href="/services" class="ms-2">Offer your services to earn more hours</a>
              </small>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="bookingForm.invalid || isLoading || !canBook()">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Book Service
          </button>
          <button 
            type="button" 
            class="btn btn-secondary ms-2"
            (click)="onCancel()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .booking-component {
      max-width: 600px;
    }

    .booking-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .service-info {
      margin-top: 1rem;
    }

    .service-info p {
      margin-bottom: 0.5rem;
      color: #6c757d;
    }

    .service-info i {
      width: 20px;
      margin-right: 0.5rem;
    }

    .time-slots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .time-slot {
      position: relative;
    }

    .time-slot input[type="radio"] {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: pointer;
    }

    .time-slot input[type="radio"]:disabled {
      cursor: not-allowed;
    }

    .time-slot-label {
      display: block;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 0.375rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 0;
    }

    .time-slot.available .time-slot-label:hover {
      border-color: #0d6efd;
      background-color: #f8f9ff;
    }

    .time-slot input[type="radio"]:checked + .time-slot-label {
      border-color: #0d6efd;
      background-color: #0d6efd;
      color: white;
    }

    .time-slot.unavailable .time-slot-label {
      background-color: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .time-range {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .conflict-reason {
      font-size: 0.75rem;
      color: #dc3545;
    }

    .no-slots {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    }

    .no-slots i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
    }

    .loading-slots {
      text-align: center;
      padding: 1rem;
      color: #6c757d;
    }

    .booking-summary {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .summary-details {
      margin-top: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.1rem;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 2px solid #dee2e6;
    }

    .summary-row .label {
      color: #6c757d;
    }

    .bank-hours-check {
      margin: 1.5rem 0;
    }

    .balance-status i {
      font-size: 1.5rem;
    }

    .form-actions {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    @media (max-width: 768px) {
      .time-slots {
        grid-template-columns: 1fr;
      }
      
      .summary-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class BookingComponent implements OnInit {
  @Input() service!: Service;
  @Output() bookingCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  bookingForm!: FormGroup;
  availableTimeSlots: TimeSlot[] = [];
  selectedTimeSlot: TimeSlot | null = null;
  selectedDate: string = '';
  selectedDuration: number = 0;
  totalCost: number = 0;
  currentUser: User | null = null;
  
  isLoading = false;
  isLoadingSlots = false;
  
  minDate: string = '';
  maxDate: string = '';
  durationOptions: { value: number; label: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setDateLimits();
    this.generateDurationOptions();
    this.loadCurrentUser();
  }

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required],
      duration: ['', Validators.required],
      notes: ['']
    });
  }

  private setDateLimits(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + (this.service.advanceBookingDays || 30));
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  private generateDurationOptions(): void {
    const min = this.service.minBookingHours || 0.5;
    const max = this.service.maxBookingHours || 8;
    
    this.durationOptions = [];
    
    for (let hours = min; hours <= max; hours += 0.5) {
      this.durationOptions.push({
        value: hours,
        label: hours === 1 ? '1 hour' : `${hours} hours`
      });
    }
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      this.currentUser = await this.authService.getCurrentUser();
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  async onDateChange(): Promise<void> {
    this.selectedDate = this.bookingForm.get('bookingDate')?.value;
    this.selectedTimeSlot = null;
    this.availableTimeSlots = [];
    
    if (this.selectedDate && this.selectedDuration > 0) {
      await this.loadAvailableTimeSlots();
    }
  }

  async onDurationChange(): Promise<void> {
    this.selectedDuration = parseFloat(this.bookingForm.get('duration')?.value || '0');
    this.selectedTimeSlot = null;
    this.calculateTotalCost();
    
    if (this.selectedDate && this.selectedDuration > 0) {
      await this.loadAvailableTimeSlots();
    }
  }

  private async loadAvailableTimeSlots(): Promise<void> {
    if (!this.selectedDate || !this.selectedDuration) return;

    this.isLoadingSlots = true;
    
    try {
      this.availableTimeSlots = await this.schedulingService.getAvailableTimeSlots(
        this.service.id,
        this.selectedDate,
        this.selectedDuration
      );
    } catch (error) {
      console.error('Error loading available time slots:', error);
      this.availableTimeSlots = [];
    } finally {
      this.isLoadingSlots = false;
    }
  }

  onTimeSlotSelect(slot: TimeSlot): void {
    if (!slot.isAvailable) return;
    
    this.selectedTimeSlot = slot;
    this.calculateTotalCost();
  }

  private calculateTotalCost(): void {
    this.totalCost = this.selectedDuration * this.service.hourlyDuration;
  }

  canBook(): boolean {
    return !!(
      this.selectedTimeSlot &&
      this.currentUser &&
      this.currentUser.bankHours >= this.totalCost
    );
  }

  async onSubmit(): Promise<void> {
    if (this.bookingForm.invalid || !this.selectedTimeSlot || !this.canBook()) {
      return;
    }

    this.isLoading = true;

    try {
      const bookingInput: CreateBookingInput = {
        serviceId: this.service.id,
        bookingDate: this.selectedDate,
        startTime: this.selectedTimeSlot.startTime,
        endTime: this.selectedTimeSlot.endTime,
        duration: this.selectedDuration,
        notes: this.bookingForm.get('notes')?.value || undefined
      };

      await this.schedulingService.createBooking(bookingInput);
      this.bookingCreated.emit();
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Utility methods
  getAvailableDateRange(): string {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + (this.service.advanceBookingDays || 30));
    
    return `${this.formatDate(today.toISOString().split('T')[0])} - ${this.formatDate(maxDate.toISOString().split('T')[0])}`;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
