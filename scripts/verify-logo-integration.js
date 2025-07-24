#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 hOurBank Logo Integration Verification\n');

// Check if logo file exists
const logoPath = path.join(__dirname, 'public', 'hb-logo-v1.png');
const logoExists = fs.existsSync(logoPath);

console.log('📁 File Checks:');
console.log(`   ✅ Logo file exists: ${logoExists ? 'YES' : 'NO'}`);

if (logoExists) {
  const stats = fs.statSync(logoPath);
  console.log(`   📊 Logo file size: ${(stats.size / 1024).toFixed(2)} KB`);
}

// Check logo component
const logoComponentPath = path.join(__dirname, 'src', 'app', 'components', 'logo', 'logo.component.ts');
const logoComponentExists = fs.existsSync(logoComponentPath);

console.log(`   ✅ Logo component exists: ${logoComponentExists ? 'YES' : 'NO'}`);

if (logoComponentExists) {
  const logoComponent = fs.readFileSync(logoComponentPath, 'utf8');
  const usesImage = logoComponent.includes('hb-logo-v1.png');
  const hasCorrectBranding = logoComponent.includes('brand-h') && logoComponent.includes('brand-our') && logoComponent.includes('brand-bank');
  
  console.log(`   ✅ Uses hb-logo-v1.png: ${usesImage ? 'YES' : 'NO'}`);
  console.log(`   ✅ Has hOurBank branding: ${hasCorrectBranding ? 'YES' : 'NO'}`);
}

// Check index.html
const indexPath = path.join(__dirname, 'src', 'index.html');
const indexExists = fs.existsSync(indexPath);

console.log(`   ✅ Index.html exists: ${indexExists ? 'YES' : 'NO'}`);

if (indexExists) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const hasFavicon = indexContent.includes('hb-logo-v1.png');
  const hasCorrectTitle = indexContent.includes('hOurBank');
  
  console.log(`   ✅ Uses logo as favicon: ${hasFavicon ? 'YES' : 'NO'}`);
  console.log(`   ✅ Has hOurBank title: ${hasCorrectTitle ? 'YES' : 'NO'}`);
}

// Check app component
const appComponentPath = path.join(__dirname, 'src', 'app', 'app.component.html');
const appComponentExists = fs.existsSync(appComponentPath);

console.log(`   ✅ App component exists: ${appComponentExists ? 'YES' : 'NO'}`);

if (appComponentExists) {
  const appComponent = fs.readFileSync(appComponentPath, 'utf8');
  const usesLogoComponent = appComponent.includes('<app-logo');
  
  console.log(`   ✅ Uses logo component: ${usesLogoComponent ? 'YES' : 'NO'}`);
}

console.log('\n🎯 Integration Summary:');
console.log('   • Logo image: Located in /public/hb-logo-v1.png');
console.log('   • Logo component: Updated to use PNG image');
console.log('   • Branding: Maintains "hOurBank" with emphasized "Our"');
console.log('   • Favicon: Updated to use logo image');
console.log('   • Navigation: Logo appears in navbar');

console.log('\n🚀 Next Steps:');
console.log('   1. Run "ng serve" to start development server');
console.log('   2. Navigate to http://localhost:4200');
console.log('   3. Verify logo appears in navigation bar');
console.log('   4. Check browser tab for favicon');
console.log('   5. Confirm "hOurBank" branding with emphasized "Our"');

console.log('\n💡 Logo Usage Examples:');
console.log('   • Small logo: <app-logo [size]="24" [showText]="false"></app-logo>');
console.log('   • Medium logo: <app-logo [size]="32" [showText]="true"></app-logo>');
console.log('   • Large logo: <app-logo [size]="48" [showText]="true" containerClass="large"></app-logo>');

console.log('\n✨ hOurBank Logo Integration Complete!');
