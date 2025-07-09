#!/usr/bin/env node

console.log('🔧 Profile Services Debug & Fix Script\n');

const fs = require('fs');
const path = require('path');

// Check if the profile component files exist and are properly structured
function checkProfileComponent() {
    console.log('📋 Checking Profile Component Files...\n');
    
    const profilePath = './src/app/components/profile/';
    const files = [
        'profile.component.ts',
        'profile.component.html',
        'profile.component.scss'
    ];
    
    files.forEach(file => {
        const filePath = path.join(profilePath, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
        }
    });
}

// Check the service service file
function checkServiceService() {
    console.log('\n📋 Checking Service Service...\n');
    
    const servicePath = './src/app/services/service.service.ts';
    if (fs.existsSync(servicePath)) {
        console.log('✅ service.service.ts exists');
        
        const content = fs.readFileSync(servicePath, 'utf8');
        
        // Check for key methods
        const methods = [
            'getServicesByUserId',
            'createService',
            'updateService',
            'deleteService'
        ];
        
        methods.forEach(method => {
            if (content.includes(method)) {
                console.log(`✅ ${method} method found`);
            } else {
                console.log(`❌ ${method} method missing`);
            }
        });
    } else {
        console.log('❌ service.service.ts missing');
    }
}

// Check GraphQL queries
function checkGraphQLQueries() {
    console.log('\n📋 Checking GraphQL Queries...\n');
    
    const queriesPath = './src/app/graphql/queries.ts';
    if (fs.existsSync(queriesPath)) {
        console.log('✅ queries.ts exists');
        
        const content = fs.readFileSync(queriesPath, 'utf8');
        
        // Check for service-related queries
        const queries = [
            'servicesByUserId',
            'getService',
            'listServices',
            'servicesByCategory'
        ];
        
        queries.forEach(query => {
            if (content.includes(query)) {
                console.log(`✅ ${query} query found`);
            } else {
                console.log(`❌ ${query} query missing`);
            }
        });
    } else {
        console.log('❌ queries.ts missing');
    }
}

// Provide debugging steps
function provideBuggingSteps() {
    console.log('\n🔍 Debugging Steps:\n');
    
    console.log('1. Check Browser Console:');
    console.log('   - Open DevTools (F12)');
    console.log('   - Look for JavaScript errors');
    console.log('   - Check Network tab for failed API calls\n');
    
    console.log('2. Verify User Authentication:');
    console.log('   - Ensure user is logged in');
    console.log('   - Check if user ID is being retrieved correctly');
    console.log('   - Verify user mapping service is working\n');
    
    console.log('3. Check API Calls:');
    console.log('   - Look for servicesByUserId GraphQL calls');
    console.log('   - Verify the userId parameter is correct');
    console.log('   - Check for GraphQL errors in response\n');
    
    console.log('4. Component State:');
    console.log('   - Verify loadUserServices is being called');
    console.log('   - Check if userServices array is populated');
    console.log('   - Ensure mock services are added when no real services exist\n');
}

// Provide potential fixes
function provideFixes() {
    console.log('🔧 Potential Fixes:\n');
    
    console.log('1. Add Debug Logging:');
    console.log('   Add console.log statements in loadUserServices method');
    console.log('   Log the userId being passed to the API');
    console.log('   Log the API response\n');
    
    console.log('2. Force Mock Data:');
    console.log('   Temporarily force mock services to display');
    console.log('   This will help isolate if the issue is with API or UI\n');
    
    console.log('3. Check User ID Mapping:');
    console.log('   Verify the user mapping service is working');
    console.log('   Check if DynamoDB user ID is correct\n');
    
    console.log('4. API Permissions:');
    console.log('   Verify API key is valid');
    console.log('   Check GraphQL schema permissions');
    console.log('   Ensure servicesByUserId query is properly configured\n');
}

// Create a test component modification
function createTestFix() {
    console.log('📝 Creating Test Fix...\n');
    
    const testFix = `
// Add this to your profile.component.ts in the loadUserServices method
// Replace the existing method with this debug version:

loadUserServices(userId: string) {
    console.log('🔍 DEBUG: Loading services for user:', userId);
    
    this.serviceService.getServicesByUserId(userId).subscribe({
        next: (result) => {
            console.log('🔍 DEBUG: API Response:', result);
            console.log('🔍 DEBUG: Services count:', result.items?.length || 0);
            
            this.userServices = result.items;
            
            // Force mock data for testing
            if (this.userServices.length === 0) {
                console.log('🔍 DEBUG: No services found, adding mock data');
                this.addMockServicesForTesting(userId);
                console.log('🔍 DEBUG: Mock services added:', this.userServices.length);
            }
        },
        error: (error) => {
            console.error('🔍 DEBUG: Error loading services:', error);
            console.log('🔍 DEBUG: Adding mock data due to error');
            this.addMockServicesForTesting(userId);
        }
    });
}

// Also add this method to force display services:
forceDisplayTestServices() {
    this.userServices = [
        {
            id: 'test-1',
            userId: 'current-user',
            title: 'Test Service 1',
            description: 'This is a test service to verify display',
            category: 'Technology',
            hourlyDuration: 2,
            tags: ['test', 'debug'],
            isActive: true,
            requiresScheduling: false,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'test-2',
            userId: 'current-user',
            title: 'Test Service 2',
            description: 'Another test service',
            category: 'Education',
            hourlyDuration: 1,
            tags: ['teaching', 'test'],
            isActive: true,
            requiresScheduling: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    console.log('🔍 DEBUG: Forced test services:', this.userServices);
}

// Call this method in ngOnInit for testing:
// this.forceDisplayTestServices();
`;
    
    fs.writeFileSync('./debug-profile-fix.txt', testFix);
    console.log('✅ Test fix code saved to debug-profile-fix.txt');
}

// Run all checks
function runAllChecks() {
    checkProfileComponent();
    checkServiceService();
    checkGraphQLQueries();
    provideBuggingSteps();
    provideFixes();
    createTestFix();
    
    console.log('\n✅ Debug analysis complete!');
    console.log('\nNext steps:');
    console.log('1. Check the browser console for errors');
    console.log('2. Apply the debug code from debug-profile-fix.txt');
    console.log('3. Test with forced mock data');
    console.log('4. Check API calls in Network tab');
}

// Run the script
runAllChecks();
