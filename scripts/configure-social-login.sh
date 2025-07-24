#!/bin/bash

# HourBank Social Login Configuration Script
# This script helps configure social login for your HourBank application

set -e

echo "🏦 HourBank Social Login Configuration"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "amplify/backend/auth/hourbankapp488f170c/cli-inputs.json" ]; then
    echo "❌ Error: Please run this script from the HourBank app root directory"
    exit 1
fi

echo "📋 Current Configuration Check"
echo "-----------------------------"

# Check current auth configuration
echo "✅ Found existing Amplify auth configuration"
echo "   Auth resource: hourbankapp488f170c"

# Get current domain info
CURRENT_DOMAIN=""
if [ -f "amplify/backend/auth/hourbankapp488f170c/cli-inputs.json" ]; then
    echo "✅ Current auth configuration found"
else
    echo "❌ Auth configuration not found"
    exit 1
fi

echo ""
echo "🔧 Social Login Setup Options"
echo "-----------------------------"
echo "1. Configure for Development (localhost:4200)"
echo "2. Configure for Production (custom domain)"
echo "3. Configure for Both"
echo ""

read -p "Choose an option (1-3): " SETUP_OPTION

case $SETUP_OPTION in
    1)
        REDIRECT_SIGNIN="http://localhost:4200/"
        REDIRECT_SIGNOUT="http://localhost:4200/"
        echo "📍 Configuring for development environment"
        ;;
    2)
        read -p "Enter your production domain (e.g., https://hourbank.com/): " PROD_DOMAIN
        REDIRECT_SIGNIN="$PROD_DOMAIN"
        REDIRECT_SIGNOUT="$PROD_DOMAIN"
        echo "📍 Configuring for production: $PROD_DOMAIN"
        ;;
    3)
        read -p "Enter your production domain (e.g., https://hourbank.com/): " PROD_DOMAIN
        REDIRECT_SIGNIN="http://localhost:4200/,$PROD_DOMAIN"
        REDIRECT_SIGNOUT="http://localhost:4200/,$PROD_DOMAIN"
        echo "📍 Configuring for both development and production"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🔐 Social Providers Selection"
echo "----------------------------"
echo "Which social providers would you like to enable?"
echo ""

PROVIDERS=()

read -p "Enable Google Login? (y/n): " ENABLE_GOOGLE
if [[ $ENABLE_GOOGLE =~ ^[Yy]$ ]]; then
    PROVIDERS+=("Google")
    echo "✅ Google Login will be enabled"
fi

read -p "Enable Facebook Login? (y/n): " ENABLE_FACEBOOK
if [[ $ENABLE_FACEBOOK =~ ^[Yy]$ ]]; then
    PROVIDERS+=("Facebook")
    echo "✅ Facebook Login will be enabled"
fi

read -p "Enable Amazon Login? (y/n): " ENABLE_AMAZON
if [[ $ENABLE_AMAZON =~ ^[Yy]$ ]]; then
    PROVIDERS+=("Amazon")
    echo "✅ Amazon Login will be enabled"
fi

if [ ${#PROVIDERS[@]} -eq 0 ]; then
    echo "❌ No social providers selected. Exiting."
    exit 1
fi

echo ""
echo "📝 Configuration Summary"
echo "----------------------"
echo "Redirect Sign-in URI: $REDIRECT_SIGNIN"
echo "Redirect Sign-out URI: $REDIRECT_SIGNOUT"
echo "Social Providers: ${PROVIDERS[*]}"
echo ""

read -p "Proceed with this configuration? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Configuration cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting Amplify Auth Update"
echo "------------------------------"

# Create temporary expect script for automated input
cat > /tmp/amplify_auth_config.exp << EOF
#!/usr/bin/expect -f
set timeout 30

spawn amplify update auth

expect "What do you want to do?"
send "Apply default configuration with Social Provider (Federation)\r"

expect "What domain name prefix do you want to use?"
send "\r"

expect "Enter your redirect signin URI:"
send "$REDIRECT_SIGNIN\r"

expect "Do you want to add another redirect signin URI"
send "n\r"

expect "Enter your redirect signout URI:"
send "$REDIRECT_SIGNOUT\r"

expect "Do you want to add another redirect signout URI"
send "n\r"

expect "Select the social providers you want to configure for your user pool:"
EOF

# Add provider selections to expect script
for provider in "${PROVIDERS[@]}"; do
    echo "send \" $provider\r\"" >> /tmp/amplify_auth_config.exp
done

cat >> /tmp/amplify_auth_config.exp << EOF
send "\r"

expect eof
EOF

# Make expect script executable
chmod +x /tmp/amplify_auth_config.exp

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo "⚠️  'expect' is not installed. Installing..."
    
    # Try to install expect
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y expect
    elif command -v yum &> /dev/null; then
        sudo yum install -y expect
    elif command -v brew &> /dev/null; then
        brew install expect
    else
        echo "❌ Cannot install 'expect'. Please install it manually and run this script again."
        echo "   Or run 'amplify update auth' manually with the following configuration:"
        echo "   - Choose: Apply default configuration with Social Provider (Federation)"
        echo "   - Redirect signin URI: $REDIRECT_SIGNIN"
        echo "   - Redirect signout URI: $REDIRECT_SIGNOUT"
        echo "   - Social providers: ${PROVIDERS[*]}"
        exit 1
    fi
fi

echo "🔄 Running Amplify auth update..."

# Run the expect script
if /tmp/amplify_auth_config.exp; then
    echo "✅ Amplify auth configuration updated successfully!"
else
    echo "❌ Amplify auth update failed. Please run manually:"
    echo "   amplify update auth"
    echo ""
    echo "Use these settings:"
    echo "   - Choose: Apply default configuration with Social Provider (Federation)"
    echo "   - Redirect signin URI: $REDIRECT_SIGNIN"
    echo "   - Redirect signout URI: $REDIRECT_SIGNOUT"
    echo "   - Social providers: ${PROVIDERS[*]}"
    exit 1
fi

# Clean up
rm -f /tmp/amplify_auth_config.exp

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

echo ""
echo "🎨 Creating Social Login Components"
echo "---------------------------------"

# Create social login button component
mkdir -p src/app/components/social-login

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
        *ngIf="enabledProviders.includes('Google')"
        class="social-btn google-btn" 
        (click)="signInWithGoogle()"
        type="button">
        <i class="fab fa-google"></i>
        Continue with Google
      </button>
      
      <button 
        *ngIf="enabledProviders.includes('Facebook')"
        class="social-btn facebook-btn" 
        (click)="signInWithFacebook()"
        type="button">
        <i class="fab fa-facebook-f"></i>
        Continue with Facebook
      </button>
      
      <button 
        *ngIf="enabledProviders.includes('Amazon')"
        class="social-btn amazon-btn" 
        (click)="signInWithAmazon()"
        type="button">
        <i class="fab fa-amazon"></i>
        Continue with Amazon
      </button>
      
      <div class="divider" *ngIf="showDivider">
        <span>or</span>
      </div>
    </div>
  `,
  styleUrls: ['./social-login.component.scss']
})
export class SocialLoginComponent {
  enabledProviders: string[] = [];
  showDivider = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Set enabled providers based on configuration
    this.enabledProviders = this.getEnabledProviders();
  }

  private getEnabledProviders(): string[] {
    // This will be populated based on your Amplify configuration
    const providers: string[] = [];
EOF

# Add enabled providers based on user selection
for provider in "${PROVIDERS[@]}"; do
    echo "    providers.push('$provider');" >> src/app/components/social-login/social-login.component.ts
done

cat >> src/app/components/social-login/social-login.component.ts << 'EOF'
    return providers;
  }

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }

  async signInWithFacebook() {
    try {
      await this.authService.signInWithFacebook();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Facebook login failed:', error);
    }
  }

  async signInWithAmazon() {
    try {
      await this.authService.signInWithAmazon();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Amazon login failed:', error);
    }
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

  i {
    font-size: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
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
EOF

echo "✅ Social login component created"

echo ""
echo "🔧 Updating Auth Service"
echo "----------------------"

# Check if auth service exists and update it
if [ -f "src/app/services/auth.service.ts" ]; then
    # Backup existing auth service
    cp src/app/services/auth.service.ts src/app/services/auth.service.ts.backup
    
    # Add social login methods to auth service
    cat >> src/app/services/auth.service.ts << 'EOF'

  // Social Login Methods
  async signInWithGoogle() {
    try {
      const { Auth } = await import('aws-amplify');
      const { CognitoHostedUIIdentityProvider } = await import('@aws-amplify/auth');
      
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
      const { Auth } = await import('aws-amplify');
      const { CognitoHostedUIIdentityProvider } = await import('@aws-amplify/auth');
      
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
      const { Auth } = await import('aws-amplify');
      const { CognitoHostedUIIdentityProvider } = await import('@aws-amplify/auth');
      
      return await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Amazon
      });
    } catch (error) {
      console.error('Amazon sign-in error:', error);
      throw error;
    }
  }
EOF

    echo "✅ Auth service updated with social login methods"
else
    echo "⚠️  Auth service not found. You'll need to add social login methods manually."
fi

echo ""
echo "📋 Next Steps"
echo "============"
echo ""
echo "1. 🔐 Configure Social Provider Apps:"
echo "   - Google: https://console.cloud.google.com/"
echo "   - Facebook: https://developers.facebook.com/"
echo "   - Amazon: https://developer.amazon.com/"
echo ""
echo "2. 📝 Get your Cognito domain from AWS Console:"
echo "   - Go to AWS Cognito → User Pools → hourbankapp488f170c"
echo "   - Note the domain for redirect URIs"
echo ""
echo "3. 🚀 Deploy your changes:"
echo "   amplify push"
echo ""
echo "4. 🎨 Add social login to your auth component:"
echo "   Import and use the SocialLoginComponent"
echo ""
echo "5. 🧪 Test the social login functionality"
echo ""

echo "✅ Social login configuration completed!"
echo ""
echo "📖 For detailed setup instructions, see: setup-social-login.md"
echo "🔧 Social login component created at: src/app/components/social-login/"
echo ""
echo "Happy coding! 🚀"
