#!/bin/bash

echo "Building HourBank Mobile Gateway..."

# Build the Angular app for production
echo "Building Angular app..."
ng build --configuration production

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync

# Copy additional mobile assets if needed
echo "Copying mobile assets..."
# Add any additional mobile-specific assets here

echo "Mobile gateway build complete!"
echo ""
echo "Configuration:"
echo "- Web App URL: https://hourbank.ramjisreenivasan.com"
echo "- Mobile App ID: com.hourbank.gateway"
echo ""
echo "Next steps:"
echo "1. Run 'npx cap open android' to open in Android Studio"
echo "2. Build and test the APK"
echo ""
echo "The mobile app will now:"
echo "- Show guest pages (landing, services, about, community) natively"
echo "- Open authenticated features (auth, dashboard, profile, etc.) in browser at hourbank.ramjisreenivasan.com"
