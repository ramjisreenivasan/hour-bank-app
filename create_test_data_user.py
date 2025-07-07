#!/usr/bin/env python3

import json
import boto3
import uuid
import time
from datetime import datetime, timezone

# Configuration
TARGET_USER_ID = '64083428-a041-702c-2e7e-7e4b2c4ba1f4'
REGION = 'us-east-1'  # Update with your AWS region

# Test services data
TEST_SERVICES = [
    {
        'title': 'Full-Stack Web Development',
        'description': 'Professional web development using React, Node.js, and AWS. I can help build modern, scalable web applications from scratch or improve existing ones.',
        'category': 'Technology',
        'hourlyRate': 75.0,
        'tags': ['react', 'nodejs', 'aws', 'javascript', 'typescript', 'fullstack']
    },
    {
        'title': 'UI/UX Design Consultation',
        'description': 'User interface and experience design services. I help create intuitive, beautiful designs that users love.',
        'category': 'Design',
        'hourlyRate': 60.0,
        'tags': ['ui', 'ux', 'design', 'figma', 'prototyping', 'user-research']
    },
    {
        'title': 'Technical Writing & Documentation',
        'description': 'Clear, comprehensive technical documentation for software projects, APIs, and user guides.',
        'category': 'Writing',
        'hourlyRate': 45.0,
        'tags': ['technical-writing', 'documentation', 'api-docs', 'user-guides']
    },
    {
        'title': 'Code Review & Mentoring',
        'description': 'Professional code review services and mentoring for junior developers. Help improve code quality and best practices.',
        'category': 'Education',
        'hourlyRate': 50.0,
        'tags': ['code-review', 'mentoring', 'best-practices', 'clean-code']
    },
    {
        'title': 'AWS Cloud Architecture',
        'description': 'Design and implement scalable cloud solutions on AWS. Help with serverless architecture, microservices, and DevOps.',
        'category': 'Technology',
        'hourlyRate': 85.0,
        'tags': ['aws', 'cloud', 'serverless', 'devops', 'architecture']
    }
]

def get_appsync_client():
    """Get AppSync GraphQL client"""
    try:
        # Read AWS exports to get AppSync endpoint
        with open('src/aws-exports.js', 'r') as f:
            content = f.read()
            # Extract GraphQL endpoint (basic parsing)
            for line in content.split('\n'):
                if 'aws_appsync_graphqlEndpoint' in line:
                    endpoint = line.split('"')[1]
                    break
            else:
                raise ValueError("Could not find GraphQL endpoint in aws-exports.js")
        
        session = boto3.Session()
        client = session.client('appsync', region_name=REGION)
        return client, endpoint
    except Exception as e:
        print(f"❌ Error setting up AppSync client: {e}")
        return None, None

def execute_graphql_query(client, endpoint, query, variables=None):
    """Execute a GraphQL query using AppSync"""
    try:
        # This is a simplified approach - in production you'd use proper authentication
        print("⚠️  Note: This script requires proper AWS authentication setup")
        print("   You may need to use the AWS CLI or Amplify CLI instead")
        return None
    except Exception as e:
        print(f"❌ Error executing GraphQL query: {e}")
        return None

def create_service_via_cli(service_data):
    """Create service using AWS CLI (alternative approach)"""
    import subprocess
    
    # Create a temporary GraphQL query file
    query = """
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
    """
    
    variables = {
        "input": {
            "userId": TARGET_USER_ID,
            "title": service_data['title'],
            "description": service_data['description'],
            "category": service_data['category'],
            "hourlyRate": service_data['hourlyRate'],
            "isActive": True,
            "tags": service_data['tags']
        }
    }
    
    print(f"📝 Service to create: {service_data['title']}")
    print(f"   Variables: {json.dumps(variables, indent=2)}")
    return service_data['title']  # Return title as placeholder

def create_transaction_via_cli(service_id, consumer_id, transaction_data):
    """Create transaction using AWS CLI (alternative approach)"""
    query = """
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
        createdAt
        updatedAt
      }
    }
    """
    
    variables = {
        "input": {
            "providerId": TARGET_USER_ID,
            "consumerId": consumer_id,
            "serviceId": service_id,
            "hoursSpent": transaction_data['hoursSpent'],
            "status": transaction_data['status'],
            "description": transaction_data['description']
        }
    }
    
    if transaction_data.get('rating'):
        variables["input"]["rating"] = transaction_data['rating']
    if transaction_data.get('feedback'):
        variables["input"]["feedback"] = transaction_data['feedback']
    
    print(f"💼 Transaction to create: {transaction_data['description']}")
    print(f"   Variables: {json.dumps(variables, indent=2)}")
    return transaction_data['description']  # Return description as placeholder

def generate_amplify_commands():
    """Generate Amplify CLI commands for creating test data"""
    print("🚀 AMPLIFY CLI COMMANDS TO CREATE TEST DATA")
    print("=" * 60)
    print(f"Target User ID: {TARGET_USER_ID}")
    print()
    
    print("1️⃣ CREATE SERVICES:")
    print("-" * 30)
    
    service_ids = []
    for i, service in enumerate(TEST_SERVICES):
        service_id = f"service-{i+1}-{uuid.uuid4().hex[:8]}"
        service_ids.append(service_id)
        
        print(f"\n# Service {i+1}: {service['title']}")
        print("amplify api graphql << 'EOF'")
        print("mutation CreateService {")
        print("  createService(input: {")
        print(f'    userId: "{TARGET_USER_ID}"')
        print(f'    title: "{service["title"]}"')
        print(f'    description: "{service["description"]}"')
        print(f'    category: "{service["category"]}"')
        print(f'    hourlyRate: {service["hourlyRate"]}')
        print('    isActive: true')
        print(f'    tags: {json.dumps(service["tags"])}')
        print("  }) {")
        print("    id")
        print("    title")
        print("  }")
        print("}")
        print("EOF")
    
    print("\n\n2️⃣ CREATE TEST CONSUMER (if needed):")
    print("-" * 40)
    consumer_id = f"consumer-{uuid.uuid4().hex[:8]}"
    print("amplify api graphql << 'EOF'")
    print("mutation CreateUser {")
    print("  createUser(input: {")
    print('    email: "testconsumer@example.com"')
    print('    username: "test_consumer"')
    print('    firstName: "Test"')
    print('    lastName: "Consumer"')
    print('    bankHours: 50')
    print('    skills: ["testing", "feedback"]')
    print('    bio: "Test user for consuming services"')
    print("  }) {")
    print("    id")
    print("    username")
    print("  }")
    print("}")
    print("EOF")
    
    print("\n\n3️⃣ CREATE TRANSACTIONS:")
    print("-" * 30)
    
    test_transactions = [
        {
            'service_index': 0,
            'hoursSpent': 8.0,
            'status': 'COMPLETED',
            'description': 'Built a complete e-commerce website with React and Node.js',
            'rating': 5.0,
            'feedback': 'Excellent work! Very professional and delivered on time.'
        },
        {
            'service_index': 1,
            'hoursSpent': 4.0,
            'status': 'COMPLETED',
            'description': 'Redesigned mobile app interface for better user experience',
            'rating': 4.8,
            'feedback': 'Great design skills and attention to detail.'
        },
        {
            'service_index': 2,
            'hoursSpent': 3.0,
            'status': 'IN_PROGRESS',
            'description': 'Creating API documentation for REST endpoints'
        },
        {
            'service_index': 3,
            'hoursSpent': 2.0,
            'status': 'COMPLETED',
            'description': 'Code review and mentoring session for React components',
            'rating': 5.0,
            'feedback': 'Very helpful feedback and great teaching approach.'
        },
        {
            'service_index': 4,
            'hoursSpent': 6.0,
            'status': 'PENDING',
            'description': 'Design serverless architecture for data processing pipeline'
        }
    ]
    
    for i, transaction in enumerate(test_transactions):
        service_title = TEST_SERVICES[transaction['service_index']]['title']
        print(f"\n# Transaction {i+1}: {service_title}")
        print("amplify api graphql << 'EOF'")
        print("mutation CreateTransaction {")
        print("  createTransaction(input: {")
        print(f'    providerId: "{TARGET_USER_ID}"')
        print(f'    consumerId: "REPLACE_WITH_CONSUMER_ID"')
        print(f'    serviceId: "REPLACE_WITH_SERVICE_{transaction["service_index"]+1}_ID"')
        print(f'    hoursSpent: {transaction["hoursSpent"]}')
        print(f'    status: {transaction["status"]}')
        print(f'    description: "{transaction["description"]}"')
        if transaction.get('rating'):
            print(f'    rating: {transaction["rating"]}')
        if transaction.get('feedback'):
            print(f'    feedback: "{transaction["feedback"]}"')
        print("  }) {")
        print("    id")
        print("    description")
        print("    status")
        print("  }")
        print("}")
        print("EOF")
    
    print("\n\n📋 INSTRUCTIONS:")
    print("-" * 20)
    print("1. Run the service creation commands first")
    print("2. Note down the service IDs returned")
    print("3. Create the test consumer and note the consumer ID")
    print("4. Replace the placeholders in transaction commands with actual IDs")
    print("5. Run the transaction creation commands")
    print("\n✅ This will create comprehensive test data for your user!")

def main():
    print(f"🚀 Creating test data for user: {TARGET_USER_ID}")
    print("=" * 60)
    
    # Generate CLI commands instead of trying to execute directly
    generate_amplify_commands()
    
    print(f"\n📊 SUMMARY:")
    print(f"👤 Target User ID: {TARGET_USER_ID}")
    print(f"🛠️  Services to create: {len(TEST_SERVICES)}")
    print(f"💼 Transactions to create: 5")
    print(f"👥 Test consumer: Will be created")

if __name__ == "__main__":
    main()
