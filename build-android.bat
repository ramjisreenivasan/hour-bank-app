@echo off
echo Building HourBank for Android...

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo Step 2: Building Angular app...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Angular build failed, trying production build...
    call npm run build -- --configuration production
    if %errorlevel% neq 0 (
        echo Error: Production build also failed
        pause
        exit /b 1
    )
)

echo Step 3: Verifying www directory...
if not exist "www\browser\index.html" (
    echo Error: www/browser/index.html not found after build
    echo Please check your Angular build configuration
    pause
    exit /b 1
)
echo ✓ www/browser directory and index.html found

echo Step 4: Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: Capacitor sync failed
    pause
    exit /b 1
)

echo Step 5: Opening Android Studio...
call npx cap open android
if %errorlevel% neq 0 (
    echo Warning: Could not auto-open Android Studio
    echo Please manually open Android Studio and open this folder:
    echo %cd%\android
    echo.
    echo Alternative: Set CAPACITOR_ANDROID_STUDIO_PATH environment variable
    echo Example: set CAPACITOR_ANDROID_STUDIO_PATH="C:\Program Files\Android\Android Studio\bin\studio64.exe"
)

echo Build process complete! 
echo.
echo Next steps:
echo 1. Open Android Studio (manually if auto-open failed)
echo 2. Open project folder: %cd%\android
echo 3. Go to Build ^> Generate Signed Bundle/APK
echo 4. Choose Android App Bundle (AAB)
echo 5. Sign with your release keystore
echo 6. Upload the AAB to Google Play Console

pause
