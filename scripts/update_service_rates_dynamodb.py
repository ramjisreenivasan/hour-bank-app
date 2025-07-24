#!/usr/bin/env python3

import json
import subprocess
import sys
from typing import List, Dict, Any

# DynamoDB table name
TABLE_NAME = "Service-wcv2j2rh7bevbpun7acho3nium-dev"
REGION = "us-east-1"

def run_aws_command(command: List[str]) -> Dict[str, Any]:
    """Run AWS CLI command and return JSON result"""
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"❌ AWS CLI command failed: {e}")
        print(f"Command: {' '.join(command)}")
        print(f"Error output: {e.stderr}")
        raise
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON response: {e}")
        raise

def scan_services() -> List[Dict[str, Any]]:
    """Scan all services from DynamoDB table"""
    print("🔍 Scanning all services from DynamoDB...")
    
    command = [
        "aws", "dynamodb", "scan",
        "--table-name", TABLE_NAME,
        "--region", REGION
    ]
    
    result = run_aws_command(command)
    services = result.get('Items', [])
    
    print(f"📊 Found {len(services)} total services")
    return services

def update_service_rate(service_id: str, current_rate: str, target_rate: str = "1") -> bool:
    """Update a single service's hourly rate"""
    try:
        command = [
            "aws", "dynamodb", "update-item",
            "--table-name", TABLE_NAME,
            "--region", REGION,
            "--key", json.dumps({"id": {"S": service_id}}),
            "--update-expression", "SET hourlyRate = :rate",
            "--expression-attribute-values", json.dumps({":rate": {"N": target_rate}}),
            "--return-values", "UPDATED_NEW"
        ]
        
        result = run_aws_command(command)
        updated_rate = result.get('Attributes', {}).get('hourlyRate', {}).get('N', 'Unknown')
        
        print(f"  ✅ Updated service {service_id}: ${current_rate} → ${updated_rate}")
        return True
        
    except Exception as error:
        print(f"  ❌ Failed to update service {service_id}: {str(error)}")
        return False

def update_all_service_rates(target_rate: str = "1"):
    """Update all service hourly rates to the target rate"""
    print(f"💰 Updating all service hourly rates to ${target_rate}...\n")
    
    # Get all services
    services = scan_services()
    
    if not services:
        print("❌ No services found in the table.")
        return False
    
    # Filter services that need updating
    services_to_update = []
    services_already_correct = []
    
    for service in services:
        current_rate = service.get('hourlyRate', {}).get('N', '0')
        service_id = service.get('id', {}).get('S', 'Unknown')
        title = service.get('title', {}).get('S', 'Unknown Service')
        
        if current_rate != target_rate:
            services_to_update.append({
                'id': service_id,
                'title': title,
                'current_rate': current_rate
            })
        else:
            services_already_correct.append({
                'id': service_id,
                'title': title,
                'current_rate': current_rate
            })
    
    print(f"🎯 Services needing update: {len(services_to_update)}")
    print(f"✅ Services already at ${target_rate}: {len(services_already_correct)}")
    
    if not services_to_update:
        print(f"🎉 All services already have hourly rate of ${target_rate}!")
        return True
    
    print(f"\n📋 Services to update:")
    print("-" * 80)
    for i, service in enumerate(services_to_update, 1):
        print(f"{i:2d}. {service['title'][:50]:<50} ${service['current_rate']:>8} → ${target_rate}")
    
    print(f"\n⚠️  This will update {len(services_to_update)} services to ${target_rate}/hour")
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
        
        if update_service_rate(service['id'], service['current_rate'], target_rate):
            updated_count += 1
        else:
            failed_count += 1
    
    # Summary
    print(f"\n📊 UPDATE SUMMARY")
    print("=" * 40)
    print(f"Services processed: {len(services_to_update)}")
    print(f"Successfully updated: {updated_count}")
    print(f"Failed updates: {failed_count}")
    print(f"Already correct: {len(services_already_correct)}")
    print(f"Total services: {len(services)}")
    
    if updated_count == len(services_to_update):
        print(f"✅ All services now have hourly rate of ${target_rate}!")
        return True
    else:
        print("⚠️  Some updates failed. Check the errors above.")
        return False

def verify_updates(target_rate: str = "1"):
    """Verify that all services have the correct rate"""
    print(f"\n🔍 Verifying all services have rate of ${target_rate}...")
    
    services = scan_services()
    incorrect_services = []
    
    for service in services:
        current_rate = service.get('hourlyRate', {}).get('N', '0')
        if current_rate != target_rate:
            title = service.get('title', {}).get('S', 'Unknown Service')
            incorrect_services.append(f"{title}: ${current_rate}")
    
    if not incorrect_services:
        print(f"✅ All {len(services)} services have hourly rate of ${target_rate}!")
        return True
    else:
        print(f"❌ Found {len(incorrect_services)} services with incorrect rates:")
        for service in incorrect_services:
            print(f"  - {service}")
        return False

def main():
    """Main execution function"""
    try:
        # Get target rate from command line argument
        target_rate = sys.argv[1] if len(sys.argv) > 1 else "1"
        
        try:
            float(target_rate)
        except ValueError:
            print("❌ Please provide a valid number for the hourly rate")
            sys.exit(1)
        
        print("💰 DynamoDB Service Rate Updater")
        print("=" * 40)
        print(f"Target hourly rate: ${target_rate}")
        print(f"DynamoDB Table: {TABLE_NAME}")
        print(f"Region: {REGION}")
        print()
        
        # Test AWS CLI access
        try:
            subprocess.run(["aws", "sts", "get-caller-identity"], 
                         capture_output=True, check=True)
            print("✅ AWS CLI access verified")
        except subprocess.CalledProcessError:
            print("❌ AWS CLI not configured or no access")
            print("💡 Run 'aws configure' to set up your credentials")
            sys.exit(1)
        
        # Update service rates
        success = update_all_service_rates(target_rate)
        
        if success:
            # Verify the updates
            verify_updates(target_rate)
            print(f"\n🎉 All service rates updated to ${target_rate} successfully!")
        else:
            print(f"\n❌ Service rate update completed with errors.")
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n❌ Process interrupted by user")
        sys.exit(1)
    except Exception as error:
        print(f"❌ Script execution failed: {str(error)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
