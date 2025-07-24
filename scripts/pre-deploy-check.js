#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Pre-Deployment Validation for HourBank Application\n');

const checks = [];

// Check 1: Verify all syntax issues are resolved
function checkSyntaxIssues() {
  try {
    console.log('✅ Running syntax validation...');
    execSync('node validate-syntax.js', { stdio: 'pipe' });
    checks.push({ name: 'Syntax Validation', status: 'PASS', message: 'No syntax issues found' });
  } catch (error) {
    checks.push({ name: 'Syntax Validation', status: 'FAIL', message: 'Syntax issues detected' });
  }
}

// Check 2: Verify build configuration
function checkBuildConfig() {
  const angularJson = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
  const buildConfig = angularJson.projects['hourbank-app']?.architect?.build;
  
  if (buildConfig && buildConfig.configurations && buildConfig.configurations.production) {
    checks.push({ name: 'Build Configuration', status: 'PASS', message: 'Production build config found' });
  } else {
    checks.push({ name: 'Build Configuration', status: 'FAIL', message: 'Missing production build configuration' });
  }
}

// Check 3: Verify Amplify configuration
function checkAmplifyConfig() {
  if (fs.existsSync('src/amplifyconfiguration.json')) {
    const config = JSON.parse(fs.readFileSync('src/amplifyconfiguration.json', 'utf8'));
    if (config.aws_user_pools_id && config.aws_user_pools_web_client_id) {
      checks.push({ name: 'Amplify Configuration', status: 'PASS', message: 'Cognito configuration found' });
    } else {
      checks.push({ name: 'Amplify Configuration', status: 'WARN', message: 'Incomplete Cognito configuration' });
    }
  } else {
    checks.push({ name: 'Amplify Configuration', status: 'FAIL', message: 'Missing amplifyconfiguration.json' });
  }
}

// Check 4: Verify dependencies
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['@angular/core', '@angular/router', 'aws-amplify'];
    const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missing.length === 0) {
      checks.push({ name: 'Dependencies', status: 'PASS', message: 'All required dependencies present' });
    } else {
      checks.push({ name: 'Dependencies', status: 'FAIL', message: `Missing: ${missing.join(', ')}` });
    }
  } catch (error) {
    checks.push({ name: 'Dependencies', status: 'FAIL', message: 'Cannot read package.json' });
  }
}

// Check 5: Verify environment files
function checkEnvironmentFiles() {
  const envFiles = ['src/environments/environment.ts', 'src/environments/environment.prod.ts'];
  const existing = envFiles.filter(file => fs.existsSync(file));
  
  if (existing.length >= 1) {
    checks.push({ name: 'Environment Files', status: 'PASS', message: `Found ${existing.length} environment file(s)` });
  } else {
    checks.push({ name: 'Environment Files', status: 'WARN', message: 'No environment files found' });
  }
}

// Check 6: Test build
function testBuild() {
  try {
    console.log('🔨 Testing production build...');
    execSync('ng build --configuration production', { stdio: 'pipe' });
    checks.push({ name: 'Production Build', status: 'PASS', message: 'Build successful' });
  } catch (error) {
    checks.push({ name: 'Production Build', status: 'FAIL', message: 'Build failed' });
  }
}

// Run all checks
function runChecks() {
  checkSyntaxIssues();
  checkBuildConfig();
  checkAmplifyConfig();
  checkDependencies();
  checkEnvironmentFiles();
  testBuild();
}

// Display results
function displayResults() {
  console.log('\n📊 Pre-Deployment Check Results:\n');
  console.log('┌─────────────────────────────┬────────┬─────────────────────────────────┐');
  console.log('│ Check                       │ Status │ Message                         │');
  console.log('├─────────────────────────────┼────────┼─────────────────────────────────┤');
  
  checks.forEach(check => {
    const statusColor = check.status === 'PASS' ? '\x1b[32m' : 
                       check.status === 'WARN' ? '\x1b[33m' : '\x1b[31m';
    const resetColor = '\x1b[0m';
    
    console.log(`│ ${check.name.padEnd(27)} │ ${statusColor}${check.status.padEnd(6)}${resetColor} │ ${check.message.padEnd(31)} │`);
  });
  
  console.log('└─────────────────────────────┴────────┴─────────────────────────────────┘\n');
  
  const failed = checks.filter(c => c.status === 'FAIL').length;
  const warnings = checks.filter(c => c.status === 'WARN').length;
  const passed = checks.filter(c => c.status === 'PASS').length;
  
  console.log(`Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);
  
  if (failed > 0) {
    console.log('❌ Deployment not recommended. Please fix the failed checks first.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Deployment possible but with warnings. Review the warnings above.\n');
  } else {
    console.log('✅ All checks passed! Ready for deployment.\n');
  }
}

// Main execution
runChecks();
displayResults();
