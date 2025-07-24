#!/usr/bin/env python3

import requests
import json
import sys
import time
from typing import List, Dict, Any

# GraphQL endpoint and API key from aws-exports.js
GRAPHQL_ENDPOINT = "https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-7p4lacsjwbdabgmhywkvhc7wwi"

# GraphQL queries and mutations
LIST_SERVICES_QUERY = """
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
"""

UPDATE_SERVICE_MUTATION = """
mutation UpdateService($input: UpdateServiceInput!) {
  updateService(input: $input) {
    id
    title
    hourlyRate
    updatedAt
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

def get_all_services() -> List[Dict[str, Any]]:
    """Get all services from the database"""
    try:
        result = make_graphql_request(LIST_SERVICES_QUERY)
        return result['data']['listServices']['items']
    except Exception as error:
        print(f"❌ Failed to fetch services: {str(error)}")
        return []

def update_service_rate(service: Dict[str, Any], new_rate: float = 1.0) -> bool:
    """Update a service's hourly rate"""
    try:
        update_input = {
            'id': service['id'],
            'hourlyRate': new_rate
        }
        
        result = make_graphql_request(UPDATE_SERVICE_MUTATION, {'input': update_input})
        updated_service = result['data']['updateService']
        
        print(f"  ✅ Updated: {service['title']} (${service['hourlyRate']:.2f} → ${updated_service['hourlyRate']:.2f})")
        return True
        
    except Exception as error:
        print(f"  ❌ Failed to update {service['title']}: {str(error)}")
        return False

def update_all_service_rates(target_rate: float = 1.0):
    """Update all service hourly rates to the target rate"""
    print(f"🔄 Updating all service hourly rates to ${target_rate:.2f}...\n")
    
    # Get all services
    services = get_all_services()
    
    if not services:
        print("❌ Could not fetch services. Check API connection.")
        return False
    
    print(f"📊 Found {len(services)} services to update")
    
    # Filter services that need updating
    services_to_update = [s for s in services if s['hourlyRate'] != target_rate]
    
    if not services_to_update:
        print(f"✅ All services already have hourly rate of ${target_rate:.2f}!")
        return True
    
    print(f"🎯 {len(services_to_update)} services need rate updates\n")
    
    # Show current rates
    print("📋 Current Service Rates:")
    print("-" * 50)
    for service in services:
        status = "✅" if service['hourlyRate'] == target_rate else "🔄"
        print(f"{status} {service['title']}: ${service['hourlyRate']:.2f}")
    
    print(f"\n⚠️  This will update {len(services_to_update)} services to ${target_rate:.2f}/hour")
    confirm = input("Do you want to proceed? (y/N): ").strip().lower()
    
    if confirm != 'y' and confirm != 'yes':
        print("❌ Update cancelled by user")
        return False
    
    # Update services
    print(f"\n🔄 Updating service rates...")
    updated_count = 0
    failed_count = 0
    
    for i, service in enumerate(services_to_update, 1):
        print(f"\n[{i}/{len(services_to_update)}] Updating: {service['title']}")
        
        if update_service_rate(service, target_rate):
            updated_count += 1
        else:
            failed_count += 1
        
        # Add delay to avoid rate limiting
        if i < len(services_to_update):
            time.sleep(0.5)
    
    # Summary
    print(f"\n📊 UPDATE SUMMARY")
    print("=" * 30)
    print(f"Services processed: {len(services_to_update)}")
    print(f"Successfully updated: {updated_count}")
    print(f"Failed updates: {failed_count}")
    
    if updated_count == len(services_to_update):
        print(f"✅ All services now have hourly rate of ${target_rate:.2f}!")
        return True
    else:
        print("⚠️  Some updates failed. Check the errors above.")
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
        # Get target rate from command line argument
        target_rate = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
        
        if target_rate < 0:
            print("❌ Hourly rate cannot be negative")
            sys.exit(1)
        
        print("💰 Service Rate Updater")
        print("=" * 30)
        print(f"Target hourly rate: ${target_rate:.2f}")
        print()
        
        # Test API connection
        if not test_api_connection():
            sys.exit(1)
        
        # Update service rates
        success = update_all_service_rates(target_rate)
        
        if success:
            print(f"\n🎉 All service rates updated to ${target_rate:.2f} successfully!")
        else:
            print(f"\n❌ Service rate update completed with errors.")
            sys.exit(1)
        
    except ValueError:
        print("❌ Please provide a valid number for the hourly rate")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Process interrupted by user")
        sys.exit(1)
    except Exception as error:
        print(f"❌ Script execution failed: {str(error)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
