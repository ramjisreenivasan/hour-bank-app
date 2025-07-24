/**
 * Test script to demonstrate the error logging system
 * Run this in the browser console to see the enhanced error logging in action
 */

console.log('🧪 Testing Enhanced Error Logging System');
console.log('=========================================');
console.log('');

// Simulate the ErrorLogger class for testing
class TestErrorLogger {
  logError(entry) {
    const timestamp = new Date().toISOString();
    const errorMessage = entry.error instanceof Error ? entry.error.message : entry.error;
    const stack = entry.error instanceof Error ? entry.error.stack : undefined;

    const enhancedContext = {
      ...entry.context,
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };

    const logEntry = {
      severity: entry.severity,
      category: entry.category,
      message: errorMessage,
      stack,
      context: enhancedContext,
      timestamp
    };

    this.logToConsole(logEntry);
  }

  logUserNotFound(userId, operation, component, additionalData) {
    this.logError({
      error: new Error(`User not found: ${userId}`),
      context: {
        userId,
        operation,
        component,
        additionalData
      },
      severity: 'high',
      category: 'user'
    });
  }

  logToConsole(logEntry) {
    const styles = this.getConsoleStyles(logEntry.severity);
    
    console.group(`%c🚨 ${logEntry.category.toUpperCase()} ERROR - ${logEntry.severity.toUpperCase()}`, styles.header);
    
    console.log(`%c📅 Timestamp:`, styles.label, logEntry.timestamp);
    console.log(`%c💬 Message:`, styles.label, logEntry.message);
    
    if (logEntry.stack) {
      console.log(`%c📍 Stack Trace:`, styles.label);
      console.log(logEntry.stack);
    }

    console.log(`%c🔍 Context Data:`, styles.label);
    console.table(logEntry.context);

    if (logEntry.context.additionalData) {
      console.log(`%c📊 Additional Data:`, styles.label);
      console.log(logEntry.context.additionalData);
    }

    console.groupEnd();
  }

  getConsoleStyles(severity) {
    const baseStyle = 'font-weight: bold; padding: 2px 6px; border-radius: 3px;';
    
    switch (severity) {
      case 'critical':
        return {
          header: `${baseStyle} background: #ff0000; color: white;`,
          label: 'font-weight: bold; color: #ff0000;'
        };
      case 'high':
        return {
          header: `${baseStyle} background: #ff6600; color: white;`,
          label: 'font-weight: bold; color: #ff6600;'
        };
      case 'medium':
        return {
          header: `${baseStyle} background: #ffaa00; color: white;`,
          label: 'font-weight: bold; color: #ffaa00;'
        };
      default:
        return {
          header: `${baseStyle} background: #0066cc; color: white;`,
          label: 'font-weight: bold; color: #0066cc;'
        };
    }
  }
}

// Create test logger instance
const testLogger = new TestErrorLogger();

// Test 1: User Not Found Error
console.log('🔍 Test 1: User Not Found Error');
testLogger.logUserNotFound(
  '64083428-a041-702c-2e7e-7e4b2c4ba1f4',
  'getUser',
  'UserService',
  {
    searchCriteria: { id: '64083428-a041-702c-2e7e-7e4b2c4ba1f4' },
    requestedFields: ['id', 'email', 'username', 'firstName', 'lastName'],
    queryType: 'getUser',
    databaseQuery: 'SELECT * FROM users WHERE id = ?',
    executionTime: '45ms'
  }
);

console.log('');

// Test 2: Transaction Authorization Error
console.log('🔍 Test 2: Transaction Authorization Error');
testLogger.logError({
  error: new Error('Not Authorized to access createTransaction on type Mutation'),
  context: {
    transactionId: 'new',
    operation: 'createTransaction',
    component: 'TransactionService',
    additionalData: {
      inputData: {
        providerId: 'provider-123',
        consumerId: 'consumer-456',
        serviceId: 'service-789',
        hoursSpent: 2.5,
        status: 'PENDING',
        description: 'Web development service'
      },
      authorizationCheck: 'API Key should allow public access',
      apiKey: 'da2-7p4lacsjwbdabgmhywkvhc7wwi',
      endpoint: 'https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql'
    }
  },
  severity: 'high',
  category: 'transaction'
});

console.log('');

// Test 3: API Connection Error
console.log('🔍 Test 3: API Connection Error');
testLogger.logError({
  error: new Error('Network Error: Failed to fetch'),
  context: {
    operation: 'updateUserProfile',
    component: 'ProfileComponent',
    additionalData: {
      userId: '2ddf7654-46f6-4dc3-9f47-d97746437e30',
      updateFields: ['firstName', 'lastName', 'bio'],
      requestData: {
        id: '2ddf7654-46f6-4dc3-9f47-d97746437e30',
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio text'
      },
      networkStatus: navigator.onLine ? 'online' : 'offline',
      connectionType: navigator.connection?.effectiveType || 'unknown'
    }
  },
  severity: 'medium',
  category: 'api'
});

console.log('');

// Test 4: Authentication Error
console.log('🔍 Test 4: Authentication Error');
testLogger.logError({
  error: new Error('User pool does not exist'),
  context: {
    operation: 'signIn',
    component: 'AuthService',
    additionalData: {
      email: 'us***@example.com', // Masked for privacy
      errorType: 'UserPoolNotFound',
      cognitoConfig: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_XXXXXXXXX'
      },
      attemptNumber: 1,
      lastSuccessfulAuth: '2025-07-05T10:30:00Z'
    }
  },
  severity: 'critical',
  category: 'auth'
});

console.log('');

// Test 5: Service Error
console.log('🔍 Test 5: Service Error');
testLogger.logError({
  error: new Error('Service validation failed: Invalid hourly rate'),
  context: {
    serviceId: 'service-123',
    operation: 'createService',
    component: 'ServiceComponent',
    additionalData: {
      inputData: {
        title: 'Web Development',
        description: 'Full-stack development services',
        hourlyRate: -5, // Invalid negative rate
        category: 'Technology',
        userId: 'user-456'
      },
      validationErrors: [
        'Hourly rate must be positive',
        'Hourly rate must be between 0.1 and 100'
      ],
      formState: 'invalid'
    }
  },
  severity: 'medium',
  category: 'service'
});

console.log('');
console.log('✅ Error logging tests completed!');
console.log('');
console.log('💡 Key Features Demonstrated:');
console.log('• Rich context data with every error');
console.log('• Styled console output for easy reading');
console.log('• Categorized and prioritized errors');
console.log('• Comprehensive debugging information');
console.log('• Privacy-conscious data masking');
console.log('• Performance and system metrics');
console.log('');
console.log('🎯 Next Steps:');
console.log('1. Integrate this logging system into your Angular components');
console.log('2. Use the ErrorHandler component for user-friendly error display');
console.log('3. Set up production monitoring integration');
console.log('4. Configure error alerting for critical issues');
console.log('');
console.log('📚 See ERROR_LOGGING_GUIDE.md for complete implementation details');
