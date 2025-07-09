# Profile Services Debug Guide

## Issue Description
Services are not displaying correctly on the profile page.

## Changes Made

### 1. Enhanced Debugging
Added comprehensive console logging throughout the profile component:

- **ngOnInit**: Tracks component initialization and route parameters
- **loadUserProfile**: Monitors user profile loading process
- **loadUserServices**: Detailed API call tracking and response logging
- **addMockServicesForTesting**: Logs mock service creation

### 2. Test Services
- Added `forceDisplayTestServices()` method that creates 3 test services
- Temporarily enabled in `ngOnInit` to verify UI functionality
- Includes active and inactive services to test all display states

### 3. Debug Logging Format
All debug logs use the format: `🔍 DEBUG: [message]` for easy identification

## How to Debug

### Step 1: Check Browser Console
1. Open your application in the browser
2. Navigate to the profile page
3. Open Developer Tools (F12)
4. Check the Console tab for debug messages

### Step 2: Expected Debug Output
You should see logs like:
```
🔍 DEBUG: ProfileComponent ngOnInit called
🔍 DEBUG: Route userId parameter: null
🔍 DEBUG: Forcing test services display
🔍 DEBUG: Forced test services: [Array of 3 services]
🔍 DEBUG: No userId in route, loading current user profile
```

### Step 3: Verify UI Display
- You should see 3 test services displayed on the profile page
- If test services appear, the UI is working correctly
- If test services don't appear, there's a UI/template issue

### Step 4: Check API Calls
Look for these debug messages:
```
🔍 DEBUG: Loading services for user: [userId]
🔍 DEBUG: API Response: [response object]
🔍 DEBUG: Services count: [number]
```

## Troubleshooting Scenarios

### Scenario 1: Test Services Don't Display
**Problem**: UI/Template issue
**Solution**: Check the HTML template and CSS styling

### Scenario 2: Test Services Display, But Real Services Don't
**Problem**: API or data retrieval issue
**Check**:
- User authentication status
- GraphQL API calls in Network tab
- User ID mapping service

### Scenario 3: No Debug Logs Appear
**Problem**: Component not loading or JavaScript errors
**Check**:
- Browser console for JavaScript errors
- Angular routing configuration
- Component imports and dependencies

### Scenario 4: API Errors in Console
**Problem**: Backend/GraphQL issues
**Check**:
- AWS Amplify configuration
- GraphQL schema and resolvers
- API permissions and authentication

## Next Steps Based on Results

### If Test Services Display Successfully:
1. Remove the `forceDisplayTestServices()` call from `ngOnInit`
2. Focus on debugging the real API calls
3. Check user authentication and ID mapping

### If Test Services Don't Display:
1. Check the HTML template structure
2. Verify CSS styling isn't hiding elements
3. Check for Angular template errors

### If API Calls Fail:
1. Verify AWS Amplify configuration
2. Check GraphQL schema
3. Test API calls manually
4. Verify user permissions

## Files Modified
- `src/app/components/profile/profile.component.ts`

## Temporary Changes to Remove Later
- The `forceDisplayTestServices()` call in `ngOnInit` should be removed once debugging is complete
- The extensive console logging can be reduced once the issue is resolved

## Testing Commands
```bash
# Start the development server
ng serve

# Open browser and navigate to profile page
# Check browser console for debug messages
```

## Expected Behavior After Fix
1. User navigates to profile page
2. Component loads user profile data
3. Services are fetched via GraphQL API
4. Services display in the UI
5. If no services exist, mock services are shown
6. User can add, edit, and manage services

## Contact
If the issue persists after following this guide, provide:
1. Browser console output
2. Network tab showing API calls
3. Any error messages
4. Screenshots of the profile page
