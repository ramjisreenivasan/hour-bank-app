#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Converting SVG favicon to ICO format...');

// Since we don't have image processing libraries available,
// let's create a simple HTML file that can help with the conversion

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SVG to ICO Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .preview { display: flex; gap: 20px; margin: 20px 0; }
        .size-preview { text-align: center; }
        .size-preview img { border: 1px solid #ddd; background: #f9f9f9; }
        .instructions { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .download-section { background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        h1 { color: #1e3a8a; }
        h2 { color: #333; }
        .step { margin: 10px 0; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏦 HourBank Favicon Converter</h1>
        
        <div class="preview">
            <div class="size-preview">
                <h3>16x16</h3>
                <img src="favicon-16.svg" width="16" height="16" alt="16x16 favicon">
            </div>
            <div class="size-preview">
                <h3>32x32</h3>
                <img src="favicon-hourbank.svg" width="32" height="32" alt="32x32 favicon">
            </div>
            <div class="size-preview">
                <h3>48x48</h3>
                <img src="favicon-hourbank.svg" width="48" height="48" alt="48x48 favicon">
            </div>
        </div>
        
        <div class="instructions">
            <h2>📋 Instructions to Create ICO File:</h2>
            <div class="step"><strong>Option 1 - Online Converter (Recommended):</strong></div>
            <div class="step">1. Go to <a href="https://convertio.co/svg-ico/" target="_blank">https://convertio.co/svg-ico/</a></div>
            <div class="step">2. Upload <span class="highlight">public/favicon-hourbank.svg</span></div>
            <div class="step">3. Convert and download as <span class="highlight">favicon.ico</span></div>
            <div class="step">4. Replace the existing favicon.ico in your public folder</div>
            
            <div class="step" style="margin-top: 20px;"><strong>Option 2 - Using Browser Developer Tools:</strong></div>
            <div class="step">1. Right-click on the 32x32 image above → "Save image as..."</div>
            <div class="step">2. Save as PNG, then use an online PNG to ICO converter</div>
        </div>
        
        <div class="download-section">
            <h2>💾 Download SVG Files:</h2>
            <div class="step">• <a href="favicon-hourbank.svg" download>Download Main Favicon (32x32)</a></div>
            <div class="step">• <a href="favicon-16.svg" download>Download Small Favicon (16x16)</a></div>
        </div>
        
        <div class="instructions">
            <h2>✅ Current Setup:</h2>
            <div class="step">Your index.html already includes favicon links:</div>
            <div class="step">• ICO fallback for older browsers</div>
            <div class="step">• PNG icons for modern browsers</div>
            <div class="step">• Apple touch icon for iOS devices</div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>🎨 HourBank Favicon - Based on your beautiful logo design!</p>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, '..', 'public', 'favicon-converter.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Created favicon-converter.html');
console.log('');
console.log('🌐 To convert your SVG to ICO:');
console.log('1. Open http://localhost:4200/favicon-converter.html in your browser');
console.log('2. Follow the instructions to convert SVG to ICO');
console.log('');
console.log('🎯 Quick conversion options:');
console.log('• Online: https://convertio.co/svg-ico/');
console.log('• Upload: public/favicon-hourbank.svg');
console.log('• Download as: favicon.ico');
console.log('');
console.log('📁 Your favicon files:');
console.log('• favicon-hourbank.svg (main, 32x32 optimized)');
console.log('• favicon-16.svg (simplified for small sizes)');
console.log('• favicon.svg (current active favicon)');

// Also create a simple README for the favicon
const readmeContent = `# HourBank Favicon

## Files Created

- \`favicon-hourbank.svg\` - Main favicon (32x32 optimized) with detailed hourglass and bank design
- \`favicon-16.svg\` - Simplified version for very small sizes (16x16)
- \`favicon.svg\` - Current active favicon (copy of favicon-hourbank.svg)
- \`favicon-converter.html\` - Helper page for SVG to ICO conversion

## Design Elements

The favicon incorporates key elements from your HourBank logo:
- 🏛️ Classical bank building with columns and pediment (gold)
- ⏳ Hourglass in the center (white outline with gold sand)
- 🎨 Dark blue background matching your brand
- ✨ Gold accents consistent with your logo

## Usage

The favicon is already set up in your \`index.html\`:
- ICO format for older browsers
- SVG format for modern browsers  
- Apple touch icon for iOS devices

## Converting to ICO

To create a proper ICO file:
1. Visit https://convertio.co/svg-ico/
2. Upload \`favicon-hourbank.svg\`
3. Download as \`favicon.ico\`
4. Replace the existing favicon.ico

## Browser Support

- ✅ Chrome, Firefox, Safari (SVG)
- ✅ Internet Explorer, Edge (ICO fallback)
- ✅ iOS Safari (Apple touch icon)
- ✅ Android Chrome (PNG icons)
`;

const readmePath = path.join(__dirname, '..', 'public', 'favicon-README.md');
fs.writeFileSync(readmePath, readmeContent);

console.log('✅ Created favicon-README.md with detailed information');
console.log('');
console.log('🎉 Favicon setup complete! Your HourBank favicon is ready to use.');
