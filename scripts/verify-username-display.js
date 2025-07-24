#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('👤 hOurBank Username Display Verification');
console.log('=========================================\n');

// Files to check for proper username display
const componentsToCheck = [
  {
    name: 'Dashboard Component',
    htmlPath: 'src/app/components/dashboard/dashboard.component.html',
    tsPath: 'src/app/components/dashboard/dashboard.component.ts'
  },
  {
    name: 'Transaction Component',
    htmlPath: 'src/app/components/transaction/transaction.component.html',
    tsPath: 'src/app/components/transaction/transaction.component.ts'
  },
  {
    name: 'Profile Component',
    htmlPath: 'src/app/components/profile/profile.component.html',
    tsPath: 'src/app/components/profile/profile.component.ts'
  },
  {
    name: 'Services Browse Component',
    htmlPath: null,
    tsPath: 'src/app/components/services/services-browse.component.ts'
  },
  {
    name: 'Service Detail Component',
    htmlPath: null,
    tsPath: 'src/app/components/services/service-detail.component.ts'
  },
  {
    name: 'Community Browse Component',
    htmlPath: null,
    tsPath: 'src/app/components/community/community-browse.component.ts'
  }
];

let totalIssues = 0;
let totalChecks = 0;

console.log('Checking components for proper username display...\n');

componentsToCheck.forEach(component => {
  console.log(`📄 ${component.name}:`);
  
  let componentIssues = 0;
  let componentChecks = 0;

  // Check TypeScript file
  if (component.tsPath) {
    const tsPath = path.join(__dirname, component.tsPath);
    if (fs.existsSync(tsPath)) {
      const tsContent = fs.readFileSync(tsPath, 'utf8');
      
      // Check for UserDisplayService import
      if (tsContent.includes('UserDisplayService')) {
        console.log('   ✅ UserDisplayService imported');
      } else {
        console.log('   ⚠️  UserDisplayService not imported');
        componentIssues++;
      }
      componentChecks++;

      // Check for proper username methods
      if (tsContent.includes('getUserUsername') || tsContent.includes('getDisplayName')) {
        console.log('   ✅ Username display methods found');
      } else if (tsContent.includes('?.username')) {
        console.log('   ⚠️  Direct username access found (consider using display service)');
        componentIssues++;
      }
      componentChecks++;

    } else {
      console.log(`   ❌ TypeScript file not found: ${component.tsPath}`);
      componentIssues++;
    }
  }

  // Check HTML file
  if (component.htmlPath) {
    const htmlPath = path.join(__dirname, component.htmlPath);
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Check for proper username display methods
      if (htmlContent.includes('getUserUsername') || htmlContent.includes('getOtherPartyUsername')) {
        console.log('   ✅ Username display methods used in template');
      } else if (htmlContent.includes('?.username')) {
        console.log('   ⚠️  Direct username access in template');
        componentIssues++;
      }
      componentChecks++;

      // Check for user ID displays
      const userIdMatches = htmlContent.match(/\{\{\s*[^}]*\.id\s*\}\}/g);
      if (userIdMatches) {
        console.log(`   ⚠️  Found ${userIdMatches.length} potential user ID displays`);
        componentIssues++;
      }
      componentChecks++;

    } else if (component.htmlPath) {
      console.log(`   ❌ HTML file not found: ${component.htmlPath}`);
      componentIssues++;
    }
  }

  if (componentIssues === 0) {
    console.log('   ✅ No issues found');
  } else {
    console.log(`   ❌ ${componentIssues} issue(s) found`);
  }

  totalIssues += componentIssues;
  totalChecks += componentChecks;
  console.log('');
});

// Check if UserDisplayService exists
const userDisplayServicePath = path.join(__dirname, 'src/app/services/user-display.service.ts');
if (fs.existsSync(userDisplayServicePath)) {
  console.log('✅ UserDisplayService created successfully');
  
  const serviceContent = fs.readFileSync(userDisplayServicePath, 'utf8');
  const methods = [
    'getDisplayName',
    'getShortDisplayName', 
    'getFullNameOrUsername',
    'getUsername',
    'getListDisplayName',
    'getInitials'
  ];
  
  methods.forEach(method => {
    if (serviceContent.includes(method)) {
      console.log(`   ✅ ${method} method available`);
    } else {
      console.log(`   ❌ ${method} method missing`);
      totalIssues++;
    }
  });
} else {
  console.log('❌ UserDisplayService not found');
  totalIssues++;
}

console.log('\n📊 Summary:');
console.log(`   Total checks performed: ${totalChecks}`);
console.log(`   Issues found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n🎉 All components properly display usernames!');
} else {
  console.log('\n⚠️  Some components may need updates for consistent username display.');
}

console.log('\n💡 Best Practices:');
console.log('   • Use UserDisplayService methods instead of direct .username access');
console.log('   • Prefer getUserUsername() for consistent username display');
console.log('   • Use getDisplayName() for user-friendly names');
console.log('   • Avoid displaying raw user IDs in the UI');
console.log('   • Consider fallbacks for missing user data');

console.log('\n🔧 Available UserDisplayService Methods:');
console.log('   • getDisplayName(user) - Primary display name');
console.log('   • getUsername(user) - Username with fallbacks');
console.log('   • getShortDisplayName(user) - Compact display');
console.log('   • getFullNameOrUsername(user) - Full name or username');
console.log('   • getListDisplayName(user) - For lists (username + full name)');
console.log('   • getInitials(user) - For avatars');
