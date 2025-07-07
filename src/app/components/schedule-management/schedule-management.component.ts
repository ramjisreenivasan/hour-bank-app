import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Service, ServiceSchedule, CreateServiceScheduleInput } from '../../models/user.model';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="schedule-management">
      <div class="schedule-header">
        <h3>Service Schedule</h3>
        <p class="text-muted">Set your availability for this service</p>
      </div>

      <form [formGroup]="scheduleForm" (ngSubmit)="onSubmit()">
        <!-- Scheduling Toggle -->
        <div class="form-group mb-4">
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="requiresScheduling"
              formControlName="requiresScheduling">
            <label class="form-check-label" for="requiresScheduling">
              <strong>This service requires scheduled appointments</strong>
            </label>
          </div>
          <small class="form-text text-muted">
            If enabled, consumers will need to book specific time slots for this service
          </small>
        </div>

        <!-- Scheduling Options (shown when scheduling is enabled) -->
        <div *ngIf="scheduleForm.get('requiresScheduling')?.value" class="scheduling-options">
          
          <!-- Booking Constraints -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="minBookingHours" class="form-label">Minimum Booking Duration (hours)</label>
              <input 
                type="number" 
                class="form-control" 
                id="minBookingHours"
                formControlName="minBookingHours"
                min="0.5" 
                step="0.5"
                placeholder="1.0">
            </div>
            <div class="col-md-6">
              <label for="maxBookingHours" class="form-label">Maximum Booking Duration (hours)</label>
              <input 
                type="number" 
                class="form-control" 
                id="maxBookingHours"
                formControlName="maxBookingHours"
                min="0.5" 
                step="0.5"
                placeholder="8.0">
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <label for="advanceBookingDays" class="form-label">Advance Booking (days)</label>
              <input 
                type="number" 
                class="form-control" 
                id="advanceBookingDays"
                formControlName="advanceBookingDays"
                min="1" 
                max="365"
                placeholder="30">
              <small class="form-text text-muted">How far in advance can bookings be made</small>
            </div>
            <div class="col-md-6">
              <label for="cancellationHours" class="form-label">Cancellation Notice (hours)</label>
              <input 
                type="number" 
                class="form-control" 
                id="cancellationHours"
                formControlName="cancellationHours"
                min="1" 
                max="168"
                placeholder="24">
              <small class="form-text text-muted">Minimum notice required for cancellations</small>
            </div>
          </div>

          <!-- Weekly Schedule -->
          <div class="weekly-schedule">
            <h4>Weekly Availability</h4>
            <p class="text-muted mb-3">Set your available hours for each day of the week</p>
            
            <div formArrayName="schedules" class="schedule-days">
              <div 
                *ngFor="let scheduleGroup of schedulesFormArray.controls; let i = index" 
                [formGroupName]="i" 
                class="schedule-day">
                
                <div class="day-header">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      [id]="'day-' + i"
                      formControlName="isActive"
                      (change)="onDayToggle(i)">
                    <label class="form-check-label day-name" [for]="'day-' + i">
                      {{ getDayName(i) }}
                    </label>
                  </div>
                </div>

                <div 
                  *ngIf="scheduleGroup.get('isActive')?.value" 
                  class="time-inputs">
                  <div class="row">
                    <div class="col-md-5">
                      <label [for]="'start-' + i" class="form-label">Start Time</label>
                      <input 
                        type="time" 
                        class="form-control" 
                        [id]="'start-' + i"
                        formControlName="startTime">
                    </div>
                    <div class="col-md-5">
                      <label [for]="'end-' + i" class="form-label">End Time</label>
                      <input 
                        type="time" 
                        class="form-control" 
                        [id]="'end-' + i"
                        formControlName="endTime">
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary btn-sm"
                        (click)="copyToAllDays(i)"
                        title="Copy to all days">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Schedule Templates -->
          <div class="schedule-templates mt-4">
            <h5>Quick Templates</h5>
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                (click)="applyTemplate('business')">
                Business Hours (9-5)
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                (click)="applyTemplate('evening')">
                Evenings (6-9 PM)
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                (click)="applyTemplate('weekend')">
                Weekends Only
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                (click)="clearAllSchedules()">
                Clear All
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions mt-4">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="scheduleForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Save Schedule
          </button>
          <button 
            type="button" 
            class="btn btn-secondary ms-2"
            (click)="onCancel()">
            Cancel
          </button>
        </div>
      </form>

      <!-- Current Schedule Display -->
      <div *ngIf="existingSchedules.length > 0" class="current-schedule mt-4">
        <h4>Current Schedule</h4>
        <div class="schedule-summary">
          <div 
            *ngFor="let schedule of existingSchedules" 
            class="schedule-item">
            <span class="day-name">{{ getDayName(schedule.dayOfWeek) }}</span>
            <span class="time-range">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger ms-2"
              (click)="deleteSchedule(schedule.id)"
              title="Delete this schedule">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-management {
      max-width: 800px;
    }

    .schedule-header {
      margin-bottom: 2rem;
    }

    .scheduling-options {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 1.5rem;
      background-color: #f8f9fa;
    }

    .schedule-days {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      overflow: hidden;
    }

    .schedule-day {
      border-bottom: 1px solid #dee2e6;
      padding: 1rem;
      background-color: white;
    }

    .schedule-day:last-child {
      border-bottom: none;
    }

    .day-header {
      margin-bottom: 0.5rem;
    }

    .day-name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .time-inputs {
      margin-left: 1.5rem;
    }

    .schedule-templates {
      padding: 1rem;
      background-color: #e9ecef;
      border-radius: 0.375rem;
    }

    .current-schedule {
      border-top: 1px solid #dee2e6;
      padding-top: 1.5rem;
    }

    .schedule-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 0.25rem;
    }

    .schedule-item .day-name {
      min-width: 100px;
      font-weight: 600;
    }

    .schedule-item .time-range {
      flex: 1;
      color: #6c757d;
    }

    .form-actions {
      border-top: 1px solid #dee2e6;
      padding-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .time-inputs .row > div {
        margin-bottom: 1rem;
      }
      
      .btn-group {
        flex-direction: column;
      }
      
      .btn-group .btn {
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class ScheduleManagementComponent implements OnInit {
  @Input() service!: Service;
  @Output() scheduleUpdated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  scheduleForm!: FormGroup;
  existingSchedules: ServiceSchedule[] = [];
  isLoading = false;

  private dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingSchedules();
  }

  get schedulesFormArray(): FormArray {
    return this.scheduleForm.get('schedules') as FormArray;
  }

  private initializeForm(): void {
    this.scheduleForm = this.fb.group({
      requiresScheduling: [this.service?.requiresScheduling || false],
      minBookingHours: [this.service?.minBookingHours || 1],
      maxBookingHours: [this.service?.maxBookingHours || 8],
      advanceBookingDays: [this.service?.advanceBookingDays || 30],
      cancellationHours: [this.service?.cancellationHours || 24],
      schedules: this.fb.array([])
    });

    // Initialize schedule form array for each day of the week
    for (let i = 0; i < 7; i++) {
      this.schedulesFormArray.push(this.createScheduleFormGroup(i));
    }
  }

  private createScheduleFormGroup(dayOfWeek: number): FormGroup {
    return this.fb.group({
      dayOfWeek: [dayOfWeek],
      isActive: [false],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required]
    });
  }

  private async loadExistingSchedules(): Promise<void> {
    if (!this.service?.id) return;

    try {
      this.existingSchedules = await this.schedulingService.getServiceSchedules(this.service.id);
      
      // Populate form with existing schedules
      this.existingSchedules.forEach(schedule => {
        const dayFormGroup = this.schedulesFormArray.at(schedule.dayOfWeek);
        dayFormGroup.patchValue({
          isActive: schedule.isActive,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        });
      });
    } catch (error) {
      console.error('Error loading existing schedules:', error);
    }
  }

  onDayToggle(dayIndex: number): void {
    const dayFormGroup = this.schedulesFormArray.at(dayIndex);
    const isActive = dayFormGroup.get('isActive')?.value;
    
    if (isActive) {
      // Set default times if enabling
      if (!dayFormGroup.get('startTime')?.value) {
        dayFormGroup.patchValue({
          startTime: '09:00',
          endTime: '17:00'
        });
      }
    }
  }

  copyToAllDays(sourceIndex: number): void {
    const sourceGroup = this.schedulesFormArray.at(sourceIndex);
    const startTime = sourceGroup.get('startTime')?.value;
    const endTime = sourceGroup.get('endTime')?.value;

    for (let i = 0; i < 7; i++) {
      if (i !== sourceIndex) {
        const targetGroup = this.schedulesFormArray.at(i);
        targetGroup.patchValue({
          isActive: true,
          startTime,
          endTime
        });
      }
    }
  }

  applyTemplate(templateType: string): void {
    this.clearAllSchedules();

    switch (templateType) {
      case 'business':
        // Monday to Friday, 9 AM to 5 PM
        for (let i = 1; i <= 5; i++) {
          this.schedulesFormArray.at(i).patchValue({
            isActive: true,
            startTime: '09:00',
            endTime: '17:00'
          });
        }
        break;

      case 'evening':
        // Monday to Friday, 6 PM to 9 PM
        for (let i = 1; i <= 5; i++) {
          this.schedulesFormArray.at(i).patchValue({
            isActive: true,
            startTime: '18:00',
            endTime: '21:00'
          });
        }
        break;

      case 'weekend':
        // Saturday and Sunday, 10 AM to 4 PM
        [0, 6].forEach(i => {
          this.schedulesFormArray.at(i).patchValue({
            isActive: true,
            startTime: '10:00',
            endTime: '16:00'
          });
        });
        break;
    }
  }

  clearAllSchedules(): void {
    for (let i = 0; i < 7; i++) {
      this.schedulesFormArray.at(i).patchValue({
        isActive: false,
        startTime: '09:00',
        endTime: '17:00'
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.scheduleForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.scheduleForm.value;
      
      // Update service scheduling settings
      // This would typically be done through a service update API call
      
      // Save active schedules
      const activeSchedules = formValue.schedules
        .filter((schedule: any) => schedule.isActive)
        .map((schedule: any) => ({
          serviceId: this.service.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true
        }));

      // Delete existing schedules first
      for (const existingSchedule of this.existingSchedules) {
        await this.schedulingService.deleteServiceSchedule(existingSchedule.id);
      }

      // Create new schedules
      for (const scheduleInput of activeSchedules) {
        await this.schedulingService.createServiceSchedule(scheduleInput);
      }

      this.scheduleUpdated.emit();
    } catch (error) {
      console.error('Error saving schedule:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await this.schedulingService.deleteServiceSchedule(scheduleId);
      this.existingSchedules = this.existingSchedules.filter(s => s.id !== scheduleId);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getDayName(dayOfWeek: number): string {
    return this.dayNames[dayOfWeek];
  }
}
