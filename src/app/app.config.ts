import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Capacitor } from '@capacitor/core';

import { routes } from './app.routes';
import { mobileRoutes } from './app.mobile.routes';

// Use mobile routes for native platforms, web routes for browser
const platformRoutes = Capacitor.isNativePlatform() ? mobileRoutes : routes;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(platformRoutes),
    provideHttpClient(),
    provideAnimationsAsync()
  ]
};
