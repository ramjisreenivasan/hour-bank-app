#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkMethodAccessibility() {
  const componentsDir = path.join(__dirname, 'src/app/components');
  const issues = [];
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.name.endsWith('.component.ts')) {
        const tsContent = fs.readFileSync(fullPath, 'utf8');
        const htmlPath = fullPath.replace('.ts', '.html');
        
        if (fs.existsSync(htmlPath)) {
          const htmlContent = fs.readFileSync(htmlPath, 'utf8');
          
          // Extract private methods from TypeScript file
          const privateMethods = [];
          const privateMethodRegex = /private\s+([a-zA-Z][a-zA-Z0-9]*)\s*\(/g;
          let match;
          while ((match = privateMethodRegex.exec(tsContent)) !== null) {
            privateMethods.push(match[1]);
          }
          
          // Check if any private methods are called in HTML
          for (const method of privateMethods) {
            const methodCallRegex = new RegExp(`${method}\\s*\\(`, 'g');
            if (methodCallRegex.test(htmlContent)) {
              issues.push(`${fullPath}: Private method '${method}' is called from template`);
            }
          }
        }
      }
    }
  }
  
  processDirectory(componentsDir);
  return issues;
}

console.log('Checking method accessibility...\n');

const issues = checkMethodAccessibility();

if (issues.length === 0) {
  console.log('✅ No private method accessibility issues found!');
} else {
  console.log('❌ Accessibility issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}
