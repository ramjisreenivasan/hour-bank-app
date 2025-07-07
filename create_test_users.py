#!/usr/bin/env python3

import requests
import json
import random
import uuid
import time
import sys
from typing import List, Dict, Any

# GraphQL endpoint and API key from aws-exports.js
GRAPHQL_ENDPOINT = "https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-7p4lacsjwbdabgmhywkvhc7wwi"

# Sample skills for random selection
AVAILABLE_SKILLS = [
    'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
    'Digital Marketing', 'Content Writing', 'Photography', 'Video Editing',
    'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps',
    'Project Management', 'Business Consulting', 'Financial Planning', 'Legal Advice',
    'Language Translation', 'Tutoring', 'Music Lessons', 'Fitness Training',
    'Cooking', 'Home Repair', 'Gardening', 'Pet Care',
    'Event Planning', 'Social Media Management', 'SEO Optimization', 'Copywriting',
    'Accounting', 'Tax Preparation', 'Real Estate', 'Interior Design',
    'Fashion Styling', 'Makeup Artistry', 'Hair Styling', 'Massage Therapy',
    'Life Coaching', 'Career Counseling', 'Mental Health Support', 'Nutrition Consulting'
]

# GraphQL mutations
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

# Simple test query
TEST_QUERY = """
query {
  __schema {
    queryType {
      name
    }
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

def get_random_skills(count: int = 3) -> List[str]:
    """Get random skills from the available list"""
    return random.sample(AVAILABLE_SKILLS, min(count, len(AVAILABLE_SKILLS)))

def generate_user_data(index: int) -> Dict[str, Any]:
    """Generate random user data"""
    skills = get_random_skills(random.randint(2, 5))
    first_name = f"TestUser{index}"
    last_name = f"Ramji{index}"
    user_id = str(uuid.uuid4())
    
    return {
        'id': user_id,
        'email': f"ramjisreenivasan+{random.randint(1000, 9999)}@gmail.com",
        'username': f"testuser{index}_{random.randint(100, 999)}",
        'firstName': first_name,
        'lastName': last_name,
        'skills': skills,
        'bio': f"I'm {first_name}, offering services in {' and '.join(skills[:2])}. Looking forward to helping others while earning bank hours!",
        'bankHours': float(random.randint(0, 50)),
        'rating': round(random.uniform(3.0, 5.0), 1),
        'totalTransactions': random.randint(0, 20)
    }

def generate_service_data(user_id: str, user_skills: List[str], user_name: str) -> Dict[str, Any]:
    """Generate service data for a user"""
    skill = random.choice(user_skills)
    categories = ['Technology', 'Design', 'Business', 'Education', 'Health', 'Lifestyle']
    
    return {
        'userId': user_id,
        'title': f"Professional {skill} Services",
        'description': f"Hi! I'm {user_name} and I offer high-quality {skill.lower()} services. With years of experience, I can help you achieve your goals efficiently and professionally.",
        'category': random.choice(categories),
        'hourlyRate': round(random.uniform(10.0, 50.0), 2),
        'isActive': True,
        'tags': [skill.lower().replace(' ', '-'), 'professional', 'experienced']
    }

def create_test_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a test user with services"""
    try:
        print(f"\n🔄 Creating user: {user_data['email']}")
        
        # Create user record
        print("  📊 Creating user record...")
        user_result = make_graphql_request(CREATE_USER_MUTATION, {'input': user_data})
        created_user = user_result['data']['createUser']
        print(f"  ✅ User record created with ID: {created_user['id']}")
        
        # Create services
        print("  🛠️  Creating services...")
        services = []
        services_to_create = min(len(user_data['skills']), 2)
        
        for i in range(services_to_create):
            service_data = generate_service_data(
                user_data['id'],
                [user_data['skills'][i]],
                user_data['firstName']
            )
            
            try:
                service_result = make_graphql_request(CREATE_SERVICE_MUTATION, {'input': service_data})
                created_service = service_result['data']['createService']
                services.append(created_service)
                print(f"    ✅ Service created: {service_data['title']}")
            except Exception as service_error:
                print(f"    ❌ Service creation failed: {str(service_error)}")
        
        return {
            'success': True,
            'user': created_user,
            'services': services,
            'user_id': user_data['id']
        }
        
    except Exception as error:
        print(f"  ❌ Failed to create user {user_data['email']}: {str(error)}")
        return {
            'success': False,
            'error': str(error),
            'user_data': user_data
        }

def create_multiple_users(count: int = 10) -> Dict[str, Any]:
    """Create multiple test users"""
    print(f"🚀 Starting creation of {count} test users...\n")
    
    results = {
        'successful': [],
        'failed': [],
        'total': count
    }
    
    for i in range(1, count + 1):
        user_data = generate_user_data(i)
        result = create_test_user(user_data)
        
        if result['success']:
            results['successful'].append(result)
            print(f"✅ User {i}/{count} created successfully")
        else:
            results['failed'].append(result)
            print(f"❌ User {i}/{count} failed")
        
        # Add delay to avoid rate limiting
        if i < count:
            print("⏳ Waiting 1 second...")
            time.sleep(1)
    
    # Summary
    print("\n📊 CREATION SUMMARY")
    print("==================")
    print(f"Total users attempted: {results['total']}")
    print(f"Successfully created: {len(results['successful'])}")
    print(f"Failed: {len(results['failed'])}")
    
    if results['successful']:
        print("\n✅ SUCCESSFUL USERS:")
        for i, result in enumerate(results['successful'], 1):
            user = result['user']
            print(f"{i}. {user['email']}")
            print(f"   Skills: {', '.join(user['skills'])}")
            print(f"   Services: {len(result['services'])}")
            print(f"   Bank Hours: {user['bankHours']}")
            print(f"   Rating: {user['rating']}/5.0")
            print()
    
    if results['failed']:
        print("\n❌ FAILED USERS:")
        for i, result in enumerate(results['failed'], 1):
            print(f"{i}. {result['user_data']['email']} - {result['error']}")
    
    return results

def test_api_connection():
    """Test the API connection"""
    try:
        print("🔧 Testing API connection...")
        result = make_graphql_request(TEST_QUERY)
        print("✅ API connection successful")
        return True
    except Exception as error:
        print(f"❌ API connection failed: {str(error)}")
        print("💡 Make sure your API is deployed and accessible")
        return False

def main():
    """Main execution function"""
    try:
        # Get user count from command line argument
        user_count = int(sys.argv[1]) if len(sys.argv) > 1 else 5
        
        if user_count < 1 or user_count > 50:
            print("❌ Please specify a number between 1 and 50")
            sys.exit(1)
        
        # Test API connection
        if not test_api_connection():
            sys.exit(1)
        
        # Create users
        results = create_multiple_users(user_count)
        
        print(f"\n🎉 Process completed! Created {len(results['successful'])} users successfully.")
        
        if results['successful']:
            print("\n📋 SUMMARY OF CREATED USERS:")
            print("=" * 50)
            total_services = sum(len(r['services']) for r in results['successful'])
            total_skills = sum(len(r['user']['skills']) for r in results['successful'])
            
            print(f"👥 Total Users: {len(results['successful'])}")
            print(f"🛠️  Total Services: {total_services}")
            print(f"🎯 Total Skills: {total_skills}")
            print(f"💰 Average Bank Hours: {sum(r['user']['bankHours'] for r in results['successful']) / len(results['successful']):.1f}")
            print(f"⭐ Average Rating: {sum(r['user']['rating'] for r in results['successful']) / len(results['successful']):.1f}/5.0")
        
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
