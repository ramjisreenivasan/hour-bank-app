/**
 * Test Transaction Creation
 * Quick test to verify transaction creation works with required fields
 */

import { generateClient } from 'aws-amplify/api';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

/**
 * Test creating a single transaction to verify the fix
 */
export async function testTransactionCreation(): Promise<boolean> {
  console.log('🧪 Testing transaction creation...');
  
  const client = generateClient();
  
  try {
    // Get existing users and services
    const usersResult = await client.graphql({
      query: queries.listUsers,
      variables: { limit: 5 }
    });
    
    const servicesResult = await client.graphql({
      query: queries.listServices,
      variables: { limit: 5 }
    });
    
    const users = (usersResult as any).data?.listUsers?.items || [];
    const services = (servicesResult as any).data?.listServices?.items || [];
    
    console.log(`📊 Found ${users.length} users and ${services.length} services`);
    
    if (users.length < 2) {
      console.error('❌ Need at least 2 users to test transaction creation');
      return false;
    }
    
    if (services.length === 0) {
      console.error('❌ Need at least 1 service to test transaction creation');
      return false;
    }
    
    // Select test data
    const service = services[0];
    const provider = users.find((u: any) => u.id === service.userId);
    const consumer = users.find((u: any) => u.id !== service.userId);
    
    if (!provider || !consumer) {
      console.error('❌ Could not find suitable provider and consumer');
      return false;
    }
    
    console.log(`👥 Testing with provider: ${provider.email}, consumer: ${consumer.email}`);
    console.log(`🛍️ Service: ${service.title}`);
    
    // Create test transaction with all required fields
    const transactionInput = {
      providerId: provider.id,
      consumerId: consumer.id,
      serviceId: service.id,
      hoursSpent: service.hourlyDuration || 1,
      status: 'PENDING', // Required field
      description: `Test transaction for ${service.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Creating transaction with input:', transactionInput);
    
    const createResult = await client.graphql({
      query: mutations.createTransaction,
      variables: { input: transactionInput }
    });
    
    const transaction = (createResult as any).data?.createTransaction;
    
    if (transaction) {
      console.log('✅ Transaction created successfully!');
      console.log('📋 Transaction details:', {
        id: transaction.id,
        status: transaction.status,
        hoursSpent: transaction.hoursSpent,
        description: transaction.description
      });
      
      // Test updating the transaction
      console.log('🔄 Testing transaction update...');
      
      const updateResult = await client.graphql({
        query: mutations.updateTransaction,
        variables: {
          input: {
            id: transaction.id,
            status: 'COMPLETED',
            rating: 5,
            feedback: 'Test feedback',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
      
      const updatedTransaction = (updateResult as any).data?.updateTransaction;
      
      if (updatedTransaction) {
        console.log('✅ Transaction updated successfully!');
        console.log('📋 Updated transaction:', {
          id: updatedTransaction.id,
          status: updatedTransaction.status,
          rating: updatedTransaction.rating,
          feedback: updatedTransaction.feedback
        });
        
        console.log('🎉 Transaction creation and update test PASSED!');
        return true;
      } else {
        console.error('❌ Transaction update failed');
        return false;
      }
      
    } else {
      console.error('❌ Transaction creation failed - no transaction returned');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Transaction test failed:', error);
    
    // Parse GraphQL errors for better debugging
    if (error.errors) {
      console.error('GraphQL Errors:');
      error.errors.forEach((err: any, index: number) => {
        console.error(`  ${index + 1}. ${err.message}`);
        if (err.path) console.error(`     Path: ${err.path.join('.')}`);
        if (err.locations) console.error(`     Location: Line ${err.locations[0].line}, Column ${err.locations[0].column}`);
      });
    }
    
    return false;
  }
}

/**
 * Quick diagnosis of simulation requirements
 */
export async function diagnoseSimulationRequirements(): Promise<void> {
  console.log('🔍 Diagnosing simulation requirements...');
  
  const client = generateClient();
  
  try {
    // Check authentication
    console.log('🔐 Checking authentication...');
    // Note: Auth check would go here if needed
    
    // Check users
    const usersResult = await client.graphql({
      query: queries.listUsers,
      variables: { limit: 10 }
    });
    
    const users = (usersResult as any).data?.listUsers?.items || [];
    console.log(`👥 Users: ${users.length} found`);
    
    if (users.length > 0) {
      const usersWithBankHours = users.filter((u: any) => (u.bankHours || 0) > 0);
      console.log(`💰 Users with bank hours: ${usersWithBankHours.length}`);
      
      users.slice(0, 3).forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.bankHours || 0} hours`);
      });
    }
    
    // Check services
    const servicesResult = await client.graphql({
      query: queries.listServices,
      variables: { limit: 10 }
    });
    
    const services = (servicesResult as any).data?.listServices?.items || [];
    console.log(`🛍️ Services: ${services.length} found`);
    
    if (services.length > 0) {
      const activeServices = services.filter((s: any) => s.isActive !== false);
      console.log(`✅ Active services: ${activeServices.length}`);
      
      services.slice(0, 3).forEach((service: any, index: number) => {
        console.log(`   ${index + 1}. ${service.title} - ${service.hourlyDuration || 1}h (${service.userId})`);
      });
    }
    
    // Check existing transactions
    const transactionsResult = await client.graphql({
      query: queries.listTransactions,
      variables: { limit: 5 }
    });
    
    const transactions = (transactionsResult as any).data?.listTransactions?.items || [];
    console.log(`📋 Existing transactions: ${transactions.length}`);
    
    // Summary
    console.log('\n📊 SIMULATION READINESS:');
    console.log(`   Users: ${users.length >= 2 ? '✅' : '❌'} (need at least 2)`);
    console.log(`   Services: ${services.length >= 1 ? '✅' : '❌'} (need at least 1)`);
    console.log(`   Bank Hours: ${users.some((u: any) => (u.bankHours || 0) > 0) ? '✅' : '❌'} (some users need hours)`);
    
    if (users.length >= 2 && services.length >= 1) {
      console.log('🚀 Ready for simulation! Run testTransactionCreation() to verify.');
    } else {
      console.log('⚠️ Create more users/services before running simulation.');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).testTransactionCreation = testTransactionCreation;
  (window as any).diagnoseSimulationRequirements = diagnoseSimulationRequirements;
  
  console.log('🧪 Test functions loaded!');
  console.log('   - testTransactionCreation() - Test creating a single transaction');
  console.log('   - diagnoseSimulationRequirements() - Check if ready for simulation');
}
