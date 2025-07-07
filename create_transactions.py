#!/usr/bin/env python3

import requests
import json
import random
import uuid
import time
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any

# GraphQL endpoint and API key from aws-exports.js
GRAPHQL_ENDPOINT = "https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-7p4lacsjwbdabgmhywkvhc7wwi"

# GraphQL queries and mutations
LIST_USERS_QUERY = """
query ListUsers($limit: Int) {
  listUsers(limit: $limit) {
    items {
      id
      email
      username
      firstName
      lastName
      bankHours
      skills
      services {
        items {
          id
          title
          category
          hourlyRate
          description
        }
      }
    }
  }
}
"""

CREATE_TRANSACTION_MUTATION = """
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
    completedAt
  }
}
"""

UPDATE_USER_MUTATION = """
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    bankHours
    totalTransactions
  }
}
"""

CREATE_USER_MUTATION = """
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
    rating
    totalTransactions
    createdAt
  }
}
"""

CREATE_SERVICE_MUTATION = """
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
  }
}
"""

def make_graphql_request(query: str, variables: Dict[str, Any] = None) -> Dict[str, Any]:
    """Make a GraphQL request to the API"""
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    
    payload = {
        'query': query,
        'variables': variables or {}
    }
    
    response = requests.post(GRAPHQL_ENDPOINT, json=payload, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"HTTP {response.status_code}: {response.text}")
    
    result = response.json()
    
    if 'errors' in result:
        raise Exception(f"GraphQL errors: {result['errors']}")
    
    return result

def create_ramji_hb2_user():
    """Create the special ramji-hb2 user with premium skills"""
    ramji_user_data = {
        'id': str(uuid.uuid4()),
        'email': 'ramjisreenivasan+hb2@gmail.com',
        'username': 'ramji-hb2',
        'firstName': 'Ramji',
        'lastName': 'Sreenivasan',
        'skills': ['Web Development', 'Cloud Computing', 'DevOps', 'Machine Learning', 'Business Consulting'],
        'bio': "I'm Ramji, the founder of HourBank! I offer premium tech consulting and development services. Let's build something amazing together!",
        'bankHours': 100.0,  # Start with good bank hours
        'rating': 4.9,
        'totalTransactions': 0
    }
    
    try:
        print("🔄 Creating ramji-hb2 user...")
        user_result = make_graphql_request(CREATE_USER_MUTATION, {'input': ramji_user_data})
        created_user = user_result['data']['createUser']
        print(f"✅ ramji-hb2 user created with ID: {created_user['id']}")
        
        # Create premium services for ramji-hb2
        services_data = [
            {
                'userId': ramji_user_data['id'],
                'title': 'Full-Stack Web Development',
                'description': 'Professional web development services using modern technologies like React, Node.js, and AWS. Perfect for startups and enterprises.',
                'category': 'Technology',
                'hourlyRate': 75.0,
                'isActive': True,
                'tags': ['web-development', 'react', 'nodejs', 'aws', 'premium']
            },
            {
                'userId': ramji_user_data['id'],
                'title': 'Cloud Architecture & DevOps',
                'description': 'Expert cloud infrastructure design and DevOps implementation. Specializing in AWS, Docker, and CI/CD pipelines.',
                'category': 'Technology',
                'hourlyRate': 85.0,
                'isActive': True,
                'tags': ['cloud', 'devops', 'aws', 'docker', 'premium']
            },
            {
                'userId': ramji_user_data['id'],
                'title': 'AI/ML Consulting',
                'description': 'Machine learning and AI consulting services. From data analysis to model deployment and optimization.',
                'category': 'Technology',
                'hourlyRate': 95.0,
                'isActive': True,
                'tags': ['machine-learning', 'ai', 'data-science', 'consulting', 'premium']
            }
        ]
        
        created_services = []
        for service_data in services_data:
            try:
                service_result = make_graphql_request(CREATE_SERVICE_MUTATION, {'input': service_data})
                created_services.append(service_result['data']['createService'])
                print(f"  ✅ Service created: {service_data['title']}")
            except Exception as e:
                print(f"  ❌ Service creation failed: {str(e)}")
        
        return {
            'user': created_user,
            'services': created_services
        }
        
    except Exception as error:
        print(f"❌ Failed to create ramji-hb2 user: {str(error)}")
        return None

def get_all_users():
    """Fetch all users from the database"""
    try:
        result = make_graphql_request(LIST_USERS_QUERY, {'limit': 100})
        users = result['data']['listUsers']['items']
        print(f"📊 Found {len(users)} users in the database")
        return users
    except Exception as error:
        print(f"❌ Failed to fetch users: {str(error)}")
        return []

def generate_transaction_data(provider, consumer, service, hours_spent):
    """Generate realistic transaction data"""
    transaction_descriptions = [
        f"Completed {service['title'].lower()} work as requested. Great collaboration!",
        f"Delivered high-quality {service['category'].lower()} services. Client was very satisfied.",
        f"Successfully provided {service['title'].lower()}. Looking forward to working together again!",
        f"Finished the {service['category'].lower()} project on time and within scope.",
        f"Excellent experience providing {service['title'].lower()} services.",
    ]
    
    # Generate completion time (1-30 days ago)
    days_ago = random.randint(1, 30)
    completed_at = datetime.now() - timedelta(days=days_ago)
    
    return {
        'id': str(uuid.uuid4()),
        'providerId': provider['id'],
        'consumerId': consumer['id'],
        'serviceId': service['id'],
        'hoursSpent': hours_spent,
        'status': 'COMPLETED',
        'description': random.choice(transaction_descriptions),
        'rating': round(random.uniform(4.0, 5.0), 1),  # High ratings for completed transactions
        'feedback': f"Great work by {provider['firstName']}! Professional and delivered exactly what was needed.",
        'completedAt': completed_at.isoformat() + 'Z'
    }

def update_user_bank_hours(user_id, new_bank_hours, new_total_transactions):
    """Update user's bank hours and transaction count"""
    try:
        update_input = {
            'id': user_id,
            'bankHours': new_bank_hours,
            'totalTransactions': new_total_transactions
        }
        
        result = make_graphql_request(UPDATE_USER_MUTATION, {'input': update_input})
        return result['data']['updateUser']
    except Exception as error:
        print(f"❌ Failed to update user {user_id}: {str(error)}")
        return None

def create_transactions(users, num_transactions=20):
    """Create realistic transactions between users"""
    print(f"🚀 Creating {num_transactions} transactions...")
    
    successful_transactions = []
    failed_transactions = []
    
    # Find ramji-hb2 user
    ramji_user = None
    for user in users:
        if user['username'] == 'ramji-hb2':
            ramji_user = user
            break
    
    if not ramji_user:
        print("❌ ramji-hb2 user not found!")
        return {'successful': [], 'failed': []}
    
    # Ensure ramji-hb2 participates in at least 30% of transactions
    ramji_transaction_count = max(1, num_transactions // 3)
    
    for i in range(num_transactions):
        try:
            # Decide if ramji-hb2 should be involved
            involve_ramji = i < ramji_transaction_count or random.random() < 0.3
            
            if involve_ramji:
                # ramji-hb2 as provider or consumer
                if random.random() < 0.6:  # 60% chance ramji is provider
                    provider = ramji_user
                    consumer = random.choice([u for u in users if u['id'] != ramji_user['id']])
                else:  # 40% chance ramji is consumer
                    consumer = ramji_user
                    provider = random.choice([u for u in users if u['id'] != ramji_user['id']])
            else:
                # Random transaction between other users
                provider = random.choice(users)
                consumer = random.choice([u for u in users if u['id'] != provider['id']])
            
            # Get provider's services
            provider_services = provider.get('services', {}).get('items', [])
            if not provider_services:
                print(f"⚠️  {provider['username']} has no services, skipping...")
                continue
            
            service = random.choice(provider_services)
            hours_spent = round(random.uniform(1.0, 8.0), 1)  # 1-8 hours
            
            # Generate transaction
            transaction_data = generate_transaction_data(provider, consumer, service, hours_spent)
            
            print(f"\n🔄 Transaction {i+1}/{num_transactions}:")
            print(f"   Provider: {provider['username']} ({provider['firstName']})")
            print(f"   Consumer: {consumer['username']} ({consumer['firstName']})")
            print(f"   Service: {service['title']}")
            print(f"   Hours: {hours_spent}")
            
            # Create transaction
            result = make_graphql_request(CREATE_TRANSACTION_MUTATION, {'input': transaction_data})
            created_transaction = result['data']['createTransaction']
            
            # Update bank hours
            # Provider gains hours, consumer loses hours
            provider_new_hours = provider['bankHours'] + hours_spent
            consumer_new_hours = max(0, consumer['bankHours'] - hours_spent)  # Don't go negative
            
            # Update provider
            update_user_bank_hours(
                provider['id'], 
                provider_new_hours, 
                provider.get('totalTransactions', 0) + 1
            )
            
            # Update consumer
            update_user_bank_hours(
                consumer['id'], 
                consumer_new_hours, 
                consumer.get('totalTransactions', 0) + 1
            )
            
            # Update local data for next iterations
            provider['bankHours'] = provider_new_hours
            provider['totalTransactions'] = provider.get('totalTransactions', 0) + 1
            consumer['bankHours'] = consumer_new_hours
            consumer['totalTransactions'] = consumer.get('totalTransactions', 0) + 1
            
            successful_transactions.append(created_transaction)
            print(f"   ✅ Transaction created successfully")
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
            
        except Exception as error:
            print(f"   ❌ Transaction {i+1} failed: {str(error)}")
            failed_transactions.append({'index': i+1, 'error': str(error)})
    
    return {
        'successful': successful_transactions,
        'failed': failed_transactions
    }

def main():
    """Main execution function"""
    try:
        num_transactions = int(sys.argv[1]) if len(sys.argv) > 1 else 15
        
        if num_transactions < 1 or num_transactions > 100:
            print("❌ Please specify a number between 1 and 100")
            sys.exit(1)
        
        print("🔧 Testing API connection...")
        make_graphql_request("query { __schema { queryType { name } } }")
        print("✅ API connection successful")
        
        # Get all users
        users = get_all_users()
        if len(users) < 2:
            print("❌ Need at least 2 users to create transactions")
            sys.exit(1)
        
        # Check if ramji-hb2 exists, create if not
        ramji_exists = any(user['username'] == 'ramji-hb2' for user in users)
        if not ramji_exists:
            print("🔄 ramji-hb2 user not found, creating...")
            ramji_result = create_ramji_hb2_user()
            if ramji_result:
                users.append(ramji_result['user'])
                print("✅ ramji-hb2 user added to user list")
            else:
                print("❌ Failed to create ramji-hb2 user")
                sys.exit(1)
        
        # Create transactions
        results = create_transactions(users, num_transactions)
        
        # Summary
        print("\n📊 TRANSACTION CREATION SUMMARY")
        print("=" * 40)
        print(f"Total attempted: {num_transactions}")
        print(f"Successfully created: {len(results['successful'])}")
        print(f"Failed: {len(results['failed'])}")
        
        if results['successful']:
            print(f"\n✅ SUCCESSFUL TRANSACTIONS:")
            ramji_transactions = 0
            for i, transaction in enumerate(results['successful'][:10], 1):  # Show first 10
                # Get user info from the original users list
                provider_user = next((u for u in users if u['id'] == transaction['providerId']), None)
                consumer_user = next((u for u in users if u['id'] == transaction['consumerId']), None)
                
                if provider_user and consumer_user:
                    provider_name = provider_user['username']
                    consumer_name = consumer_user['username']
                    hours = transaction['hoursSpent']
                    
                    if provider_name == 'ramji-hb2' or consumer_name == 'ramji-hb2':
                        ramji_transactions += 1
                        print(f"{i}. 🌟 {provider_name} → {consumer_name}: {hours}h")
                    else:
                        print(f"{i}. {provider_name} → {consumer_name}: {hours}h")
            
            if len(results['successful']) > 10:
                print(f"... and {len(results['successful']) - 10} more transactions")
            
            print(f"\n🌟 ramji-hb2 participated in {ramji_transactions} transactions")
        
        if results['failed']:
            print(f"\n❌ FAILED TRANSACTIONS:")
            for failure in results['failed'][:5]:  # Show first 5 failures
                print(f"Transaction {failure['index']}: {failure['error']}")
        
        print(f"\n🎉 Process completed! Your HourBank app now has realistic transaction data!")
        print("💡 Check the recent activity section in your UI to see the transactions.")
        
    except ValueError:
        print("❌ Please provide a valid number")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Process interrupted by user")
        sys.exit(1)
    except Exception as error:
        print(f"❌ Script execution failed: {str(error)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
