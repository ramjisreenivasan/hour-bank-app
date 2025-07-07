import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateClient } from 'aws-amplify/api';
import { User, Service } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserGraphQLService {
  private client = generateClient();
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  public services$ = this.servicesSubject.asObservable();

  constructor() {}

  // User CRUD Operations
  async getUsers(): Promise<User[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListUsers {
            listUsers {
              items {
                id
                email
                username
                firstName
                lastName
                bankHours
                skills
                bio
                profilePicture
                rating
                totalTransactions
                createdAt
                updatedAt
              }
            }
          }
        `
      }) as any;
      
      const users = result.data.listUsers.items;
      this.usersSubject.next(users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const result = await this.client.graphql({
        query: `
          query GetUser($id: ID!) {
            getUser(id: $id) {
              id
              email
              username
              firstName
              lastName
              bankHours
              skills
              bio
              profilePicture
              rating
              totalTransactions
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id }
      }) as any;
      
      return result.data.getUser;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUser(input: Partial<User>): Promise<User> {
    try {
      const result = await this.client.graphql({
        query: `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              email
              username
              firstName
              lastName
              bankHours
              skills
              bio
              profilePicture
              rating
              totalTransactions
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            ...input,
            bankHours: input.bankHours || 0,
            rating: input.rating || 0,
            totalTransactions: input.totalTransactions || 0,
            skills: input.skills || []
          }
        }
      }) as any;
      
      const newUser = result.data.createUser;
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      this.usersSubject.next([...currentUsers, newUser]);
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, input: Partial<User>): Promise<User> {
    try {
      // First, get the current user to ensure we have the latest version
      const currentUser = await this.getUserById(id);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Prepare the update input with the current updatedAt for version control
      const updateInput = {
        id,
        ...input,
        // Include the current updatedAt for optimistic concurrency control
        updatedAt: currentUser.updatedAt
      };

      const result = await this.client.graphql({
        query: `
          mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
              id
              email
              username
              firstName
              lastName
              bankHours
              skills
              bio
              profilePicture
              rating
              totalTransactions
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: updateInput
        }
      }) as any;
      
      const updatedUser = result.data.updateUser;
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      const userIndex = currentUsers.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        currentUsers[userIndex] = updatedUser;
        this.usersSubject.next([...currentUsers]);
      }
      
      return updatedUser;
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Handle specific DynamoDB conditional request failure
      if (error.message && error.message.includes('conditional request failed')) {
        // Retry once by fetching the latest version
        try {
          console.log('Retrying update with fresh user data...');
          const freshUser = await this.getUserById(id);
          if (!freshUser) {
            throw new Error('User not found on retry');
          }

          const retryInput = {
            id,
            ...input,
            updatedAt: freshUser.updatedAt
          };

          const retryResult = await this.client.graphql({
            query: `
              mutation UpdateUser($input: UpdateUserInput!) {
                updateUser(input: $input) {
                  id
                  email
                  username
                  firstName
                  lastName
                  bankHours
                  skills
                  bio
                  profilePicture
                  rating
                  totalTransactions
                  createdAt
                  updatedAt
                }
              }
            `,
            variables: {
              input: retryInput
            }
          }) as any;

          const updatedUser = retryResult.data.updateUser;
          
          // Update local state
          const currentUsers = this.usersSubject.value;
          const userIndex = currentUsers.findIndex(user => user.id === id);
          if (userIndex !== -1) {
            currentUsers[userIndex] = updatedUser;
            this.usersSubject.next([...currentUsers]);
          }
          
          return updatedUser;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw new Error('Failed to update user profile. Please refresh the page and try again.');
        }
      }
      
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.client.graphql({
        query: `
          mutation DeleteUser($input: DeleteUserInput!) {
            deleteUser(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: { id }
        }
      }) as any;
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      this.usersSubject.next(currentUsers.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Service CRUD Operations
  async getServices(): Promise<Service[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListServices {
            listServices {
              items {
                id
                userId
                title
                description
                category
                hourlyRate
                isActive
                tags
                createdAt
                updatedAt
              }
            }
          }
        `
      }) as any;
      
      const services = result.data.listServices.items;
      this.servicesSubject.next(services);
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getServicesByUser(userId: string): Promise<Service[]> {
    try {
      const result = await this.client.graphql({
        query: `
          query ListServicesByUser($userId: ID!) {
            listServices(filter: { userId: { eq: $userId } }) {
              items {
                id
                userId
                title
                description
                category
                hourlyRate
                isActive
                tags
                createdAt
                updatedAt
              }
            }
          }
        `,
        variables: { userId }
      }) as any;
      
      return result.data.listServices.items;
    } catch (error) {
      console.error('Error fetching services by user:', error);
      return [];
    }
  }

  async createService(input: Partial<Service>): Promise<Service> {
    try {
      const result = await this.client.graphql({
        query: `
          mutation CreateService($input: CreateServiceInput!) {
            createService(input: $input) {
              id
              userId
              title
              description
              category
              hourlyRate
              isActive
              tags
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
            tags: input.tags || []
          }
        }
      }) as any;
      
      const newService = result.data.createService;
      
      // Update local state
      const currentServices = this.servicesSubject.value;
      this.servicesSubject.next([...currentServices, newService]);
      
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, input: Partial<Service>): Promise<Service> {
    try {
      // Get current service for version control
      const currentService = this.getServiceById(id);
      
      const updateInput = {
        id,
        ...input,
        // Include updatedAt if available for version control
        ...(currentService?.updatedAt && { updatedAt: currentService.updatedAt })
      };

      const result = await this.client.graphql({
        query: `
          mutation UpdateService($input: UpdateServiceInput!) {
            updateService(input: $input) {
              id
              userId
              title
              description
              category
              hourlyRate
              isActive
              tags
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: updateInput
        }
      }) as any;
      
      const updatedService = result.data.updateService;
      
      // Update local state
      const currentServices = this.servicesSubject.value;
      const serviceIndex = currentServices.findIndex(service => service.id === id);
      if (serviceIndex !== -1) {
        currentServices[serviceIndex] = updatedService;
        this.servicesSubject.next([...currentServices]);
      }
      
      return updatedService;
    } catch (error: any) {
      console.error('Error updating service:', error);
      
      // Handle conditional request failure for services too
      if (error.message && error.message.includes('conditional request failed')) {
        throw new Error('Service was modified by another process. Please refresh and try again.');
      }
      
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      await this.client.graphql({
        query: `
          mutation DeleteService($input: DeleteServiceInput!) {
            deleteService(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: { id }
        }
      }) as any;
      
      // Update local state
      const currentServices = this.servicesSubject.value;
      this.servicesSubject.next(currentServices.filter(service => service.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Helper methods for local data access
  getUserFromCache(id: string): User | undefined {
    return this.usersSubject.value.find(user => user.id === id);
  }

  getServiceById(id: string): Service | undefined {
    return this.servicesSubject.value.find(service => service.id === id);
  }

  getServicesByUserId(userId: string): Service[] {
    return this.servicesSubject.value.filter(service => service.userId === userId);
  }

  // Search and Filter Operations
  async searchServices(query: string, category?: string): Promise<Service[]> {
    try {
      let filter = `filter: { isActive: { eq: true } }`;
      
      if (category && category !== 'All') {
        filter = `filter: { and: [{ isActive: { eq: true } }, { category: { eq: "${category}" } }] }`;
      }

      const result = await this.client.graphql({
        query: `
          query SearchServices {
            listServices(${filter}) {
              items {
                id
                userId
                title
                description
                category
                hourlyRate
                isActive
                tags
                createdAt
                updatedAt
              }
            }
          }
        `
      }) as any;
      
      let services = result.data.listServices.items;
      
      // Client-side text search
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        services = services.filter((service: Service) =>
          service.title.toLowerCase().includes(searchTerm) ||
          service.description.toLowerCase().includes(searchTerm) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return services;
    } catch (error) {
      console.error('Error searching services:', error);
      return [];
    }
  }
}
