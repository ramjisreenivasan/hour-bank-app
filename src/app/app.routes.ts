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
    loadComponent: () => import('./components/info/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'business', 
    loadComponent: () => import('./components/info/business/business.component').then(m => m.BusinessComponent)
  },
  { 
    path: 'organizations', 
    loadComponent: () => import('./components/info/organizations/organizations.component').then(m => m.OrganizationsComponent)
  },
  { 
    path: 'investors', 
    loadComponent: () => import('./components/info/investors/investors.component').then(m => m.InvestorsComponent)
  },
  { 
    path: 'donate', 
    loadComponent: () => import('./components/donate/donate.component').then(m => m.DonateComponent)
  },
  { 
    path: 'contribute', 
    loadComponent: () => import('./components/contribute/contribute.component').then(m => m.ContributeComponent)
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
  { 
    path: 'simulation', 
    loadComponent: () => import('./components/admin/simulation-dashboard.component').then(m => m.SimulationDashboardComponent)
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
  { 
    path: 'admin/simulation', 
    loadComponent: () => import('./components/admin/simulation-dashboard.component').then(m => m.SimulationDashboardComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/transaction-simulation', 
    loadComponent: () => import('./components/admin/transaction-simulation.component').then(m => m.TransactionSimulationComponent),
    canActivate: [AdminGuard]
  },
  
  { path: '**', redirectTo: '/' }
];
