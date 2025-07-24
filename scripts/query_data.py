#!/usr/bin/env python3

import requests
import json
from datetime import datetime

# GraphQL endpoint and API key
GRAPHQL_ENDPOINT = "https://fxghyoyyabhsljplild6be6evy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-7p4lacsjwbdabgmhywkvhc7wwi"

def make_graphql_request(query, variables=None):
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

def query_users():
    """Query all users"""
    query = """
    query ListUsers {
      listUsers {
        items {
          id
          username
          firstName
          lastName
          email
          bankHours
          skills
          totalTransactions
          rating
          createdAt
        }
      }
    }
    """
    
    result = make_graphql_request(query)
    return result['data']['listUsers']['items']

def query_transactions():
    """Query all transactions"""
    query = """
    query ListTransactions {
      listTransactions {
        items {
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
    }
    """
    
    result = make_graphql_request(query)
    return result['data']['listTransactions']['items']

def query_services():
    """Query all services"""
    query = """
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
        }
      }
    }
    """
    
    result = make_graphql_request(query)
    return result['data']['listServices']['items']

def main():
    """Main function to display data summary"""
    try:
        print("🔍 HOURBANK DATA SUMMARY")
        print("=" * 50)
        
        # Query users
        users = query_users()
        print(f"\n👥 USERS ({len(users)} total):")
        print("-" * 30)
        
        ramji_user = None
        for user in users:
            if user['username'] == 'ramji-hb2':
                ramji_user = user
                print(f"🌟 {user['username']} ({user['firstName']} {user['lastName']})")
                print(f"   Email: {user['email']}")
                print(f"   Bank Hours: {user['bankHours']}")
                print(f"   Skills: {', '.join(user['skills'][:3])}{'...' if len(user['skills']) > 3 else ''}")
                print(f"   Transactions: {user['totalTransactions']}")
                print(f"   Rating: {user['rating']}/5.0")
            else:
                print(f"   {user['username']} - {user['bankHours']} hours, {user['totalTransactions']} transactions")
        
        # Query services
        services = query_services()
        print(f"\n🛠️  SERVICES ({len(services)} total):")
        print("-" * 30)
        
        ramji_services = [s for s in services if s['userId'] == ramji_user['id']] if ramji_user else []
        other_services = [s for s in services if s['userId'] != ramji_user['id']] if ramji_user else services
        
        if ramji_services:
            print("🌟 ramji-hb2's Premium Services:")
            for service in ramji_services:
                print(f"   • {service['title']} - ${service['hourlyRate']}/hr ({service['category']})")
        
        print(f"\n📊 Other Services by Category:")
        categories = {}
        for service in other_services:
            cat = service['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(service)
        
        for category, cat_services in categories.items():
            print(f"   {category}: {len(cat_services)} services")
        
        # Query transactions
        transactions = query_transactions()
        print(f"\n💰 TRANSACTIONS ({len(transactions)} total):")
        print("-" * 30)
        
        # Recent transactions (last 10)
        recent_transactions = sorted(transactions, key=lambda x: x['createdAt'], reverse=True)[:10]
        
        print("📈 Recent Activity:")
        for i, transaction in enumerate(recent_transactions, 1):
            # Find provider and consumer
            provider = next((u for u in users if u['id'] == transaction['providerId']), None)
            consumer = next((u for u in users if u['id'] == transaction['consumerId']), None)
            
            if provider and consumer:
                provider_name = provider['username']
                consumer_name = consumer['username']
                hours = transaction['hoursSpent']
                status = transaction['status']
                
                if provider_name == 'ramji-hb2' or consumer_name == 'ramji-hb2':
                    print(f"   {i}. 🌟 {provider_name} → {consumer_name}: {hours}h ({status})")
                else:
                    print(f"   {i}. {provider_name} → {consumer_name}: {hours}h ({status})")
        
        # Statistics
        total_hours_traded = sum(t['hoursSpent'] for t in transactions)
        completed_transactions = [t for t in transactions if t['status'] == 'COMPLETED']
        avg_rating = sum(t['rating'] for t in completed_transactions if t['rating']) / len(completed_transactions) if completed_transactions else 0
        
        ramji_transactions = [t for t in transactions if t['providerId'] == ramji_user['id'] or t['consumerId'] == ramji_user['id']] if ramji_user else []
        
        print(f"\n📊 STATISTICS:")
        print("-" * 30)
        print(f"Total Hours Traded: {total_hours_traded:.1f} hours")
        print(f"Completed Transactions: {len(completed_transactions)}")
        print(f"Average Rating: {avg_rating:.1f}/5.0")
        print(f"ramji-hb2 Participation: {len(ramji_transactions)} transactions")
        
        # Bank hours distribution
        total_bank_hours = sum(u['bankHours'] for u in users)
        print(f"Total Bank Hours in System: {total_bank_hours:.1f}")
        
        if ramji_user:
            print(f"ramji-hb2 Bank Hours: {ramji_user['bankHours']:.1f}")
        
        print(f"\n🎯 Your HourBank application is ready with rich, realistic data!")
        print("💡 Users can now browse services, make transactions, and see recent activity.")
        
    except Exception as error:
        print(f"❌ Error querying data: {str(error)}")

if __name__ == "__main__":
    main()
