#!/usr/bin/env python3

import requests
import json
import sys
from typing import List, Dict, Any

# GraphQL endpoint and API key from aws-exports.js
GRAPHQL_ENDPOINT = "https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-7p4lacsjwbdabgmhywkvhc7wwi"

# GraphQL queries and mutations
LIST_USERS_QUERY = """
query ListUsers {
  listUsers {
    items {
      id
      email
      username
      firstName
      lastName
    }
  }
}
"""

LIST_SERVICES_QUERY = """
query ListServices {
  listServices {
    items {
      id
      userId
      title
    }
  }
}
"""

DELETE_USER_MUTATION = """
mutation DeleteUser($input: DeleteUserInput!) {
  deleteUser(input: $input) {
    id
    email
    username
  }
}
"""

DELETE_SERVICE_MUTATION = """
mutation DeleteService($input: DeleteServiceInput!) {
  deleteService(input: $input) {
    id
    title
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

def get_all_users() -> List[Dict[str, Any]]:
    """Get all users from the database"""
    try:
        result = make_graphql_request(LIST_USERS_QUERY)
        return result['data']['listUsers']['items']
    except Exception as error:
        print(f"❌ Failed to fetch users: {str(error)}")
        return []

def get_all_services() -> List[Dict[str, Any]]:
    """Get all services from the database"""
    try:
        result = make_graphql_request(LIST_SERVICES_QUERY)
        return result['data']['listServices']['items']
    except Exception as error:
        print(f"❌ Failed to fetch services: {str(error)}")
        return []

def delete_user(user_id: str) -> bool:
    """Delete a user by ID"""
    try:
        result = make_graphql_request(DELETE_USER_MUTATION, {
            'input': {'id': user_id}
        })
        return True
    except Exception as error:
        print(f"❌ Failed to delete user {user_id}: {str(error)}")
        return False

def delete_service(service_id: str) -> bool:
    """Delete a service by ID"""
    try:
        result = make_graphql_request(DELETE_SERVICE_MUTATION, {
            'input': {'id': service_id}
        })
        return True
    except Exception as error:
        print(f"❌ Failed to delete service {service_id}: {str(error)}")
        return False

def identify_test_users(users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Identify test users based on common patterns"""
    test_users = []
    
    for user in users:
        # Check for common test user patterns
        is_test_user = (
            # Generic test names
            user.get('firstName', '').lower().startswith('test') or
            user.get('lastName', '').lower().startswith('test') or
            user.get('username', '').lower().startswith('test') or
            user.get('email', '').lower().startswith('test') or
            
            # Common test patterns
            'testuser' in user.get('username', '').lower() or
            'testuser' in user.get('email', '').lower() or
            user.get('firstName') == 'TestUser' or
            user.get('lastName') == 'TestUser' or
            
            # Generic numbered users
            user.get('firstName', '').startswith('User') and user.get('firstName', '')[4:].isdigit() or
            
            # Example/demo users
            'example' in user.get('email', '').lower() or
            'demo' in user.get('email', '').lower()
        )
        
        if is_test_user:
            test_users.append(user)
    
    return test_users

def delete_test_data():
    """Delete all test user data"""
    print("🔍 Scanning for existing test data...\n")
    
    # Get all users and services
    all_users = get_all_users()
    all_services = get_all_services()
    
    if not all_users:
        print("❌ Could not fetch users. Check API connection.")
        return False
    
    print(f"📊 Found {len(all_users)} total users")
    print(f"📊 Found {len(all_services)} total services")
    
    # Identify test users
    test_users = identify_test_users(all_users)
    
    if not test_users:
        print("✅ No test users found to delete!")
        return True
    
    print(f"\n🎯 Identified {len(test_users)} test users to delete:")
    for i, user in enumerate(test_users, 1):
        print(f"{i}. {user.get('firstName', 'N/A')} {user.get('lastName', 'N/A')} (@{user.get('username', 'N/A')})")
        print(f"   Email: {user.get('email', 'N/A')}")
    
    # Confirm deletion
    print(f"\n⚠️  This will delete {len(test_users)} test users and their associated services.")
    confirm = input("Do you want to proceed? (y/N): ").strip().lower()
    
    if confirm != 'y' and confirm != 'yes':
        print("❌ Deletion cancelled by user")
        return False
    
    # Delete services first (to avoid foreign key constraints)
    print(f"\n🗑️  Deleting services for test users...")
    test_user_ids = {user['id'] for user in test_users}
    services_to_delete = [s for s in all_services if s.get('userId') in test_user_ids]
    
    deleted_services = 0
    for service in services_to_delete:
        if delete_service(service['id']):
            deleted_services += 1
            print(f"  ✅ Deleted service: {service.get('title', 'Unknown')}")
        else:
            print(f"  ❌ Failed to delete service: {service.get('title', 'Unknown')}")
    
    # Delete users
    print(f"\n🗑️  Deleting test users...")
    deleted_users = 0
    for user in test_users:
        if delete_user(user['id']):
            deleted_users += 1
            print(f"  ✅ Deleted user: {user.get('firstName', 'N/A')} {user.get('lastName', 'N/A')}")
        else:
            print(f"  ❌ Failed to delete user: {user.get('firstName', 'N/A')} {user.get('lastName', 'N/A')}")
    
    # Summary
    print(f"\n📊 DELETION SUMMARY")
    print("=" * 30)
    print(f"Services deleted: {deleted_services}/{len(services_to_delete)}")
    print(f"Users deleted: {deleted_users}/{len(test_users)}")
    
    if deleted_users == len(test_users):
        print("✅ All test data deleted successfully!")
        return True
    else:
        print("⚠️  Some deletions failed. Check the errors above.")
        return False

def test_api_connection() -> bool:
    """Test the API connection"""
    try:
        print("🔧 Testing API connection...")
        result = make_graphql_request("query { __typename }")
        print("✅ API connection successful")
        return True
    except Exception as error:
        print(f"❌ API connection failed: {str(error)}")
        print("💡 Make sure your API is deployed and accessible")
        return False

def main():
    """Main execution function"""
    try:
        print("🧹 Test Data Cleanup Tool")
        print("=" * 30)
        
        # Test API connection
        if not test_api_connection():
            sys.exit(1)
        
        # Delete test data
        success = delete_test_data()
        
        if success:
            print("\n🎉 Test data cleanup completed successfully!")
        else:
            print("\n❌ Test data cleanup completed with errors.")
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n❌ Process interrupted by user")
        sys.exit(1)
    except Exception as error:
        print(f"❌ Script execution failed: {str(error)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
