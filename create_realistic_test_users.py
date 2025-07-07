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

# Realistic user data templates
REALISTIC_USERS = [
    {
        'firstName': 'Sarah',
        'lastName': 'Chen',
        'email': 'sarah.chen.dev@gmail.com',
        'username': 'sarahc_dev',
        'skills': ['Web Development', 'React', 'Node.js', 'TypeScript'],
        'bio': 'Full-stack developer with 5 years of experience building scalable web applications. Passionate about clean code and user experience.',
        'specialties': ['Frontend Development', 'API Design', 'Database Optimization']
    },
    {
        'firstName': 'Marcus',
        'lastName': 'Johnson',
        'email': 'marcus.johnson.design@gmail.com',
        'username': 'marcusj_design',
        'skills': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
        'bio': 'Creative designer focused on human-centered design. I help businesses create intuitive digital experiences that users love.',
        'specialties': ['Mobile App Design', 'Brand Identity', 'Prototyping']
    },
    {
        'firstName': 'Elena',
        'lastName': 'Rodriguez',
        'email': 'elena.rodriguez.marketing@gmail.com',
        'username': 'elenar_marketing',
        'skills': ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media'],
        'bio': 'Marketing strategist with expertise in growing online presence. I help small businesses reach their target audience effectively.',
        'specialties': ['Content Marketing', 'Email Campaigns', 'Analytics']
    },
    {
        'firstName': 'David',
        'lastName': 'Kim',
        'email': 'david.kim.data@gmail.com',
        'username': 'davidk_data',
        'skills': ['Data Analysis', 'Python', 'Machine Learning', 'SQL'],
        'bio': 'Data scientist passionate about turning data into actionable insights. Experienced in predictive modeling and business intelligence.',
        'specialties': ['Data Visualization', 'Statistical Analysis', 'ML Models']
    },
    {
        'firstName': 'Amara',
        'lastName': 'Okafor',
        'email': 'amara.okafor.writer@gmail.com',
        'username': 'amarao_writer',
        'skills': ['Content Writing', 'Copywriting', 'Technical Writing', 'Editing'],
        'bio': 'Professional writer specializing in tech content and marketing copy. I help businesses communicate their value clearly and persuasively.',
        'specialties': ['Blog Writing', 'Documentation', 'Brand Voice']
    },
    {
        'firstName': 'James',
        'lastName': 'Thompson',
        'email': 'james.thompson.photo@gmail.com',
        'username': 'jamest_photo',
        'skills': ['Photography', 'Photo Editing', 'Lightroom', 'Event Photography'],
        'bio': 'Professional photographer with 8 years of experience. I capture moments that tell stories and create lasting memories.',
        'specialties': ['Portrait Photography', 'Product Photography', 'Photo Retouching']
    },
    {
        'firstName': 'Priya',
        'lastName': 'Patel',
        'email': 'priya.patel.business@gmail.com',
        'username': 'priyap_business',
        'skills': ['Business Consulting', 'Project Management', 'Strategy', 'Operations'],
        'bio': 'Business consultant helping startups and small businesses optimize their operations and achieve sustainable growth.',
        'specialties': ['Business Strategy', 'Process Improvement', 'Team Leadership']
    },
    {
        'firstName': 'Alex',
        'lastName': 'Rivera',
        'email': 'alex.rivera.music@gmail.com',
        'username': 'alexr_music',
        'skills': ['Music Production', 'Guitar Lessons', 'Audio Engineering', 'Songwriting'],
        'bio': 'Music producer and instructor with 10+ years in the industry. I help aspiring musicians develop their sound and skills.',
        'specialties': ['Music Composition', 'Recording', 'Music Theory']
    },
    {
        'firstName': 'Lisa',
        'lastName': 'Anderson',
        'email': 'lisa.anderson.fitness@gmail.com',
        'username': 'lisaa_fitness',
        'skills': ['Personal Training', 'Nutrition Coaching', 'Yoga', 'Wellness'],
        'bio': 'Certified personal trainer and wellness coach. I help people achieve their fitness goals through personalized training and nutrition guidance.',
        'specialties': ['Strength Training', 'Weight Loss', 'Mindfulness']
    },
    {
        'firstName': 'Omar',
        'lastName': 'Hassan',
        'email': 'omar.hassan.lang@gmail.com',
        'username': 'omarh_lang',
        'skills': ['Language Translation', 'Arabic', 'French', 'Tutoring'],
        'bio': 'Multilingual translator and language instructor fluent in Arabic, French, and English. I help bridge communication gaps.',
        'specialties': ['Document Translation', 'Language Tutoring', 'Cultural Consulting']
    },
    {
        'firstName': 'Rachel',
        'lastName': 'Green',
        'email': 'rachel.green.finance@gmail.com',
        'username': 'rachelg_finance',
        'skills': ['Financial Planning', 'Accounting', 'Tax Preparation', 'Investment Advice'],
        'bio': 'CPA with 12 years of experience helping individuals and small businesses manage their finances and plan for the future.',
        'specialties': ['Tax Strategy', 'Retirement Planning', 'Business Finance']
    },
    {
        'firstName': 'Carlos',
        'lastName': 'Mendoza',
        'email': 'carlos.mendoza.repair@gmail.com',
        'username': 'carlosm_repair',
        'skills': ['Home Repair', 'Plumbing', 'Electrical Work', 'Carpentry'],
        'bio': 'Experienced handyman with 15 years in home improvement. I help homeowners with repairs, maintenance, and small renovations.',
        'specialties': ['Kitchen Repairs', 'Bathroom Renovations', 'Electrical Fixes']
    },
    {
        'firstName': 'Nina',
        'lastName': 'Kowalski',
        'email': 'nina.kowalski.garden@gmail.com',
        'username': 'ninak_garden',
        'skills': ['Gardening', 'Landscaping', 'Plant Care', 'Organic Farming'],
        'bio': 'Master gardener passionate about sustainable growing practices. I help people create beautiful, productive gardens.',
        'specialties': ['Vegetable Gardens', 'Native Plants', 'Composting']
    },
    {
        'firstName': 'Tyler',
        'lastName': 'Brooks',
        'email': 'tyler.brooks.video@gmail.com',
        'username': 'tylerb_video',
        'skills': ['Video Editing', 'Motion Graphics', 'YouTube Content', 'Storytelling'],
        'bio': 'Video editor and content creator with expertise in crafting compelling visual stories for brands and creators.',
        'specialties': ['Social Media Videos', 'Corporate Videos', 'Animation']
    },
    {
        'firstName': 'Sophia',
        'lastName': 'Nakamura',
        'email': 'sophia.nakamura.legal@gmail.com',
        'username': 'sophian_legal',
        'skills': ['Legal Consulting', 'Contract Review', 'Business Law', 'Compliance'],
        'bio': 'Business attorney specializing in small business legal needs. I help entrepreneurs navigate legal requirements and protect their interests.',
        'specialties': ['Contract Drafting', 'Business Formation', 'Intellectual Property']
    },
    {
        'firstName': 'Michael',
        'lastName': 'O\'Connor',
        'email': 'michael.oconnor.coach@gmail.com',
        'username': 'michaelo_coach',
        'skills': ['Life Coaching', 'Career Counseling', 'Leadership Development', 'Motivation'],
        'bio': 'Certified life coach helping professionals overcome challenges and achieve their personal and career goals.',
        'specialties': ['Career Transitions', 'Goal Setting', 'Confidence Building']
    },
    {
        'firstName': 'Zara',
        'lastName': 'Ali',
        'email': 'zara.ali.fashion@gmail.com',
        'username': 'zaraa_fashion',
        'skills': ['Fashion Styling', 'Personal Shopping', 'Color Analysis', 'Wardrobe Consulting'],
        'bio': 'Personal stylist helping clients discover their unique style and build confidence through fashion choices.',
        'specialties': ['Wardrobe Makeovers', 'Special Event Styling', 'Professional Attire']
    },
    {
        'firstName': 'Benjamin',
        'lastName': 'Clark',
        'email': 'benjamin.clark.chef@gmail.com',
        'username': 'benjaminc_chef',
        'skills': ['Cooking', 'Meal Planning', 'Nutrition', 'Culinary Arts'],
        'bio': 'Professional chef and culinary instructor. I teach cooking techniques and help people develop healthy eating habits.',
        'specialties': ['Healthy Cooking', 'Meal Prep', 'International Cuisine']
    },
    {
        'firstName': 'Isabella',
        'lastName': 'Santos',
        'email': 'isabella.santos.therapy@gmail.com',
        'username': 'isabellas_therapy',
        'skills': ['Massage Therapy', 'Wellness', 'Stress Relief', 'Holistic Health'],
        'bio': 'Licensed massage therapist focused on helping clients achieve physical and mental wellness through therapeutic touch.',
        'specialties': ['Deep Tissue Massage', 'Relaxation Therapy', 'Pain Management']
    },
    {
        'firstName': 'Kevin',
        'lastName': 'Walsh',
        'email': 'kevin.walsh.pets@gmail.com',
        'username': 'kevinw_pets',
        'skills': ['Pet Care', 'Dog Training', 'Animal Behavior', 'Pet Sitting'],
        'bio': 'Professional pet care specialist and dog trainer. I help pet owners build strong, healthy relationships with their furry friends.',
        'specialties': ['Puppy Training', 'Behavioral Issues', 'Pet Grooming']
    }
]

# Service categories and their typical hourly rates
SERVICE_CATEGORIES = {
    'Technology': {'min': 50, 'max': 120},
    'Design': {'min': 40, 'max': 100},
    'Business': {'min': 60, 'max': 150},
    'Education': {'min': 25, 'max': 80},
    'Health': {'min': 30, 'max': 90},
    'Lifestyle': {'min': 20, 'max': 70},
    'Creative': {'min': 35, 'max': 85},
    'Home Services': {'min': 25, 'max': 65}
}

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

def generate_realistic_user_data(user_template: Dict[str, Any], index: int) -> Dict[str, Any]:
    """Generate realistic user data from template"""
    base_email = user_template['email'].replace('@gmail.com', '')
    unique_email = f"{base_email}+{random.randint(100, 999)}@gmail.com"
    
    return {
        'id': str(uuid.uuid4()),
        'email': unique_email,
        'username': f"{user_template['username']}_{random.randint(10, 99)}",
        'firstName': user_template['firstName'],
        'lastName': user_template['lastName'],
        'skills': user_template['skills'],
        'bio': user_template['bio'],
        'bankHours': round(random.uniform(5.0, 75.0), 1),
        'rating': round(random.uniform(3.5, 5.0), 1),
        'totalTransactions': random.randint(0, 25),
        'specialties': user_template['specialties']
    }

def generate_services_for_user(user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate services for a user based on their skills"""
    services = []
    num_services = random.randint(1, 3)
    
    for i in range(num_services):
        skill = user_data['skills'][i] if i < len(user_data['skills']) else user_data['skills'][0]
        specialty = user_data['specialties'][i] if i < len(user_data['specialties']) else user_data['specialties'][0]
        
        # Determine category based on skills
        category = 'Other'
        tech_skills = ['Web Development', 'React', 'Node.js', 'TypeScript', 'Python', 'Data Analysis', 'Machine Learning']
        design_skills = ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Photography', 'Video Editing']
        business_skills = ['Business Consulting', 'Project Management', 'Financial Planning', 'Legal Consulting']
        education_skills = ['Tutoring', 'Language Translation', 'Music Lessons', 'Cooking']
        health_skills = ['Personal Training', 'Massage Therapy', 'Wellness', 'Nutrition']
        lifestyle_skills = ['Home Repair', 'Gardening', 'Pet Care', 'Fashion Styling']
        
        if any(tech in user_data['skills'] for tech in tech_skills):
            category = 'Technology'
        elif any(design in user_data['skills'] for design in design_skills):
            category = 'Design'
        elif any(biz in user_data['skills'] for biz in business_skills):
            category = 'Business'
        elif any(edu in user_data['skills'] for edu in education_skills):
            category = 'Education'
        elif any(health in user_data['skills'] for health in health_skills):
            category = 'Health'
        elif any(lifestyle in user_data['skills'] for lifestyle in lifestyle_skills):
            category = 'Lifestyle'
        
        rate_range = SERVICE_CATEGORIES.get(category, {'min': 30, 'max': 80})
        hourly_rate = round(random.uniform(rate_range['min'], rate_range['max']), 2)
        
        bio_parts = user_data['bio'].split('.')
        additional_info = bio_parts[1] if len(bio_parts) > 1 else 'I bring years of experience and dedication to every project.'
        
        services.append({
            'title': f"Professional {specialty} Services",
            'description': f"Hi! I'm {user_data['firstName']} and I specialize in {specialty.lower()}. {additional_info.strip()} Let me help you achieve your goals with quality service and attention to detail.",
            'category': category,
            'hourlyRate': hourly_rate,
            'isActive': random.random() > 0.1,  # 90% chance of being active
            'tags': [
                skill.lower().replace(' ', '-'),
                specialty.lower().replace(' ', '-') if specialty else None,
                'professional',
                'experienced',
                category.lower()
            ]
        })
        
        # Remove None values from tags
        services[-1]['tags'] = [tag for tag in services[-1]['tags'] if tag is not None]
    
    return services

def create_realistic_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a realistic test user with services"""
    try:
        print(f"\n🔄 Creating user: {user_data['firstName']} {user_data['lastName']}")
        
        # Create user record
        print("  📊 Creating user record...")
        user_input = {
            'id': user_data['id'],
            'email': user_data['email'],
            'username': user_data['username'],
            'firstName': user_data['firstName'],
            'lastName': user_data['lastName'],
            'bankHours': user_data['bankHours'],
            'skills': user_data['skills'],
            'bio': user_data['bio'],
            'rating': user_data['rating'],
            'totalTransactions': user_data['totalTransactions']
        }
        
        user_result = make_graphql_request(CREATE_USER_MUTATION, {'input': user_input})
        created_user = user_result['data']['createUser']
        print(f"  ✅ User created with ID: {created_user['id']}")
        
        # Create services
        print("  🛠️  Creating services...")
        services_to_create = generate_services_for_user(user_data)
        created_services = []
        
        for service_data in services_to_create:
            try:
                service_input = {
                    'userId': user_data['id'],
                    **service_data
                }
                
                service_result = make_graphql_request(CREATE_SERVICE_MUTATION, {'input': service_input})
                created_service = service_result['data']['createService']
                created_services.append(created_service)
                print(f"    ✅ Service created: {service_data['title']}")
            except Exception as service_error:
                print(f"    ❌ Service creation failed: {str(service_error)}")
        
        return {
            'success': True,
            'user': created_user,
            'services': created_services
        }
        
    except Exception as error:
        print(f"  ❌ Failed to create user {user_data['firstName']} {user_data['lastName']}: {str(error)}")
        return {
            'success': False,
            'error': str(error),
            'user_data': user_data
        }

def create_realistic_test_users(count: int = 10) -> Dict[str, Any]:
    """Create multiple realistic test users"""
    print(f"🚀 Creating {count} realistic test users...\n")
    
    results = {
        'successful': [],
        'failed': [],
        'total': count
    }
    
    # Shuffle and select users
    shuffled_users = REALISTIC_USERS.copy()
    random.shuffle(shuffled_users)
    users_to_create = shuffled_users[:min(count, len(REALISTIC_USERS))]
    
    # If we need more users than templates, repeat some with variations
    while len(users_to_create) < count:
        random_user = random.choice(REALISTIC_USERS)
        users_to_create.append(random_user)
    
    for i in range(count):
        user_template = users_to_create[i]
        user_data = generate_realistic_user_data(user_template, i + 1)
        result = create_realistic_user(user_data)
        
        if result['success']:
            results['successful'].append(result)
            print(f"✅ User {i + 1}/{count} created successfully")
        else:
            results['failed'].append(result)
            print(f"❌ User {i + 1}/{count} failed")
        
        # Add delay to avoid rate limiting
        if i < count - 1:
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
            print(f"{i}. {user['firstName']} {user['lastName']} (@{user['username']})")
            print(f"   Email: {user['email']}")
            print(f"   Skills: {', '.join(user['skills'])}")
            print(f"   Services: {len(result['services'])}")
            print(f"   Bank Hours: {user['bankHours']}")
            print(f"   Rating: {user['rating']}/5.0")
            print()
    
    if results['failed']:
        print("\n❌ FAILED USERS:")
        for i, result in enumerate(results['failed'], 1):
            user_data = result['user_data']
            print(f"{i}. {user_data['firstName']} {user_data['lastName']} - {result['error']}")
    
    return results

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
        # Get user count from command line argument
        user_count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
        
        if user_count < 1 or user_count > 50:
            print("❌ Please specify a number between 1 and 50")
            sys.exit(1)
        
        # Test API connection
        if not test_api_connection():
            sys.exit(1)
        
        # Create users
        results = create_realistic_test_users(user_count)
        
        print(f"\n🎉 Process completed! Created {len(results['successful'])} realistic users successfully.")
        
        if results['successful']:
            print("\n📋 SUMMARY STATISTICS:")
            print("=" * 50)
            total_services = sum(len(r['services']) for r in results['successful'])
            total_skills = sum(len(r['user']['skills']) for r in results['successful'])
            avg_bank_hours = sum(r['user']['bankHours'] for r in results['successful']) / len(results['successful'])
            avg_rating = sum(r['user']['rating'] for r in results['successful']) / len(results['successful'])
            
            print(f"👥 Total Users: {len(results['successful'])}")
            print(f"🛠️  Total Services: {total_services}")
            print(f"🎯 Total Skills: {total_skills}")
            print(f"💰 Average Bank Hours: {avg_bank_hours:.1f}")
            print(f"⭐ Average Rating: {avg_rating:.1f}/5.0")
        
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
