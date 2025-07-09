import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Service } from '../models/user.model';
import { errorLogger } from '../utils/error-logger';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private client = generateClient();

  constructor() {}

  /**
   * Get service by ID
   */
  getService(serviceId: string): Observable<Service | null> {
    return from(this.client.graphql({
      query: queries.getService,
      variables: { id: serviceId }
    })).pipe(
      map((result: any) => {
        if (!result.data?.getService) {
          errorLogger.logError({
            error: new Error(`Service not found: ${serviceId}`),
            context: {
              serviceId,
              operation: 'getService',
              component: 'ServiceService',
              additionalData: {
                queryType: 'getService',
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'service'
          });
          return null;
        }
        return result.data.getService as Service;
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'getService',
            variables: { id: serviceId }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to get service ${serviceId}: ${error.message}`));
      })
    );
  }

  /**
   * Get services by user ID
   */
  getServicesByUserId(userId: string, limit?: number, nextToken?: string): Observable<{items: Service[], nextToken?: string}> {
    console.log('🔍 DEBUG: ServiceService.getServicesByUserId called with:', { userId, limit, nextToken });
    
    return from(this.client.graphql({
      query: queries.servicesByUserId,
      variables: { userId, limit, nextToken }
    })).pipe(
      map((result: any) => {
        console.log('🔍 DEBUG: GraphQL raw response:', result);
        
        const data = result.data?.servicesByUserId;
        if (!data) {
          console.log('🔍 DEBUG: No data in response, checking for errors:', result.errors);
          
          errorLogger.logError({
            error: new Error(`Failed to get services for user: ${userId}`),
            context: {
              userId,
              operation: 'getServicesByUserId',
              component: 'ServiceService',
              additionalData: {
                queryParams: { userId, limit, nextToken },
                graphqlResponse: result,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'service'
          });
          return { items: [], nextToken: undefined };
        }
        
        console.log('🔍 DEBUG: Services data found:', data);
        return {
          items: data.items || [],
          nextToken: data.nextToken
        };
      }),
      catchError((error) => {
        console.error('🔍 DEBUG: GraphQL error caught:', error);
        console.error('🔍 DEBUG: Error details:', {
          name: error.name,
          message: error.message,
          errors: error.errors,
          data: error.data,
          extensions: error.extensions
        });
        
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'servicesByUserId',
            variables: { userId, limit, nextToken }
          },
          error.response
        );
        
        // Return empty array instead of throwing error to allow fallback to mock data
        console.log('🔍 DEBUG: Returning empty array due to error');
        return of({ items: [], nextToken: undefined });
      })
    );
  }

  /**
   * List all services
   */
  listServices(limit?: number, nextToken?: string, filter?: any): Observable<{items: Service[], nextToken?: string}> {
    return from(this.client.graphql({
      query: queries.listServices,
      variables: { limit, nextToken, filter }
    })).pipe(
      map((result: any) => {
        const data = result.data?.listServices;
        if (!data) {
          errorLogger.logError({
            error: new Error('Failed to list services'),
            context: {
              operation: 'listServices',
              component: 'ServiceService',
              additionalData: {
                queryParams: { limit, nextToken, filter },
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'service'
          });
          return { items: [], nextToken: undefined };
        }
        return {
          items: data.items || [],
          nextToken: data.nextToken
        };
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'listServices',
            variables: { limit, nextToken, filter }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to list services: ${error.message}`));
      })
    );
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: string, limit?: number, nextToken?: string): Observable<{items: Service[], nextToken?: string}> {
    return from(this.client.graphql({
      query: queries.servicesByCategory,
      variables: { category, limit, nextToken }
    })).pipe(
      map((result: any) => {
        const data = result.data?.servicesByCategory;
        if (!data) {
          errorLogger.logError({
            error: new Error(`Failed to get services for category: ${category}`),
            context: {
              operation: 'getServicesByCategory',
              component: 'ServiceService',
              additionalData: {
                category,
                queryParams: { category, limit, nextToken },
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'service'
          });
          return { items: [], nextToken: undefined };
        }
        return {
          items: data.items || [],
          nextToken: data.nextToken
        };
      }),
      catchError((error) => {
        errorLogger.logApiError(
          '/graphql',
          'POST',
          error,
          {
            query: 'servicesByCategory',
            variables: { category, limit, nextToken }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to get services for category ${category}: ${error.message}`));
      })
    );
  }

  /**
   * Create a new service
   */
  createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Observable<Service> {
    const input = {
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return from(this.client.graphql({
      query: mutations.createService,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.createService) {
          errorLogger.logError({
            error: new Error('Create service failed: No data returned'),
            context: {
              operation: 'createService',
              component: 'ServiceService',
              additionalData: {
                inputData: input,
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'service'
          });
          throw new Error('Failed to create service');
        }
        return result.data.createService as Service;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            operation: 'createService',
            component: 'ServiceService',
            additionalData: {
              inputData: input,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'service'
        });
        return throwError(() => new Error(`Failed to create service: ${error.message}`));
      })
    );
  }

  /**
   * Update a service
   */
  updateService(serviceId: string, updateData: Partial<Service>): Observable<Service> {
    const input = {
      id: serviceId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return from(this.client.graphql({
      query: mutations.updateService,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.updateService) {
          errorLogger.logError({
            error: new Error(`Update service failed: No data returned for service ${serviceId}`),
            context: {
              serviceId,
              operation: 'updateService',
              component: 'ServiceService',
              additionalData: {
                updateFields: Object.keys(updateData),
                inputData: input,
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'service'
          });
          throw new Error(`Failed to update service ${serviceId}`);
        }
        return result.data.updateService as Service;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            serviceId,
            operation: 'updateService',
            component: 'ServiceService',
            additionalData: {
              updateFields: Object.keys(updateData),
              inputData: input,
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'high',
          category: 'service'
        });
        return throwError(() => new Error(`Failed to update service ${serviceId}: ${error.message}`));
      })
    );
  }

  /**
   * Delete a service
   */
  deleteService(serviceId: string): Observable<boolean> {
    return from(this.client.graphql({
      query: mutations.deleteService,
      variables: { input: { id: serviceId } }
    })).pipe(
      map((result: any) => {
        if (!result.data?.deleteService) {
          errorLogger.logError({
            error: new Error(`Delete service failed: No confirmation for service ${serviceId}`),
            context: {
              serviceId,
              operation: 'deleteService',
              component: 'ServiceService',
              additionalData: {
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'high',
            category: 'service'
          });
          return false;
        }
        return true;
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            serviceId,
            operation: 'deleteService',
            component: 'ServiceService',
            additionalData: {
              errorDetails: {
                name: error.name,
                message: error.message,
                code: error.code
              },
              graphqlErrors: error.errors,
              timestamp: new Date().toISOString()
            }
          },
          severity: 'critical',
          category: 'service'
        });
        return throwError(() => new Error(`Failed to delete service ${serviceId}: ${error.message}`));
      })
    );
  }
}
