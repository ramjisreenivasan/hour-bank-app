#!/usr/bin/env ts-node

/**
 * Standalone Transaction Simulation Runner
 * This script runs the transaction simulation without requiring UI interaction
 */

import { TransactionSimulationService } from '../services/transaction-simulation.service';
import { UserGraphQLService } from '../services/user-graphql.service';
import { TransactionGraphQLService } from '../services/transaction-graphql.service';
import { DataSimulationService } from '../services/data-simulation.service';

/**
 * Initialize and run the transaction simulation
 */
async function runSimulation(): Promise<void> {
  console.log('🚀 Starting HourBank Transaction Simulation (Standalone Mode)');
  console.log('=' .repeat(70));
  
  try {
    // Initialize services
    console.log('🔧 Initializing services...');
    const userService = new UserGraphQLService();
    const transactionService = new TransactionGraphQLService();
    const dataSimulationService = new DataSimulationService();
    
    const simulationService = new TransactionSimulationService(
      userService,
      transactionService,
      dataSimulationService
    );
    
    console.log('✅ Services initialized successfully');
    console.log('📋 Simulation Configuration:');
    console.log('   📅 Period: June 1, 2025 to July 26, 2025 (56 days)');
    console.log('   📊 Volume: 5-8 weekday, 8-12 weekend transactions/day');
    console.log('   👥 Users: 20% regular, 60% casual, 20% inactive');
    console.log('   ✅ Success: 70% completed, 15% rejected, 10% cancelled, 5% pending');
    console.log('   ⭐ Ratings: 60% five stars, 25% four stars, realistic distribution');
    console.log('   💰 Economy: Realistic bank hour balance management');
    console.log('   🕐 Timing: Business hours requests, reasonable completion times');
    console.log('   💾 Data: Real persistent data in database');
    console.log('');
    
    // Run the simulation
    console.log('🎬 Starting simulation execution...');
    const startTime = Date.now();
    
    const result = await simulationService.runSimulation();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Final summary
    console.log('');
    console.log('🎉 SIMULATION COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(70));
    console.log(`⏱️  Execution Time: ${duration} seconds`);
    console.log(`📊 Total Transactions Generated: ${result.totalTransactions}`);
    console.log(`✅ Completed Transactions: ${result.completedTransactions}`);
    console.log(`💰 Bank Hours Transferred: ${result.totalBankHoursTransferred}`);
    console.log(`📈 Success Rate: ${((result.completedTransactions / result.totalTransactions) * 100).toFixed(1)}%`);
    console.log('');
    console.log('🔍 Detailed Breakdown:');
    console.log(`   ✅ Completed: ${result.completedTransactions} (${((result.completedTransactions / result.totalTransactions) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Rejected: ${result.rejectedTransactions} (${((result.rejectedTransactions / result.totalTransactions) * 100).toFixed(1)}%)`);
    console.log(`   🚫 Cancelled: ${result.cancelledTransactions} (${((result.cancelledTransactions / result.totalTransactions) * 100).toFixed(1)}%)`);
    console.log(`   ⏳ Pending: ${result.pendingTransactions} (${((result.pendingTransactions / result.totalTransactions) * 100).toFixed(1)}%)`);
    console.log('');
    console.log('💡 The simulation data is now available in your database!');
    console.log('   You can view the generated transactions in the admin dashboard');
    console.log('   or through the regular transaction interfaces.');
    console.log('');
    console.log('✨ Simulation completed successfully! ✨');
    
  } catch (error) {
    console.error('');
    console.error('❌ SIMULATION FAILED');
    console.error('=' .repeat(70));
    console.error('Error details:', error);
    console.error('');
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Ensure AWS Amplify is properly configured');
    console.error('   2. Check database connectivity');
    console.error('   3. Verify GraphQL schema is deployed');
    console.error('   4. Check authentication status');
    
    process.exit(1);
  }
}

/**
 * Quick validation of simulation setup
 */
async function validateSetup(): Promise<boolean> {
  console.log('🔍 Validating simulation setup...');
  
  try {
    const userService = new UserGraphQLService();
    const transactionService = new TransactionGraphQLService();
    const dataSimulationService = new DataSimulationService();
    
    // Test service initialization
    console.log('   ✅ UserGraphQLService initialized');
    console.log('   ✅ TransactionGraphQLService initialized');
    console.log('   ✅ DataSimulationService initialized');
    
    // Test data generation
    const testData = dataSimulationService.getSimulatedData();
    console.log(`   ✅ Test data generation: ${testData.users.length} users, ${testData.services.length} services`);
    
    console.log('✅ Setup validation passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup validation failed:', error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('🎯 HourBank Transaction Simulation Runner');
  console.log('   Generating realistic transaction data from June 2025 to today');
  console.log('');
  
  // Validate setup first
  const isSetupValid = await validateSetup();
  if (!isSetupValid) {
    console.error('❌ Setup validation failed. Please check your configuration.');
    process.exit(1);
  }
  
  console.log('');
  
  // Run the simulation
  await runSimulation();
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export { runSimulation, validateSetup };
