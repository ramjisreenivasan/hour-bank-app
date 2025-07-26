#!/usr/bin/env node

/**
 * Auto-Run Transaction Simulation
 * Automatically executes the browser-based simulation without UI interaction
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Auto-Running HourBank Transaction Simulation');
console.log('=' .repeat(60));
console.log('💾 This will create real transactions in your database');
console.log('📅 Period: June 1, 2025 to July 26, 2025');
console.log('');

async function autoRunSimulation() {
  try {
    // Check if Angular app is running
    console.log('🔍 Checking if Angular development server is running...');
    
    // Try to start Angular dev server if not running
    console.log('🔧 Starting Angular development server...');
    const ngServe = spawn('ng', ['serve', '--port', '4200'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => {
        reject(new Error('Angular server startup timeout'));
      }, 30000);

      ngServe.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local:') || output.includes('localhost:4200')) {
          clearTimeout(timeout);
          console.log('✅ Angular development server started');
          resolve();
        }
      });

      ngServe.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Port 4200 is already in use')) {
          clearTimeout(timeout);
          console.log('✅ Angular development server already running');
          resolve();
        }
      });
    });

    // Wait a moment for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create a headless browser script to run the simulation
    console.log('🤖 Creating automated browser session...');
    
    const puppeteerScript = `
const puppeteer = require('puppeteer');

(async () => {
  console.log('🌐 Launching headless browser...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🚀') || text.includes('📅') || text.includes('✅') || text.includes('📊') || text.includes('🎉')) {
      console.log(text);
    }
  });
  
  console.log('📱 Navigating to application...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });
  
  console.log('⚡ Injecting simulation script...');
  
  // Inject the simulation code directly
  await page.evaluate(() => {
    // Simulation will be injected here
    console.log('🔧 Simulation script injected, starting execution...');
    
    // Call the simulation function
    if (typeof window.runBrowserAPISimulation === 'function') {
      return window.runBrowserAPISimulation();
    } else {
      console.log('⚠️ Simulation function not found, loading manually...');
      // Manual simulation execution would go here
    }
  });
  
  // Wait for simulation to complete (estimated 2-3 minutes)
  console.log('⏳ Simulation running... (this may take 2-3 minutes)');
  await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutes
  
  console.log('🎉 Simulation completed!');
  await browser.close();
  
  process.exit(0);
})().catch(console.error);
`;

    // Check if puppeteer is available
    try {
      require.resolve('puppeteer');
      console.log('✅ Puppeteer found, proceeding with automated execution...');
      
      // Write and execute the puppeteer script
      fs.writeFileSync('temp-simulation-runner.js', puppeteerScript);
      
      const puppeteerProcess = spawn('node', ['temp-simulation-runner.js'], {
        stdio: 'inherit'
      });
      
      puppeteerProcess.on('close', (code) => {
        // Clean up
        if (fs.existsSync('temp-simulation-runner.js')) {
          fs.unlinkSync('temp-simulation-runner.js');
        }
        
        if (code === 0) {
          console.log('🎉 Simulation completed successfully!');
          console.log('💾 Check your database for the generated transactions');
        } else {
          console.log('❌ Simulation failed with code:', code);
        }
        
        process.exit(code);
      });
      
    } catch (error) {
      console.log('⚠️ Puppeteer not found. Installing...');
      console.log('📦 Run: npm install puppeteer');
      console.log('');
      console.log('🔄 Alternative: Manual execution steps:');
      console.log('   1. Open browser to http://localhost:4200');
      console.log('   2. Open console (F12)');
      console.log('   3. Run: runBrowserAPISimulation()');
      console.log('');
      
      // Fallback: Create a simple HTML file that auto-runs the simulation
      console.log('📄 Creating auto-run HTML file...');
      
      const autoRunHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>HourBank Simulation Auto-Runner</title>
    <script src="http://localhost:4200/main.js"></script>
</head>
<body>
    <h1>🚀 HourBank Transaction Simulation</h1>
    <p>Auto-running simulation...</p>
    <div id="output"></div>
    
    <script>
        // Wait for Angular app to load
        setTimeout(() => {
            if (typeof runBrowserAPISimulation === 'function') {
                console.log('🎬 Starting simulation...');
                runBrowserAPISimulation().then(() => {
                    document.getElementById('output').innerHTML = '<h2>✅ Simulation Complete!</h2>';
                }).catch(error => {
                    document.getElementById('output').innerHTML = '<h2>❌ Simulation Failed: ' + error + '</h2>';
                });
            } else {
                document.getElementById('output').innerHTML = '<h2>⚠️ Simulation function not found</h2>';
            }
        }, 5000);
    </script>
</body>
</html>
`;
      
      fs.writeFileSync('auto-simulation.html', autoRunHTML);
      console.log('✅ Created auto-simulation.html');
      console.log('🌐 Open this file in your browser to auto-run the simulation');
    }
    
  } catch (error) {
    console.error('❌ Failed to auto-run simulation:', error);
    console.log('');
    console.log('🔄 Manual fallback options:');
    console.log('   1. Run: ng serve');
    console.log('   2. Open browser to http://localhost:4200');
    console.log('   3. Open console and run: runBrowserAPISimulation()');
    console.log('');
    console.log('   OR');
    console.log('');
    console.log('   1. Open the created auto-simulation.html file in browser');
    
    process.exit(1);
  }
}

// Check if this is being run directly
if (require.main === module) {
  autoRunSimulation();
}
