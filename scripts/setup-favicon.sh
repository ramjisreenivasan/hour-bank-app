#!/bin/bash

echo "🎨 Setting up HourBank favicon..."

# Check if we're in the right directory
if [ ! -f "public/hb-logo-v1.png" ]; then
    echo "❌ Please run this script from the hourbank-app root directory"
    exit 1
fi

# Backup existing favicon
if [ -f "public/favicon.ico" ]; then
    echo "📦 Backing up existing favicon.ico to favicon-old.ico"
    cp public/favicon.ico public/favicon-old.ico
fi

if [ -f "public/favicon.svg" ]; then
    echo "📦 Backing up existing favicon.svg to favicon-old.svg"
    cp public/favicon.svg public/favicon-old.svg
fi

# Copy our new SVG favicon
echo "✅ Installing new SVG favicon"
cp public/favicon-hourbank.svg public/favicon.svg

# Check if ImageMagick is available for ICO conversion
if command -v convert &> /dev/null; then
    echo "🔄 Converting SVG to ICO using ImageMagick..."
    convert public/favicon-hourbank.svg -resize 16x16 public/favicon-16x16.png
    convert public/favicon-hourbank.svg -resize 32x32 public/favicon-32x32.png
    convert public/favicon-hourbank.svg -resize 48x48 public/favicon-48x48.png
    
    # Create ICO file with multiple sizes
    convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon.ico
    echo "✅ Created favicon.ico with multiple sizes"
    
    # Clean up temporary PNG files
    rm public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png
    
elif command -v inkscape &> /dev/null; then
    echo "🔄 Converting SVG to PNG using Inkscape..."
    inkscape --export-type=png --export-width=16 --export-height=16 --export-filename=public/favicon-16x16.png public/favicon-hourbank.svg
    inkscape --export-type=png --export-width=32 --export-height=32 --export-filename=public/favicon-32x32.png public/favicon-hourbank.svg
    
    if command -v convert &> /dev/null; then
        convert public/favicon-16x16.png public/favicon-32x32.png public/favicon.ico
        echo "✅ Created favicon.ico"
        rm public/favicon-16x16.png public/favicon-32x32.png
    else
        echo "⚠️  Created PNG files, but couldn't create ICO. Please use an online converter."
    fi
else
    echo "⚠️  No image conversion tools found (ImageMagick or Inkscape)"
    echo "💡 You can use an online SVG to ICO converter like:"
    echo "   - https://convertio.co/svg-ico/"
    echo "   - https://cloudconvert.com/svg-to-ico"
    echo "   Upload public/favicon-hourbank.svg and save as public/favicon.ico"
fi

# Update index.html if it exists
if [ -f "src/index.html" ]; then
    echo "🔄 Updating index.html with favicon links..."
    
    # Check if favicon links already exist
    if grep -q "favicon" src/index.html; then
        echo "ℹ️  Favicon links already exist in index.html"
    else
        # Add favicon links before closing head tag
        sed -i 's|</head>|  <link rel="icon" type="image/x-icon" href="/favicon.ico">\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n  <link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg">\n</head>|' src/index.html
        echo "✅ Added favicon links to index.html"
    fi
fi

echo ""
echo "🎉 Favicon setup completed!"
echo ""
echo "📋 Files created:"
echo "   ✅ public/favicon.svg (SVG version)"
echo "   ✅ public/favicon-hourbank.svg (detailed version)"
echo "   ✅ public/favicon-16.svg (simplified for small sizes)"
if [ -f "public/favicon.ico" ]; then
    echo "   ✅ public/favicon.ico (ICO version)"
fi
echo ""
echo "🔧 Manual steps (if needed):"
echo "1. If ICO wasn't created automatically, convert public/favicon-hourbank.svg to ICO online"
echo "2. Add these lines to your index.html <head> section:"
echo '   <link rel="icon" type="image/x-icon" href="/favicon.ico">'
echo '   <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
echo '   <link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg">'
echo ""
echo "🌟 Your HourBank favicon is ready!"
