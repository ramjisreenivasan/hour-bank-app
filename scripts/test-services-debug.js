#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function debugServices() {
    console.log('🔍 Debugging Services in Profile Page...\n');

    try {
        // First, let's check what tables exist
        console.log('📋 Checking Service table...');
        
        // Scan the Service table to see all services
        const scanParams = {
            TableName: 'Service-hnqgvgqhxjhqjmqvqvqvqvqvqv-dev', // Replace with your actual table name
            Limit: 20
        };

        try {
            const scanResult = await docClient.send(new ScanCommand(scanParams));
            console.log(`Found ${scanResult.Items?.length || 0} services in total:`);
            
            if (scanResult.Items && scanResult.Items.length > 0) {
                scanResult.Items.forEach((service, index) => {
                    console.log(`\n${index + 1}. Service ID: ${service.id}`);
                    console.log(`   User ID: ${service.userId}`);
                    console.log(`   Title: ${service.title}`);
                    console.log(`   Category: ${service.category}`);
                    console.log(`   Active: ${service.isActive}`);
                    console.log(`   Created: ${service.createdAt}`);
                });
            } else {
                console.log('❌ No services found in the database');
            }
        } catch (tableError) {
            console.log('❌ Error accessing Service table:', tableError.message);
            console.log('💡 This might be because the table name is different or doesn\'t exist yet');
        }

        // Now let's check the User table to see what users exist
        console.log('\n📋 Checking User table...');
        
        const userScanParams = {
            TableName: 'User-hnqgvgqhxjhqjmqvqvqvqvqvqv-dev', // Replace with your actual table name
            Limit: 10
        };

        try {
            const userScanResult = await docClient.send(new ScanCommand(userScanParams));
            console.log(`Found ${userScanResult.Items?.length || 0} users in total:`);
            
            if (userScanResult.Items && userScanResult.Items.length > 0) {
                userScanResult.Items.forEach((user, index) => {
                    console.log(`\n${index + 1}. User ID: ${user.id}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Username: ${user.username}`);
                    console.log(`   Name: ${user.firstName} ${user.lastName}`);
                    console.log(`   Bank Hours: ${user.bankHours}`);
                });

                // For each user, try to find their services
                console.log('\n🔍 Checking services for each user...');
                for (const user of userScanResult.Items) {
                    try {
                        const userServicesParams = {
                            TableName: 'Service-hnqgvgqhxjhqjmqvqvqvqvqvqv-dev',
                            IndexName: 'servicesByUserId', // GSI name
                            KeyConditionExpression: 'userId = :userId',
                            ExpressionAttributeValues: {
                                ':userId': user.id
                            }
                        };

                        const userServicesResult = await docClient.send(new QueryCommand(userServicesParams));
                        console.log(`   User ${user.username} has ${userServicesResult.Items?.length || 0} services`);
                        
                        if (userServicesResult.Items && userServicesResult.Items.length > 0) {
                            userServicesResult.Items.forEach(service => {
                                console.log(`     - ${service.title} (${service.category})`);
                            });
                        }
                    } catch (queryError) {
                        console.log(`   ❌ Error querying services for user ${user.username}:`, queryError.message);
                    }
                }
            }
        } catch (userTableError) {
            console.log('❌ Error accessing User table:', userTableError.message);
        }

    } catch (error) {
        console.error('❌ General error:', error);
    }
}

// Run the debug function
debugServices().then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
});
