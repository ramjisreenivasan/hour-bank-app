# Social Login Setup Guide for HourBank

This guide will help you enable social login (Google, Facebook, Amazon) for your HourBank application using AWS Cognito.

## Prerequisites

1. Your app should be deployed and have a domain (for production)
2. For development, you can use `http://localhost:4200/`
3. Social provider accounts (Google, Facebook, Amazon Developer)

## Step 1: Update Amplify Auth Configuration

Run the following command and follow the prompts:

```bash
amplify update auth
```

### Configuration Options:

1. **Choose**: "Apply default configuration with Social Provider (Federation)"
2. **Domain name prefix**: Use default or customize (e.g., `hourbank-social`)
3. **Redirect signin URI**: 
   - Development: `http://localhost:4200/`
   - Production: `https://your-domain.com/`
4. **Redirect signout URI**: Same as signin URI
5. **Social providers**: Select the ones you want to enable

## Step 2: Configure Social Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:4200` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Configure:
   - Valid OAuth Redirect URIs: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - Valid JavaScript Origins: Your app domain

### Amazon OAuth Setup

1. Go to [Amazon Developer Console](https://developer.amazon.com/)
2. Create a new Security Profile
3. Configure:
   - Allowed Return URLs: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - Allowed JavaScript Origins: Your app domain

## Step 3: Update Frontend Code

### Install Required Dependencies

```bash
npm install @aws-amplify/ui-angular
```

### Update Auth Service

Add social login methods to your auth service:

```typescript
// src/app/services/auth.service.ts
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

export class AuthService {
  // Existing methods...

  async signInWithGoogle() {
    try {
      return await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signInWithFacebook() {
    try {
      return await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Facebook
      });
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  async signInWithAmazon() {
    try {
      return await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Amazon
      });
    } catch (error) {
      console.error('Amazon sign-in error:', error);
      throw error;
    }
  }
}
```

### Update Auth Component Template

Add social login buttons to your auth component:

```html
<!-- src/app/components/auth/auth.component.html -->
<div class="social-login-section">
  <h3>Sign in with</h3>
  
  <button 
    class="social-btn google-btn" 
    (click)="signInWithGoogle()"
    type="button">
    <i class="fab fa-google"></i>
    Continue with Google
  </button>
  
  <button 
    class="social-btn facebook-btn" 
    (click)="signInWithFacebook()"
    type="button">
    <i class="fab fa-facebook-f"></i>
    Continue with Facebook
  </button>
  
  <button 
    class="social-btn amazon-btn" 
    (click)="signInWithAmazon()"
    type="button">
    <i class="fab fa-amazon"></i>
    Continue with Amazon
  </button>
  
  <div class="divider">
    <span>or</span>
  </div>
  
  <!-- Your existing email/password form -->
</div>
```

### Update Auth Component TypeScript

```typescript
// src/app/components/auth/auth.component.ts
export class AuthComponent {
  constructor(private authService: AuthService) {}

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      // Handle successful login
    } catch (error) {
      console.error('Google login failed:', error);
      // Handle error
    }
  }

  async signInWithFacebook() {
    try {
      await this.authService.signInWithFacebook();
      // Handle successful login
    } catch (error) {
      console.error('Facebook login failed:', error);
      // Handle error
    }
  }

  async signInWithAmazon() {
    try {
      await this.authService.signInWithAmazon();
      // Handle successful login
    } catch (error) {
      console.error('Amazon login failed:', error);
      // Handle error
    }
  }
}
```

## Step 4: Add Social Login Styling

Add CSS for social login buttons:

```scss
// src/app/components/auth/auth.component.scss
.social-login-section {
  margin-bottom: 2rem;

  h3 {
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
  }
}

.social-btn {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;

  i {
    font-size: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.google-btn {
  background-color: #4285f4;
  color: white;

  &:hover {
    background-color: #357ae8;
  }
}

.facebook-btn {
  background-color: #1877f2;
  color: white;

  &:hover {
    background-color: #166fe5;
  }
}

.amazon-btn {
  background-color: #ff9900;
  color: white;

  &:hover {
    background-color: #e88900;
  }
}

.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #ddd;
  }

  span {
    background-color: white;
    padding: 0 16px;
    color: #666;
    font-size: 14px;
  }
}
```

## Step 5: Update Amplify Configuration

After configuring social providers, update your `amplifyconfiguration.json`:

```json
{
  "Auth": {
    "Cognito": {
      "userPoolId": "your-user-pool-id",
      "userPoolClientId": "your-client-id",
      "identityPoolId": "your-identity-pool-id",
      "loginWith": {
        "oauth": {
          "domain": "your-cognito-domain.auth.region.amazoncognito.com",
          "scopes": ["openid", "email", "profile"],
          "redirectSignIn": ["http://localhost:4200/", "https://your-domain.com/"],
          "redirectSignOut": ["http://localhost:4200/", "https://your-domain.com/"],
          "responseType": "code"
        }
      }
    }
  }
}
```

## Step 6: Deploy Changes

```bash
# Push auth changes to AWS
amplify push

# Build and deploy your app
ng build --prod
amplify publish
```

## Step 7: Testing

1. **Development**: Test with `http://localhost:4200`
2. **Production**: Test with your deployed domain
3. Verify redirect URLs work correctly
4. Test user data mapping from social providers

## Troubleshooting

### Common Issues:

1. **Redirect URI Mismatch**: Ensure all redirect URIs match exactly
2. **CORS Issues**: Check your domain configuration
3. **Social Provider Setup**: Verify client IDs and secrets are correct
4. **Amplify Configuration**: Ensure `amplifyconfiguration.json` is updated

### Debug Steps:

1. Check browser console for errors
2. Verify Cognito User Pool settings in AWS Console
3. Test social provider configurations independently
4. Check network requests in browser dev tools

## Security Considerations

1. **HTTPS Required**: Social login requires HTTPS in production
2. **Domain Validation**: Ensure redirect URIs are properly validated
3. **Token Handling**: Implement proper token refresh logic
4. **User Data**: Handle social provider user data appropriately

## Next Steps

After enabling social login:

1. Update user profile handling for social users
2. Implement account linking for existing users
3. Add social provider-specific user data handling
4. Consider implementing progressive profiling
5. Add analytics for social login usage

This setup will provide a seamless social login experience for your HourBank users while maintaining security best practices.
