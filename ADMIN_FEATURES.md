# HourBank Admin Features

This document describes the admin functionality added to the HourBank application.

## Overview

The admin dashboard provides a comprehensive view of all users in the system, along with system statistics and user management capabilities. Admin access is role-based and secure.

## Admin Access Control

Admin access is determined by multiple criteria (in order of precedence):

1. **Cognito User Groups**: Users in the `admin` or `Admin` group
2. **Admin Email Patterns**: Users with emails like `admin@hourbank.com` or `administrator@hourbank.com`
3. **Admin Username Patterns**: Users with usernames containing "admin"

## Features

### 1. System Statistics Dashboard

- **Total Users**: Count of all registered users
- **Active Users**: Users with recent activity or services
- **Total Services**: Count of all services in the marketplace
- **Total Transactions**: Count of all completed transactions
- **Total Bank Hours**: Sum of all bank hours in circulation
- **System Health**: Calculated health score based on activity metrics

### 2. User Management

#### User List View
- Comprehensive table showing all users with:
  - Username and full name
  - Email address
  - Current bank hours balance
  - Number of services offered
  - Number of transactions completed
  - User status (active/inactive/suspended)
  - Join date and last activity

#### Search and Filtering
- **Search**: Filter users by username, email, first name, or last name
- **Status Filter**: Filter by user status (active/inactive/suspended)
- **Sorting**: Sort by any column (username, email, bank hours, services, transactions, status, join date)

#### User Actions
- **View Details**: See detailed user information in a modal
- **Edit Bank Hours**: Adjust user's bank hours balance with reason tracking
- **Toggle Status**: Suspend or activate users with reason tracking

### 3. Admin Navigation

- Admin users see a special "Admin" link in the navigation bar
- Admin badge displayed next to username
- Distinctive red styling for admin elements

## Technical Implementation

### Components
- `AdminDashboardComponent`: Main admin interface
- `AdminGuard`: Route protection for admin-only pages
- `AdminService`: Backend operations for admin functionality

### Security
- Route protection via `AdminGuard`
- Role-based access control
- All admin actions are logged for audit purposes
- Backward compatible with existing user permissions

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls on mobile devices

## Usage

### Accessing Admin Dashboard

1. Sign in with an admin account
2. Navigate to `/admin` or click the "Admin" link in the navigation
3. The dashboard will load with current system statistics

### Managing Users

1. Use the search box to find specific users
2. Apply status filters to view users by their current status
3. Click column headers to sort the user list
4. Use action buttons to:
   - View detailed user information
   - Adjust bank hours (with reason)
   - Suspend or activate users (with reason)

### Monitoring System Health

The system health score is calculated based on:
- Recent user signups (last 30 days)
- Percentage of active users
- Total transactions in the system
- Total services available

Health status indicators:
- **Healthy** (80-100%): Green indicator
- **Warning** (60-79%): Yellow indicator  
- **Critical** (0-59%): Red indicator

## Backend Compatibility

All admin features are implemented using existing GraphQL schema and operations:
- No schema changes required
- Uses existing user, service, and transaction queries
- Backward compatible with all existing functionality
- Admin actions are logged through the existing error logging system

## Future Enhancements

Potential future admin features:
- User communication/messaging
- Service moderation and approval
- Transaction dispute resolution
- Advanced analytics and reporting
- Bulk user operations
- System configuration management

## Security Considerations

- Admin access is strictly controlled through multiple verification methods
- All admin actions are logged with timestamps and reasons
- User data is handled securely with appropriate masking
- Admin operations follow the principle of least privilege
- Regular audit trails are maintained through the error logging system
