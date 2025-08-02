export const environment = {
  production: true,
  apiUrl: 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql',
  apiKey: 'da2-7p4lacsjwbdabgmhywkvhc7wwi',
  region: 'us-east-1',
  enableErrorLogging: true,
  enableConsoleLogging: false, // Disable console logging in production
  enableLocalStorage: false,   // Disable local storage in production for privacy
  buildInfo: {
      "buildNumber": 42,
      "buildDate": "2025-08-02T15:56:41.869Z",
      "version": "1.0.0",
      "environment": "production"
  }
};
