import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateClient } from 'aws-amplify/api';
import { Transaction, TransactionStatus, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionGraphQLService {
  private client = generateClient();
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor() {}

  // Transaction CRUD Operations
  async getTransactions(): Promise<Transaction[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListTransactions {
            listTransactions {
              items {
                id
                providerId
                consumerId
                serviceId
                hoursSpent
                status
                description
                rating
                feedback
                provider {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                consumer {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                service {
                  id
                  title
                  description
                  category
                  hourlyDuration
                }
                createdAt
                completedAt
                updatedAt
              }
            }
          }
        `
      }) as any;
      
      const transactions = result.data.listTransactions.items;
      this.transactionsSubject.next(transactions);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const result = await this.client.graphql({
        query: `
          query GetTransaction($id: ID!) {
            getTransaction(id: $id) {
              id
              providerId
              consumerId
              serviceId
              hoursSpent
              status
              description
              rating
              feedback
              provider {
                id
                username
                firstName
                lastName
                rating
              }
              consumer {
                id
                username
                firstName
                lastName
                rating
              }
              service {
                id
                title
                description
                category
                hourlyDuration
              }
              createdAt
              completedAt
              updatedAt
            }
          }
        `,
        variables: { id }
      }) as any;
      
      return result.data.getTransaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListTransactionsByUser($userId: ID!) {
            listTransactions(filter: {
              or: [
                { providerId: { eq: $userId } },
                { consumerId: { eq: $userId } }
              ]
            }) {
              items {
                id
                providerId
                consumerId
                serviceId
                hoursSpent
                status
                description
                rating
                feedback
                provider {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                consumer {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                service {
                  id
                  title
                  description
                  category
                  hourlyDuration
                }
                createdAt
                completedAt
                updatedAt
              }
            }
          }
        `,
        variables: { userId }
      }) as any;
      
      return result.data.listTransactions.items;
    } catch (error) {
      console.error('Error fetching transactions by user:', error);
      return [];
    }
  }

  async createTransaction(input: {
    providerId: string;
    consumerId: string;
    serviceId: string;
    hoursSpent: number;
    description: string;
  }): Promise<Transaction> {
    try {
      const result = await this.client.graphql({
        query: `
          mutation CreateTransaction($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
              providerId
              consumerId
              serviceId
              hoursSpent
              status
              description
              rating
              feedback
              provider {
                id
                username
                firstName
                lastName
                rating
              }
              consumer {
                id
                username
                firstName
                lastName
                rating
              }
              service {
                id
                title
                description
                category
                hourlyDuration
              }
              createdAt
              completedAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            ...input,
            status: TransactionStatus.PENDING
          }
        }
      }) as any;
      
      const newTransaction = result.data.createTransaction;
      
      // Update local state
      const currentTransactions = this.transactionsSubject.value;
      this.transactionsSubject.next([...currentTransactions, newTransaction]);
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransactionStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    try {
      const updateInput: any = {
        id,
        status
      };

      // If completing the transaction, set completedAt
      if (status === TransactionStatus.COMPLETED) {
        updateInput.completedAt = new Date().toISOString();
      }

      const result = await this.client.graphql({
        query: `
          mutation UpdateTransaction($input: UpdateTransactionInput!) {
            updateTransaction(input: $input) {
              id
              providerId
              consumerId
              serviceId
              hoursSpent
              status
              description
              rating
              feedback
              provider {
                id
                username
                firstName
                lastName
                rating
              }
              consumer {
                id
                username
                firstName
                lastName
                rating
              }
              service {
                id
                title
                description
                category
                hourlyDuration
              }
              createdAt
              completedAt
              updatedAt
            }
          }
        `,
        variables: {
          input: updateInput
        }
      }) as any;
      
      const updatedTransaction = result.data.updateTransaction;
      
      // Update local state
      const currentTransactions = this.transactionsSubject.value;
      const transactionIndex = currentTransactions.findIndex(t => t.id === id);
      if (transactionIndex !== -1) {
        currentTransactions[transactionIndex] = updatedTransaction;
        this.transactionsSubject.next([...currentTransactions]);
      }
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  async addRatingAndFeedback(id: string, rating: number, feedback: string): Promise<Transaction> {
    try {
      const result = await this.client.graphql({
        query: `
          mutation UpdateTransaction($input: UpdateTransactionInput!) {
            updateTransaction(input: $input) {
              id
              providerId
              consumerId
              serviceId
              hoursSpent
              status
              description
              rating
              feedback
              provider {
                id
                username
                firstName
                lastName
                rating
              }
              consumer {
                id
                username
                firstName
                lastName
                rating
              }
              service {
                id
                title
                description
                category
                hourlyDuration
              }
              createdAt
              completedAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            id,
            rating,
            feedback
          }
        }
      }) as any;
      
      const updatedTransaction = result.data.updateTransaction;
      
      // Update local state
      const currentTransactions = this.transactionsSubject.value;
      const transactionIndex = currentTransactions.findIndex(t => t.id === id);
      if (transactionIndex !== -1) {
        currentTransactions[transactionIndex] = updatedTransaction;
        this.transactionsSubject.next([...currentTransactions]);
      }
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error adding rating and feedback:', error);
      throw error;
    }
  }

  // Helper method to get transaction with populated service details
  async getTransactionWithDetails(transactionId: string): Promise<any> {
    try {
      // Get the transaction
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction) return null;

      // Get service details
      const serviceResult = await this.client.graphql({
        query: `
          query GetService($id: ID!) {
            getService(id: $id) {
              id
              title
              description
              category
              hourlyDuration
              user {
                id
                firstName
                lastName
                username
                rating
              }
            }
          }
        `,
        variables: { id: transaction.serviceId }
      }) as any;
      
      const service = serviceResult.data.getService;
      
      return {
        ...transaction,
        service
      };
    } catch (error) {
      console.error('Error getting transaction with details:', error);
      return null;
    }
  }

  // Request a service (creates a transaction)
  async requestService(serviceId: string, consumerId: string, hoursRequested: number = 1): Promise<Transaction> {
    try {
      // First get the service to find the provider
      const service = await this.getServiceById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      return await this.createTransaction({
        providerId: service.userId,
        consumerId,
        serviceId,
        hoursSpent: hoursRequested,
        description: `Request for ${service.title}`
      });
    } catch (error) {
      console.error('Error requesting service:', error);
      throw error;
    }
  }

  // Helper method to get service by ID
  private async getServiceById(serviceId: string): Promise<any> {
    try {
      const result = await this.client.graphql({
        query: `
          query GetService($id: ID!) {
            getService(id: $id) {
              id
              userId
              title
              description
              category
              hourlyDuration
            }
          }
        `,
        variables: { id: serviceId }
      }) as any;
      
      return result.data.getService;
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  }

  // Get user details for transactions
  async getUsersForTransaction(providerId: string, consumerId: string): Promise<{ provider: User | null, consumer: User | null }> {
    try {
      const [providerResult, consumerResult] = await Promise.all([
        this.client.graphql({
          query: `
            query GetUser($id: ID!) {
              getUser(id: $id) {
                id
                username
                firstName
                lastName
                rating
              }
            }
          `,
          variables: { id: providerId }
        }) as any,
        this.client.graphql({
          query: `
            query GetUser($id: ID!) {
              getUser(id: $id) {
                id
                username
                firstName
                lastName
                rating
              }
            }
          `,
          variables: { id: consumerId }
        }) as any
      ]);
      
      const provider = providerResult.data.getUser;
      const consumer = consumerResult.data.getUser;
      
      return { provider, consumer };
    } catch (error) {
      console.error('Error fetching users for transaction:', error);
      return { provider: null, consumer: null };
    }
  }

  // Filter and search operations
  async getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListTransactionsByStatus($status: TransactionStatus!) {
            listTransactions(filter: { status: { eq: $status } }) {
              items {
                id
                providerId
                consumerId
                serviceId
                hoursSpent
                status
                description
                rating
                feedback
                provider {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                consumer {
                  id
                  username
                  firstName
                  lastName
                  rating
                }
                service {
                  id
                  title
                  description
                  category
                  hourlyDuration
                }
                createdAt
                completedAt
                updatedAt
              }
            }
          }
        `,
        variables: { status }
      }) as any;
      
      return result.data.listTransactions.items;
    } catch (error) {
      console.error('Error fetching transactions by status:', error);
      return [];
    }
  }

  // Helper methods for accessing populated data
  getTransactionProvider(transaction: Transaction): User | null {
    return transaction.provider || null;
  }

  getTransactionConsumer(transaction: Transaction): User | null {
    return transaction.consumer || null;
  }
}
