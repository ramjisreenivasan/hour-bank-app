#!/usr/bin/env node

/**
 * Simplified HourBank Draw.io MCP Server
 * Generates architecture diagrams with auto-export to PNG/SVG
 */

const path = require('path');
const fs = require('fs-extra');

// Import our libraries
const ShapeLibrary = require('./lib/shape-library.js');
const LayoutEngine = require('./lib/layout-engine.js');
const ArchitectureAnalyzer = require('./lib/architecture-analyzer.js');
const XMLGenerator = require('./lib/xml-generator.js');
const ImageExporter = require('./lib/image-exporter.js');

// Import detailed architecture libraries
const DetailedArchitectureAnalyzer = require('./lib/detailed-architecture-analyzer.js');
const DetailedLayoutEngine = require('./lib/detailed-layout-engine.js');
const DetailedXMLGenerator = require('./lib/detailed-xml-generator.js');

class HourBankDrawioServer {
  constructor() {
    this.projectRoot = '/home/awsramji/projects/hourbank/hour-bank-app';
    this.diagramsPath = path.join(this.projectRoot, 'diagrams');
    this.outputPath = path.join(this.diagramsPath, 'output');
  }
  
  /**
   * Generate the complete architecture diagram
   */
  async generateArchitectureDiagram(filename = 'hourbank-architecture', includeLabels = true) {
    try {
      // Ensure output directories exist
      await fs.ensureDir(this.outputPath);
      
      console.log(`Generating architecture diagram: ${filename}`);
      
      // Analyze project structure
      const analyzer = new ArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeProject();
      
      console.log('Project analysis complete');
      
      // Initialize components
      const shapeLib = new ShapeLibrary();
      const layout = new LayoutEngine();
      const xmlGen = new XMLGenerator();
      
      // Calculate positions
      const positions = layout.calculateArchitecturePositions();
      
      // Add layer labels if requested
      if (includeLabels) {
        xmlGen.addLabel('Presentation Layer', 
          positions.layer_labels.presentation.x,
          positions.layer_labels.presentation.y,
          positions.layer_labels.presentation.width,
          positions.layer_labels.presentation.height
        );
        
        xmlGen.addLabel('API Layer',
          positions.layer_labels.api.x,
          positions.layer_labels.api.y,
          positions.layer_labels.api.width,
          positions.layer_labels.api.height
        );
        
        xmlGen.addLabel('Services Layer',
          positions.layer_labels.services.x,
          positions.layer_labels.services.y,
          positions.layer_labels.services.width,
          positions.layer_labels.services.height
        );
      }
      
      // Add shapes with analyzed data
      const mobileId = xmlGen.addShape(
        'mobile',
        `Mobile App\\n(${architecture.mobile.type})`,
        positions.mobile.x,
        positions.mobile.y,
        positions.mobile.width,
        positions.mobile.height,
        shapeLib.getShapeStyle('mobile')
      );
      
      const webId = xmlGen.addShape(
        'web',
        `Web App\\n(${architecture.frontend.type} ${architecture.frontend.version})`,
        positions.web.x,
        positions.web.y,
        positions.web.width,
        positions.web.height,
        shapeLib.getShapeStyle('frontend')
      );
      
      const amplifyId = xmlGen.addShape(
        'amplify',
        `${architecture.backend.type}\\nAPI Gateway`,
        positions.amplify.x,
        positions.amplify.y,
        positions.amplify.width,
        positions.amplify.height,
        shapeLib.getShapeStyle('api')
      );
      
      const cognitoId = xmlGen.addShape(
        'cognito',
        `${architecture.auth.type}\\nAuthentication`,
        positions.cognito.x,
        positions.cognito.y,
        positions.cognito.width,
        positions.cognito.height,
        shapeLib.getShapeStyle('auth')
      );
      
      const lambdaId = xmlGen.addShape(
        'lambda',
        'AWS Lambda\\nBusiness Logic',
        positions.lambda.x,
        positions.lambda.y,
        positions.lambda.width,
        positions.lambda.height,
        shapeLib.getShapeStyle('backend')
      );
      
      const dynamoId = xmlGen.addShape(
        'dynamo',
        `${architecture.database.type}\\nDatabase`,
        positions.dynamodb.x,
        positions.dynamodb.y,
        positions.dynamodb.width,
        positions.dynamodb.height,
        shapeLib.getShapeStyle('database')
      );
      
      // Add connectors with labels
      xmlGen.addConnector(mobileId, amplifyId, 'GraphQL API', shapeLib.getConnectorStyle());
      xmlGen.addConnector(webId, amplifyId, 'GraphQL API', shapeLib.getConnectorStyle());
      xmlGen.addConnector(amplifyId, cognitoId, 'Auth', shapeLib.getConnectorStyle());
      xmlGen.addConnector(amplifyId, lambdaId, 'Functions', shapeLib.getConnectorStyle());
      xmlGen.addConnector(lambdaId, dynamoId, 'Data', shapeLib.getConnectorStyle());
      
      console.log('Diagram structure created');
      
      // Generate XML
      const xmlContent = xmlGen.generateXML();
      
      // Define output paths
      const drawioPath = path.join(this.outputPath, `${filename}.drawio`);
      const pngPath = path.join(this.outputPath, `${filename}.png`);
      const svgPath = path.join(this.outputPath, `${filename}.svg`);
      
      // Save Draw.io file
      await fs.writeFile(drawioPath, xmlContent, 'utf8');
      console.log('Draw.io file saved');
      
      // Export images (with error handling)
      const exporter = new ImageExporter();
      let pngSuccess = false;
      let svgSuccess = false;
      
      try {
        await exporter.exportToPNG(xmlContent, pngPath);
        console.log('PNG export complete');
        pngSuccess = true;
      } catch (pngError) {
        console.log('PNG export failed:', pngError.message);
      }
      
      try {
        await exporter.exportToSVG(xmlContent, svgPath);
        console.log('SVG export complete');
        svgSuccess = true;
      } catch (svgError) {
        console.log('SVG export failed:', svgError.message);
      }
      
      // Generate relative paths for documentation
      const relativePaths = {
        drawio: `./diagrams/output/${filename}.drawio`,
        png: `./diagrams/output/${filename}.png`,
        svg: `./diagrams/output/${filename}.svg`
      };
      
      const exportStatus = [];
      if (pngSuccess) exportStatus.push('✅ PNG (1920x1080)');
      else exportStatus.push('❌ PNG (failed)');
      
      if (svgSuccess) exportStatus.push('✅ SVG (vector)');
      else exportStatus.push('❌ SVG (failed)');
      
      const result = `✅ HourBank Architecture Diagram Generated!

📁 Files Created:
- ${drawioPath} (Draw.io format - editable)
- Export Status: ${exportStatus.join(', ')}

🏗️ Architecture Components Detected:
- Frontend: ${architecture.frontend.type} ${architecture.frontend.version}
- Mobile: ${architecture.mobile.type} (${architecture.mobile.platforms.join(', ')})
- Backend: ${architecture.backend.type}
- Auth: ${architecture.auth.type}
- Database: ${architecture.database.type} (${architecture.database.tables.length} tables)

📝 Markdown Usage:
\`\`\`markdown
# HourBank Architecture

![HourBank Architecture](${relativePaths.png})

[View Interactive Diagram](${relativePaths.drawio})
\`\`\`

🎨 Styling: AWS-themed colors with high-level component view
📐 Resolution: 1920x1080 optimized for documentation

Note: If image exports failed, you can still use the .drawio file in Draw.io web app.`;

      console.log(result);
      return result;
      
    } catch (error) {
      console.error('Architecture diagram generation failed:', error);
      const errorMsg = `❌ Error generating architecture diagram: ${error.message}

Please check:
- Project structure is accessible
- Required dependencies are installed
- Sufficient disk space for image generation

Error details: ${error.stack}`;
      
      console.log(errorMsg);
      return errorMsg;
    }
  }
  
  /**
   * Generate detailed architecture diagram with all database tables
   */
  async generateDetailedArchitectureDiagram(filename = 'hourbank-detailed-architecture', includeLabels = true) {
    try {
      // Ensure output directories exist
      await fs.ensureDir(this.outputPath);
      
      console.log(`Generating detailed architecture diagram: ${filename}`);
      
      // Analyze project structure in detail
      const analyzer = new DetailedArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeDetailedArchitecture();
      
      console.log('Detailed project analysis complete');
      console.log(`Found ${architecture.database.totalTables} database tables`);
      
      // Initialize detailed components
      const shapeLib = new ShapeLibrary();
      const layout = new DetailedLayoutEngine();
      const xmlGen = new DetailedXMLGenerator();
      
      // Calculate positions for detailed view
      const positions = layout.calculateDetailedArchitecturePositions(architecture);
      
      // Add layer labels if requested
      if (includeLabels) {
        xmlGen.addLabel('Presentation Layer', 
          positions.layer_labels.presentation.x,
          positions.layer_labels.presentation.y,
          positions.layer_labels.presentation.width,
          positions.layer_labels.presentation.height
        );
        
        xmlGen.addLabel('API Layer',
          positions.layer_labels.api.x,
          positions.layer_labels.api.y,
          positions.layer_labels.api.width,
          positions.layer_labels.api.height
        );
        
        xmlGen.addLabel('Business Logic Layer',
          positions.layer_labels.business.x,
          positions.layer_labels.business.y,
          positions.layer_labels.business.width,
          positions.layer_labels.business.height
        );
        
        xmlGen.addLabel('Data Layer',
          positions.layer_labels.data.x,
          positions.layer_labels.data.y,
          positions.layer_labels.data.width,
          positions.layer_labels.data.height
        );
      }
      
      // Add service components
      const mobileId = xmlGen.addComponent(
        'mobile',
        `Mobile App\\n(${architecture.mobile.type})`,
        positions.mobile.x,
        positions.mobile.y,
        positions.mobile.width,
        positions.mobile.height,
        shapeLib.getShapeStyle('mobile')
      );
      
      const webId = xmlGen.addComponent(
        'web',
        `Web App\\n(${architecture.frontend.type})`,
        positions.web.x,
        positions.web.y,
        positions.web.width,
        positions.web.height,
        shapeLib.getShapeStyle('frontend')
      );
      
      const graphqlId = xmlGen.addComponent(
        'graphql',
        `GraphQL API\\n(${architecture.api.type})`,
        positions.graphql.x,
        positions.graphql.y,
        positions.graphql.width,
        positions.graphql.height,
        shapeLib.getShapeStyle('api')
      );
      
      const apigatewayId = xmlGen.addComponent(
        'apigateway',
        'API Gateway\\n(AWS)',
        positions.apigateway.x,
        positions.apigateway.y,
        positions.apigateway.width,
        positions.apigateway.height,
        shapeLib.getShapeStyle('backend')
      );
      
      const cognitoId = xmlGen.addComponent(
        'cognito',
        `${architecture.auth.type}\\nAuthentication`,
        positions.cognito.x,
        positions.cognito.y,
        positions.cognito.width,
        positions.cognito.height,
        shapeLib.getShapeStyle('auth')
      );
      
      const lambdaId = xmlGen.addComponent(
        'lambda',
        'AWS Lambda\\nBusiness Logic',
        positions.lambda.x,
        positions.lambda.y,
        positions.lambda.width,
        positions.lambda.height,
        shapeLib.getShapeStyle('backend')
      );
      
      const amplifyId = xmlGen.addComponent(
        'amplify',
        'AWS Amplify\\nHosting & CI/CD',
        positions.amplify.x,
        positions.amplify.y,
        positions.amplify.width,
        positions.amplify.height,
        shapeLib.getShapeStyle('backend')
      );
      
      // Add category groups and tables
      const tableIds = {};
      const categoryConfigs = layout.getAllCategoryConfigs();
      
      // Add category group backgrounds
      Object.entries(categoryConfigs).forEach(([category, config]) => {
        const tablesInCategory = Object.values(architecture.database.tables).filter(
          table => table.category === category
        );
        
        if (tablesInCategory.length > 0) {
          // Calculate group dimensions
          const groupHeight = Math.ceil(tablesInCategory.length / 3) * (layout.tableSize.height + layout.tableSize.spacing) + 60;
          
          xmlGen.addCategoryGroup(
            config.label,
            config.x - 20,
            config.y - 50,
            config.width + 40,
            groupHeight,
            config.color
          );
        }
      });
      
      // Add database tables
      Object.entries(positions).forEach(([key, pos]) => {
        if (key.startsWith('table_')) {
          const tableName = key.replace('table_', '');
          const table = pos.table;
          const categoryConfig = categoryConfigs[pos.category];
          
          if (table && categoryConfig) {
            const tableId = xmlGen.addTable(
              key,
              table,
              pos.x,
              pos.y,
              pos.width,
              pos.height,
              categoryConfig.color
            );
            
            tableIds[tableName] = tableId;
          }
        }
      });
      
      // Add service layer connectors
      xmlGen.addConnector(mobileId, graphqlId, 'GraphQL', shapeLib.getConnectorStyle());
      xmlGen.addConnector(webId, graphqlId, 'GraphQL', shapeLib.getConnectorStyle());
      xmlGen.addConnector(graphqlId, apigatewayId, 'API', shapeLib.getConnectorStyle());
      xmlGen.addConnector(apigatewayId, cognitoId, 'Auth', shapeLib.getConnectorStyle());
      xmlGen.addConnector(apigatewayId, lambdaId, 'Functions', shapeLib.getConnectorStyle());
      xmlGen.addConnector(lambdaId, amplifyId, 'Deploy', shapeLib.getConnectorStyle());
      
      // Add key table relationships (limit to avoid clutter)
      const keyRelationships = architecture.database.relationships.filter(rel => 
        ['User', 'Service', 'Transaction', 'Booking'].includes(rel.from) ||
        ['User', 'Service', 'Transaction', 'Booking'].includes(rel.to)
      );
      
      keyRelationships.forEach(rel => {
        const sourceId = tableIds[rel.from];
        const targetId = tableIds[rel.to];
        
        if (sourceId && targetId) {
          xmlGen.addRelationshipConnector(sourceId, targetId, rel.type, '');
        }
      });
      
      console.log('Detailed diagram structure created');
      
      // Generate XML
      const xmlContent = xmlGen.generateDetailedXML();
      
      // Define output paths
      const drawioPath = path.join(this.outputPath, `${filename}.drawio`);
      const pngPath = path.join(this.outputPath, `${filename}.png`);
      const svgPath = path.join(this.outputPath, `${filename}.svg`);
      
      // Save Draw.io file
      await fs.writeFile(drawioPath, xmlContent, 'utf8');
      console.log('Detailed Draw.io file saved');
      
      // Export images (with error handling)
      const exporter = new ImageExporter();
      exporter.viewportWidth = 2400;  // Use wider viewport for detailed view
      exporter.viewportHeight = 1600;
      
      let pngSuccess = false;
      let svgSuccess = false;
      
      try {
        await exporter.exportToPNG(xmlContent, pngPath);
        console.log('PNG export complete');
        pngSuccess = true;
      } catch (pngError) {
        console.log('PNG export failed:', pngError.message);
      }
      
      try {
        await exporter.exportToSVG(xmlContent, svgPath);
        console.log('SVG export complete');
        svgSuccess = true;
      } catch (svgError) {
        console.log('SVG export failed:', svgError.message);
      }
      
      // Generate relative paths for documentation
      const relativePaths = {
        drawio: `./diagrams/output/${filename}.drawio`,
        png: `./diagrams/output/${filename}.png`,
        svg: `./diagrams/output/${filename}.svg`
      };
      
      const exportStatus = [];
      if (pngSuccess) exportStatus.push('✅ PNG (2400x1600)');
      else exportStatus.push('❌ PNG (failed)');
      
      if (svgSuccess) exportStatus.push('✅ SVG (vector)');
      else exportStatus.push('❌ SVG (failed)');
      
      // Count tables by category
      const tablesByCategory = {};
      Object.values(architecture.database.tables).forEach(table => {
        const category = table.category || 'other';
        tablesByCategory[category] = (tablesByCategory[category] || 0) + 1;
      });
      
      const categoryBreakdown = Object.entries(tablesByCategory)
        .map(([category, count]) => `${category}: ${count}`)
        .join(', ');
      
      const result = `✅ HourBank Detailed Architecture Diagram Generated!

📁 Files Created:
- ${drawioPath} (Draw.io format - editable)
- Export Status: ${exportStatus.join(', ')}

🏗️ Detailed Architecture Components:
- Frontend: ${architecture.frontend.type} ${architecture.frontend.version}
- Mobile: ${architecture.mobile.type} (${architecture.mobile.platforms.join(', ')})
- API: ${architecture.api.type} with ${architecture.api.features.join(', ')}
- Backend: ${architecture.backend.type}
- Auth: ${architecture.auth.type}
- Database: ${architecture.database.type} (${architecture.database.totalTables} tables)

📊 Database Tables by Category:
- ${categoryBreakdown}

🔗 Relationships: ${architecture.database.relationships.length} table relationships mapped

📝 Markdown Usage:
\`\`\`markdown
# HourBank Detailed Architecture

![HourBank Detailed Architecture](${relativePaths.png})

[View Interactive Diagram](${relativePaths.drawio})
\`\`\`

🎨 Styling: AWS-themed colors with detailed database view
📐 Resolution: 2400x1600 optimized for detailed documentation
🗂️ Organization: Tables grouped by functional categories

Note: If image exports failed, you can still use the .drawio file in Draw.io web app.`;

      console.log(result);
      return result;
      
    } catch (error) {
      console.error('Detailed architecture diagram generation failed:', error);
      const errorMsg = `❌ Error generating detailed architecture diagram: ${error.message}

Please check:
- Project structure is accessible
- GraphQL schema is readable
- Required dependencies are installed
- Sufficient disk space for image generation

Error details: ${error.stack}`;
      
      console.log(errorMsg);
      return errorMsg;
    }
  }
  
  /**
   * Analyze and return project structure details
   */
  async analyzeProjectStructure() {
    try {
      const analyzer = new ArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeProject();
      
      const result = `🔍 HourBank Project Structure Analysis:

📱 Frontend:
- Type: ${architecture.frontend.type}
- Version: ${architecture.frontend.version}
- Features: ${architecture.frontend.features.join(', ')}

📲 Mobile:
- Type: ${architecture.mobile.type}
- Platforms: ${architecture.mobile.platforms.join(', ')}

☁️ Backend:
- Type: ${architecture.backend.type}
- Services: ${architecture.backend.services.join(', ')}

🔐 Authentication:
- Type: ${architecture.auth.type}
- Features: ${architecture.auth.features.join(', ')}

🗄️ Database:
- Type: ${architecture.database.type}
- Tables: ${architecture.database.tables.join(', ')}

This analysis is used to generate accurate architecture diagrams.`;

      console.log(result);
      return result;
      
    } catch (error) {
      const errorMsg = `❌ Error analyzing project structure: ${error.message}`;
      console.log(errorMsg);
      return errorMsg;
    }
  }
  
  /**
   * Analyze detailed database structure
   */
  async analyzeDetailedDatabase() {
    try {
      const analyzer = new DetailedArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeDetailedArchitecture();
      
      const tablesByCategory = {};
      Object.values(architecture.database.tables).forEach(table => {
        const category = table.category || 'other';
        if (!tablesByCategory[category]) {
          tablesByCategory[category] = [];
        }
        tablesByCategory[category].push(table.name);
      });
      
      let categoryBreakdown = '';
      Object.entries(tablesByCategory).forEach(([category, tables]) => {
        categoryBreakdown += `\n📊 ${category.toUpperCase()} TABLES (${tables.length}):\n`;
        tables.forEach(table => {
          const tableDetails = architecture.database.tables[table];
          categoryBreakdown += `  • ${table} - ${tableDetails.description} (${tableDetails.fields.length} fields)\n`;
        });
      });
      
      const result = `🔍 HourBank Detailed Database Analysis:

📈 Database Overview:
- Type: ${architecture.database.type}
- Total Tables: ${architecture.database.totalTables}
- Total Relationships: ${architecture.database.relationships.length}
- API Type: ${architecture.database.apiType}

${categoryBreakdown}

🔗 Key Relationships:
${architecture.database.relationships.slice(0, 10).map(rel => 
  `  • ${rel.from} ${rel.type} ${rel.to}`
).join('\n')}
${architecture.database.relationships.length > 10 ? `\n  ... and ${architecture.database.relationships.length - 10} more relationships` : ''}

This detailed analysis is used to generate comprehensive database diagrams.`;

      console.log(result);
      return result;
      
    } catch (error) {
      const errorMsg = `❌ Error analyzing detailed database structure: ${error.message}`;
      console.log(errorMsg);
      return errorMsg;
    }
  }
}

// Command line interface
async function main() {
  const server = new HourBankDrawioServer();
  
  const command = process.argv[2];
  const filename = process.argv[3] || 'hourbank-architecture';
  
  switch (command) {
    case 'generate':
      await server.generateArchitectureDiagram(filename);
      break;
    case 'detailed':
      await server.generateDetailedArchitectureDiagram(filename);
      break;
    case 'analyze':
      await server.analyzeProjectStructure();
      break;
    case 'analyze-db':
      await server.analyzeDetailedDatabase();
      break;
    default:
      console.log(`
HourBank Draw.io Diagram Generator

Usage:
  node simple-mcp-server.js generate [filename]   - Generate high-level architecture diagram
  node simple-mcp-server.js detailed [filename]   - Generate detailed architecture with all database tables
  node simple-mcp-server.js analyze               - Analyze project structure
  node simple-mcp-server.js analyze-db            - Analyze detailed database structure

Examples:
  node simple-mcp-server.js generate
  node simple-mcp-server.js detailed hourbank-detailed
  node simple-mcp-server.js analyze
  node simple-mcp-server.js analyze-db
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = HourBankDrawioServer;
