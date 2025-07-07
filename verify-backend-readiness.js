#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 HourBank Backend Readiness Check\n');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${exists ? 'Found' : 'Missing'}`);
  return exists;
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ ${description}: Available`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: Not available`);
    return false;
  }
}

function checkAmplifyStatus() {
  try {
    const result = execSync('amplify status', { encoding: 'utf8' });
    console.log('📊 Current Amplify Status:');
    console.log(result);
    return true;
  } catch (error) {
    console.log('❌ Amplify not initialized or error checking status');
    return false;
  }
}

function analyzeCurrentSetup() {
  console.log('🔍 Analyzing Current Setup:\n');
  
  let score = 0;
  let total = 0;
  
  // Check prerequisites
  console.log('📋 Prerequisites:');
  total += 4;
  score += checkCommand('node --version', 'Node.js') ? 1 : 0;
  score += checkCommand('npm --version', 'npm') ? 1 : 0;
  score += checkCommand('aws --version', 'AWS CLI') ? 1 : 0;
  score += checkCommand('amplify --version', 'Amplify CLI') ? 1 : 0;
  
  console.log('');
  
  // Check project files
  console.log('📁 Project Files:');
  total += 6;
  score += checkFile('package.json', 'Package.json') ? 1 : 0;
  score += checkFile('src/app/models/user.model.ts', 'User Model') ? 1 : 0;
  score += checkFile('src/app/services/auth.service.ts', 'Auth Service') ? 1 : 0;
  score += checkFile('src/app/services/user.service.ts', 'User Service') ? 1 : 0;
  score += checkFile('src/app/services/transaction.service.ts', 'Transaction Service') ? 1 : 0;
  score += checkFile('src/amplifyconfiguration.json', 'Amplify Configuration') ? 1 : 0;
  
  console.log('');
  
  // Check backend setup files
  console.log('🚀 Backend Setup Files:');
  total += 5;
  score += checkFile('schema.graphql', 'GraphQL Schema') ? 1 : 0;
  score += checkFile('setup-backend.sh', 'Backend Setup Script') ? 1 : 0;
  score += checkFile('src/app/services/user-graphql.service.ts', 'GraphQL User Service') ? 1 : 0;
  score += checkFile('src/app/services/transaction-graphql.service.ts', 'GraphQL Transaction Service') ? 1 : 0;
  score += checkFile('BACKEND_DEPLOYMENT_GUIDE.md', 'Deployment Guide') ? 1 : 0;
  
  console.log('');
  
  // Check Amplify setup
  console.log('⚡ Amplify Setup:');
  total += 3;
  score += checkFile('amplify/cli.json', 'Amplify CLI Config') ? 1 : 0;
  score += checkFile('amplify/team-provider-info.json', 'Team Provider Info') ? 1 : 0;
  score += fs.existsSync('amplify/backend/auth') ? 1 : 0;
  console.log(`${fs.existsSync('amplify/backend/auth') ? '✅' : '❌'} Authentication: ${fs.existsSync('amplify/backend/auth') ? 'Configured' : 'Not configured'}`);
  
  console.log('');
  
  return { score, total };
}

function checkAWSCredentials() {
  console.log('🔐 AWS Credentials Check:');
  try {
    const result = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    const identity = JSON.parse(result);
    console.log('✅ AWS Credentials: Valid');
    console.log(`   Account: ${identity.Account}`);
    console.log(`   User: ${identity.Arn.split('/').pop()}`);
    return true;
  } catch (error) {
    console.log('❌ AWS Credentials: Not configured or invalid');
    console.log('   Run: aws configure');
    return false;
  }
}

function provideRecommendations(score, total) {
  console.log('💡 Recommendations:\n');
  
  const percentage = (score / total) * 100;
  
  if (percentage >= 90) {
    console.log('🎉 Excellent! Your setup is ready for backend deployment.');
    console.log('   Next steps:');
    console.log('   1. Run: ./setup-backend.sh');
    console.log('   2. Follow the deployment guide');
    console.log('   3. Test your GraphQL API');
  } else if (percentage >= 70) {
    console.log('⚠️  Good setup, but some components are missing.');
    console.log('   Please address the missing items above before deployment.');
  } else if (percentage >= 50) {
    console.log('🔧 Partial setup detected. Several components need attention.');
    console.log('   Focus on installing missing prerequisites first.');
  } else {
    console.log('❌ Setup incomplete. Please install prerequisites and set up the project.');
    console.log('   Start with: npm install && amplify configure');
  }
  
  console.log('');
  
  // Specific recommendations
  if (!fs.existsSync('schema.graphql')) {
    console.log('📝 Missing GraphQL schema. This file defines your data models.');
  }
  
  if (!fs.existsSync('setup-backend.sh')) {
    console.log('🔧 Missing backend setup script. This automates the deployment process.');
  }
  
  if (!fs.existsSync('amplify/backend/auth')) {
    console.log('🔐 Authentication not configured. Run: amplify add auth');
  }
}

function showNextSteps() {
  console.log('📋 Next Steps for Backend Deployment:\n');
  
  console.log('1. **Prepare Environment:**');
  console.log('   • Ensure AWS credentials are configured');
  console.log('   • Verify Amplify CLI is installed and configured');
  console.log('   • Check that all project files are present\n');
  
  console.log('2. **Run Backend Setup:**');
  console.log('   • Execute: ./setup-backend.sh');
  console.log('   • Follow the interactive prompts');
  console.log('   • Review the generated schema\n');
  
  console.log('3. **Deploy to AWS:**');
  console.log('   • Run: amplify push');
  console.log('   • Wait for resource creation (5-10 minutes)');
  console.log('   • Verify deployment in AWS Console\n');
  
  console.log('4. **Generate Code:**');
  console.log('   • Run: amplify codegen');
  console.log('   • Update your services to use GraphQL');
  console.log('   • Test the integration\n');
  
  console.log('5. **Test & Deploy:**');
  console.log('   • Test GraphQL operations in AppSync console');
  console.log('   • Update frontend components');
  console.log('   • Deploy the complete application\n');
}

function main() {
  console.log('🚀 HourBank Backend Readiness Assessment');
  console.log('==========================================\n');
  
  const { score, total } = analyzeCurrentSetup();
  
  console.log('');
  checkAWSCredentials();
  
  console.log('');
  console.log(`📊 Readiness Score: ${score}/${total} (${Math.round((score/total)*100)}%)\n`);
  
  provideRecommendations(score, total);
  showNextSteps();
  
  console.log('📚 Documentation Available:');
  console.log('   • AMPLIFY_BACKEND_SETUP.md - Complete setup guide');
  console.log('   • BACKEND_DEPLOYMENT_GUIDE.md - Deployment instructions');
  console.log('   • schema.graphql - GraphQL schema definition');
  console.log('   • setup-backend.sh - Automated setup script\n');
  
  console.log('🎯 Ready to build your skill exchange platform backend! 🚀');
}

main();
