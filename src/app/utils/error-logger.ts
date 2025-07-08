/**
 * Enhanced Error Logging Utility for HourBank Application
 * Provides comprehensive error logging with context data for better debugging
 */

export interface ErrorContext {
  userId?: string;
  serviceId?: string;
  transactionId?: string;
  bookingId?: string;
  operation?: string;
  component?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  viewport?: string;
  connectionType?: string;
  additionalData?: any;
}

export interface ErrorLogEntry {
  error: Error | string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user' | 'service' | 'transaction' | 'booking' | 'auth' | 'api' | 'ui' | 'system' | 'admin';
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private isDevelopment: boolean;

  private constructor() {
    // Safely determine if we're in development mode
    this.isDevelopment = this.isDevMode();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Safely determine if we're in development mode
   */
  private isDevMode(): boolean {
    try {
      // Try multiple ways to detect development mode
      if (typeof process !== 'undefined' && process.env) {
        return process.env['NODE_ENV'] !== 'production';
      }
      
      // Check for Angular development mode indicators
      if (typeof window !== 'undefined') {
        // Check if we're running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
        
        // Check for development port
        const isDevelopmentPort = window.location.port === '4200' || 
                                 window.location.port === '3000';
        
        return isLocalhost || isDevelopmentPort;
      }
      
      // Default to development if we can't determine
      return true;
    } catch (error) {
      // If any error occurs, default to development mode
      console.warn('Could not determine environment mode, defaulting to development');
      return true;
    }
  }

  /**
   * Log error with comprehensive context data
   */
  logError(entry: ErrorLogEntry): void {
    const timestamp = new Date().toISOString();
    const errorMessage = entry.error instanceof Error ? entry.error.message : entry.error;
    const stack = entry.error instanceof Error ? entry.error.stack : undefined;

    // Enhanced context with system information
    const enhancedContext: ErrorContext = {
      ...entry.context,
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    };

    // Create comprehensive log entry
    const logEntry = {
      severity: entry.severity,
      category: entry.category,
      message: errorMessage,
      stack,
      context: enhancedContext,
      timestamp
    };

    // Console logging with styling
    this.logToConsole(logEntry);

    // Send to monitoring service in production
    if (!this.isDevelopment) {
      this.sendToMonitoring(logEntry);
    }

    // Store locally for debugging
    this.storeLocally(logEntry);
  }

  /**
   * Specific method for "User not found" errors
   */
  logUserNotFound(userId: string, operation: string, component: string, additionalData?: any): void {
    this.logError({
      error: new Error(`User not found: ${userId}`),
      context: {
        userId,
        operation,
        component,
        additionalData: {
          searchCriteria: additionalData?.searchCriteria,
          requestedFields: additionalData?.requestedFields,
          queryParameters: additionalData?.queryParameters,
          ...additionalData
        }
      },
      severity: 'high',
      category: 'user'
    });
  }

  /**
   * Service-related error logging
   */
  logServiceError(serviceId: string, operation: string, error: Error | string, additionalData?: any): void {
    this.logError({
      error,
      context: {
        serviceId,
        operation,
        component: 'ServiceComponent',
        additionalData
      },
      severity: 'medium',
      category: 'service'
    });
  }

  /**
   * Transaction-related error logging
   */
  logTransactionError(transactionId: string, operation: string, error: Error | string, additionalData?: any): void {
    this.logError({
      error,
      context: {
        transactionId,
        operation,
        component: 'TransactionComponent',
        additionalData
      },
      severity: 'high',
      category: 'transaction'
    });
  }

  /**
   * Authentication error logging
   */
  logAuthError(operation: string, error: Error | string, userId?: string, additionalData?: any): void {
    this.logError({
      error,
      context: {
        userId,
        operation,
        component: 'AuthService',
        additionalData
      },
      severity: 'critical',
      category: 'auth'
    });
  }

  /**
   * API error logging
   */
  logApiError(endpoint: string, method: string, error: Error | string, requestData?: any, responseData?: any): void {
    this.logError({
      error,
      context: {
        operation: `${method} ${endpoint}`,
        component: 'ApiService',
        additionalData: {
          endpoint,
          method,
          requestData,
          responseData,
          headers: this.sanitizeHeaders()
        }
      },
      severity: 'high',
      category: 'api'
    });
  }

  /**
   * Enhanced console logging with styling and structure
   */
  private logToConsole(logEntry: any): void {
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

    // Performance information
    const performanceMemory = (performance as any).memory;
    if (performance && performanceMemory) {
      console.log(`%c⚡ Performance:`, styles.label, {
        usedJSHeapSize: `${Math.round(performanceMemory.usedJSHeapSize / 1024 / 1024)}MB`,
        totalJSHeapSize: `${Math.round(performanceMemory.totalJSHeapSize / 1024 / 1024)}MB`,
        jsHeapSizeLimit: `${Math.round(performanceMemory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }

    console.groupEnd();
  }

  /**
   * Get console styling based on severity
   */
  private getConsoleStyles(severity: string) {
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

  /**
   * Store error locally for debugging
   */
  private storeLocally(logEntry: any): void {
    try {
      const errors = JSON.parse(localStorage.getItem('hourbank_errors') || '[]');
      errors.push(logEntry);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('hourbank_errors', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  /**
   * Send to monitoring service (placeholder for production)
   */
  private sendToMonitoring(logEntry: any): void {
    // TODO: Implement actual monitoring service integration
    // Examples: Sentry, LogRocket, CloudWatch, etc.
    console.log('📡 Sending to monitoring service:', logEntry);
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(): any {
    const headers: any = {};
    // Add non-sensitive headers only
    headers['content-type'] = 'application/json';
    headers['user-agent'] = navigator.userAgent;
    return headers;
  }

  /**
   * Get stored errors for debugging
   */
  getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('hourbank_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('hourbank_errors');
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();
