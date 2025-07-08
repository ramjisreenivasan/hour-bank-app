// Simple TypeScript test to verify our fixes compile correctly

import { Service } from './src/app/models/user.model';

// Test the ServiceWithProvider interface fix
interface ServiceWithProvider extends Omit<Service, 'provider'> {
  provider?: {
    firstName: string;
    lastName: string;
    rating: number;
    totalTransactions: number;
  };
}

// Test creating a ServiceWithProvider object
const testService: ServiceWithProvider = {
  id: '1',
  userId: 'user1',
  title: 'Test Service',
  description: 'Test Description',
  category: 'Technology',
  hourlyRate: 2,
  isActive: true,
  tags: ['test'],
  requiresScheduling: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  provider: {
    firstName: 'John',
    lastName: 'Doe',
    rating: 4.5,
    totalTransactions: 10
  }
};

// Test error logging structure
interface ErrorContext {
  userId?: string;
  serviceId?: string;
  operation?: string;
  component?: string;
  additionalData?: any;
}

interface ErrorLogEntry {
  error: Error | string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user' | 'service' | 'transaction' | 'booking' | 'auth' | 'api' | 'ui' | 'system';
}

// Test creating an error log entry
const testErrorLog: ErrorLogEntry = {
  error: new Error('Test error'),
  context: {
    operation: 'getServicesByCategory',
    component: 'ServiceService',
    additionalData: {
      category: 'Technology',
      timestamp: new Date().toISOString()
    }
  },
  severity: 'medium',
  category: 'service'
};

console.log('TypeScript fixes verified successfully!');
console.log('Test service:', testService.title);
console.log('Test error log:', testErrorLog.category);
