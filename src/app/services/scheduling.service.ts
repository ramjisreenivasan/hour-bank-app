import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { 
  Service, 
  ServiceSchedule, 
  Booking, 
  BookingStatus, 
  ScheduleException,
  TimeSlot,
  ProviderAvailability,
  CreateServiceScheduleInput,
  CreateBookingInput,
  BookingCalendarEvent,
  BookingRole
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private client = generateClient();
  private schedulesSubject = new BehaviorSubject<ServiceSchedule[]>([]);
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  public schedules$ = this.schedulesSubject.asObservable();
  public bookings$ = this.bookingsSubject.asObservable();

  constructor() {}

  // Service Schedule Management
  async createServiceSchedule(input: CreateServiceScheduleInput): Promise<ServiceSchedule> {
    const mutation = `
      mutation CreateServiceSchedule($input: CreateServiceScheduleInput!) {
        createServiceSchedule(input: $input) {
          id
          serviceId
          userId
          dayOfWeek
          startTime
          endTime
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query: mutation,
        variables: { input }
      }) as GraphQLResult<any>;
      
      const schedule = result.data.createServiceSchedule;
      this.refreshSchedules(input.serviceId);
      return schedule;
    } catch (error) {
      console.error('Error creating service schedule:', error);
      throw error;
    }
  }

  async updateServiceSchedule(id: string, input: Partial<ServiceSchedule>): Promise<ServiceSchedule> {
    const mutation = `
      mutation UpdateServiceSchedule($input: UpdateServiceScheduleInput!) {
        updateServiceSchedule(input: $input) {
          id
          serviceId
          userId
          dayOfWeek
          startTime
          endTime
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query: mutation,
        variables: { input: { id, ...input } }
      }) as GraphQLResult<any>;
      
      const schedule = result.data.updateServiceSchedule;
      this.refreshSchedules(schedule.serviceId);
      return schedule;
    } catch (error) {
      console.error('Error updating service schedule:', error);
      throw error;
    }
  }

  async deleteServiceSchedule(id: string): Promise<void> {
    const mutation = `
      mutation DeleteServiceSchedule($input: DeleteServiceScheduleInput!) {
        deleteServiceSchedule(input: $input) {
          id
          serviceId
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query: mutation,
        variables: { input: { id } }
      }) as GraphQLResult<any>;
      
      const deletedSchedule = result.data.deleteServiceSchedule;
      this.refreshSchedules(deletedSchedule.serviceId);
    } catch (error) {
      console.error('Error deleting service schedule:', error);
      throw error;
    }
  }

  async getServiceSchedules(serviceId: string): Promise<ServiceSchedule[]> {
    const query = `
      query ListServiceSchedules($filter: ModelServiceScheduleFilterInput) {
        listServiceSchedules(filter: $filter) {
          items {
            id
            serviceId
            userId
            dayOfWeek
            startTime
            endTime
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query,
        variables: {
          filter: {
            serviceId: { eq: serviceId },
            isActive: { eq: true }
          }
        }
      }) as GraphQLResult<any>;
      
      return result.data.listServiceSchedules.items;
    } catch (error) {
      console.error('Error fetching service schedules:', error);
      throw error;
    }
  }

  // Booking Management
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // First, get the service to calculate total cost
    const service = await this.getService(input.serviceId);
    const totalCost = input.duration * service.hourlyRate;

    const mutation = `
      mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
          id
          serviceId
          providerId
          consumerId
          bookingDate
          startTime
          endTime
          duration
          totalCost
          status
          notes
          createdAt
          updatedAt
          service {
            title
            hourlyRate
            user {
              firstName
              lastName
            }
          }
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query: mutation,
        variables: { 
          input: { 
            ...input, 
            totalCost,
            status: BookingStatus.PENDING 
          } 
        }
      }) as GraphQLResult<any>;
      
      const booking = result.data.createBooking;
      this.refreshBookings();
      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string): Promise<Booking> {
    const mutation = `
      mutation UpdateBooking($input: UpdateBookingInput!) {
        updateBooking(input: $input) {
          id
          status
          providerNotes
          confirmedAt
          cancelledAt
          completedAt
          updatedAt
        }
      }
    `;

    const updateInput: any = { id: bookingId, status };
    
    if (notes) {
      updateInput.providerNotes = notes;
    }

    // Set timestamp based on status
    const now = new Date().toISOString();
    switch (status) {
      case BookingStatus.CONFIRMED:
        updateInput.confirmedAt = now;
        break;
      case BookingStatus.CANCELLED_BY_PROVIDER:
      case BookingStatus.CANCELLED_BY_CONSUMER:
        updateInput.cancelledAt = now;
        break;
      case BookingStatus.COMPLETED:
        updateInput.completedAt = now;
        break;
    }

    try {
      const result = await this.client.graphql({
        query: mutation,
        variables: { input: updateInput }
      }) as GraphQLResult<any>;
      
      const booking = result.data.updateBooking;
      this.refreshBookings();
      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async getBookingsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string, 
    role: BookingRole
  ): Promise<Booking[]> {
    const query = `
      query ListBookings($filter: ModelBookingFilterInput) {
        listBookings(filter: $filter) {
          items {
            id
            serviceId
            providerId
            consumerId
            bookingDate
            startTime
            endTime
            duration
            totalCost
            status
            notes
            providerNotes
            createdAt
            confirmedAt
            cancelledAt
            completedAt
            updatedAt
            service {
              title
              category
              hourlyRate
            }
            provider {
              firstName
              lastName
              username
            }
            consumer {
              firstName
              lastName
              username
            }
          }
        }
      }
    `;

    const userIdField = role === BookingRole.PROVIDER ? 'providerId' : 'consumerId';
    
    try {
      const result = await this.client.graphql({
        query,
        variables: {
          filter: {
            [userIdField]: { eq: userId },
            bookingDate: { 
              between: [startDate, endDate] 
            }
          }
        }
      }) as GraphQLResult<any>;
      
      return result.data.listBookings.items;
    } catch (error) {
      console.error('Error fetching bookings by date range:', error);
      throw error;
    }
  }

  // Availability Checking
  async getAvailableTimeSlots(
    serviceId: string, 
    date: string, 
    duration: number
  ): Promise<TimeSlot[]> {
    try {
      // Get service schedules for the day of week
      const dayOfWeek = new Date(date).getDay();
      const schedules = await this.getServiceSchedules(serviceId);
      const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

      if (daySchedules.length === 0) {
        return [];
      }

      // Get existing bookings for the date
      const bookings = await this.getBookingsForDate(serviceId, date);
      
      // Generate time slots
      const timeSlots: TimeSlot[] = [];
      
      for (const schedule of daySchedules) {
        const slots = this.generateTimeSlotsForSchedule(
          schedule, 
          duration, 
          bookings
        );
        timeSlots.push(...slots);
      }

      return timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }

  // Calendar Integration
  getBookingCalendarEvents(bookings: Booking[]): BookingCalendarEvent[] {
    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.service?.title || 'Service'} - ${booking.consumer?.firstName || 'Consumer'}`,
      start: new Date(`${booking.bookingDate}T${booking.startTime}`),
      end: new Date(`${booking.bookingDate}T${booking.endTime}`),
      booking,
      color: this.getBookingColor(booking.status)
    }));
  }

  // Utility Methods
  private async getService(serviceId: string): Promise<Service> {
    const query = `
      query GetService($id: ID!) {
        getService(id: $id) {
          id
          title
          hourlyRate
          userId
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query,
        variables: { id: serviceId }
      }) as GraphQLResult<any>;
      
      return result.data.getService;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  private async getBookingsForDate(serviceId: string, date: string): Promise<Booking[]> {
    const query = `
      query ListBookings($filter: ModelBookingFilterInput) {
        listBookings(filter: $filter) {
          items {
            id
            startTime
            endTime
            status
          }
        }
      }
    `;

    try {
      const result = await this.client.graphql({
        query,
        variables: {
          filter: {
            serviceId: { eq: serviceId },
            bookingDate: { eq: date },
            status: { 
              ne: BookingStatus.CANCELLED_BY_CONSUMER 
            }
          }
        }
      }) as GraphQLResult<any>;
      
      return result.data.listBookings.items;
    } catch (error) {
      console.error('Error fetching bookings for date:', error);
      return [];
    }
  }

  private generateTimeSlotsForSchedule(
    schedule: ServiceSchedule, 
    duration: number, 
    existingBookings: Booking[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);
    const durationMinutes = duration * 60;

    for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += 30) {
      const startTime = this.minutesToTime(minutes);
      const endTime = this.minutesToTime(minutes + durationMinutes);
      
      const isAvailable = !this.hasConflict(startTime, endTime, existingBookings);
      
      slots.push({
        startTime,
        endTime,
        isAvailable,
        conflictReason: isAvailable ? undefined : 'Time slot already booked'
      });
    }

    return slots;
  }

  private hasConflict(startTime: string, endTime: string, bookings: Booking[]): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return bookings.some(booking => {
      const bookingStart = this.timeToMinutes(booking.startTime);
      const bookingEnd = this.timeToMinutes(booking.endTime);
      
      return (startMinutes < bookingEnd && endMinutes > bookingStart);
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private getBookingColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return '#ffc107'; // Yellow
      case BookingStatus.CONFIRMED:
        return '#28a745'; // Green
      case BookingStatus.IN_PROGRESS:
        return '#007bff'; // Blue
      case BookingStatus.COMPLETED:
        return '#6c757d'; // Gray
      case BookingStatus.CANCELLED_BY_CONSUMER:
      case BookingStatus.CANCELLED_BY_PROVIDER:
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  }

  private async refreshSchedules(serviceId: string): Promise<void> {
    try {
      const schedules = await this.getServiceSchedules(serviceId);
      this.schedulesSubject.next(schedules);
    } catch (error) {
      console.error('Error refreshing schedules:', error);
    }
  }

  private async refreshBookings(): Promise<void> {
    // This would typically refresh bookings for the current user
    // Implementation depends on your authentication service
  }

  // Day of week helpers
  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  getDayAbbreviation(dayOfWeek: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek];
  }
}
