/**
 * Detailed architecture analyzer that extracts all database tables and relationships
 */
const fs = require('fs-extra');
const path = require('path');

class DetailedArchitectureAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }
  
  /**
   * Analyze the complete detailed architecture including all database tables
   */
  async analyzeDetailedArchitecture() {
    try {
      const architecture = {
        frontend: await this.analyzeFrontend(),
        backend: await this.analyzeBackend(),
        mobile: await this.analyzeMobile(),
        database: await this.analyzeDetailedDatabase(),
        auth: await this.analyzeAuth(),
        api: await this.analyzeAPI()
      };
      
      return architecture;
    } catch (error) {
      console.error('Error analyzing detailed architecture:', error);
      return this.getDefaultDetailedArchitecture();
    }
  }
  
  /**
   * Analyze frontend (same as before)
   */
  async analyzeFrontend() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      let packageJson = {};
      
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }
      
      const angularVersion = packageJson.dependencies?.['@angular/core'] || 'Unknown';
      
      return {
        type: 'Angular',
        version: angularVersion,
        features: ['TypeScript', 'Routing', 'SCSS', 'PWA'],
        components: ['Auth', 'Dashboard', 'Profile', 'Services', 'Transactions']
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
   * Analyze mobile (same as before)
   */
  async analyzeMobile() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      let packageJson = {};
      
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJson(packageJsonPath);
      }
      
      const hasIonic = !!packageJson.dependencies?.['@ionic/angular'];
      const ionicVersion = packageJson.dependencies?.['@ionic/angular'] || 'Unknown';
      
      return {
        type: hasIonic ? 'Ionic' : 'PWA',
        version: ionicVersion,
        platforms: ['iOS', 'Android', 'Web'],
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
   * Analyze backend services
   */
  async analyzeBackend() {
    return {
      type: 'AWS Amplify',
      services: [
        'API Gateway',
        'Lambda Functions',
        'CloudFormation',
        'CloudWatch'
      ],
      hosting: 'Amplify Hosting'
    };
  }
  
  /**
   * Analyze API layer
   */
  async analyzeAPI() {
    return {
      type: 'GraphQL',
      endpoint: 'API Gateway',
      features: [
        'Queries',
        'Mutations', 
        'Subscriptions',
        'Real-time Updates'
      ],
      authentication: 'Cognito User Pools'
    };
  }
  
  /**
   * Analyze authentication
   */
  async analyzeAuth() {
    return {
      type: 'AWS Cognito',
      features: [
        'User Pools',
        'Sign Up/Sign In',
        'Email Verification',
        'Password Reset',
        'JWT Tokens'
      ],
      provider: 'AWS'
    };
  }
  
  /**
   * Analyze detailed database structure from GraphQL schema
   */
  async analyzeDetailedDatabase() {
    try {
      const schemaPath = path.join(this.projectRoot, 'schema.graphql');
      
      if (await fs.pathExists(schemaPath)) {
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        return this.parseGraphQLSchema(schemaContent);
      }
      
      return this.getDefaultDatabaseStructure();
    } catch (error) {
      console.error('Error analyzing database:', error);
      return this.getDefaultDatabaseStructure();
    }
  }
  
  /**
   * Parse GraphQL schema to extract table structure and relationships
   */
  parseGraphQLSchema(schemaContent) {
    const tables = {};
    const relationships = [];
    
    // Split schema into type definitions
    const typeBlocks = this.extractTypeBlocks(schemaContent);
    
    typeBlocks.forEach(typeBlock => {
      const nameMatch = typeBlock.match(/type\s+(\w+)/);
      if (!nameMatch) return;
      
      const tableName = nameMatch[1];
      if (['Query', 'Mutation', 'Subscription'].includes(tableName)) return;
      
      // Extract fields
      const fields = this.extractFields(typeBlock);
      const tableRelationships = this.extractRelationships(typeBlock, tableName);
      
      tables[tableName] = {
        name: tableName,
        fields: fields,
        category: this.categorizeTable(tableName),
        description: this.getTableDescription(tableName)
      };
      
      relationships.push(...tableRelationships);
    });
    
    return {
      type: 'DynamoDB',
      tables: tables,
      relationships: relationships,
      totalTables: Object.keys(tables).length,
      apiType: 'GraphQL'
    };
  }
  
  /**
   * Extract individual type blocks from schema
   */
  extractTypeBlocks(schemaContent) {
    const typeBlocks = [];
    
    // Use a simpler regex approach to split by type definitions
    const typePattern = /type\s+(\w+)\s+@model[\s\S]*?^}/gm;
    const matches = schemaContent.match(typePattern);
    
    if (matches) {
      return matches;
    }
    
    // Fallback: manual parsing
    const lines = schemaContent.split('\n');
    let currentBlock = '';
    let inTypeBlock = false;
    let braceDepth = 0;
    let typeStarted = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Start of a type block
      if (trimmedLine.match(/^type\s+\w+.*@model/)) {
        if (currentBlock) {
          typeBlocks.push(currentBlock);
        }
        currentBlock = line + '\n';
        inTypeBlock = true;
        typeStarted = false;
        braceDepth = 0;
        continue;
      }
      
      if (inTypeBlock) {
        currentBlock += line + '\n';
        
        // Look for the start of the actual type definition (after auth rules)
        if (!typeStarted && (trimmedLine === '}) {' || trimmedLine === '{')) {
          typeStarted = true;
          braceDepth = 1;
        } else if (typeStarted) {
          // Count braces
          for (const char of line) {
            if (char === '{') braceDepth++;
            if (char === '}') braceDepth--;
          }
          
          // End of type definition
          if (braceDepth === 0) {
            typeBlocks.push(currentBlock);
            currentBlock = '';
            inTypeBlock = false;
            typeStarted = false;
          }
        }
      }
    }
    
    // Add the last block if exists
    if (currentBlock && inTypeBlock) {
      typeBlocks.push(currentBlock);
    }
    
    return typeBlocks;
  }
  
  /**
   * Extract fields from a type definition
   */
  extractFields(typeContent) {
    const fields = [];
    
    // More robust field extraction
    const lines = typeContent.split('\n');
    let inFieldsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      // Start of fields section
      if (trimmedLine.includes('{')) {
        inFieldsSection = true;
        continue;
      }
      
      // End of fields section
      if (trimmedLine.includes('}')) {
        break;
      }
      
      if (inFieldsSection) {
        // Match field definitions like: fieldName: Type! or fieldName: [Type]!
        const fieldMatch = trimmedLine.match(/^(\w+):\s*(.+?)(?:\s*@|\s*$)/);
        
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2].trim();
          
          // Skip relationship fields, timestamps, and directive lines
          if (!fieldName.includes('@') && 
              !['createdAt', 'updatedAt'].includes(fieldName) &&
              !fieldType.includes('@hasMany') &&
              !fieldType.includes('@belongsTo') &&
              !fieldType.includes('@hasOne') &&
              !trimmedLine.includes('@hasMany') &&
              !trimmedLine.includes('@belongsTo') &&
              !trimmedLine.includes('@hasOne') &&
              !trimmedLine.startsWith('# ')) {
            
            fields.push({
              name: fieldName,
              type: this.simplifyType(fieldType),
              isPrimary: fieldName === 'id'
            });
          }
        }
      }
    }
    
    return fields;
  }
  
  /**
   * Extract relationships from a type definition
   */
  extractRelationships(typeContent, tableName) {
    const relationships = [];
    const lines = typeContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Extract @hasMany relationships
      const hasManyMatch = trimmedLine.match(/(\w+):\s*\[(\w+)\]\s*@hasMany/);
      if (hasManyMatch) {
        relationships.push({
          from: tableName,
          to: hasManyMatch[2],
          type: 'hasMany',
          field: hasManyMatch[1]
        });
      }
      
      // Extract @belongsTo relationships
      const belongsToMatch = trimmedLine.match(/(\w+):\s*(\w+)\s*@belongsTo/);
      if (belongsToMatch) {
        relationships.push({
          from: tableName,
          to: belongsToMatch[2],
          type: 'belongsTo',
          field: belongsToMatch[1]
        });
      }
      
      // Extract @hasOne relationships
      const hasOneMatch = trimmedLine.match(/(\w+):\s*(\w+)\s*@hasOne/);
      if (hasOneMatch) {
        relationships.push({
          from: tableName,
          to: hasOneMatch[2],
          type: 'hasOne',
          field: hasOneMatch[1]
        });
      }
    }
    
    return relationships;
  }
  
  /**
   * Categorize tables by their purpose
   */
  categorizeTable(tableName) {
    const categories = {
      'User': 'core',
      'Service': 'core',
      'Transaction': 'core',
      'Booking': 'scheduling',
      'ServiceSchedule': 'scheduling',
      'ScheduleException': 'scheduling',
      'Rating': 'social',
      'Message': 'communication',
      'Conversation': 'communication',
      'Notification': 'communication',
      'Category': 'metadata',
      'Skill': 'metadata',
      'Report': 'moderation'
    };
    
    return categories[tableName] || 'other';
  }
  
  /**
   * Get description for each table
   */
  getTableDescription(tableName) {
    const descriptions = {
      'User': 'User profiles and account information',
      'Service': 'Services offered by users',
      'Transaction': 'Service exchange records',
      'Booking': 'Time slot reservations',
      'ServiceSchedule': 'Service availability schedules',
      'ScheduleException': 'Schedule modifications',
      'Rating': 'User ratings and reviews',
      'Message': 'Direct messages between users',
      'Conversation': 'Message threads',
      'Notification': 'System notifications',
      'Category': 'Service categories',
      'Skill': 'Predefined skill definitions',
      'Report': 'User reports for moderation'
    };
    
    return descriptions[tableName] || 'Application data table';
  }
  
  /**
   * Simplify GraphQL types for display
   */
  simplifyType(type) {
    return type
      .replace(/!/g, '')
      .replace(/\[|\]/g, '')
      .replace(/AWSDateTime/g, 'DateTime')
      .replace(/AWSDate/g, 'Date')
      .trim();
  }
  
  /**
   * Get default database structure if parsing fails
   */
  getDefaultDatabaseStructure() {
    return {
      type: 'DynamoDB',
      tables: {
        'User': {
          name: 'User',
          fields: [
            { name: 'id', type: 'ID', isPrimary: true },
            { name: 'email', type: 'String' },
            { name: 'username', type: 'String' },
            { name: 'bankHours', type: 'Float' }
          ],
          category: 'core'
        },
        'Service': {
          name: 'Service',
          fields: [
            { name: 'id', type: 'ID', isPrimary: true },
            { name: 'title', type: 'String' },
            { name: 'hourlyRate', type: 'Float' }
          ],
          category: 'core'
        },
        'Transaction': {
          name: 'Transaction',
          fields: [
            { name: 'id', type: 'ID', isPrimary: true },
            { name: 'hoursSpent', type: 'Float' },
            { name: 'status', type: 'String' }
          ],
          category: 'core'
        }
      },
      relationships: [],
      totalTables: 3,
      apiType: 'GraphQL'
    };
  }
  
  /**
   * Get default detailed architecture
   */
  getDefaultDetailedArchitecture() {
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
      database: this.getDefaultDatabaseStructure(),
      auth: {
        type: 'AWS Cognito',
        features: ['User Authentication']
      },
      api: {
        type: 'GraphQL',
        features: ['Queries', 'Mutations', 'Subscriptions']
      }
    };
  }
}

module.exports = DetailedArchitectureAnalyzer;
