import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { errorLogger } from '../utils/error-logger';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

export interface Transaction {
  id: string;
  providerId: string;
  consumerId: string;
  serviceId: string;
  bookingId?: string;
  hoursSpent: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  providerId: string;
  consumerId: string;
  serviceId: string;
  bookingId?: string;
  hoursSpent: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  rating?: number;
  feedback?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private client = generateClient();

  constructor() {}

  /**
   * Create transaction with comprehensive error logging
   */
  createTransaction(input: CreateTransactionInput): Observable<Transaction> {
    return from(this.client.graphql({
      query: mutations.createTransaction,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.createTransaction) {
          errorLogger.logTransactionError(
            'new',
            'createTransaction',
            new Error('Create transaction failed: No data returned'),
            {
              inputData: input,
              resultData: result.data,
              timestamp: new Date().toISOString(),
              operation: 'create'
            }
          );
          throw new Error('Failed to create transaction');
        }
        return result.data.createTransaction as Transaction;
      }),
      catchError((error) => {
        errorLogger.logTransactionError(
          'new',
          'createTransaction',
          error,
          {
            inputData: input,
            errorDetails: {
              name: error.name,
              message: error.message,
              code: error.code,
              stack: error.stack
            },
            graphqlErrors: error.errors,
            timestamp: new Date().toISOString(),
            operation: 'create',
            authorizationCheck: 'API Key should allow public access'
          }
        );
        return throwError(() => new Error(`Failed to create transaction: ${error.message}`));
      })
    );
  }

  /**
   * Get transaction by ID with error logging
   */
  getTransaction(transactionId: string): Observable<Transaction | null> {
    return from(this.client.graphql({
      query: queries.getTransaction,
      variables: { id: transactionId }
    })).pipe(
      map((result: any) => {
        if (!result.data?.getTransaction) {
          errorLogger.logTransactionError(
            transactionId,
            'getTransaction',
            new Error(`Transaction not found: ${transactionId}`),
            {
              queryType: 'getTransaction',
              searchCriteria: { id: transactionId },
              resultData: result.data,
              timestamp: new Date().toISOString()
            }
          );
          return null;
        }
        return result.data.getTransaction as Transaction;
      }),
      catchError((error) => {
        errorLogger.logTransactionError(
          transactionId,
          'getTransaction',
          error,
          {
            errorDetails: {
              name: error.name,
              message: error.message,
              code: error.code
            },
            graphqlErrors: error.errors,
            timestamp: new Date().toISOString()
          }
        );
        return throwError(() => new Error(`Failed to get transaction ${transactionId}: ${error.message}`));
      })
    );
  }

  /**
   * Update transaction with error logging
   */
  updateTransaction(transactionId: string, updateData: Partial<Transaction>): Observable<Transaction> {
    const input = {
      id: transactionId,
      ...updateData
    };

    return from(this.client.graphql({
      query: mutations.updateTransaction,
      variables: { input }
    })).pipe(
      map((result: any) => {
        if (!result.data?.updateTransaction) {
          errorLogger.logTransactionError(
            transactionId,
            'updateTransaction',
            new Error(`Update transaction failed: No data returned for ${transactionId}`),
            {
              updateFields: Object.keys(updateData),
              inputData: input,
              resultData: result.data,
              timestamp: new Date().toISOString()
            }
          );
          throw new Error(`Failed to update transaction ${transactionId}`);
        }
        return result.data.updateTransaction as Transaction;
      }),
      catchError((error) => {
        errorLogger.logTransactionError(
          transactionId,
          'updateTransaction',
          error,
          {
            updateFields: Object.keys(updateData),
            inputData: input,
            errorDetails: {
              name: error.name,
              message: error.message,
              code: error.code,
              stack: error.stack
            },
            graphqlErrors: error.errors,
            timestamp: new Date().toISOString()
          }
        );
        return throwError(() => new Error(`Failed to update transaction ${transactionId}: ${error.message}`));
      })
    );
  }

  /**
   * List transactions with error logging
   */
  listTransactions(limit?: number, nextToken?: string): Observable<{items: Transaction[], nextToken?: string}> {
    return from(this.client.graphql({
      query: queries.listTransactions,
      variables: { limit, nextToken }
    })).pipe(
      map((result: any) => {
        const data = result.data?.listTransactions;
        if (!data) {
          errorLogger.logError({
            error: new Error('List transactions failed: No data returned'),
            context: {
              operation: 'listTransactions',
              component: 'TransactionService',
              additionalData: {
                queryParams: { limit, nextToken },
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'medium',
            category: 'transaction'
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
            query: 'listTransactions',
            variables: { limit, nextToken }
          },
          error.response
        );
        return throwError(() => new Error(`Failed to list transactions: ${error.message}`));
      })
    );
  }

  /**
   * Get transactions by user ID (as provider)
   */
  getTransactionsByProviderId(providerId: string): Observable<Transaction[]> {
    return from(this.client.graphql({
      query: queries.transactionsByProviderId,
      variables: { providerId }
    })).pipe(
      map((result: any) => {
        const data = result.data?.transactionsByProviderId;
        if (!data) {
          errorLogger.logError({
            error: new Error(`No transactions found for provider: ${providerId}`),
            context: {
              userId: providerId,
              operation: 'getTransactionsByProviderId',
              component: 'TransactionService',
              additionalData: {
                queryType: 'transactionsByProviderId',
                searchCriteria: { providerId },
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'low',
            category: 'transaction'
          });
          return [];
        }
        return data.items || [];
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId: providerId,
            operation: 'getTransactionsByProviderId',
            component: 'TransactionService',
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
          severity: 'medium',
          category: 'transaction'
        });
        return throwError(() => new Error(`Failed to get transactions for provider ${providerId}: ${error.message}`));
      })
    );
  }

  /**
   * Get transactions by user ID (as consumer)
   */
  getTransactionsByConsumerId(consumerId: string): Observable<Transaction[]> {
    return from(this.client.graphql({
      query: queries.transactionsByConsumerId,
      variables: { consumerId }
    })).pipe(
      map((result: any) => {
        const data = result.data?.transactionsByConsumerId;
        if (!data) {
          errorLogger.logError({
            error: new Error(`No transactions found for consumer: ${consumerId}`),
            context: {
              userId: consumerId,
              operation: 'getTransactionsByConsumerId',
              component: 'TransactionService',
              additionalData: {
                queryType: 'transactionsByConsumerId',
                searchCriteria: { consumerId },
                resultData: result.data,
                timestamp: new Date().toISOString()
              }
            },
            severity: 'low',
            category: 'transaction'
          });
          return [];
        }
        return data.items || [];
      }),
      catchError((error) => {
        errorLogger.logError({
          error: error,
          context: {
            userId: consumerId,
            operation: 'getTransactionsByConsumerId',
            component: 'TransactionService',
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
          severity: 'medium',
          category: 'transaction'
        });
        return throwError(() => new Error(`Failed to get transactions for consumer ${consumerId}: ${error.message}`));
      })
    );
  }
}
