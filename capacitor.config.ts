import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hourbank.gateway',
  appName: 'HourBank Gateway',
  webDir: 'dist/hourbank-app/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976d2',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    Browser: {
      // Browser plugin configuration
      windowName: '_system'
    }
  }
};

export default config;
