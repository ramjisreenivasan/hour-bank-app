# Test Data Mutations for User: 64083428-a041-702c-2e7e-7e4b2c4ba1f4

## 🛠️ Services to Create

### Service 1: Full-Stack Web Development
```graphql
mutation CreateService1 {
  createService(input: {
    userId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    title: "Full-Stack Web Development"
    description: "Professional web development using React, Node.js, and AWS. I can help build modern, scalable web applications from scratch or improve existing ones."
    category: "Technology"
    hourlyRate: 75
    isActive: true
    tags: ["react", "nodejs", "aws", "javascript", "typescript", "fullstack"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

### Service 2: UI/UX Design Consultation
```graphql
mutation CreateService2 {
  createService(input: {
    userId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    title: "UI/UX Design Consultation"
    description: "User interface and experience design services. I help create intuitive, beautiful designs that users love."
    category: "Design"
    hourlyRate: 60
    isActive: true
    tags: ["ui", "ux", "design", "figma", "prototyping", "user-research"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

### Service 3: Technical Writing & Documentation
```graphql
mutation CreateService3 {
  createService(input: {
    userId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    title: "Technical Writing & Documentation"
    description: "Clear, comprehensive technical documentation for software projects, APIs, and user guides."
    category: "Writing"
    hourlyRate: 45
    isActive: true
    tags: ["technical-writing", "documentation", "api-docs", "user-guides"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

### Service 4: Code Review & Mentoring
```graphql
mutation CreateService4 {
  createService(input: {
    userId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    title: "Code Review & Mentoring"
    description: "Professional code review services and mentoring for junior developers. Help improve code quality and best practices."
    category: "Education"
    hourlyRate: 50
    isActive: true
    tags: ["code-review", "mentoring", "best-practices", "clean-code"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

### Service 5: AWS Cloud Architecture
```graphql
mutation CreateService5 {
  createService(input: {
    userId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    title: "AWS Cloud Architecture"
    description: "Design and implement scalable cloud solutions on AWS. Help with serverless architecture, microservices, and DevOps."
    category: "Technology"
    hourlyRate: 85
    isActive: true
    tags: ["aws", "cloud", "serverless", "devops", "architecture"]
  }) {
    id
    title
    category
    hourlyRate
  }
}
```

## 👤 Test Consumer User

```graphql
mutation CreateTestConsumer {
  createUser(input: {
    email: "testconsumer@hourbank.com"
    username: "test_consumer_001"
    firstName: "Sarah"
    lastName: "Johnson"
    bankHours: 100
    skills: ["project-management", "testing", "feedback"]
    bio: "Experienced project manager who loves trying new services and providing detailed feedback."
  }) {
    id
    username
    firstName
    lastName
    bankHours
  }
}
```

## 💼 Transactions to Create

**⚠️ Replace `CONSUMER_ID` and `SERVICE_X_ID` with actual IDs from above mutations**

### Transaction 1: Completed Web Development (Service 1)
```graphql
mutation CreateTransaction1 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "CONSUMER_ID"
    serviceId: "SERVICE_1_ID"
    hoursSpent: 8
    status: COMPLETED
    description: "Built a complete e-commerce website with React and Node.js backend"
    rating: 5
    feedback: "Excellent work! Very professional and delivered exactly what was promised. Great communication throughout the project."
  }) {
    id
    description
    status
    rating
    feedback
  }
}
```

### Transaction 2: Completed UI/UX Design (Service 2)
```graphql
mutation CreateTransaction2 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "CONSUMER_ID"
    serviceId: "SERVICE_2_ID"
    hoursSpent: 4
    status: COMPLETED
    description: "Redesigned mobile app interface for better user experience"
    rating: 4.8
    feedback: "Amazing design skills! The new interface is so much more intuitive. Users love it!"
  }) {
    id
    description
    status
    rating
    feedback
  }
}
```

### Transaction 3: In Progress Documentation (Service 3)
```graphql
mutation CreateTransaction3 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "CONSUMER_ID"
    serviceId: "SERVICE_3_ID"
    hoursSpent: 3
    status: IN_PROGRESS
    description: "Creating comprehensive API documentation for REST endpoints"
  }) {
    id
    description
    status
  }
}
```

### Transaction 4: Completed Code Review (Service 4)
```graphql
mutation CreateTransaction4 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "CONSUMER_ID"
    serviceId: "SERVICE_4_ID"
    hoursSpent: 2
    status: COMPLETED
    description: "Code review and mentoring session for React components and best practices"
    rating: 5
    feedback: "Incredibly helpful! Learned so much about clean code practices. Will definitely book again."
  }) {
    id
    description
    status
    rating
    feedback
  }
}
```

### Transaction 5: Pending AWS Architecture (Service 5)
```graphql
mutation CreateTransaction5 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "CONSUMER_ID"
    serviceId: "SERVICE_5_ID"
    hoursSpent: 6
    status: PENDING
    description: "Design serverless architecture for data processing pipeline using AWS Lambda and DynamoDB"
  }) {
    id
    description
    status
  }
}
```

## 📋 Instructions

1. **Run Service Mutations**: Execute each service creation mutation and note the returned IDs
2. **Create Test Consumer**: Run the consumer creation mutation and note the consumer ID
3. **Replace Placeholders**: In the transaction mutations, replace:
   - `CONSUMER_ID` with the actual consumer ID
   - `SERVICE_X_ID` with the actual service IDs
4. **Run Transaction Mutations**: Execute each transaction creation mutation

## 📊 Expected Results

After running all mutations, the user `64083428-a041-702c-2e7e-7e4b2c4ba1f4` will have:

- **5 Services** across different categories (Technology, Design, Writing, Education)
- **5 Transactions** with varied statuses:
  - 3 Completed (with ratings and feedback)
  - 1 In Progress
  - 1 Pending
- **1 Test Consumer** with 100 bank hours for realistic transaction data

This creates a comprehensive test dataset that showcases all the features of your HourBank application!
