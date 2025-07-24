#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// You'll need to replace these with your actual table names
const USER_TABLE = 'User-hnqgvgqhxjhqjmqvqvqvqvqvqv-dev'; // Replace with actual table name
const SERVICE_TABLE = 'Service-hnqgvgqhxjhqjmqvqvqvqvqvqv-dev'; // Replace with actual table name

async function fixIdMapping() {
    console.log('🔧 Starting ID Mapping Fix...\n');

    try {
        // Step 1: Analyze current data structure
        await analyzeCurrentData();
        
        // Step 2: Fix user records
        await fixUserRecords();
        
        // Step 3: Fix service records
        await fixServiceRecords();
        
        // Step 4: Verify fixes
        await verifyFixes();
        
        console.log('✅ ID Mapping fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during ID mapping fix:', error);
        process.exit(1);
    }
}

async function analyzeCurrentData() {
    console.log('📋 Step 1: Analyzing current data structure...\n');
    
    try {
        // Check User table
        console.log('Checking User table...');
        const userScanResult = await docClient.send(new ScanCommand({
            TableName: USER_TABLE,
            Limit: 10
        }));
        
        if (userScanResult.Items && userScanResult.Items.length > 0) {
            console.log(\`Found \${userScanResult.Items.length} users:\`);
            userScanResult.Items.forEach((user, index) => {
                console.log(\`  \${index + 1}. ID: \${user.id}\`);
                console.log(\`     CognitoID: \${user.cognitoId || 'MISSING'}\`);
                console.log(\`     Email: \${user.email}\`);
                console.log(\`     Username: \${user.username}\`);
                console.log('');
            });
        } else {
            console.log('❌ No users found in User table');
            return;
        }
        
        // Check Service table
        console.log('Checking Service table...');
        const serviceScanResult = await docClient.send(new ScanCommand({
            TableName: SERVICE_TABLE,
            Limit: 10
        }));
        
        if (serviceScanResult.Items && serviceScanResult.Items.length > 0) {
            console.log(\`Found \${serviceScanResult.Items.length} services:\`);
            serviceScanResult.Items.forEach((service, index) => {
                console.log(\`  \${index + 1}. ID: \${service.id}\`);
                console.log(\`     UserID: \${service.userId}\`);
                console.log(\`     Title: \${service.title}\`);
                console.log('');
            });
        } else {
            console.log('❌ No services found in Service table');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing data:', error.message);
        throw error;
    }
}

async function fixUserRecords() {
    console.log('📋 Step 2: Fixing user records...\n');
    
    try {
        const userScanResult = await docClient.send(new ScanCommand({
            TableName: USER_TABLE
        }));
        
        if (!userScanResult.Items || userScanResult.Items.length === 0) {
            console.log('No users to fix');
            return;
        }
        
        for (const user of userScanResult.Items) {
            // Check if user is missing cognitoId
            if (!user.cognitoId) {
                console.log(\`⚠️  User \${user.id} missing cognitoId\`);
                
                // For now, we'll use the username as a placeholder
                // In a real scenario, you'd need to map this to actual Cognito IDs
                const cognitoId = user.username || user.email;
                
                try {
                    await docClient.send(new UpdateCommand({
                        TableName: USER_TABLE,
                        Key: { id: user.id },
                        UpdateExpression: 'SET cognitoId = :cognitoId',
                        ExpressionAttributeValues: {
                            ':cognitoId': cognitoId
                        }
                    }));
                    
                    console.log(\`✅ Updated user \${user.id} with cognitoId: \${cognitoId}\`);
                } catch (updateError) {
                    console.error(\`❌ Failed to update user \${user.id}:, updateError.message\`);
                }
            } else {
                console.log(\`✅ User \${user.id} already has cognitoId: \${user.cognitoId}\`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error fixing user records:', error.message);
        throw error;
    }
}

async function fixServiceRecords() {
    console.log('📋 Step 3: Fixing service records...\n');
    
    try {
        // Get all users for reference
        const userScanResult = await docClient.send(new ScanCommand({
            TableName: USER_TABLE
        }));
        
        if (!userScanResult.Items || userScanResult.Items.length === 0) {
            console.log('No users found for service mapping');
            return;
        }
        
        // Create mapping from cognitoId to DynamoDB ID
        const cognitoToDbIdMap = {};
        const usernameToDbIdMap = {};
        
        userScanResult.Items.forEach(user => {
            if (user.cognitoId) {
                cognitoToDbIdMap[user.cognitoId] = user.id;
            }
            if (user.username) {
                usernameToDbIdMap[user.username] = user.id;
            }
        });
        
        console.log('User ID mappings created:');
        console.log('CognitoId -> DynamoDB ID:', cognitoToDbIdMap);
        console.log('Username -> DynamoDB ID:', usernameToDbIdMap);
        console.log('');
        
        // Get all services
        const serviceScanResult = await docClient.send(new ScanCommand({
            TableName: SERVICE_TABLE
        }));
        
        if (!serviceScanResult.Items || serviceScanResult.Items.length === 0) {
            console.log('No services to fix');
            return;
        }
        
        for (const service of serviceScanResult.Items) {
            console.log(\`Checking service \${service.id} with userId: \${service.userId}\`);
            
            // Check if the userId exists in the User table
            const userExists = userScanResult.Items.some(user => user.id === service.userId);
            
            if (userExists) {
                console.log(\`✅ Service \${service.id} has valid userId: \${service.userId}\`);
                continue;
            }
            
            // Try to find the correct user ID
            let correctUserId = null;
            
            // Check if userId is actually a cognitoId
            if (cognitoToDbIdMap[service.userId]) {
                correctUserId = cognitoToDbIdMap[service.userId];
                console.log(\`🔄 Service \${service.id} userId appears to be cognitoId, mapping to: \${correctUserId}\`);
            }
            // Check if userId is actually a username
            else if (usernameToDbIdMap[service.userId]) {
                correctUserId = usernameToDbIdMap[service.userId];
                console.log(\`🔄 Service \${service.id} userId appears to be username, mapping to: \${correctUserId}\`);
            }
            
            if (correctUserId) {
                try {
                    await docClient.send(new UpdateCommand({
                        TableName: SERVICE_TABLE,
                        Key: { id: service.id },
                        UpdateExpression: 'SET userId = :userId',
                        ExpressionAttributeValues: {
                            ':userId': correctUserId
                        }
                    }));
                    
                    console.log(\`✅ Updated service \${service.id} userId from \${service.userId} to \${correctUserId}\`);
                } catch (updateError) {
                    console.error(\`❌ Failed to update service \${service.id}:, updateError.message\`);
                }
            } else {
                console.log(\`⚠️  Could not find correct userId for service \${service.id}\`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error fixing service records:', error.message);
        throw error;
    }
}

async function verifyFixes() {
    console.log('📋 Step 4: Verifying fixes...\n');
    
    try {
        // Check that all users have cognitoId
        const userScanResult = await docClient.send(new ScanCommand({
            TableName: USER_TABLE
        }));
        
        const usersWithoutCognitoId = userScanResult.Items?.filter(user => !user.cognitoId) || [];
        
        if (usersWithoutCognitoId.length === 0) {
            console.log('✅ All users have cognitoId');
        } else {
            console.log(\`⚠️  \${usersWithoutCognitoId.length} users still missing cognitoId\`);
        }
        
        // Check that all services have valid userId
        const serviceScanResult = await docClient.send(new ScanCommand({
            TableName: SERVICE_TABLE
        }));
        
        let validServices = 0;
        let invalidServices = 0;
        
        if (serviceScanResult.Items) {
            for (const service of serviceScanResult.Items) {
                const userExists = userScanResult.Items?.some(user => user.id === service.userId);
                if (userExists) {
                    validServices++;
                } else {
                    invalidServices++;
                    console.log(\`⚠️  Service \${service.id} still has invalid userId: \${service.userId}\`);
                }
            }
        }
        
        console.log(\`✅ \${validServices} services have valid userId\`);
        if (invalidServices > 0) {
            console.log(\`⚠️  \${invalidServices} services still have invalid userId\`);
        }
        
        // Test a sample query
        if (userScanResult.Items && userScanResult.Items.length > 0) {
            const sampleUser = userScanResult.Items[0];
            console.log(\`\\nTesting servicesByUserId query for user: \${sampleUser.id}\`);
            
            try {
                const servicesByUserResult = await docClient.send(new QueryCommand({
                    TableName: SERVICE_TABLE,
                    IndexName: 'byUserId',
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: {
                        ':userId': sampleUser.id
                    }
                }));
                
                console.log(\`✅ Found \${servicesByUserResult.Items?.length || 0} services for user \${sampleUser.id}\`);
                
                if (servicesByUserResult.Items && servicesByUserResult.Items.length > 0) {
                    servicesByUserResult.Items.forEach(service => {
                        console.log(\`   - \${service.title} (ID: \${service.id})\`);
                    });
                }
                
            } catch (queryError) {
                console.error('❌ Error testing servicesByUserId query:', queryError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error verifying fixes:', error.message);
        throw error;
    }
}

// Helper function to get table names from environment or prompt user
async function getTableNames() {
    console.log('⚠️  Please update the table names in this script:');
    console.log(\`   USER_TABLE: \${USER_TABLE}\`);
    console.log(\`   SERVICE_TABLE: \${SERVICE_TABLE}\`);
    console.log('');
    console.log('You can find the actual table names in:');
    console.log('1. AWS DynamoDB Console');
    console.log('2. AWS Amplify Console -> Backend environments');
    console.log('3. Your amplify/backend/api/hourbankapp/build/ directory');
    console.log('');
    
    // For now, we'll use the placeholder names
    // In a real scenario, you'd want to get these dynamically
}

// Main execution
if (require.main === module) {
    console.log('🔧 User/Service ID Mapping Fix Tool');
    console.log('=====================================\\n');
    
    getTableNames().then(() => {
        console.log('Starting fix process...\\n');
        return fixIdMapping();
    }).catch(error => {
        console.error('❌ Fix process failed:', error);
        process.exit(1);
    });
}

module.exports = {
    fixIdMapping,
    analyzeCurrentData,
    fixUserRecords,
    fixServiceRecords,
    verifyFixes
};
