/**
 * Analyzes HourBank project structure to identify architecture components
 */
const fs = require('fs-extra');
const path = require('path');

class ArchitectureAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }
  
  /**
   * Analyze the complete project architecture
   */
  async analyzeProject() {
    try {
      const architecture = {
        frontend: await this.analyzeFrontend(),
        backend: await this.analyzeBackend(),
        mobile: await this.analyzeMobile(),
        database: await this.analyzeDatabase(),
        auth: await this.analyzeAuth()
      };
      
      return architecture;
    } catch (error) {
      console.error('Error analyzing project:', error);
      return this.getDefaultArchitecture();
    }
  }
  
  /**
   * Analyze frontend configuration
   */
  async analyzeFrontend() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const angularJsonPath = path.join(this.projectRoot, 'angular.json');
      
      let packageJson = {};
      let angularJson = {};
      
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }
      
      if (await fs.pathExists(angularJsonPath)) {
        angularJson = await fs.readJson(angularJsonPath);
      }
      
      const angularVersion = packageJson.dependencies?.['@angular/core'] || 'Unknown';
      const hasRouting = !!packageJson.dependencies?.['@angular/router'];
      const hasPWA = !!packageJson.dependencies?.['@angular/pwa'];
      
      return {
        type: 'Angular',
        version: angularVersion,
        features: [
          'TypeScript',
          hasRouting ? 'Routing' : null,
          hasPWA ? 'PWA' : null,
          'SCSS Styling'
        ].filter(Boolean),
        buildTool: 'Angular CLI'
      };
    } catch (error) {
      return {
        type: 'Angular',
        version: '19',
        features: ['TypeScript', 'Routing', 'SCSS']
      };
    }
  }
  
  /**
   * Analyze backend/AWS configuration
   */
  async analyzeBackend() {
    try {
      const amplifyPath = path.join(this.projectRoot, 'amplify');
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      
      let packageJson = {};
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }
      
      const hasAmplify = await fs.pathExists(amplifyPath);
      const amplifyVersion = packageJson.dependencies?.['aws-amplify'] || 'Unknown';
      
      const services = ['API Gateway'];
      
      if (hasAmplify) {
        // Check for specific Amplify services
        const backendConfigPath = path.join(amplifyPath, 'backend', 'backend-config.json');
        if (await fs.pathExists(backendConfigPath)) {
          try {
            const backendConfig = await fs.readJson(backendConfigPath);
            if (backendConfig.auth) services.push('Cognito Auth');
            if (backendConfig.api) services.push('GraphQL API');
            if (backendConfig.function) services.push('Lambda Functions');
            if (backendConfig.storage) services.push('S3 Storage');
          } catch (e) {
            // Use defaults
          }
        }
      }
      
      return {
        type: 'AWS Amplify',
        version: amplifyVersion,
        services: services,
        hosting: 'Amplify Hosting'
      };
    } catch (error) {
      return {
        type: 'AWS Amplify',
        services: ['API Gateway', 'Lambda Functions']
      };
    }
  }
  
  /**
   * Analyze mobile configuration
   */
  async analyzeMobile() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const capacitorConfigPath = path.join(this.projectRoot, 'capacitor.config.ts');
      const ionicConfigPath = path.join(this.projectRoot, 'ionic.config.json');
      
      let packageJson = {};
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }
      
      const hasIonic = !!packageJson.dependencies?.['@ionic/angular'];
      const hasCapacitor = await fs.pathExists(capacitorConfigPath);
      const ionicVersion = packageJson.dependencies?.['@ionic/angular'] || 'Unknown';
      
      const platforms = [];
      if (hasCapacitor) {
        const androidPath = path.join(this.projectRoot, 'android');
        const iosPath = path.join(this.projectRoot, 'ios');
        
        if (await fs.pathExists(androidPath)) platforms.push('Android');
        if (await fs.pathExists(iosPath)) platforms.push('iOS');
      }
      
      return {
        type: hasIonic ? 'Ionic' : 'PWA',
        version: ionicVersion,
        platforms: platforms.length > 0 ? platforms : ['Web', 'PWA'],
        framework: 'Capacitor'
      };
    } catch (error) {
      return {
        type: 'Ionic',
        platforms: ['iOS', 'Android', 'Web']
      };
    }
  }
  
  /**
   * Analyze database configuration
   */
  async analyzeDatabase() {
    try {
      const schemaPath = path.join(this.projectRoot, 'schema.graphql');
      
      if (await fs.pathExists(schemaPath)) {
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        
        // Extract table/type names from GraphQL schema
        const typeMatches = schemaContent.match(/type\s+(\w+)/g) || [];
        const tables = typeMatches
          .map(match => match.replace('type ', ''))
          .filter(name => !['Query', 'Mutation', 'Subscription'].includes(name));
        
        return {
          type: 'DynamoDB',
          tables: tables.length > 0 ? tables : ['Users', 'Services', 'Transactions'],
          apiType: 'GraphQL'
        };
      }
      
      return {
        type: 'DynamoDB',
        tables: ['Users', 'Services', 'Transactions'],
        apiType: 'GraphQL'
      };
    } catch (error) {
      return {
        type: 'DynamoDB',
        tables: ['Users', 'Services', 'Transactions']
      };
    }
  }
  
  /**
   * Analyze authentication configuration
   */
  async analyzeAuth() {
    try {
      const amplifyConfigPath = path.join(this.projectRoot, 'src', 'amplifyconfiguration.json');
      
      if (await fs.pathExists(amplifyConfigPath)) {
        const config = await fs.readJson(amplifyConfigPath);
        
        return {
          type: 'AWS Cognito',
          features: [
            'User Pools',
            'Sign Up/Sign In',
            'Email Verification',
            'Password Reset'
          ],
          provider: 'AWS'
        };
      }
      
      return {
        type: 'AWS Cognito',
        features: ['User Authentication']
      };
    } catch (error) {
      return {
        type: 'AWS Cognito',
        features: ['User Authentication']
      };
    }
  }
  
  /**
   * Get default architecture when analysis fails
   */
  getDefaultArchitecture() {
    return {
      frontend: {
        type: 'Angular',
        version: '19',
        features: ['TypeScript', 'Routing', 'SCSS']
      },
      backend: {
        type: 'AWS Amplify',
        services: ['API Gateway', 'Lambda Functions']
      },
      mobile: {
        type: 'Ionic',
        platforms: ['iOS', 'Android', 'Web']
      },
      database: {
        type: 'DynamoDB',
        tables: ['Users', 'Services', 'Transactions']
      },
      auth: {
        type: 'AWS Cognito',
        features: ['User Authentication']
      }
    };
  }
}

module.exports = ArchitectureAnalyzer;
