# 🚀 HourBank Backend Deployment & Testing Guide

## 📋 Overview

This guide walks you through deploying and testing your complete HourBank backend infrastructure with AWS Amplify.

## 🏗️ Backend Architecture

Your HourBank application now includes:

### **Core Services:**
- 🔐 **Authentication** - AWS Cognito (existing)
- 🗄️ **Database** - DynamoDB with GraphQL API
- 📁 **Storage** - S3 for profile pictures and files
- 🌐 **API** - GraphQL API with real-time subscriptions
- ⚡ **Functions** - Lambda functions for business logic
- 🔔 **Notifications** - Real-time updates

### **Data Models:**
- **User** - Profile, skills, bank hours, ratings
- **Service** - Offered services with categories and tags
- **Transaction** - Service exchanges with status tracking
- **Rating** - Detailed rating system
- **Category** - Service categorization
- **Notification** - System notifications
- **Message** - Direct messaging between users

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare for Deployment**

```bash
# Ensure you're in the project directory
cd /home/awsramji/projects/hourbank/hourbank-app

# Check current Amplify status
amplify status

# Verify AWS credentials
aws sts get-caller-identity
```

### **Step 2: Run the Backend Setup Script**

```bash
# Make the script executable (if not already done)
chmod +x setup-backend.sh

# Run the automated setup
./setup-backend.sh
```

**What this script does:**
1. ✅ Adds GraphQL API with comprehensive schema
2. ✅ Adds S3 storage for file uploads
3. ✅ Creates Lambda functions for business logic
4. ✅ Updates authentication configuration
5. ✅ Creates updated service files
6. ✅ Generates TypeScript types

### **Step 3: Manual Schema Setup (Alternative)**

If you prefer manual setup:

```bash
# Add GraphQL API
amplify add api
# Choose: GraphQL
# Choose: Amazon Cognito User Pool
# Accept defaults and edit schema

# Copy the schema
cp schema.graphql amplify/backend/api/hourbankapi/schema.graphql

# Add S3 Storage
amplify add storage
# Choose: Content (Images, audio, video, etc.)
# Name: hourbankStorage
# Access: Auth users only
# Permissions: create/update, read, delete
```

### **Step 4: Deploy to AWS**

```bash
# Push all changes to AWS (this creates the infrastructure)
amplify push

# This will create:
# - DynamoDB tables for all models
# - GraphQL API with resolvers
# - S3 bucket for file storage
# - Lambda functions
# - IAM roles and policies
```

### **Step 5: Generate GraphQL Code**

```bash
# Generate TypeScript types and queries
amplify codegen add
# Choose: TypeScript
# Path: src/graphql
# Generate: Yes
# File: src/app/API.service.ts

# Generate the code
amplify codegen
```

## 📊 Verify Deployment

### **Check AWS Resources:**

```bash
# Check Amplify status
amplify status

# Open Amplify Console
amplify console

# Check specific resources
aws dynamodb list-tables --region us-east-1
aws s3 ls
```

### **Expected AWS Resources:**

#### **DynamoDB Tables:**
- `User-dev-{hash}` - User profiles
- `Service-dev-{hash}` - Available services
- `Transaction-dev-{hash}` - Transaction records
- `Category-dev-{hash}` - Service categories
- `Rating-dev-{hash}` - User ratings
- `Notification-dev-{hash}` - System notifications
- `Message-dev-{hash}` - Direct messages
- `Conversation-dev-{hash}` - Message threads

#### **S3 Buckets:**
- `hourbank-storage-bucket-dev-{hash}` - File storage

#### **API Gateway:**
- GraphQL endpoint: `https://{id}.appsync-api.us-east-1.amazonaws.com/graphql`

## 🔄 Update Your Application

### **Step 1: Update Package Dependencies**

```bash
npm install --save @aws-amplify/ui-angular aws-amplify
```

### **Step 2: Update Service Imports**

Replace your existing services with the new GraphQL versions:

```typescript
// In your components, update imports:
import { UserGraphQLService } from '../services/user-graphql.service';
import { TransactionGraphQLService } from '../services/transaction-graphql.service';

// Update constructor injections:
constructor(
  private userService: UserGraphQLService,
  private transactionService: TransactionGraphQLService
) {}
```

### **Step 3: Update Component Logic**

Update your components to use the new async methods:

```typescript
// Before (mock data)
ngOnInit() {
  this.users = this.userService.getUsers();
}

// After (GraphQL)
async ngOnInit() {
  try {
    this.users = await this.userService.getUsers();
  } catch (error) {
    console.error('Error loading users:', error);
  }
}
```

## 🧪 Testing Your Backend

### **Step 1: Test GraphQL API**

```bash
# Open GraphQL playground
amplify console api
# Click on "View in AppSync console"
# Use the Queries tab to test
```

**Sample Test Queries:**

```graphql
# Create a user
mutation CreateUser {
  createUser(input: {
    email: "test@example.com"
    username: "testuser"
    firstName: "Test"
    lastName: "User"
    bankHours: 10
    skills: ["JavaScript", "React"]
    rating: 0
    totalTransactions: 0
  }) {
    id
    email
    username
    bankHours
  }
}

# List all users
query ListUsers {
  listUsers {
    items {
      id
      username
      firstName
      lastName
      bankHours
      skills
    }
  }
}

# Create a service
mutation CreateService {
  createService(input: {
    userId: "USER_ID_HERE"
    title: "Web Development"
    description: "I can help with React and Angular development"
    category: "Programming"
    hourlyRate: 2
    isActive: true
    tags: ["React", "Angular", "JavaScript"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

### **Step 2: Test File Upload**

```typescript
// Test profile picture upload
async testFileUpload() {
  const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const storageService = new StorageService();
  
  try {
    const key = await storageService.uploadProfilePicture(file, 'user123');
    const url = await storageService.getProfilePictureUrl(key);
    console.log('Upload successful:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### **Step 3: Test Real-time Subscriptions**

```typescript
// Test transaction updates subscription
ngOnInit() {
  this.transactionService.subscribeToTransactionUpdates('user123')
    .subscribe(transaction => {
      console.log('Transaction updated:', transaction);
    });
}
```

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. Schema Validation Errors**
```bash
# Check schema syntax
amplify api gql-compile

# Fix common issues:
# - Missing required fields
# - Invalid relationship definitions
# - Incorrect auth rules
```

#### **2. Permission Errors**
```bash
# Check IAM roles
amplify console auth

# Common fixes:
# - Verify user pool configuration
# - Check auth rules in schema
# - Ensure proper user authentication
```

#### **3. Build Errors**
```bash
# Regenerate GraphQL code
amplify codegen

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Debug Commands:**

```bash
# Check Amplify logs
amplify console

# View CloudWatch logs
aws logs describe-log-groups --region us-east-1

# Test GraphQL endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"query { listUsers { items { id username } } }"}' \
  YOUR_GRAPHQL_ENDPOINT
```

## 📱 Frontend Integration

### **Update Components:**

#### **Dashboard Component:**
```typescript
async ngOnInit() {
  try {
    // Load user data
    this.currentUser = await this.userService.getUserById(this.userId);
    
    // Load services
    this.services = await this.userService.getServices();
    
    // Load transactions
    this.transactions = await this.transactionService.getTransactionsByUser(this.userId);
    
    // Subscribe to real-time updates
    this.subscribeToUpdates();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

private subscribeToUpdates() {
  // Subscribe to transaction updates
  this.transactionService.subscribeToTransactionUpdates(this.userId)
    .subscribe(transaction => {
      this.handleTransactionUpdate(transaction);
    });
}
```

#### **Profile Component:**
```typescript
async saveProfile() {
  try {
    // Upload profile picture if changed
    if (this.profilePictureFile) {
      const key = await this.storageService.uploadProfilePicture(
        this.profilePictureFile, 
        this.currentUser.id
      );
      this.currentUser.profilePicture = key;
    }
    
    // Update user profile
    await this.userService.updateUser(this.currentUser.id, this.currentUser);
    
    this.showSuccess('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    this.showError('Failed to update profile');
  }
}
```

## 🔐 Security Best Practices

### **Authentication Rules:**
- ✅ Users can only modify their own data
- ✅ Public read access for services and user profiles
- ✅ Private access for transactions and messages
- ✅ Admin-only access for categories and system data

### **Data Validation:**
- ✅ Input validation on all mutations
- ✅ Business logic validation in Lambda functions
- ✅ Rate limiting on API calls
- ✅ File upload restrictions

## 📊 Monitoring & Analytics

### **CloudWatch Metrics:**
- API request counts and latency
- DynamoDB read/write capacity
- Lambda function invocations
- S3 storage usage

### **Custom Metrics:**
```typescript
// Track user engagement
await this.analyticsService.record('user_login', {
  userId: user.id,
  timestamp: new Date().toISOString()
});

// Track service requests
await this.analyticsService.record('service_requested', {
  serviceId: service.id,
  category: service.category
});
```

## 🚀 Production Deployment

### **Environment Setup:**
```bash
# Create production environment
amplify env add prod

# Deploy to production
amplify push --env prod
```

### **Domain Configuration:**
```bash
# Add custom domain
amplify add hosting

# Configure SSL certificate
# Set up CloudFront distribution
```

## 🎯 Next Steps

1. **✅ Deploy the backend** using the setup script
2. **✅ Test all GraphQL operations** in AppSync console
3. **✅ Update your frontend components** to use GraphQL services
4. **✅ Test file upload functionality**
5. **✅ Implement real-time features** with subscriptions
6. **✅ Add error handling and loading states**
7. **✅ Set up monitoring and analytics**
8. **✅ Deploy to production environment**

## 🎉 Congratulations!

Your HourBank application now has a complete, production-ready backend with:

- ✅ **Scalable Database** - DynamoDB with GraphQL
- ✅ **File Storage** - S3 with secure access
- ✅ **Real-time Updates** - GraphQL subscriptions
- ✅ **Authentication** - AWS Cognito integration
- ✅ **Business Logic** - Lambda functions
- ✅ **Security** - Proper auth rules and validation

Your skill exchange platform is ready to handle real users and transactions! 🚀
