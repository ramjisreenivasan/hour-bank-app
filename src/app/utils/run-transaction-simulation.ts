/**
 * Simple script to run the transaction simulation
 * This can be called from the browser console or integrated into the admin dashboard
 */

import { TransactionSimulationService } from '../services/transaction-simulation.service';
import { UserGraphQLService } from '../services/user-graphql.service';
import { TransactionGraphQLService } from '../services/transaction-graphql.service';
import { DataSimulationService } from '../services/data-simulation.service';

/**
 * Run the transaction simulation
 * Usage: Call this function from the browser console or admin interface
 */
export async function runTransactionSimulation(): Promise<void> {
  console.log('🚀 Initializing HourBank Transaction Simulation...');
  
  try {
    // Create service instances
    const userService = new UserGraphQLService();
    const transactionService = new TransactionGraphQLService();
    const dataSimulationService = new DataSimulationService();
    
    const simulationService = new TransactionSimulationService(
      userService,
      transactionService,
      dataSimulationService
    );
    
    // Run the simulation
    const result = await simulationService.runSimulation();
    
    console.log('🎉 Simulation completed successfully!');
    console.log('📊 Final Results:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    throw error;
  }
}

/**
 * Quick test function to verify the simulation setup
 */
export function testSimulationSetup(): void {
  console.log('🔧 Testing simulation setup...');
  
  try {
    const userService = new UserGraphQLService();
    const transactionService = new TransactionGraphQLService();
    const dataSimulationService = new DataSimulationService();
    
    const simulationService = new TransactionSimulationService(
      userService,
      transactionService,
      dataSimulationService
    );
    
    console.log('✅ All services initialized successfully');
    console.log('📋 Simulation parameters:');
    console.log('   - Period: June 1, 2025 to July 26, 2025');
    console.log('   - Volume: 5-8 weekday, 8-12 weekend transactions/day');
    console.log('   - Users: 20% regular, 60% casual, 20% inactive');
    console.log('   - Success Rate: 70% completed, 15% rejected, 10% cancelled, 5% pending');
    console.log('   - Economy: Realistic bank hour balance management');
    console.log('🚀 Ready to run simulation!');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
  }
}

// Make functions available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).runTransactionSimulation = runTransactionSimulation;
  (window as any).testSimulationSetup = testSimulationSetup;
}
