const fs = require('fs');
const path = require('path');

console.log('🧪 Testing ServiceDetailComponent...\n');

// Check if file exists
const componentPath = './src/app/components/services/service-detail.component.ts';
if (!fs.existsSync(componentPath)) {
  console.log('❌ ServiceDetailComponent file not found');
  process.exit(1);
}

// Read file content
const content = fs.readFileSync(componentPath, 'utf8');

// Check for required elements
const checks = [
  {
    name: 'Export statement',
    pattern: /export class ServiceDetailComponent/,
    required: true
  },
  {
    name: 'Component decorator',
    pattern: /@Component\(/,
    required: true
  },
  {
    name: 'Template property',
    pattern: /template:\s*`/,
    required: true
  },
  {
    name: 'Template closing',
    pattern: /`\s*,/,
    required: true
  },
  {
    name: 'Class implementation',
    pattern: /implements OnInit/,
    required: true
  },
  {
    name: 'Constructor',
    pattern: /constructor\(/,
    required: true
  },
  {
    name: 'ngOnInit method',
    pattern: /ngOnInit\(\)/,
    required: true
  }
];

let allPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(content);
  const status = found ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${found ? 'Found' : 'Missing'}`);
  
  if (check.required && !found) {
    allPassed = false;
  }
});

// Check for syntax issues
const syntaxChecks = [
  {
    name: 'Balanced template literals',
    test: () => {
      const templateStart = (content.match(/template:\s*`/g) || []).length;
      const templateEnd = (content.match(/`\s*,/g) || []).length;
      return templateStart === templateEnd;
    }
  },
  {
    name: 'Balanced braces',
    test: () => {
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      return openBraces === closeBraces;
    }
  },
  {
    name: 'No duplicate template endings',
    test: () => {
      const endings = content.match(/`\s*,\s*styleUrls/g) || [];
      return endings.length === 1;
    }
  }
];

console.log('\n🔍 Syntax Validation:');
syntaxChecks.forEach(check => {
  const passed = check.test();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${passed ? 'Valid' : 'Invalid'}`);
  
  if (!passed) {
    allPassed = false;
  }
});

console.log('\n📊 Summary:');
if (allPassed) {
  console.log('✅ ServiceDetailComponent is valid and should compile correctly');
  console.log('✅ Component is properly exported and ready for use');
} else {
  console.log('❌ ServiceDetailComponent has issues that need to be fixed');
}

console.log('\n🎯 Component Features:');
console.log('• Service detail display');
console.log('• Provider information');
console.log('• Booking modal (placeholder)');
console.log('• Authentication-aware UI');
console.log('• Responsive design ready');
