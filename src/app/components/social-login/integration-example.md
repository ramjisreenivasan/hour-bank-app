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

### 3. Add Font Awesome Icons

Add this to your `src/styles.scss`:

```scss
// Font Awesome icons (you can also use CDN)
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
```

Or add to your `src/index.html`:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

### 4. Update Your Auth Service Import

Make sure your auth service imports are correct:

```typescript
// src/app/services/auth.service.ts
import { signInWithRedirect } from 'aws-amplify/auth';
```

## Next Steps

After adding the component:

1. Configure your social provider apps (Google, Facebook)
2. Update your Amplify configuration with the correct redirect URIs
3. Deploy your changes with `amplify push`
4. Test the social login functionality

## Social Provider Setup

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

## Testing

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
