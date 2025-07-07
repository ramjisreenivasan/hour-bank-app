#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📦 Bundle Size Analyzer & Optimizer\n');

function analyzeDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = packageJson.dependencies || {};
  
  console.log('📋 Large Dependencies Analysis:\n');
  
  // Known large packages and their approximate sizes
  const knownSizes = {
    '@angular/material': '~150kB',
    '@angular/cdk': '~100kB',
    'aws-amplify': '~200kB',
    '@aws-amplify/ui-angular': '~80kB',
    '@angular/animations': '~50kB',
    'rxjs': '~40kB'
  };
  
  console.log('┌─────────────────────────────────┬──────────────┬─────────────────────────────────┐');
  console.log('│ Package                         │ Est. Size    │ Optimization Suggestions        │');
  console.log('├─────────────────────────────────┼──────────────┼─────────────────────────────────┤');
  
  Object.keys(deps).forEach(dep => {
    if (knownSizes[dep]) {
      const suggestions = getOptimizationSuggestions(dep);
      console.log(`│ ${dep.padEnd(31)} │ ${knownSizes[dep].padEnd(12)} │ ${suggestions.padEnd(31)} │`);
    }
  });
  
  console.log('└─────────────────────────────────┴──────────────┴─────────────────────────────────┘\n');
}

function getOptimizationSuggestions(packageName) {
  const suggestions = {
    '@angular/material': 'Tree-shake unused components',
    '@angular/cdk': 'Import specific modules only',
    'aws-amplify': 'Use selective imports',
    '@aws-amplify/ui-angular': 'Import specific UI components',
    '@angular/animations': 'Lazy load if not critical',
    'rxjs': 'Use pipeable operators only'
  };
  
  return suggestions[packageName] || 'Review usage';
}

function generateOptimizationStrategies() {
  console.log('🎯 Bundle Optimization Strategies:\n');
  
  console.log('1. **Tree Shaking Optimization**');
  console.log('   • Import only specific modules/components you use');
  console.log('   • Avoid importing entire libraries');
  console.log('   • Use ES6 imports instead of CommonJS\n');
  
  console.log('2. **Lazy Loading**');
  console.log('   • Load routes lazily');
  console.log('   • Defer non-critical features');
  console.log('   • Use dynamic imports for large components\n');
  
  console.log('3. **Code Splitting**');
  console.log('   • Split vendor bundles');
  console.log('   • Create separate chunks for different features');
  console.log('   • Use Angular\'s built-in code splitting\n');
  
  console.log('4. **Dependency Optimization**');
  console.log('   • Remove unused dependencies');
  console.log('   • Replace large libraries with smaller alternatives');
  console.log('   • Use CDN for common libraries\n');
}

function createOptimizedImports() {
  console.log('🔧 Optimized Import Examples:\n');
  
  console.log('**AWS Amplify - Before:**');
  console.log('```typescript');
  console.log('import Amplify from "aws-amplify";');
  console.log('```\n');
  
  console.log('**AWS Amplify - After:**');
  console.log('```typescript');
  console.log('import { Amplify } from "aws-amplify";');
  console.log('import { Auth } from "aws-amplify/auth";');
  console.log('import { Hub } from "aws-amplify/utils";');
  console.log('```\n');
  
  console.log('**Angular Material - Before:**');
  console.log('```typescript');
  console.log('import * as Material from "@angular/material";');
  console.log('```\n');
  
  console.log('**Angular Material - After:**');
  console.log('```typescript');
  console.log('import { MatButtonModule } from "@angular/material/button";');
  console.log('import { MatCardModule } from "@angular/material/card";');
  console.log('// Only import what you actually use');
  console.log('```\n');
}

function checkCurrentBudgets() {
  const angularJsonPath = path.join(process.cwd(), 'angular.json');
  if (fs.existsSync(angularJsonPath)) {
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
    const buildConfig = angularJson.projects['hourbank-app']?.architect?.build?.configurations?.production;
    
    if (buildConfig && buildConfig.budgets) {
      console.log('📊 Current Bundle Budgets:\n');
      buildConfig.budgets.forEach(budget => {
        console.log(`• ${budget.type}:`);
        console.log(`  - Warning: ${budget.maximumWarning}`);
        console.log(`  - Error: ${budget.maximumError}`);
        
        if (budget.type === 'initial') {
          console.log(`  - Current Issue: Bundle is 547.71kB (exceeds 500kB warning)`);
          console.log(`  - Status: Under 1MB error limit, but needs optimization`);
        }
        console.log('');
      });
    }
  }
}

function provideSolutions() {
  console.log('💡 Immediate Solutions:\n');
  
  console.log('**Option 1: Increase Budget (Quick Fix)**');
  console.log('```json');
  console.log('{');
  console.log('  "type": "initial",');
  console.log('  "maximumWarning": "600kB",');
  console.log('  "maximumError": "1MB"');
  console.log('}');
  console.log('```\n');
  
  console.log('**Option 2: Optimize Bundle (Recommended)**');
  console.log('• Implement tree shaking');
  console.log('• Use lazy loading for routes');
  console.log('• Optimize AWS Amplify imports');
  console.log('• Remove unused Angular Material components\n');
  
  console.log('**Option 3: Code Splitting**');
  console.log('• Split vendor bundles');
  console.log('• Create feature-specific chunks');
  console.log('• Use dynamic imports\n');
}

// Main execution
console.log('🔍 Analyzing your HourBank application bundle...\n');

analyzeDependencies();
checkCurrentBudgets();
generateOptimizationStrategies();
createOptimizedImports();
provideSolutions();

console.log('📈 Bundle Analysis Complete!');
console.log('Choose the optimization strategy that best fits your needs.');
