# HourBank Scheduling System

This document explains the scheduling and booking system implemented in the HourBank application.

## Overview

The scheduling system allows service providers to set their availability and consumers to book specific time slots for services. This ensures better coordination and reduces scheduling conflicts.

## Features

### For Service Providers

1. **Schedule Management**
   - Set weekly availability for each service
   - Define working hours for each day of the week
   - Use quick templates (Business Hours, Evenings, Weekends)
   - Copy schedules across multiple days

2. **Booking Configuration**
   - Set minimum and maximum booking durations
   - Configure advance booking limits (how far ahead bookings can be made)
   - Set cancellation notice requirements

3. **Booking Management**
   - View all bookings in list or calendar format
   - Confirm or decline pending bookings
   - Track booking status (Pending, Confirmed, In Progress, Completed)
   - Add notes to bookings
   - Cancel bookings when necessary

### For Consumers

1. **Service Booking**
   - Browse available time slots for scheduled services
   - Select date and duration
   - View real-time availability
   - Add notes for the provider
   - Check bank hours balance before booking

2. **Booking Tracking**
   - View upcoming bookings
   - Track booking status
   - Receive notifications for booking updates

## Database Schema

### New Models Added

#### ServiceSchedule
- Defines weekly availability for services
- Links to specific services and users
- Stores day of week and time ranges

#### Booking
- Individual time slot reservations
- Links consumers, providers, and services
- Tracks status and metadata

#### ScheduleException
- Handles one-time schedule changes
- Supports unavailable dates and custom hours

### Updated Models

#### Service
- Added scheduling configuration fields
- Links to schedules and bookings

#### Transaction
- Added optional booking reference
- Links completed services to their bookings

## Components

### ScheduleManagementComponent
- **Location**: `src/app/components/schedule-management/`
- **Purpose**: Allows providers to set up their service schedules
- **Features**:
  - Weekly schedule grid
  - Quick templates
  - Booking constraints configuration
  - Real-time schedule preview

### BookingComponent
- **Location**: `src/app/components/booking/`
- **Purpose**: Enables consumers to book time slots
- **Features**:
  - Date and duration selection
  - Available time slot display
  - Bank hours validation
  - Booking summary

### BookingManagementComponent
- **Location**: `src/app/components/booking-management/`
- **Purpose**: Provider dashboard for managing bookings
- **Features**:
  - List and calendar views
  - Status filtering
  - Booking actions (confirm, cancel, complete)
  - Notes management

## Services

### SchedulingService
- **Location**: `src/app/services/scheduling.service.ts`
- **Purpose**: Handles all scheduling-related API calls
- **Key Methods**:
  - `createServiceSchedule()` - Create new schedule
  - `getAvailableTimeSlots()` - Get available slots for booking
  - `createBooking()` - Create new booking
  - `updateBookingStatus()` - Update booking status
  - `getBookingsByDateRange()` - Fetch bookings for date range

## Usage Examples

### Setting Up a Service Schedule

1. Navigate to "My Services"
2. Click "Schedule" button on any service
3. Enable "This service requires scheduled appointments"
4. Set booking constraints (min/max duration, advance booking, cancellation notice)
5. Configure weekly availability:
   - Check days you're available
   - Set start and end times
   - Use templates for common schedules
6. Save the schedule

### Booking a Service

1. Browse services and select one that requires scheduling
2. Click "Book Appointment"
3. Select desired date
4. Choose duration from available options
5. Pick from available time slots
6. Add any notes for the provider
7. Confirm booking (bank hours will be reserved)

### Managing Bookings (Provider)

1. Navigate to "Bookings" page
2. View bookings in list or calendar format
3. Filter by status (Pending, Confirmed, etc.)
4. Actions available:
   - Confirm pending bookings
   - Start service when consumer arrives
   - Complete service when finished
   - Cancel with reason if needed
   - Add notes for record keeping

## GraphQL Queries and Mutations

### Key Queries
- `getAvailableTimeSlots` - Get available slots for a service/date
- `getProviderSchedule` - Get provider's schedule for date range
- `getBookingsByDateRange` - Get bookings for specific period

### Key Mutations
- `createServiceSchedule` - Create new schedule
- `createBooking` - Create new booking
- `updateBooking` - Update booking status/notes
- `deleteServiceSchedule` - Remove schedule

### Subscriptions
- `onBookingUpdate` - Real-time booking updates
- `onScheduleUpdate` - Real-time schedule changes

## Integration Points

### Service Detail Page
- Shows scheduling information for services that require appointments
- Displays booking constraints and availability info
- Provides "Book Appointment" button for scheduled services

### My Services Page
- Added "Schedule" button to each service card
- Opens schedule management modal
- Shows scheduling status indicators

### Navigation
- Added "Bookings" link to main navigation
- Accessible to authenticated users only

## Configuration

### Environment Variables
No additional environment variables required - uses existing AWS Amplify configuration.

### AWS Amplify Setup
The scheduling system uses the existing GraphQL API. After updating the schema:

1. Run `amplify push` to deploy schema changes
2. Update the frontend to use new GraphQL operations
3. Test the scheduling functionality

## Best Practices

### For Providers
1. Set realistic availability windows
2. Configure appropriate cancellation notice periods
3. Regularly review and update schedules
4. Respond promptly to booking requests
5. Use booking notes to prepare for sessions

### For Consumers
1. Book appointments well in advance
2. Provide clear notes about your requirements
3. Respect cancellation policies
4. Arrive on time for scheduled sessions
5. Maintain sufficient bank hours balance

## Troubleshooting

### Common Issues

1. **No available time slots showing**
   - Check if provider has set up schedules
   - Verify selected date is within advance booking window
   - Ensure duration matches provider's constraints

2. **Booking creation fails**
   - Verify sufficient bank hours balance
   - Check if time slot is still available
   - Ensure all required fields are filled

3. **Schedule not saving**
   - Verify end time is after start time
   - Check for overlapping schedules
   - Ensure user has permission to modify the service

### Error Handling
The system includes comprehensive error handling for:
- Network connectivity issues
- Insufficient permissions
- Conflicting bookings
- Invalid time ranges
- Bank hours validation

## Future Enhancements

Potential improvements to consider:
1. Recurring booking support
2. Buffer time between bookings
3. Group booking capabilities
4. Integration with external calendars
5. Automated reminders and notifications
6. Booking templates for common services
7. Waitlist functionality for popular time slots
8. Advanced scheduling rules and exceptions

## Support

For technical support or questions about the scheduling system:
1. Check this documentation first
2. Review the component source code
3. Test with the provided mock data
4. Consult the GraphQL schema for data structure
5. Check browser console for error messages

The scheduling system is designed to be intuitive and flexible while maintaining data consistency and user experience quality.
