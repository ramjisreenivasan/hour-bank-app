# AWS Amplify Setup Guide for HourBank

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed
- Amplify CLI installed globally

## Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

## Step 2: Configure Amplify CLI
```bash
amplify configure
```
Follow the prompts to:
- Sign in to AWS Console
- Create an IAM user with AdministratorAccess-Amplify policy
- Set up access keys

## Step 3: Initialize Amplify Project
```bash
cd /path/to/hourbank-app
amplify init
```

Configuration options:
- Project name: `hourbank-app`
- Environment name: `dev`
- Default editor: Your preferred editor
- App type: `javascript`
- Javascript framework: `angular`
- Source Directory Path: `src`
- Distribution Directory Path: `dist/hourbank-app`
- Build Command: `npm run build`
- Start Command: `ng serve`
- Use profile: `default` (or your configured profile)

## Step 4: Add Authentication
```bash
amplify add auth
```

Configuration:
- Do you want to use the default authentication and security configuration? `Default configuration`
- How do you want users to be able to sign in? `Username`
- Do you want to configure advanced settings? `No, I am done.`

## Step 5: Add API (Optional - for future backend data storage)
```bash
amplify add api
```

Configuration:
- Please select from one of the below mentioned services: `GraphQL`
- Provide API name: `hourbankapi`
- Choose the default authorization type for the API: `Amazon Cognito User Pool`
- Do you want to configure advanced settings for the GraphQL API: `No, I am done.`
- Do you have an annotated GraphQL schema? `No`
- Choose a schema template: `Single object with fields (e.g., "Todo" with ID, name, description)`

## Step 6: Add Storage (Optional - for profile pictures)
```bash
amplify add storage
```

Configuration:
- Please select from one of the below mentioned services: `Content (Images, audio, video, etc.)`
- Provide a friendly name for your resource: `hourbankStorage`
- Provide bucket name: `hourbank-storage-bucket`
- Who should have access: `Auth users only`
- What kind of access do you want for Authenticated users? `create/update, read, delete`

## Step 7: Deploy Backend Services
```bash
amplify push
```

This will:
- Create AWS resources (Cognito User Pool, AppSync API, S3 bucket)
- Generate the `amplifyconfiguration.json` file
- Update your local configuration

## Step 8: Add Hosting
```bash
amplify add hosting
```

Configuration:
- Select the plugin module to execute: `Amazon CloudFront and S3`
- Select the environment setup: `DEV (S3 only with HTTP)`
- hosting bucket name: `hourbank-app-hosting-bucket`

## Step 9: Publish Application
```bash
amplify publish
```

This will:
- Build your Angular application
- Deploy to S3
- Set up CloudFront distribution
- Provide you with the live URL

## Step 10: Update Environment Configuration

After running `amplify push`, update your `src/amplifyconfiguration.json` with the generated values.

Example configuration:
```json
{
  "aws_project_region": "us-east-1",
  "aws_cognito_identity_pool_id": "us-east-1:12345678-1234-1234-1234-123456789012",
  "aws_cognito_region": "us-east-1",
  "aws_user_pools_id": "us-east-1_AbCdEfGhI",
  "aws_user_pools_web_client_id": "1234567890abcdefghijklmnop",
  "oauth": {},
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": ["EMAIL"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": ["SMS"],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["EMAIL"]
}
```

## Useful Commands

### Development
```bash
# Start local development server
ng serve

# Build for production
ng build --prod

# Run tests
ng test
```

### Amplify Management
```bash
# Check status of backend resources
amplify status

# Pull latest backend changes
amplify pull

# Delete all backend resources
amplify delete

# Add new environment
amplify env add

# Switch environments
amplify env checkout <env-name>
```

### Deployment
```bash
# Deploy backend changes only
amplify push

# Deploy frontend and backend
amplify publish

# Deploy to specific environment
amplify publish --environment prod
```

## Environment Variables

Create environment-specific configurations:

### src/environments/environment.ts (Development)
```typescript
export const environment = {
  production: false,
  amplify: {
    region: 'us-east-1',
    // Add other Amplify-specific configs
  }
};
```

### src/environments/environment.prod.ts (Production)
```typescript
export const environment = {
  production: true,
  amplify: {
    region: 'us-east-1',
    // Add other Amplify-specific configs
  }
};
```

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** with minimal required permissions
3. **Enable MFA** for production environments
4. **Regularly rotate** access keys
5. **Monitor usage** through AWS CloudWatch
6. **Set up billing alerts** to avoid unexpected charges

## Troubleshooting

### Common Issues

1. **Authentication errors**
   - Check `amplifyconfiguration.json` values
   - Verify Cognito User Pool settings
   - Clear browser cache and localStorage

2. **Build errors**
   - Update Node.js to latest LTS version
   - Clear `node_modules` and reinstall dependencies
   - Check TypeScript version compatibility

3. **Deployment issues**
   - Verify AWS credentials and permissions
   - Check region consistency across services
   - Review CloudFormation stack events

### Getting Help

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Angular Documentation](https://angular.io/docs)
- [AWS Support](https://aws.amazon.com/support/)

## Cost Optimization

- Use **AWS Free Tier** resources when possible
- Set up **billing alerts** for cost monitoring
- Consider **S3 lifecycle policies** for storage optimization
- Use **CloudFront caching** to reduce origin requests
- Monitor **Cognito active users** to optimize costs

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions or AWS CodePipeline
2. Add monitoring and logging with AWS CloudWatch
3. Implement advanced features like real-time notifications
4. Set up multiple environments (dev, staging, prod)
5. Add automated testing and quality gates
