# HourBank Transaction Simulation Instructions

## 🚀 How to Run the Real Database Simulation

The transaction simulation creates **real transactions** in your database using your existing users and services.

### **Method 1: Browser Console (Recommended)**

1. **Start your Angular app:**
   ```bash
   ng serve
   ```

2. **Open browser to your app:**
   ```
   http://localhost:4200
   ```

3. **Open browser console (F12)**

4. **Run the simulation:**
   ```javascript
   runBrowserAPISimulation()
   ```

5. **Watch the progress:**
   - Daily transaction creation progress
   - Weekly summaries
   - Final statistics

### **Method 2: Admin Dashboard UI**

1. **Start your Angular app:**
   ```bash
   ng serve
   ```

2. **Navigate to admin simulation:**
   ```
   http://localhost:4200/admin/transaction-simulation
   ```

3. **Select "Database Simulation" mode**

4. **Click "Start Simulation" button**

### **Method 3: Programmatic Integration**

```typescript
import { runBrowserAPISimulation } from './src/app/utils/browser-api-simulation';

// In your component or service
async runSimulation() {
  await runBrowserAPISimulation();
}
```

## 📊 What the Simulation Creates

### **Real Database Transactions:**
- **~300-350 transactions** from June 1, 2025 to July 26, 2025
- **Real bank hour transfers** between users
- **Realistic ratings and feedback** for completed services
- **Proper transaction statuses** (70% completed, 25% cancelled, 5% pending)

### **Uses Your Existing Data:**
- ✅ **Existing users** from your database
- ✅ **Existing services** from your database
- ✅ **Real GraphQL API calls** (createTransaction, updateTransaction, updateUser)
- ✅ **Persistent data** visible in admin dashboard

### **Realistic Patterns:**
- **Business hours:** Transactions requested 9 AM - 6 PM
- **Weekend activity:** Higher volume on weekends
- **User activity levels:** 20% regular, 60% casual, 20% inactive
- **Completion timing:** Services completed 0-3 days after request
- **Rating distribution:** 60% five stars, 25% four stars, realistic spread

## 🔍 Verification

After running the simulation, verify the data:

1. **Check Admin Dashboard:**
   - View transaction tables
   - See updated user bank hour balances
   - Review transaction history

2. **Database Verification:**
   - Query transaction tables directly
   - Check user balance updates
   - Verify rating and feedback data

3. **Console Output:**
   - Daily progress: "📅 2025-06-01: 8 created, 6 completed, 9h transferred"
   - Weekly summaries with statistics
   - Final completion report

## ⚡ Quick Demo

For a quick demonstration without database changes:

```bash
node run-simulation.js
```

This runs a mock version showing exactly what the real simulation does.

## 🛠️ Troubleshooting

### **"No users found"**
- Create some users through your app's registration
- Ensure users have sufficient bank hours (>0)

### **"No services found"**
- Create services through your app's service creation interface
- Ensure services are marked as active

### **"Simulation function not found"**
- Ensure you're on a page where the app has loaded
- Try refreshing the page and running again

### **Authentication errors**
- Make sure you're logged in to your app
- Check that your user has proper permissions

## 📈 Expected Output

```
🚀 Starting Browser API Transaction Simulation
📅 Period: June 1, 2025 to July 26, 2025
💾 Creating real transactions via GraphQL API
============================================================
🔄 Loading existing data from database...
✅ Loaded 15 users and 25 services
🔧 Initializing simulation parameters...
👥 User activity distribution: 3 regular, 9 casual, 3 inactive
📊 Daily Progress:
────────────────────────────────────────────────────────────
📅 2025-06-01: 8 created, 6 completed, 9h transferred
📅 2025-06-02: 7 created, 5 completed, 7h transferred
...
🎉 SIMULATION COMPLETE!
============================================================
📊 Final Statistics:
   Total transactions: 342
   Completed: 239 (69.9%)
   Cancelled: 86
   Pending: 17
   Bank hours transferred: 387
💾 All data saved to your database via GraphQL API
============================================================
```

## 🎯 Ready to Run!

The simulation is ready to create real transaction data in your database. Just open your browser console and run:

```javascript
runBrowserAPISimulation()
```

Your database will be populated with realistic transaction history! 🚀
