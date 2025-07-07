#!/bin/bash

# HourBank Deployment Script
# This script automates the deployment process for the HourBank application

set -e  # Exit on any error

echo "🚀 Starting HourBank deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Angular CLI
    if ! command -v ng &> /dev/null; then
        print_warning "Angular CLI not found. Installing globally..."
        npm install -g @angular/cli
    fi
    
    # Check Amplify CLI
    if ! command -v amplify &> /dev/null; then
        print_warning "Amplify CLI not found. Installing globally..."
        npm install -g @aws-amplify/cli
    fi
    
    print_success "Prerequisites check completed!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    print_success "Dependencies installed successfully!"
}

# Build the application
build_application() {
    print_status "Building Angular application..."
    ng build --configuration production
    print_success "Application built successfully!"
}

# Initialize Amplify (if not already initialized)
init_amplify() {
    if [ ! -d "amplify" ]; then
        print_status "Initializing Amplify project..."
        print_warning "Please follow the prompts to configure Amplify:"
        echo "  - Project name: hourbank-app"
        echo "  - Environment: dev"
        echo "  - Framework: angular"
        echo "  - Source directory: src"
        echo "  - Distribution directory: dist/hourbank-app"
        echo "  - Build command: npm run build"
        echo "  - Start command: ng serve"
        
        amplify init
        print_success "Amplify initialized successfully!"
    else
        print_status "Amplify already initialized. Skipping..."
    fi
}

# Add authentication
add_auth() {
    if [ ! -f "amplify/backend/auth/*/cli-inputs.json" ]; then
        print_status "Adding authentication service..."
        amplify add auth
        print_success "Authentication service added!"
    else
        print_status "Authentication already configured. Skipping..."
    fi
}

# Add hosting
add_hosting() {
    if [ ! -f "amplify/backend/hosting/*/cli-inputs.json" ]; then
        print_status "Adding hosting service..."
        amplify add hosting
        print_success "Hosting service added!"
    else
        print_status "Hosting already configured. Skipping..."
    fi
}

# Deploy backend services
deploy_backend() {
    print_status "Deploying backend services to AWS..."
    amplify push --yes
    print_success "Backend services deployed successfully!"
}

# Publish application
publish_app() {
    print_status "Publishing application..."
    amplify publish --yes
    print_success "Application published successfully!"
    
    # Get the hosting URL
    HOSTING_URL=$(amplify status | grep -A 5 "Hosting" | grep "Hosting endpoint" | awk '{print $3}')
    if [ ! -z "$HOSTING_URL" ]; then
        print_success "🎉 Your application is live at: $HOSTING_URL"
    fi
}

# Main deployment function
deploy() {
    echo "=========================================="
    echo "       HourBank Deployment Script        "
    echo "=========================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    build_application
    init_amplify
    add_auth
    add_hosting
    deploy_backend
    publish_app
    
    echo ""
    echo "=========================================="
    print_success "🎉 Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Test your application thoroughly"
    echo "2. Set up monitoring and alerts"
    echo "3. Configure custom domain (optional)"
    echo "4. Set up CI/CD pipeline (optional)"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "build")
        check_prerequisites
        install_dependencies
        build_application
        ;;
    "backend")
        check_prerequisites
        deploy_backend
        ;;
    "publish")
        check_prerequisites
        publish_app
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  build    - Build application only"
        echo "  backend  - Deploy backend services only"
        echo "  publish  - Publish application only"
        echo "  help     - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
