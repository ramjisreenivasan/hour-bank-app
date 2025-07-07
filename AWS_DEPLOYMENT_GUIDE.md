# HourBank AWS Deployment Guide

## Overview
This guide will help you deploy your HourBank Angular application to AWS using AWS Amplify. Your application is already configured with Amplify and has Cognito authentication set up.

## Current AWS Configuration
- **Region**: us-east-1
- **Amplify App ID**: d28saavnbxir8q
- **Cognito User Pool**: us-east-1_Il1TvEVPZ
- **Environment**: dev

## Prerequisites

### 1. AWS CLI Setup
```bash
# Install AWS CLI if not already installed
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI with your credentials
aws configure
```

### 2. Amplify CLI Setup
```bash
# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Configure Amplify CLI
amplify configure
```

## Deployment Options

### Option 1: Amplify Console Deployment (Recommended)

This is the easiest method for continuous deployment:

1. **Push your code to a Git repository** (GitHub, GitLab, Bitbucket, or CodeCommit)

2. **Connect to Amplify Console**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your Git repository
   - Select your repository and branch

3. **Configure build settings**:
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist/hourbank-app
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

4. **Deploy**: Amplify will automatically build and deploy your app

### Option 2: Manual Amplify CLI Deployment

If you prefer command-line deployment:

1. **Fix the build issue first**:
   ```bash
   # Create a clean environment
   rm -rf node_modules package-lock.json
   
   # Use npm ci for clean install
   npm ci
   
   # If esbuild issues persist, use this workaround:
   npm install --platform=linux --arch=x64 esbuild
   ```

2. **Build the application**:
   ```bash
   ng build --configuration production
   ```

3. **Deploy with Amplify**:
   ```bash
   # Deploy backend and frontend
   amplify publish
   ```

### Option 3: S3 + CloudFront Deployment

For more control over the deployment:

1. **Build the application**:
   ```bash
   ng build --configuration production
   ```

2. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://hourbank-app-production --region us-east-1
   ```

3. **Configure S3 for static website hosting**:
   ```bash
   aws s3 website s3://hourbank-app-production --index-document index.html --error-document index.html
   ```

4. **Upload files**:
   ```bash
   aws s3 sync dist/hourbank-app/ s3://hourbank-app-production --delete
   ```

5. **Set up CloudFront distribution** (optional but recommended for performance)

## Environment Configuration

### 1. Create Environment Files

Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-gateway-url.amazonaws.com/prod',
  amplify: {
    aws_project_region: 'us-east-1',
    aws_cognito_identity_pool_id: 'us-east-1:cba27644-9f75-4b31-bb76-77c079c55fa4',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'us-east-1_Il1TvEVPZ',
    aws_user_pools_web_client_id: '7jcpkan0knpmuq97jht2m50s6q'
  }
};
```

### 2. Update Angular Configuration

Ensure `angular.json` has proper production configuration:
```json
{
  "projects": {
    "hourbank-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ],
              "outputHashing": "all",
              "optimization": true,
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}
```

## Backend Services Setup

### 1. Add API Gateway (Optional)
If you need a backend API:
```bash
amplify add api
# Choose REST API
# Follow the prompts to configure your API
```

### 2. Add Storage (Optional)
If you need file storage:
```bash
amplify add storage
# Choose Content (Images, audio, video, etc.)
# Follow the prompts
```

### 3. Deploy Backend Changes
```bash
amplify push
```

## Custom Domain Setup (Optional)

### 1. Using Amplify Console
- Go to your app in Amplify Console
- Click "Domain management"
- Add your custom domain
- Follow the DNS configuration steps

### 2. Using Route 53
```bash
# Create hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Add A record pointing to your Amplify app
```

## Security Configuration

### 1. Update CORS Settings
If you have API endpoints, ensure CORS is properly configured:
```json
{
  "headers": {
    "Access-Control-Allow-Origin": "https://your-domain.com",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  }
}
```

### 2. Configure Content Security Policy
Add to your `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cognito-idp.us-east-1.amazonaws.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.amazonaws.com;">
```

## Monitoring and Logging

### 1. Enable CloudWatch Logs
```bash
# For Amplify apps, logs are automatically available in CloudWatch
aws logs describe-log-groups --log-group-name-prefix "/aws/amplify"
```

### 2. Set up Alarms
```bash
# Create CloudWatch alarm for errors
aws cloudwatch put-metric-alarm \
  --alarm-name "HourBank-HighErrorRate" \
  --alarm-description "High error rate in HourBank app" \
  --metric-name "4XXError" \
  --namespace "AWS/CloudFront" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check Angular version compatibility
   - Verify all imports are correct

2. **Authentication Issues**:
   - Verify Cognito configuration in `amplifyconfiguration.json`
   - Check CORS settings
   - Ensure proper redirect URLs are configured

3. **Routing Issues**:
   - Configure proper redirects for SPA routing
   - Set up 404 handling to redirect to index.html

### Useful Commands

```bash
# Check Amplify status
amplify status

# View Amplify app info
amplify console

# Pull latest backend config
amplify pull

# Delete resources (be careful!)
amplify delete
```

## Cost Optimization

1. **Use CloudFront caching** to reduce origin requests
2. **Enable gzip compression** in your build configuration
3. **Optimize bundle size** using Angular's built-in optimization
4. **Monitor usage** with AWS Cost Explorer

## Next Steps After Deployment

1. **Set up monitoring** with CloudWatch and AWS X-Ray
2. **Configure backup strategies** for your data
3. **Implement CI/CD pipeline** for automated deployments
4. **Set up staging environment** for testing
5. **Configure custom domain** and SSL certificate
6. **Implement proper error tracking** (e.g., Sentry)

## Support and Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)

---

**Note**: Your application already has Amplify configured with Cognito authentication. The main step is to either use the Amplify Console for continuous deployment or fix the local build issues for CLI deployment.
