export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bankHours: number;
  skills: string[];
  bio?: string;
  profilePicture?: string;
  rating: number;
  totalTransactions: number;
  cognitoId?: string;  // Added to map to Cognito User Pool ID
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  user: User;
  availableServices: Service[];
  completedTransactions: Transaction[];
}

export interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  hourlyRate: number; // Using hourlyRate to match the deployed GraphQL schema
  isActive: boolean;
  tags: string[];
  
  // Scheduling fields
  requiresScheduling: boolean;
  minBookingHours?: number;
  maxBookingHours?: number;
  advanceBookingDays?: number;
  cancellationHours?: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  schedules?: ServiceSchedule[];
  bookings?: Booking[];
  provider?: User; // Provider information when populated
}

export interface ServiceSchedule {
  id: string;
  serviceId: string;
  userId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  serviceId: string;
  providerId: string;
  consumerId: string;
  bookingDate: string; // ISO date string
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  duration: number; // Duration in hours
  totalCost: number; // Total bank hours cost
  status: BookingStatus;
  notes?: string;
  providerNotes?: string;
  cancellationReason?: string;
  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
  
  // Populated fields
  service?: Service;
  provider?: User;
  consumer?: User;
  transaction?: Transaction;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_CONSUMER = 'CANCELLED_BY_CONSUMER',
  CANCELLED_BY_PROVIDER = 'CANCELLED_BY_PROVIDER',
  NO_SHOW_CONSUMER = 'NO_SHOW_CONSUMER',
  NO_SHOW_PROVIDER = 'NO_SHOW_PROVIDER'
}

export interface ScheduleException {
  id: string;
  serviceId: string;
  userId: string;
  exceptionDate: string; // ISO date string
  exceptionType: ScheduleExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ScheduleExceptionType {
  UNAVAILABLE = 'UNAVAILABLE',
  CUSTOM_HOURS = 'CUSTOM_HOURS',
  HOLIDAY = 'HOLIDAY'
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflictReason?: string;
}

export interface ProviderAvailability {
  date: string;
  dayOfWeek: number;
  schedules: ServiceSchedule[];
  exceptions: ScheduleException[];
  bookings: Booking[];
  isAvailable: boolean;
}

export enum BookingRole {
  PROVIDER = 'PROVIDER',
  CONSUMER = 'CONSUMER'
}

export interface Transaction {
  id: string;
  providerId: string;
  consumerId: string;
  serviceId: string;
  bookingId?: string; // Links to booking if scheduled
  hoursSpent: number;
  status: TransactionStatus;
  description: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  completedAt?: Date;
  // GraphQL populated fields
  provider?: User;
  consumer?: User;
  service?: Service;
  booking?: Booking;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Helper interfaces for scheduling
export interface CreateServiceScheduleInput {
  serviceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateBookingInput {
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
}

export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  booking: Booking;
  color?: string;
}
