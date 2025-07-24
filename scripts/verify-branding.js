#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏦 hOurBank Branding Verification');
console.log('================================\n');

// Files to check for branding consistency
const filesToCheck = [
  'src/index.html',
  'src/app/app.component.html',
  'src/app/app.component.ts',
  'src/app/components/auth/auth.component.html',
  'src/app/components/landing/landing.component.html',
  'src/app/components/about/about.component.html',
  'src/app/components/dashboard/dashboard.component.html',
  'src/app/components/how-it-works/how-it-works.component.ts',
  'src/app/components/services/service-detail.component.ts',
  'src/app/components/community/community-browse.component.ts',
  'src/styles.scss'
];

let totalOldOccurrences = 0;
let totalHOccurrences = 0;
let updatedOccurrences = 0;

console.log('Checking files for branding consistency...\n');

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const oldBrandMatches = content.match(/HourBank/g);
    const hBrandMatches = content.match(/HOurBank/g);
    const newBrandMatches = content.match(/hOurBank/g);
    
    if (oldBrandMatches || hBrandMatches || newBrandMatches) {
      console.log(`📄 ${filePath}:`);
      
      if (oldBrandMatches) {
        console.log(`   ❌ Found ${oldBrandMatches.length} instances of "HourBank"`);
        totalOldOccurrences += oldBrandMatches.length;
      }
      
      if (hBrandMatches) {
        console.log(`   ⚠️  Found ${hBrandMatches.length} instances of "HOurBank"`);
        totalHOccurrences += hBrandMatches.length;
      }
      
      if (newBrandMatches) {
        console.log(`   ✅ Found ${newBrandMatches.length} instances of "hOurBank"`);
        updatedOccurrences += newBrandMatches.length;
      }
      
      console.log('');
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

// Check if logo component exists
const logoComponentPath = path.join(__dirname, 'src/app/components/logo/logo.component.ts');
if (fs.existsSync(logoComponentPath)) {
  console.log('✅ Logo component created successfully');
} else {
  console.log('❌ Logo component not found');
}

// Check if favicon exists
const faviconPath = path.join(__dirname, 'public/favicon.svg');
if (fs.existsSync(faviconPath)) {
  console.log('✅ Custom favicon created successfully');
} else {
  console.log('❌ Custom favicon not found');
}

console.log('\n📊 Summary:');
console.log(`   Updated branding: ${updatedOccurrences} instances of "hOurBank"`);
console.log(`   Old HOurBank branding: ${totalHOccurrences} instances`);
console.log(`   Remaining old branding: ${totalOldOccurrences} instances of "HourBank"`);

if (totalOldOccurrences === 0 && totalHOccurrences === 0) {
  console.log('\n🎉 All branding has been successfully updated to "hOurBank"!');
} else {
  console.log('\n⚠️  Some files still contain old branding.');
}

console.log('\n🎨 Logo Features:');
console.log('   • Hourglass inside bank building design');
console.log('   • Emphasizes "Our" with capital O in hOurBank');
console.log('   • Lowercase "h" for modern, friendly feel');
console.log('   • Reusable component with size and text options');
console.log('   • SVG-based for scalability');
console.log('   • Custom favicon created');
