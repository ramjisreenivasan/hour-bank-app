# HourBank Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Angular CLI (`npm install -g @angular/cli`)
- AWS CLI configured
- Amplify CLI (`npm install -g @aws-amplify/cli`)

### Local Development
```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open browser to http://localhost:4200
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/           # Feature components
│   │   ├── auth/            # Authentication
│   │   ├── dashboard/       # Main dashboard
│   │   ├── profile/         # User profile
│   │   └── transaction/     # Transaction management
│   ├── guards/              # Route guards
│   │   ├── auth.guard.ts    # Protect authenticated routes
│   │   └── guest.guard.ts   # Redirect authenticated users
│   ├── services/            # Business logic services
│   │   ├── auth.service.ts  # Authentication service
│   │   ├── user.service.ts  # User management
│   │   └── transaction.service.ts # Transaction handling
│   ├── models/              # TypeScript interfaces
│   │   └── user.model.ts    # Data models
│   ├── app.component.*      # Root component
│   ├── app.config.ts        # App configuration
│   └── app.routes.ts        # Routing configuration
├── styles.scss              # Global styles
├── main.ts                  # Application bootstrap
└── amplifyconfiguration.json # AWS Amplify config
```

## 🎨 Design System

### CSS Variables
The application uses a comprehensive design system with CSS custom properties:

```scss
:root {
  /* Colors */
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Other design tokens... */
}
```

### Component Classes
- `.btn` - Button styles with variants (primary, secondary, outline)
- `.card` - Card container with shadow and border
- `.form-group` - Form field container
- `.status-badge` - Status indicators
- `.tag` - Tag/chip components

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create new component
ng generate component components/feature-name

# Create new service
ng generate service services/service-name

# Create new guard
ng generate guard guards/guard-name
```

### 2. Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use SCSS for styling
- Implement responsive design
- Add proper error handling

### 3. Testing
```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e

# Generate code coverage
ng test --code-coverage
```

## 🔐 Authentication Flow

### AWS Cognito Integration
```typescript
// Sign up
await this.authService.signUp(email, password, username);

// Sign in
await this.authService.signIn(email, password);

// Sign out
await this.authService.signOut();

// Check auth status
this.authService.isAuthenticated$.subscribe(isAuth => {
  // Handle authentication state
});
```

### Route Protection
```typescript
// Protected routes
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}

// Guest-only routes
{
  path: 'auth',
  component: AuthComponent,
  canActivate: [GuestGuard]
}
```

## 💾 Data Management

### User Service
```typescript
// Get current user
const user = this.userService.getCurrentUser();

// Update user profile
this.userService.updateUser(updatedUser);

// Manage services
this.userService.addService(service);
this.userService.updateService(service);
```

### Transaction Service
```typescript
// Create transaction
const transactionId = this.transactionService.createTransaction({
  providerId: 'user1',
  consumerId: 'user2',
  serviceId: 'service1',
  hoursSpent: 2
});

// Update status
this.transactionService.updateTransactionStatus(id, 'COMPLETED');

// Add rating
this.transactionService.addRatingAndFeedback(id, 5, 'Great service!');
```

## 🎯 Key Features

### 1. Time-Based Currency System
- Users start with 10 bank hours
- Service providers earn hours
- Consumers spend hours
- Real-time balance tracking

### 2. Service Marketplace
- Browse available services
- Filter by category and tags
- Request services from providers
- Rate completed services

### 3. Transaction Management
- Track all service exchanges
- Update transaction status
- Provide ratings and feedback
- View transaction history

### 4. User Profiles
- Manage personal information
- Add skills and bio
- Create and manage services
- View statistics and ratings

## 🚀 Deployment

### Automated Deployment
```bash
# Full deployment
./deploy.sh

# Build only
./deploy.sh build

# Backend only
./deploy.sh backend

# Publish only
./deploy.sh publish
```

### Manual Deployment
```bash
# Initialize Amplify
amplify init

# Add authentication
amplify add auth

# Add hosting
amplify add hosting

# Deploy backend
amplify push

# Publish app
amplify publish
```

## 🔍 Debugging

### Common Issues

1. **Authentication Errors**
   ```bash
   # Check Amplify configuration
   amplify status
   
   # Pull latest backend config
   amplify pull
   ```

2. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check TypeScript errors
   ng build --verbose
   ```

3. **Styling Issues**
   ```bash
   # Check SCSS compilation
   ng build --extract-css
   
   # Verify CSS variables
   # Check browser dev tools
   ```

### Development Tools
- Angular DevTools (browser extension)
- Redux DevTools (for state management)
- AWS Amplify Admin UI
- Chrome/Firefox Developer Tools

## 📊 Performance Optimization

### Bundle Size
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/hourbank-app/stats.json
```

### Lazy Loading
```typescript
// Implement lazy loading for routes
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];
```

### Change Detection
```typescript
// Use OnPush strategy for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 🧪 Testing Strategy

### Unit Tests
- Test all services and components
- Mock external dependencies
- Achieve >80% code coverage

### Integration Tests
- Test component interactions
- Verify routing behavior
- Test form submissions

### E2E Tests
- Test complete user workflows
- Verify authentication flow
- Test critical user journeys

## 📈 Monitoring & Analytics

### AWS CloudWatch
- Monitor application performance
- Track error rates
- Set up alerts for issues

### User Analytics
- Track user engagement
- Monitor feature usage
- Analyze user behavior

## 🔒 Security Best Practices

### Frontend Security
- Sanitize user inputs
- Implement CSP headers
- Use HTTPS everywhere
- Validate all form data

### AWS Security
- Use IAM roles with minimal permissions
- Enable MFA for admin accounts
- Regularly rotate access keys
- Monitor AWS CloudTrail logs

## 🤝 Contributing

### Code Review Process
1. Create feature branch
2. Implement changes with tests
3. Submit pull request
4. Code review and approval
5. Merge to main branch

### Commit Messages
```
feat: add user profile management
fix: resolve authentication redirect issue
docs: update API documentation
style: improve responsive design
refactor: optimize service layer
test: add unit tests for auth service
```

## 📚 Resources

- [Angular Documentation](https://angular.io/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [RxJS Documentation](https://rxjs.dev/guide/overview)

## 🆘 Getting Help

1. Check the documentation
2. Search existing issues
3. Create detailed bug reports
4. Join the community discussions
5. Contact the development team
