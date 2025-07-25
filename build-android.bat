@echo off
echo Building HourBank for Android...

echo Step 1: Installing dependencies...
call npm install

echo Step 2: Building Angular app...
call npm run build:mobile

echo Step 3: Syncing with Capacitor...
call npx cap sync android

echo Step 4: Opening Android Studio...
call npx cap open android

echo Build process complete! 
echo Next steps:
echo 1. In Android Studio, go to Build > Generate Signed Bundle/APK
echo 2. Choose Android App Bundle (AAB)
echo 3. Sign with your release keystore
echo 4. Upload the AAB to Google Play Console

pause
