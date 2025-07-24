#!/bin/bash

# HourBank AWS Deployment Script
# This script deploys the HourBank application to AWS Amplify

set -e

echo "🚀 HourBank AWS Deployment Script"
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

# Check if AWS CLI is configured
check_aws_cli() {
    print_status "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is configured"
}

# Check if Amplify CLI is available
check_amplify_cli() {
    print_status "Checking Amplify CLI..."
    
    if ! command -v amplify &> /dev/null; then
        print_warning "Amplify CLI not found. Installing..."
        npm install -g @aws-amplify/cli
    fi
    
    print_success "Amplify CLI is available"
}

# Display current Amplify status
show_amplify_status() {
    print_status "Current Amplify project status:"
    echo ""
    amplify status
    echo ""
}

# Option 1: Deploy using Amplify Console (Git-based)
deploy_with_console() {
    print_status "Setting up deployment with Amplify Console..."
    echo ""
    echo "To deploy using Amplify Console:"
    echo "1. Push your code to a Git repository (GitHub, GitLab, etc.)"
    echo "2. Go to: https://console.aws.amazon.com/amplify/"
    echo "3. Click 'New app' → 'Host web app'"
    echo "4. Connect your Git repository"
    echo "5. Use these build settings:"
    echo ""
    cat << 'EOF'
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist/hourbank-app
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
EOF
    echo ""
    print_success "Amplify Console setup instructions provided above"
}

# Option 2: Deploy using Amplify CLI
deploy_with_cli() {
    print_status "Attempting CLI deployment..."
    
    # Try to build first
    print_status "Building application..."
    if ng build --configuration production; then
        print_success "Build successful"
        
        print_status "Publishing to Amplify..."
        if amplify publish --yes; then
            print_success "Deployment successful!"
            
            # Get the hosting URL
            print_status "Getting hosting URL..."
            amplify status
        else
            print_error "Amplify publish failed"
            return 1
        fi
    else
        print_error "Build failed. This might be due to the esbuild platform issue."
        print_warning "Consider using Amplify Console deployment instead."
        return 1
    fi
}

# Option 3: Manual S3 deployment
deploy_to_s3() {
    print_status "Manual S3 deployment option..."
    
    BUCKET_NAME="hourbank-app-$(date +%s)"
    
    echo "To deploy manually to S3:"
    echo "1. Create S3 bucket: aws s3 mb s3://$BUCKET_NAME --region us-east-1"
    echo "2. Enable static website hosting: aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html"
    echo "3. Build your app locally (fix esbuild issues first)"
    echo "4. Upload files: aws s3 sync dist/hourbank-app/ s3://$BUCKET_NAME --delete"
    echo "5. Make bucket public or set up CloudFront"
    
    print_warning "This option requires manual configuration of permissions and CloudFront"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment method:"
    echo "1. Amplify Console (Git-based) - Recommended"
    echo "2. Amplify CLI (Direct)"
    echo "3. Manual S3 deployment"
    echo "4. Show current status only"
    echo "5. Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_with_console
            ;;
        2)
            deploy_with_cli
            ;;
        3)
            deploy_to_s3
            ;;
        4)
            show_amplify_status
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Main execution
main() {
    echo ""
    print_status "Starting deployment process..."
    
    check_aws_cli
    check_amplify_cli
    show_amplify_status
    
    echo ""
    echo "Your Amplify app is already configured:"
    echo "- App ID: d28saavnbxir8q"
    echo "- Region: us-east-1"
    echo "- Environment: dev"
    echo "- Cognito User Pool: us-east-1_Il1TvEVPZ"
    
    show_menu
}

# Run main function
main
