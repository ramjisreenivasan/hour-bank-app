#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateHtmlFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const issues = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      issues.push(...validateHtmlFiles(fullPath));
    } else if (file.name.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for common issues
        if (line.includes('[[') || line.includes(']]')) {
          issues.push(`${fullPath}:${index + 1} - Double brackets found: ${line.trim()}`);
        }
        
        // Check for stray p tags
        if (line.trim().startsWith('<p><div')) {
          issues.push(`${fullPath}:${index + 1} - Stray <p> tag before <div>: ${line.trim()}`);
        }
        
        // Check for @ symbol that might be interpreted as control flow
        if (line.includes('@{{') || (line.includes('@') && line.includes('{{') && !line.includes('&#64;'))) {
          issues.push(`${fullPath}:${index + 1} - Potential @ symbol issue (use &#64; instead): ${line.trim()}`);
        }
        
        // Check for unclosed Angular directives
        const openBrackets = (line.match(/\[/g) || []).length;
        const closeBrackets = (line.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets && (line.includes('*ng') || line.includes('[(') || line.includes('[('))) {
          issues.push(`${fullPath}:${index + 1} - Potential unclosed brackets: ${line.trim()}`);
        }
      });
    }
  }
  
  return issues;
}

function validateTsFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const issues = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      issues.push(...validateTsFiles(fullPath));
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for missing imports
      if (content.includes('FormsModule') && content.includes('ngModel')) {
        if (!content.includes('imports: [') || !content.includes('FormsModule')) {
          issues.push(`${fullPath} - Uses ngModel but may be missing FormsModule import`);
        }
      }
      
      if (content.includes('routerLink') || content.includes('routerLinkActive')) {
        if (!content.includes('RouterLink') || !content.includes('RouterLinkActive')) {
          issues.push(`${fullPath} - Uses router directives but may be missing imports`);
        }
      }
      
      // Check for enum string literals (but exclude enum definitions)
      const enumStringLiterals = content.match(/'(PENDING|IN_PROGRESS|COMPLETED|CANCELLED)'/g);
      if (enumStringLiterals && enumStringLiterals.length > 0 && content.includes('TransactionStatus') && !content.includes('enum TransactionStatus')) {
        issues.push(`${fullPath} - Found string literals instead of TransactionStatus enum: ${enumStringLiterals.join(', ')}`);
      }
    }
  }
  
  return issues;
}

function checkMethodAccessibility(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const issues = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      issues.push(...checkMethodAccessibility(fullPath));
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
            issues.push(`${fullPath} - Private method '${method}' is called from template`);
          }
        }
      }
    }
  }
  
  return issues;
}

console.log('Validating Angular application syntax...\n');

const srcDir = path.join(__dirname, 'src');
const htmlIssues = validateHtmlFiles(srcDir);
const tsIssues = validateTsFiles(srcDir);
const accessibilityIssues = checkMethodAccessibility(path.join(srcDir, 'app/components'));

const allIssues = [...htmlIssues, ...tsIssues, ...accessibilityIssues];

if (allIssues.length === 0) {
  console.log('✅ No syntax issues found!');
} else {
  console.log('❌ Issues found:');
  allIssues.forEach(issue => console.log(`  - ${issue}`));
}
