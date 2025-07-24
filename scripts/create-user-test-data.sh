#!/bin/bash

# Test data creation script for user: 64083428-a041-702c-2e7e-7e4b2c4ba1f4
# This script provides the GraphQL mutations you can run manually or through Amplify CLI

TARGET_USER_ID="64083428-a041-702c-2e7e-7e4b2c4ba1f4"

echo "🚀 Creating test data for user: $TARGET_USER_ID"
echo "=================================================="
echo ""

echo "📝 STEP 1: CREATE SERVICES"
echo "-------------------------"
echo ""

echo "Service 1: Full-Stack Web Development"
echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "Service 2: UI/UX Design Consultation"
echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "Service 3: Technical Writing & Documentation"
echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "Service 4: Code Review & Mentoring"
echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "Service 5: AWS Cloud Architecture"
echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "👤 STEP 2: CREATE TEST CONSUMER (if needed)"
echo "-------------------------------------------"
echo ""

echo "amplify api graphql"
cat << 'EOF'
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
EOF
echo ""

echo "💼 STEP 3: CREATE TRANSACTIONS"
echo "------------------------------"
echo "⚠️  Replace SERVICE_ID_X and CONSUMER_ID with actual IDs from steps 1 and 2"
echo ""

echo "Transaction 1: Completed Web Development Project"
echo "amplify api graphql"
cat << 'EOF'
mutation CreateTransaction1 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "REPLACE_WITH_CONSUMER_ID"
    serviceId: "REPLACE_WITH_SERVICE_1_ID"
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
EOF
echo ""

echo "Transaction 2: Completed UI/UX Design"
echo "amplify api graphql"
cat << 'EOF'
mutation CreateTransaction2 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "REPLACE_WITH_CONSUMER_ID"
    serviceId: "REPLACE_WITH_SERVICE_2_ID"
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
EOF
echo ""

echo "Transaction 3: In Progress Documentation"
echo "amplify api graphql"
cat << 'EOF'
mutation CreateTransaction3 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "REPLACE_WITH_CONSUMER_ID"
    serviceId: "REPLACE_WITH_SERVICE_3_ID"
    hoursSpent: 3
    status: IN_PROGRESS
    description: "Creating comprehensive API documentation for REST endpoints"
  }) {
    id
    description
    status
  }
}
EOF
echo ""

echo "Transaction 4: Completed Code Review"
echo "amplify api graphql"
cat << 'EOF'
mutation CreateTransaction4 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "REPLACE_WITH_CONSUMER_ID"
    serviceId: "REPLACE_WITH_SERVICE_4_ID"
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
EOF
echo ""

echo "Transaction 5: Pending AWS Architecture"
echo "amplify api graphql"
cat << 'EOF'
mutation CreateTransaction5 {
  createTransaction(input: {
    providerId: "64083428-a041-702c-2e7e-7e4b2c4ba1f4"
    consumerId: "REPLACE_WITH_CONSUMER_ID"
    serviceId: "REPLACE_WITH_SERVICE_5_ID"
    hoursSpent: 6
    status: PENDING
    description: "Design serverless architecture for data processing pipeline using AWS Lambda and DynamoDB"
  }) {
    id
    description
    status
  }
}
EOF
echo ""

echo "📋 INSTRUCTIONS:"
echo "=================="
echo "1. Run each service creation mutation and note the returned IDs"
echo "2. Create the test consumer and note the consumer ID"
echo "3. Replace placeholders in transaction mutations with actual IDs"
echo "4. Run the transaction creation mutations"
echo ""
echo "📊 SUMMARY:"
echo "- Target User: $TARGET_USER_ID"
echo "- Services to create: 5 (Technology, Design, Writing, Education)"
echo "- Transactions to create: 5 (3 completed, 1 in-progress, 1 pending)"
echo "- Test consumer: 1 user with 100 bank hours"
echo ""
echo "✅ This will create a comprehensive test dataset for your user!"
echo "🎯 The user will have a good mix of services and transaction history"
