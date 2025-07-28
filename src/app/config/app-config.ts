/**
 * Application Configuration
 * Contains all configurable values for the HourBank application
 */

export interface AppConfig {
  user: {
    defaultBankHours: number;
    defaultRating: number;
    defaultTotalTransactions: number;
  };
  service: {
    defaultDuration: number;
    minimumDuration: number;
  };
  ui: {
    recentTransactionsLimit: number;
    maxVisibleServices: number;
    errorLogLimit: number;
    freeHoursText: string; // Configurable free hours text for landing page
  };
  admin: {
    queryLimit: number;
  };
  simulation: {
    testUserBankHours: number;
    testUserRatings: {
      excellent: number;
      veryGood: number;
      good: number;
      average: number;
    };
  };
}

export const APP_CONFIG: AppConfig = {
  user: {
    defaultBankHours: 10.0,
    defaultRating: 5.0,
    defaultTotalTransactions: 0
  },
  service: {
    defaultDuration: 1,
    minimumDuration: 1
  },
  ui: {
    recentTransactionsLimit: 10,
    maxVisibleServices: 5,
    errorLogLimit: 50,
    freeHoursText: "Start with 10 free hours"
  },
  admin: {
    queryLimit: 1000
  },
  simulation: {
    testUserBankHours: 10,
    testUserRatings: {
      excellent: 4.9,
      veryGood: 4.8,
      good: 4.7,
      average: 4.6
    }
  }
};

/**
 * Environment-specific configuration overrides
 */
export const getEnvironmentConfig = (): Partial<AppConfig> => {
  const environment = process.env['NODE_ENV'] || 'development';
  
  switch (environment) {
    case 'production':
      return {
        ui: {
          ...APP_CONFIG.ui,
          errorLogLimit: 100 // Store more errors in production
        },
        admin: {
          queryLimit: 5000 // Higher limits in production
        }
      };
    
    case 'staging':
      return {
        user: {
          ...APP_CONFIG.user,
          defaultBankHours: 20.0 // More hours for testing in staging
        }
      };
    
    case 'development':
    default:
      return {}; // Use default config
  }
};

/**
 * Get merged configuration with environment overrides
 */
export const getAppConfig = (): AppConfig => {
  const envConfig = getEnvironmentConfig();
  return {
    ...APP_CONFIG,
    ...envConfig,
    user: { ...APP_CONFIG.user, ...envConfig.user },
    service: { ...APP_CONFIG.service, ...envConfig.service },
    ui: { ...APP_CONFIG.ui, ...envConfig.ui },
    admin: { ...APP_CONFIG.admin, ...envConfig.admin },
    simulation: { ...APP_CONFIG.simulation, ...envConfig.simulation }
  };
};
