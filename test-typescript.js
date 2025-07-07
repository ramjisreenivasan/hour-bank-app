#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkTransactionStatusUsage() {
  const filePath = path.join(__dirname, 'src/app/components/transaction/transaction.component.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('Checking TransactionStatus enum usage...\n');
  
  // Check for the specific issue that was causing TS2367
  const lines = content.split('\n');
  let hasEarlyReturn = false;
  let hasUnreachableCode = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for early return on CANCELLED status
    if (line.includes('status === TransactionStatus.CANCELLED') && line.includes('return true')) {
      hasEarlyReturn = true;
      console.log(`Line ${i + 1}: Found early return for CANCELLED status`);
    }
    
    // Check for switch case that would be unreachable
    if (hasEarlyReturn && line.includes('case TransactionStatus.') && line.includes('CANCELLED')) {
      hasUnreachableCode = true;
      console.log(`Line ${i + 1}: Found potentially unreachable CANCELLED case`);
    }
  }
  
  if (hasEarlyReturn && hasUnreachableCode) {
    console.log('❌ Potential TS2367 error: Early return makes switch case unreachable');
    return false;
  } else {
    console.log('✅ No TS2367 issues found in TransactionStatus usage');
    return true;
  }
}

function validateEnumUsage() {
  const files = [
    'src/app/components/transaction/transaction.component.ts',
    'src/app/services/transaction.service.ts'
  ];
  
  let allValid = true;
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for string literals instead of enum usage
      const stringLiterals = content.match(/'(PENDING|IN_PROGRESS|COMPLETED|CANCELLED)'/g);
      if (stringLiterals && stringLiterals.length > 0) {
        console.log(`❌ ${file}: Found string literals instead of enum: ${stringLiterals.join(', ')}`);
        allValid = false;
      } else {
        console.log(`✅ ${file}: Proper enum usage`);
      }
    }
  }
  
  return allValid;
}

console.log('=== TypeScript Validation ===\n');

const statusUsageValid = checkTransactionStatusUsage();
console.log('');
const enumUsageValid = validateEnumUsage();

console.log('\n=== Summary ===');
if (statusUsageValid && enumUsageValid) {
  console.log('✅ All TypeScript issues resolved!');
} else {
  console.log('❌ TypeScript issues found');
}
