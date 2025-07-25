import { DataSimulationService } from '../services/data-simulation.service';

/**
 * Script to generate and export simulation data
 * Run this to create realistic transaction history for the HourBank application
 */

// Create an instance of the simulation service
const simulationService = new DataSimulationService();

// Generate the simulation data
console.log('🚀 Generating HourBank simulation data...\n');

const simulatedData = simulationService.getSimulatedData();

console.log('📊 Simulation Results:');
console.log(`👥 Users: ${simulatedData.users.length}`);
console.log(`🛍️ Services: ${simulatedData.services.length}`);
console.log(`💳 Transactions: ${simulatedData.transactions.length}`);
console.log(`📅 Bookings: ${simulatedData.bookings.length}\n`);

// Display user bank hours summary
console.log('💰 User Bank Hours Summary:');
console.log('─'.repeat(60));
simulatedData.users.forEach(user => {
  const earned = simulatedData.transactions
    .filter(t => t.providerId === user.id && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.hoursSpent, 0);
  
  const spent = simulatedData.transactions
    .filter(t => t.consumerId === user.id && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.hoursSpent, 0);

  console.log(`${user.firstName} ${user.lastName}: ${user.bankHours} hours (Earned: ${earned + 10}, Spent: ${spent})`);
});

// Display transaction summary by category
console.log('\n📈 Transaction Summary by Category:');
console.log('─'.repeat(60));
const categoryStats: { [key: string]: { count: number, totalHours: number } } = {};

simulatedData.transactions.forEach(transaction => {
  const service = simulatedData.services.find(s => s.id === transaction.serviceId);
  if (service) {
    if (!categoryStats[service.category]) {
      categoryStats[service.category] = { count: 0, totalHours: 0 };
    }
    categoryStats[service.category].count++;
    categoryStats[service.category].totalHours += transaction.hoursSpent;
  }
});

Object.entries(categoryStats)
  .sort(([,a], [,b]) => b.count - a.count)
  .forEach(([category, stats]) => {
    console.log(`${category}: ${stats.count} transactions, ${stats.totalHours} hours`);
  });

// Display recent transactions
console.log('\n🕒 Recent Transactions (Last 10):');
console.log('─'.repeat(80));
const recentTransactions = simulatedData.transactions
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);

recentTransactions.forEach(transaction => {
  const provider = simulatedData.users.find(u => u.id === transaction.providerId);
  const consumer = simulatedData.users.find(u => u.id === transaction.consumerId);
  const service = simulatedData.services.find(s => s.id === transaction.serviceId);
  
  const date = new Date(transaction.createdAt).toLocaleDateString();
  console.log(`${date}: ${consumer?.firstName} → ${provider?.firstName} | ${service?.title} | ${transaction.hoursSpent}h | ⭐${transaction.rating}`);
});

// Export data to JSON files (for development/testing purposes)
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../assets/simulation-data');

// Create directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write data files
fs.writeFileSync(
  path.join(dataDir, 'users.json'),
  JSON.stringify(simulatedData.users, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'services.json'),
  JSON.stringify(simulatedData.services, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'transactions.json'),
  JSON.stringify(simulatedData.transactions, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'bookings.json'),
  JSON.stringify(simulatedData.bookings, null, 2)
);

// Create a combined data file
fs.writeFileSync(
  path.join(dataDir, 'simulation-data.json'),
  JSON.stringify(simulatedData, null, 2)
);

console.log('\n✅ Simulation data generated and saved to src/assets/simulation-data/');
console.log('📁 Files created:');
console.log('   - users.json');
console.log('   - services.json');
console.log('   - transactions.json');
console.log('   - bookings.json');
console.log('   - simulation-data.json (combined)');

console.log('\n🎯 Key Insights:');
console.log(`• Total hours in circulation: ${simulatedData.users.reduce((sum, u) => sum + u.bankHours, 0)}`);
console.log(`• Average user rating: ${(simulatedData.users.reduce((sum, u) => sum + u.rating, 0) / simulatedData.users.length).toFixed(1)}`);
console.log(`• Most active category: ${Object.entries(categoryStats).sort(([,a], [,b]) => b.count - a.count)[0][0]}`);
console.log(`• Average transaction rating: ${(simulatedData.transactions.reduce((sum, t) => sum + (t.rating || 0), 0) / simulatedData.transactions.length).toFixed(1)}`);

export { simulatedData };
