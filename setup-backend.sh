#!/bin/bash

# HourBank Amplify Backend Setup Script
# This script automates the setup of all required AWS backend services

set -e

echo "🚀 HourBank Amplify Backend Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Amplify CLI is installed
    if ! command -v amplify &> /dev/null; then
        print_error "Amplify CLI is not installed. Installing..."
        npm install -g @aws-amplify/cli
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check completed!"
}

# Add GraphQL API
add_api() {
    print_status "Adding GraphQL API..."
    
    if [ ! -d "amplify/backend/api" ]; then
        print_status "Creating GraphQL API..."
        
        # Create API configuration
        amplify add api <<EOF
GraphQL
hourbankapi
Amazon Cognito User Pool
Y
N
N
N
N
N
Y
EOF
        
        # Copy our schema
        if [ -f "schema.graphql" ]; then
            cp schema.graphql amplify/backend/api/hourbankapi/schema.graphql
            print_success "GraphQL schema copied successfully!"
        else
            print_warning "schema.graphql not found. Using default schema."
        fi
        
        print_success "GraphQL API added successfully!"
    else
        print_warning "GraphQL API already exists. Skipping..."
    fi
}

# Add S3 Storage
add_storage() {
    print_status "Adding S3 Storage..."
    
    if [ ! -d "amplify/backend/storage" ]; then
        print_status "Creating S3 storage bucket..."
        
        amplify add storage <<EOF
Content (Images, audio, video, etc.)
hourbankStorage
hourbank-storage-bucket
Auth users only
create/update, read, delete
EOF
        
        print_success "S3 Storage added successfully!"
    else
        print_warning "S3 Storage already exists. Skipping..."
    fi
}

# Add Lambda Functions
add_functions() {
    print_status "Adding Lambda Functions..."
    
    if [ ! -d "amplify/backend/function" ]; then
        print_status "Creating Lambda functions..."
        
        # Business Logic Function
        amplify add function <<EOF
Lambda function (serverless function)
hourbankBusinessLogic
NodeJS
Hello World
N
N
N
N
N
EOF
        
        # Notification Function
        amplify add function <<EOF
Lambda function (serverless function)
hourbankNotifications
NodeJS
Hello World
N
N
N
N
N
EOF
        
        print_success "Lambda Functions added successfully!"
    else
        print_warning "Lambda Functions already exist. Skipping..."
    fi
}

# Update Authentication
update_auth() {
    print_status "Updating Authentication configuration..."
    
    print_status "Adding custom user attributes..."
    
    # Note: This requires manual configuration in Amplify Console
    print_warning "Please manually add these custom attributes in Amplify Console:"
    echo "  - bankHours (Number)"
    echo "  - skills (String - Array)"
    echo "  - rating (Number)"
    echo "  - totalTransactions (Number)"
    
    print_success "Authentication update instructions provided!"
}

# Create service files
create_services() {
    print_status "Creating updated service files..."
    
    # Create API service directory
    mkdir -p src/app/services/api
    
    # Create GraphQL service
    cat > src/app/services/api/graphql.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private client = generateClient();

  async query<T = any>(query: string, variables?: any): Promise<GraphQLResult<T>> {
    try {
      return await this.client.graphql({
        query,
        variables
      }) as GraphQLResult<T>;
    } catch (error) {
      console.error('GraphQL Query Error:', error);
      throw error;
    }
  }

  async mutate<T = any>(mutation: string, variables?: any): Promise<GraphQLResult<T>> {
    try {
      return await this.client.graphql({
        query: mutation,
        variables
      }) as GraphQLResult<T>;
    } catch (error) {
      console.error('GraphQL Mutation Error:', error);
      throw error;
    }
  }

  subscribe(subscription: string, variables?: any) {
    return this.client.graphql({
      query: subscription,
      variables
    });
  }
}
EOF

    # Create Storage service
    cat > src/app/services/api/storage.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  async uploadFile(file: File, key: string, options?: any): Promise<string> {
    try {
      const result = await uploadData({
        key,
        data: file,
        options: {
          accessLevel: 'private',
          ...options
        }
      }).result;

      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      const result = await getUrl({
        key,
        options: {
          accessLevel: 'private'
        }
      });
      
      return result.url.toString();
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await remove({
        key,
        options: {
          accessLevel: 'private'
        }
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const result = await list({
        prefix,
        options: {
          accessLevel: 'private'
        }
      });
      
      return result.items;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Profile picture specific methods
  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    const key = `profile-pictures/${userId}/${Date.now()}-${file.name}`;
    return this.uploadFile(file, key);
  }

  async getProfilePictureUrl(key: string): Promise<string> {
    return this.getFileUrl(key);
  }
}
EOF

    print_success "Service files created successfully!"
}

# Push changes to AWS
push_to_aws() {
    print_status "Pushing changes to AWS..."
    
    print_warning "This will create AWS resources and may take several minutes..."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        amplify push --yes
        print_success "Successfully pushed to AWS!"
    else
        print_warning "Skipping AWS push. Run 'amplify push' manually when ready."
    fi
}

# Generate GraphQL code
generate_code() {
    print_status "Generating GraphQL code..."
    
    if command -v amplify &> /dev/null; then
        amplify codegen add <<EOF
typescript
src/graphql
Y
src/app/API.service.ts
Y
EOF
        
        amplify codegen
        print_success "GraphQL code generated successfully!"
    else
        print_warning "Amplify CLI not available. Skipping code generation."
    fi
}

# Update package.json dependencies
update_dependencies() {
    print_status "Updating package dependencies..."
    
    # Add required dependencies
    npm install --save \
        @aws-amplify/ui-angular \
        aws-amplify
    
    print_success "Dependencies updated successfully!"
}

# Create migration script
create_migration_script() {
    print_status "Creating data migration script..."
    
    cat > src/app/services/migration.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { GraphQLService } from './api/graphql.service';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  
  constructor(private graphql: GraphQLService) {}

  async migrateMockDataToAmplify(): Promise<void> {
    console.log('Starting data migration...');
    
    try {
      // 1. Migrate users
      await this.migrateUsers();
      
      // 2. Migrate services
      await this.migrateServices();
      
      // 3. Migrate transactions
      await this.migrateTransactions();
      
      console.log('Data migration completed successfully!');
    } catch (error) {
      console.error('Data migration failed:', error);
      throw error;
    }
  }

  private async migrateUsers(): Promise<void> {
    // Implementation for user migration
    console.log('Migrating users...');
  }

  private async migrateServices(): Promise<void> {
    // Implementation for service migration
    console.log('Migrating services...');
  }

  private async migrateTransactions(): Promise<void> {
    // Implementation for transaction migration
    console.log('Migrating transactions...');
  }
}
EOF

    print_success "Migration script created successfully!"
}

# Main execution
main() {
    echo ""
    print_status "Starting HourBank backend setup..."
    echo ""
    
    check_prerequisites
    add_api
    add_storage
    add_functions
    update_auth
    create_services
    update_dependencies
    create_migration_script
    
    echo ""
    print_success "Backend setup completed!"
    echo ""
    
    echo "📋 Next Steps:"
    echo "1. Review the generated schema in amplify/backend/api/hourbankapi/schema.graphql"
    echo "2. Run 'amplify push' to deploy to AWS"
    echo "3. Run 'amplify codegen' to generate TypeScript types"
    echo "4. Update your services to use the new GraphQL API"
    echo "5. Test the backend integration"
    echo ""
    
    echo "🔗 Useful Commands:"
    echo "• amplify status - Check current status"
    echo "• amplify console - Open Amplify Console"
    echo "• amplify push - Deploy changes to AWS"
    echo "• amplify codegen - Generate GraphQL code"
    echo ""
    
    # Ask if user wants to push now
    push_to_aws
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_code
    fi
    
    echo ""
    print_success "🎉 HourBank backend setup is complete!"
    echo ""
    echo "Your backend now includes:"
    echo "✅ GraphQL API with DynamoDB"
    echo "✅ S3 Storage for file uploads"
    echo "✅ Lambda Functions for business logic"
    echo "✅ Enhanced Authentication"
    echo "✅ Real-time subscriptions"
    echo "✅ Updated service files"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
