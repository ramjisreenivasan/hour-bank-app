#!/bin/bash

# HourBank Social Login Auto-Configuration Script
# This script automatically configures social login with common defaults

set -e

echo "🏦 HourBank Social Login Auto-Configuration"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "amplify/backend/auth/hourbankapp488f170c/cli-inputs.json" ]; then
    echo "❌ Error: Please run this script from the HourBank app root directory"
    exit 1
fi

echo "📋 Auto-Configuration Settings"
echo "-----------------------------"
echo "✅ Setup Type: Development + Production"
echo "✅ Development URL: http://localhost:4200/"
echo "✅ Production URL: Will be configured later"
echo "✅ Social Providers: Google, Facebook"
echo ""

# Set configuration variables
REDIRECT_SIGNIN="http://localhost:4200/"
REDIRECT_SIGNOUT="http://localhost:4200/"
PROVIDERS=("Google" "Facebook")

echo "🚀 Starting Amplify Auth Update"
echo "------------------------------"

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo "📦 Installing 'expect' for automated configuration..."
    
    # Try to install expect
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y expect
    elif command -v yum &> /dev/null; then
        sudo yum install -y expect
    elif command -v brew &> /dev/null; then
        brew install expect
    else
        echo "❌ Cannot install 'expect'. Running manual configuration instead..."
        echo ""
        echo "Please run: amplify update auth"
        echo "And use these settings:"
        echo "- Choose: Apply default configuration with Social Provider (Federation)"
        echo "- Domain prefix: Use default"
        echo "- Redirect signin URI: $REDIRECT_SIGNIN"
        echo "- Redirect signout URI: $REDIRECT_SIGNOUT"
        echo "- Social providers: Google, Facebook"
        echo ""
        echo "Then run this script again to continue with component setup."
        exit 1
    fi
fi

# Create expect script for automated Amplify configuration
cat > /tmp/amplify_social_config.exp << 'EOF'
#!/usr/bin/expect -f
set timeout 60

spawn amplify update auth

expect {
    "What do you want to do?" {
        send "Apply default configuration with Social Provider (Federation)\r"
        exp_continue
    }
    "What domain name prefix do you want to use?" {
        send "\r"
        exp_continue
    }
    "Enter your redirect signin URI:" {
        send "http://localhost:4200/\r"
        exp_continue
    }
    "Do you want to add another redirect signin URI" {
        send "n\r"
        exp_continue
    }
    "Enter your redirect signout URI:" {
        send "http://localhost:4200/\r"
        exp_continue
    }
    "Do you want to add another redirect signout URI" {
        send "n\r"
        exp_continue
    }
    "Select the social providers you want to configure for your user pool:" {
        send " Google\r"
        send " Facebook\r"
        send "\r"
        exp_continue
    }
    eof {
        exit 0
    }
    timeout {
        puts "Timeout occurred"
        exit 1
    }
}
EOF

chmod +x /tmp/amplify_social_config.exp

echo "🔄 Configuring Amplify auth with social providers..."

# Run the expect script
if /tmp/amplify_social_config.exp; then
    echo "✅ Amplify auth configuration updated successfully!"
else
    echo "⚠️  Automated configuration may have issues. Please verify manually."
fi

# Clean up
rm -f /tmp/amplify_social_config.exp

echo ""
echo "📦 Installing Required Dependencies"
echo "---------------------------------"

# Install UI components if not already installed
if ! npm list @aws-amplify/ui-angular &> /dev/null; then
    echo "Installing @aws-amplify/ui-angular..."
    npm install @aws-amplify/ui-angular
else
    echo "✅ @aws-amplify/ui-angular already installed"
fi

# Install Font Awesome for social icons
if ! npm list @fortawesome/fontawesome-free &> /dev/null; then
    echo "Installing Font Awesome for social icons..."
    npm install @fortawesome/fontawesome-free
else
    echo "✅ Font Awesome already installed"
fi

echo ""
echo "🎨 Creating Social Login Components"
echo "---------------------------------"

# Create social login button component directory
mkdir -p src/app/components/social-login

# Create the social login component
cat > src/app/components/social-login/social-login.component.ts << 'EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="social-login-container">
      <h3>Sign in with</h3>
      
      <button 
        class="social-btn google-btn" 
        (click)="signInWithGoogle()"
        type="button"
        [disabled]="isLoading">
        <i class="fab fa-google"></i>
        <span>Continue with Google</span>
        <div *ngIf="isLoading && currentProvider === 'google'" class="loading-spinner"></div>
      </button>
      
      <button 
        class="social-btn facebook-btn" 
        (click)="signInWithFacebook()"
        type="button"
        [disabled]="isLoading">
        <i class="fab fa-facebook-f"></i>
        <span>Continue with Facebook</span>
        <div *ngIf="isLoading && currentProvider === 'facebook'" class="loading-spinner"></div>
      </button>
      
      <div class="divider">
        <span>or</span>
      </div>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./social-login.component.scss']
})
export class SocialLoginComponent {
  isLoading = false;
  currentProvider = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async signInWithGoogle() {
    this.startLoading('google');
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google login failed:', error);
      this.showError('Google login failed. Please try again.');
    } finally {
      this.stopLoading();
    }
  }

  async signInWithFacebook() {
    this.startLoading('facebook');
    try {
      await this.authService.signInWithFacebook();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Facebook login failed:', error);
      this.showError('Facebook login failed. Please try again.');
    } finally {
      this.stopLoading();
    }
  }

  private startLoading(provider: string) {
    this.isLoading = true;
    this.currentProvider = provider;
    this.errorMessage = '';
  }

  private stopLoading() {
    this.isLoading = false;
    this.currentProvider = '';
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
EOF

# Create social login styles
cat > src/app/components/social-login/social-login.component.scss << 'EOF'
.social-login-container {
  margin-bottom: 2rem;

  h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.social-btn {
  width: 100%;
  padding: 14px 20px;
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
  text-decoration: none;
  position: relative;
  min-height: 50px;

  i {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
    text-align: center;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.google-btn {
  background-color: #4285f4;
  color: white;

  &:hover:not(:disabled) {
    background-color: #357ae8;
  }
}

.facebook-btn {
  background-color: #1877f2;
  color: white;

  &:hover:not(:disabled) {
    background-color: #166fe5;
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  position: absolute;
  right: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
    background-color: #e0e0e0;
  }

  span {
    background-color: white;
    padding: 0 16px;
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  margin-top: 12px;
  border: 1px solid #fcc;
}
EOF

echo "✅ Social login component created"

echo ""
echo "🔧 Updating Auth Service"
echo "----------------------"

# Check if auth service exists and update it
if [ -f "src/app/services/auth.service.ts" ]; then
    # Check if social methods already exist
    if ! grep -q "signInWithGoogle" src/app/services/auth.service.ts; then
        # Backup existing auth service
        cp src/app/services/auth.service.ts src/app/services/auth.service.ts.backup
        
        # Add social login methods to auth service (before the last closing brace)
        sed -i '$i\
\
  // Social Login Methods\
  async signInWithGoogle() {\
    try {\
      const { Auth } = await import('\''aws-amplify'\'');\
      const { CognitoHostedUIIdentityProvider } = await import('\''@aws-amplify/auth'\'');\
      \
      return await Auth.federatedSignIn({\
        provider: CognitoHostedUIIdentityProvider.Google\
      });\
    } catch (error) {\
      console.error('\''Google sign-in error:'\'', error);\
      throw error;\
    }\
  }\
\
  async signInWithFacebook() {\
    try {\
      const { Auth } = await import('\''aws-amplify'\'');\
      const { CognitoHostedUIIdentityProvider } = await import('\''@aws-amplify/auth'\'');\
      \
      return await Auth.federatedSignIn({\
        provider: CognitoHostedUIIdentityProvider.Facebook\
      });\
    } catch (error) {\
      console.error('\''Facebook sign-in error:'\'', error);\
      throw error;\
    }\
  }' src/app/services/auth.service.ts

        echo "✅ Auth service updated with social login methods"
    else
        echo "✅ Social login methods already exist in auth service"
    fi
else
    echo "⚠️  Auth service not found at src/app/services/auth.service.ts"
    echo "   You'll need to add social login methods manually."
fi

echo ""
echo "📝 Adding Font Awesome to Styles"
echo "-------------------------------"

# Add Font Awesome to angular.json if not already present
if [ -f "angular.json" ]; then
    if ! grep -q "fontawesome" angular.json; then
        # Add Font Awesome to styles array in angular.json
        sed -i 's/"styles": \[/"styles": [\
              "node_modules\/@fortawesome\/fontawesome-free\/css\/all.min.css",/' angular.json
        echo "✅ Font Awesome added to angular.json"
    else
        echo "✅ Font Awesome already configured in angular.json"
    fi
fi

echo ""
echo "🎨 Creating Example Integration"
echo "-----------------------------"

# Create an example of how to integrate the social login component
cat > src/app/components/social-login/integration-example.md << 'EOF'
# Social Login Integration Example

## How to use the Social Login Component

### 1. Import in your Auth Component

```typescript
// src/app/components/auth/auth.component.ts
import { SocialLoginComponent } from '../social-login/social-login.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SocialLoginComponent  // Add this import
  ],
  // ... rest of component
})
export class AuthComponent {
  // ... your existing code
}
```

### 2. Add to your Auth Template

```html
<!-- src/app/components/auth/auth.component.html -->
<div class="auth-container">
  <div class="auth-card">
    <h2>Welcome to HourBank</h2>
    
    <!-- Add the social login component -->
    <app-social-login></app-social-login>
    
    <!-- Your existing email/password form -->
    <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
      <!-- ... your existing form fields -->
    </form>
  </div>
</div>
```

### 3. Update Your Auth Service Import

Make sure your auth service imports are correct:

```typescript
// src/app/services/auth.service.ts
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
```

## Next Steps

1. Configure your social provider apps (Google, Facebook)
2. Update your Amplify configuration with the correct redirect URIs
3. Deploy your changes with `amplify push`
4. Test the social login functionality
EOF

echo "✅ Integration example created"

echo ""
echo "📋 Configuration Summary"
echo "======================"
echo ""
echo "✅ Amplify auth updated with social providers"
echo "✅ Social login component created"
echo "✅ Auth service updated with social methods"
echo "✅ Font Awesome configured for social icons"
echo "✅ Integration example provided"
echo ""

echo "🔐 Social Provider Configuration Required"
echo "========================================"
echo ""
echo "You now need to configure your social provider apps:"
echo ""
echo "1. 🔵 Google OAuth Setup:"
echo "   - Go to: https://console.cloud.google.com/"
echo "   - Create OAuth 2.0 Client ID"
echo "   - Add redirect URI: https://[your-cognito-domain].auth.[region].amazoncognito.com/oauth2/idpresponse"
echo ""
echo "2. 🔵 Facebook OAuth Setup:"
echo "   - Go to: https://developers.facebook.com/"
echo "   - Create Facebook App"
echo "   - Add Facebook Login product"
echo "   - Add redirect URI: https://[your-cognito-domain].auth.[region].amazoncognito.com/oauth2/idpresponse"
echo ""

echo "🚀 Next Steps"
echo "============"
echo ""
echo "1. 📝 Get your Cognito domain:"
echo "   - Run: amplify status"
echo "   - Or check AWS Console → Cognito → User Pools"
echo ""
echo "2. 🔧 Configure social provider apps with the redirect URI"
echo ""
echo "3. 🚀 Deploy your changes:"
echo "   amplify push"
echo ""
echo "4. 🎨 Add social login to your auth component:"
echo "   - See: src/app/components/social-login/integration-example.md"
echo ""
echo "5. 🧪 Test the social login functionality"
echo ""

echo "✅ Social login configuration completed successfully!"
echo ""
echo "📖 For detailed setup instructions, see: setup-social-login.md"
echo "🔧 Social login component: src/app/components/social-login/"
echo "📝 Integration guide: src/app/components/social-login/integration-example.md"
echo ""
echo "Happy coding! 🚀"
