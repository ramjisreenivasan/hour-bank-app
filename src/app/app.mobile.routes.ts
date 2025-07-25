import { Routes } from '@angular/router';

export const mobileRoutes: Routes = [
  // Public routes only (guest access)
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
  { 
    path: 'privacy', 
    loadComponent: () => import('./components/mobile/mobile-privacy.component').then(m => m.MobilePrivacyComponent)
  },
  
  // Redirect all other routes to external browser
  { 
    path: 'auth', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/auth' }
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/dashboard' }
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/profile' }
  },
  { 
    path: 'my-services', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/my-services' }
  },
  { 
    path: 'transactions', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/transactions' }
  },
  { 
    path: 'messages', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/messages' }
  },
  { 
    path: 'bookings', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/bookings' }
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/mobile/external-redirect.component').then(m => m.ExternalRedirectComponent),
    data: { externalPath: '/admin' }
  },
  
  { path: '**', redirectTo: '/' }
];
