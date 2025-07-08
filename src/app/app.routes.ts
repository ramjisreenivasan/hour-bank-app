import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public routes (accessible without authentication)
  { 
    path: '', 
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'services', 
    loadComponent: () => import('./components/services/services-browse.component').then(m => m.ServicesBrowseComponent)
  },
  { 
    path: 'services/:id', 
    loadComponent: () => import('./components/services/service-detail.component').then(m => m.ServiceDetailComponent)
  },
  { 
    path: 'community', 
    loadComponent: () => import('./components/community/community-browse.component').then(m => m.CommunityBrowseComponent)
  },
  
  // Authentication routes
  { 
    path: 'auth', 
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
    canActivate: [GuestGuard]
  },
  
  // Protected routes (require authentication)
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'my-services', 
    loadComponent: () => import('./components/services/my-services.component').then(m => m.MyServicesComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'transactions', 
    loadComponent: () => import('./components/transaction/transaction.component').then(m => m.TransactionComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'messages', 
    loadComponent: () => import('./components/messages/messages.component').then(m => m.MessagesComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'bookings', 
    loadComponent: () => import('./components/booking-management/booking-management.component').then(m => m.BookingManagementComponent),
    canActivate: [AuthGuard]
  },
  
  // Admin routes (require admin privileges)
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard]
  },
  
  { path: '**', redirectTo: '/' }
];
