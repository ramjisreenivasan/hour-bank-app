#!/usr/bin/env node

const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

const TABLE_NAME = 'Service-wcv2j2rh7bevbpun7acho3nium-dev';
const NEW_HOURLY_RATE = 1;

async function updateAllServiceHourlyRates() {
    console.log('🔄 Starting to update all service hourly rates to 1...');
    
    try {
        // First, scan all services to get their IDs
        const scanCommand = new ScanCommand({
            TableName: TABLE_NAME,
            ProjectionExpression: 'id, title, hourlyRate'
        });
        
        const scanResult = await dynamoClient.send(scanCommand);
        const services = scanResult.Items;
        
        console.log(`📊 Found ${services.length} services to update`);
        
        // Update each service individually
        let successCount = 0;
        let errorCount = 0;
        
        for (const service of services) {
            try {
                const currentRate = parseFloat(service.hourlyRate.N);
                const serviceId = service.id.S;
                const title = service.title.S;
                
                console.log(`🔧 Updating "${title}" (ID: ${serviceId}) from $${currentRate}/hr to $${NEW_HOURLY_RATE}/hr`);
                
                const updateCommand = new UpdateItemCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        id: { S: serviceId }
                    },
                    UpdateExpression: 'SET hourlyRate = :newRate, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':newRate': { N: NEW_HOURLY_RATE.toString() },
                        ':updatedAt': { S: new Date().toISOString() }
                    },
                    ReturnValues: 'UPDATED_NEW'
                });
                
                await dynamoClient.send(updateCommand);
                successCount++;
                console.log(`✅ Successfully updated "${title}"`);
                
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to update service ${service.id.S}:`, error.message);
            }
        }
        
        console.log('\n📈 Update Summary:');
        console.log(`✅ Successfully updated: ${successCount} services`);
        console.log(`❌ Failed to update: ${errorCount} services`);
        console.log(`📊 Total services: ${services.length}`);
        
        if (successCount === services.length) {
            console.log('\n🎉 All services have been successfully updated to $1/hour!');
        } else {
            console.log('\n⚠️  Some services failed to update. Please check the errors above.');
        }
        
    } catch (error) {
        console.error('💥 Error during bulk update:', error);
        process.exit(1);
    }
}

// Verification function to check the updates
async function verifyUpdates() {
    console.log('\n🔍 Verifying updates...');
    
    try {
        const scanCommand = new ScanCommand({
            TableName: TABLE_NAME,
            ProjectionExpression: 'id, title, hourlyRate'
        });
        
        const scanResult = await dynamoClient.send(scanCommand);
        const services = scanResult.Items;
        
        let correctCount = 0;
        let incorrectCount = 0;
        
        for (const service of services) {
            const rate = parseFloat(service.hourlyRate.N);
            if (rate === NEW_HOURLY_RATE) {
                correctCount++;
            } else {
                incorrectCount++;
                console.log(`⚠️  Service "${service.title.S}" still has rate: $${rate}/hr`);
            }
        }
        
        console.log('\n📊 Verification Results:');
        console.log(`✅ Services with correct rate ($${NEW_HOURLY_RATE}/hr): ${correctCount}`);
        console.log(`❌ Services with incorrect rate: ${incorrectCount}`);
        
        if (incorrectCount === 0) {
            console.log('\n🎉 All services are now correctly set to $1/hour!');
        }
        
    } catch (error) {
        console.error('💥 Error during verification:', error);
    }
}

// Main execution
async function main() {
    console.log('🏦 HourBank Service Rate Updater');
    console.log('================================');
    
    await updateAllServiceHourlyRates();
    await verifyUpdates();
    
    console.log('\n✨ Update process completed!');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { updateAllServiceHourlyRates, verifyUpdates };
