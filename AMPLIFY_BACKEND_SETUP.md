# 🚀 HourBank Amplify Backend Setup Guide

## 📋 Backend Architecture Overview

Based on your HourBank application design, here's the complete backend architecture we'll implement:

### **Required AWS Services:**
1. **🔐 Authentication** - AWS Cognito (✅ Already configured)
2. **🗄️ Database** - DynamoDB with GraphQL API
3. **📁 Storage** - S3 for profile pictures and files
4. **🌐 API** - GraphQL API for all CRUD operations
5. **🔔 Functions** - Lambda functions for business logic
6. **📧 Notifications** - For transaction updates (optional)

## 🏗️ Step-by-Step Backend Setup

### **Step 1: Add GraphQL API with DynamoDB**

```bash
# Add GraphQL API
amplify add api

# Configuration options:
# ? Select from one of the below mentioned services: GraphQL
# ? Here is the GraphQL API that we will create. Select a setting to edit or continue: Continue
# ? Choose a schema template: Single object with fields (e.g., "Todo" with ID, name, description)
# ? Do you want to edit the schema now? Yes
```

### **Step 2: Add Storage for File Uploads**

```bash
# Add S3 storage
amplify add storage

# Configuration options:
# ? Select from one of the below mentioned services: Content (Images, audio, video, etc.)
# ? Provide a friendly name for your resource: hourbankStorage
# ? Provide bucket name: hourbank-storage-bucket
# ? Who should have access: Auth users only
# ? What kind of access do you want for Authenticated users? create/update, read, delete
```

### **Step 3: Add Lambda Functions (Optional)**

```bash
# Add Lambda function for business logic
amplify add function

# Configuration options:
# ? Select which capability you want to add: Lambda function (serverless function)
# ? Provide an AWS Lambda function name: hourbankBusinessLogic
# ? Choose the runtime that you want to use: NodeJS
# ? Choose the function template that you want to use: Hello World
```

## 📊 GraphQL Schema Design

Here's the complete GraphQL schema for your HourBank application:

```graphql
# User Model
type User @model @auth(rules: [
  { allow: owner, ownerField: "id" }
  { allow: private, operations: [read] }
]) {
  id: ID!
  email: String! @index(name: "byEmail")
  username: String! @index(name: "byUsername")
  firstName: String!
  lastName: String!
  bankHours: Float!
  skills: [String!]!
  bio: String
  profilePicture: String
  rating: Float!
  totalTransactions: Int!
  services: [Service] @hasMany(indexName: "byUserId", fields: ["id"])
  providedTransactions: [Transaction] @hasMany(indexName: "byProviderId", fields: ["id"])
  consumedTransactions: [Transaction] @hasMany(indexName: "byConsumerId", fields: ["id"])
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

# Service Model
type Service @model @auth(rules: [
  { allow: owner, ownerField: "userId" }
  { allow: private, operations: [read] }
]) {
  id: ID!
  userId: ID! @index(name: "byUserId")
  user: User @belongsTo(fields: ["userId"])
  title: String!
  description: String!
  category: String! @index(name: "byCategory")
  hourlyRate: Float!
  isActive: Boolean!
  tags: [String!]!
  transactions: [Transaction] @hasMany(indexName: "byServiceId", fields: ["id"])
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

# Transaction Model
type Transaction @model @auth(rules: [
  { allow: owner, ownerField: "providerId" }
  { allow: owner, ownerField: "consumerId" }
]) {
  id: ID!
  providerId: ID! @index(name: "byProviderId")
  consumerId: ID! @index(name: "byConsumerId")
  serviceId: ID! @index(name: "byServiceId")
  provider: User @belongsTo(fields: ["providerId"])
  consumer: User @belongsTo(fields: ["consumerId"])
  service: Service @belongsTo(fields: ["serviceId"])
  hoursSpent: Float!
  status: TransactionStatus!
  description: String!
  rating: Float
  feedback: String
  createdAt: AWSDateTime!
  completedAt: AWSDateTime
  updatedAt: AWSDateTime!
}

# Transaction Status Enum
enum TransactionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

# Category Model (for service categories)
type Category @model @auth(rules: [
  { allow: private, operations: [read] }
  { allow: groups, groups: ["admin"] }
]) {
  id: ID!
  name: String!
  description: String
  icon: String
  services: [Service] @hasMany(indexName: "byCategory", fields: ["name"])
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

# Rating Model (for detailed ratings)
type Rating @model @auth(rules: [
  { allow: owner, ownerField: "raterId" }
  { allow: owner, ownerField: "ratedUserId", operations: [read] }
]) {
  id: ID!
  transactionId: ID! @index(name: "byTransactionId")
  raterId: ID! @index(name: "byRaterId")
  ratedUserId: ID! @index(name: "byRatedUserId")
  rating: Float!
  feedback: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

## 🔧 Implementation Commands

### **Complete Setup Sequence:**

```bash
# 1. Add GraphQL API
amplify add api
# Choose GraphQL, continue with defaults, edit schema

# 2. Add Storage
amplify add storage
# Choose Content, configure for authenticated users

# 3. Add Lambda Functions (optional)
amplify add function
# For business logic, notifications, etc.

# 4. Push all changes to AWS
amplify push

# 5. Generate GraphQL code
amplify codegen add
# Choose TypeScript, Angular
```

## 📁 File Structure After Setup

```
amplify/
├── backend/
│   ├── api/
│   │   └── hourbankapi/
│   │       ├── schema.graphql
│   │       ├── resolvers/
│   │       └── stacks/
│   ├── auth/
│   │   └── hourbankapp488f170c/
│   ├── storage/
│   │   └── hourbankStorage/
│   └── function/
│       └── hourbankBusinessLogic/
└── #current-cloud-backend/
```

## 🔄 Service Integration

### **Update User Service:**

```typescript
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { listUsers, getUser, createUser, updateUser } from '../graphql/queries';
import { CreateUserInput, UpdateUserInput } from '../API.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private client = generateClient();

  async getUsers() {
    try {
      const result = await this.client.graphql({
        query: listUsers
      });
      return result.data.listUsers.items;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const result = await this.client.graphql({
        query: getUser,
        variables: { id }
      });
      return result.data.getUser;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(input: CreateUserInput) {
    try {
      const result = await this.client.graphql({
        query: createUser,
        variables: { input }
      });
      return result.data.createUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(input: UpdateUserInput) {
    try {
      const result = await this.client.graphql({
        query: updateUser,
        variables: { input }
      });
      return result.data.updateUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}
```

### **Update Transaction Service:**

```typescript
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { 
  listTransactions, 
  getTransaction, 
  createTransaction, 
  updateTransaction 
} from '../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private client = generateClient();

  async getTransactionsByUser(userId: string) {
    try {
      const result = await this.client.graphql({
        query: listTransactions,
        variables: {
          filter: {
            or: [
              { providerId: { eq: userId } },
              { consumerId: { eq: userId } }
            ]
          }
        }
      });
      return result.data.listTransactions.items;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(input: CreateTransactionInput) {
    try {
      const result = await this.client.graphql({
        query: createTransaction,
        variables: { input }
      });
      return result.data.createTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    try {
      const result = await this.client.graphql({
        query: updateTransaction,
        variables: {
          input: { id, status }
        }
      });
      return result.data.updateTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }
}
```

## 📁 Storage Integration

### **Profile Picture Upload:**

```typescript
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

export class ProfileService {
  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    try {
      const key = `profile-pictures/${userId}/${file.name}`;
      
      const result = await uploadData({
        key,
        data: file,
        options: {
          accessLevel: 'private'
        }
      }).result;

      return key;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async getProfilePictureUrl(key: string): Promise<string> {
    try {
      const result = await getUrl({
        key,
        options: {
          accessLevel: 'private'
        }
      });
      
      return result.url.toString();
    } catch (error) {
      console.error('Error getting profile picture URL:', error);
      throw error;
    }
  }

  async deleteProfilePicture(key: string): Promise<void> {
    try {
      await remove({
        key,
        options: {
          accessLevel: 'private'
        }
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }
}
```

## 🔐 Enhanced Authentication

### **User Groups and Attributes:**

```bash
# Add user groups
amplify update auth

# Add custom attributes:
# - skills (string array)
# - bankHours (number)
# - rating (number)
```

## 🚀 Deployment Steps

### **1. Create Schema File:**
```bash
# Create the schema file
cat > amplify/backend/api/hourbankapi/schema.graphql << 'EOF'
# [Paste the GraphQL schema from above]
EOF
```

### **2. Push to AWS:**
```bash
amplify push
# This will create:
# - DynamoDB tables
# - GraphQL API
# - S3 storage bucket
# - Lambda functions (if added)
```

### **3. Generate Types:**
```bash
amplify codegen add
# Choose TypeScript
# This generates API.service.ts with all types
```

### **4. Update Package Dependencies:**
```bash
npm install @aws-amplify/ui-angular aws-amplify
```

## 📊 Expected AWS Resources

After setup, you'll have:

### **DynamoDB Tables:**
- `User-{env}-{hash}` - User profiles and data
- `Service-{env}-{hash}` - Available services
- `Transaction-{env}-{hash}` - Transaction records
- `Category-{env}-{hash}` - Service categories
- `Rating-{env}-{hash}` - User ratings

### **S3 Buckets:**
- `hourbank-storage-bucket-{env}-{hash}` - File storage

### **API Gateway:**
- GraphQL endpoint for all operations
- Real-time subscriptions for live updates

### **Lambda Functions:**
- Business logic functions
- Custom resolvers
- Notification handlers

## 🔄 Migration from Mock Data

### **Data Migration Script:**
```typescript
// migrate-data.ts
export class DataMigrationService {
  async migrateMockDataToAmplify() {
    // 1. Create users from mock data
    // 2. Create services from mock data  
    // 3. Create transactions from mock data
    // 4. Update all references
  }
}
```

## 🎯 Next Steps

1. **Run the setup commands** above
2. **Update your services** to use GraphQL
3. **Test the API** with your existing components
4. **Add file upload functionality**
5. **Implement real-time features** with subscriptions
6. **Deploy and test** the complete backend

This comprehensive backend setup will give you a production-ready, scalable foundation for your HourBank application! 🚀
