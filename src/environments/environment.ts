// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql',
  apiKey: 'da2-7p4lacsjwbdabgmhywkvhc7wwi',
  region: 'us-east-1',
  enableErrorLogging: true,
  enableConsoleLogging: true,
  enableLocalStorage: true,
  buildInfo: {
      "buildNumber": 14,
      "buildDate": "2025-07-28T13:22:08.828Z",
      "version": "1.0.0",
      "environment": "development"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
