#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 CSS Bundle Size Optimizer\n');

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' kB';
}

function analyzeCSSFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const cssFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      cssFiles.push(...analyzeCSSFiles(fullPath));
    } else if (file.name.endsWith('.scss') || file.name.endsWith('.css')) {
      const stats = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      cssFiles.push({
        path: fullPath.replace(process.cwd() + '/', ''),
        size: stats.size,
        lines: content.split('\n').length,
        rules: (content.match(/\{/g) || []).length,
        mediaQueries: (content.match(/@media/g) || []).length
      });
    }
  }
  
  return cssFiles;
}

function checkBudgets() {
  const angularJsonPath = path.join(process.cwd(), 'angular.json');
  if (fs.existsSync(angularJsonPath)) {
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
    const buildConfig = angularJson.projects['hourbank-app']?.architect?.build?.configurations?.production;
    
    if (buildConfig && buildConfig.budgets) {
      console.log('📊 Current Angular Build Budgets:');
      buildConfig.budgets.forEach(budget => {
        console.log(`  - ${budget.type}: Warning ${budget.maximumWarning}, Error ${budget.maximumError}`);
      });
      console.log('');
      return buildConfig.budgets;
    }
  }
  return [];
}

function provideSuggestions(files) {
  console.log('💡 Optimization Suggestions:\n');
  
  const largeFiles = files.filter(f => f.size > 8000);
  if (largeFiles.length > 0) {
    console.log('🔍 Large CSS Files (>8kB):');
    largeFiles.forEach(file => {
      console.log(`  - ${file.path}: ${formatBytes(file.size)}`);
      console.log(`    • Consider using CSS placeholders (%placeholder) for repeated styles`);
      console.log(`    • Combine similar selectors`);
      console.log(`    • Remove unused styles`);
      console.log(`    • Use shorthand properties where possible`);
    });
    console.log('');
  }
  
  const filesWithManyRules = files.filter(f => f.rules > 100);
  if (filesWithManyRules.length > 0) {
    console.log('📏 Files with Many CSS Rules (>100):');
    filesWithManyRules.forEach(file => {
      console.log(`  - ${file.path}: ${file.rules} rules`);
      console.log(`    • Consider splitting into multiple components`);
      console.log(`    • Use CSS modules or utility classes`);
    });
    console.log('');
  }
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  console.log(`📈 Total CSS Size: ${formatBytes(totalSize)}`);
  
  if (totalSize > 50000) {
    console.log('⚠️  Consider implementing CSS tree-shaking or purging unused styles');
  }
}

function generateOptimizationReport(files) {
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    largestFile: files.reduce((max, f) => f.size > max.size ? f : max, files[0]),
    averageSize: files.reduce((sum, f) => sum + f.size, 0) / files.length,
    files: files.map(f => ({
      path: f.path,
      size: f.size,
      sizeFormatted: formatBytes(f.size),
      rules: f.rules,
      mediaQueries: f.mediaQueries
    }))
  };
  
  fs.writeFileSync('css-optimization-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to: css-optimization-report.json\n');
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
const cssFiles = analyzeCSSFiles(srcDir);

console.log('📋 CSS File Analysis:\n');
console.log('┌─────────────────────────────────────────────────┬──────────┬───────┬──────────┐');
console.log('│ File                                            │ Size     │ Rules │ Media    │');
console.log('├─────────────────────────────────────────────────┼──────────┼───────┼──────────┤');

cssFiles.forEach(file => {
  const fileName = file.path.length > 47 ? '...' + file.path.slice(-44) : file.path;
  const size = formatBytes(file.size);
  console.log(`│ ${fileName.padEnd(47)} │ ${size.padStart(8)} │ ${file.rules.toString().padStart(5)} │ ${file.mediaQueries.toString().padStart(8)} │`);
});

console.log('└─────────────────────────────────────────────────┴──────────┴───────┴──────────┘\n');

checkBudgets();
provideSuggestions(cssFiles);
generateOptimizationReport(cssFiles);

console.log('✅ CSS optimization analysis complete!');
