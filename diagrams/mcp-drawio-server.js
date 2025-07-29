#!/usr/bin/env node

/**
 * HourBank Draw.io MCP Server
 * Generates architecture diagrams with auto-export to PNG/SVG
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const path = require('path');
const fs = require('fs-extra');

// Import our libraries
const ShapeLibrary = require('./lib/shape-library.js');
const LayoutEngine = require('./lib/layout-engine.js');
const ArchitectureAnalyzer = require('./lib/architecture-analyzer.js');
const XMLGenerator = require('./lib/xml-generator.js');
const ImageExporter = require('./lib/image-exporter.js');

class HourBankDrawioServer {
  constructor() {
    this.server = new Server({
      name: 'hourbank-drawio-server',
      version: '1.0.0'
    }, {
      capabilities: { 
        tools: {}
      }
    });
    
    this.projectRoot = '/home/awsramji/projects/hourbank/hour-bank-app';
    this.diagramsPath = path.join(this.projectRoot, 'diagrams');
    this.outputPath = path.join(this.diagramsPath, 'output');
    
    this.setupToolHandlers();
  }
  
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'generate_architecture_diagram',
            description: 'Generate HourBank overall architecture diagram with auto-export to PNG/SVG (1920x1080, AWS-themed)',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Base filename for outputs (without extension)',
                  default: 'hourbank-architecture'
                },
                includeLabels: {
                  type: 'boolean',
                  description: 'Include layer labels in the diagram',
                  default: true
                }
              }
            }
          },
          {
            name: 'analyze_project_structure',
            description: 'Analyze HourBank project structure and return architecture details',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });
    
    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'generate_architecture_diagram':
            return await this.generateArchitectureDiagram(
              args?.filename || 'hourbank-architecture',
              args?.includeLabels !== false
            );
          
          case 'analyze_project_structure':
            return await this.analyzeProjectStructure();
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error executing ${name}: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }
  
  /**
   * Generate the complete architecture diagram
   */
  async generateArchitectureDiagram(filename, includeLabels) {
    try {
      // Ensure output directories exist
      await fs.ensureDir(this.outputPath);
      
      console.error(`Generating architecture diagram: ${filename}`);
      
      // Analyze project structure
      const analyzer = new ArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeProject();
      
      console.error('Project analysis complete');
      
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
      
      console.error('Diagram structure created');
      
      // Generate XML
      const xmlContent = xmlGen.generateXML();
      
      // Define output paths
      const drawioPath = path.join(this.outputPath, `${filename}.drawio`);
      const pngPath = path.join(this.outputPath, `${filename}.png`);
      const svgPath = path.join(this.outputPath, `${filename}.svg`);
      
      // Save Draw.io file
      await fs.writeFile(drawioPath, xmlContent, 'utf8');
      console.error('Draw.io file saved');
      
      // Export images
      const exporter = new ImageExporter();
      
      try {
        await exporter.exportToPNG(xmlContent, pngPath);
        console.error('PNG export complete');
      } catch (pngError) {
        console.error('PNG export failed:', pngError.message);
      }
      
      try {
        await exporter.exportToSVG(xmlContent, svgPath);
        console.error('SVG export complete');
      } catch (svgError) {
        console.error('SVG export failed:', svgError.message);
      }
      
      // Generate relative paths for documentation
      const relativePaths = {
        drawio: `./diagrams/output/${filename}.drawio`,
        png: `./diagrams/output/${filename}.png`,
        svg: `./diagrams/output/${filename}.svg`
      };
      
      return {
        content: [{
          type: 'text',
          text: `✅ HourBank Architecture Diagram Generated Successfully!

📁 Files Created:
- ${drawioPath} (Draw.io format - editable)
- ${pngPath} (PNG 1920x1080 - for markdown)
- ${svgPath} (SVG vector - for presentations)

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
          `
        }]
      };
      
    } catch (error) {
      console.error('Architecture diagram generation failed:', error);
      return {
        content: [{
          type: 'text',
          text: `❌ Error generating architecture diagram: ${error.message}

Please check:
- Project structure is accessible
- Required dependencies are installed
- Sufficient disk space for image generation

Error details: ${error.stack}`
        }],
        isError: true
      };
    }
  }
  
  /**
   * Analyze and return project structure details
   */
  async analyzeProjectStructure() {
    try {
      const analyzer = new ArchitectureAnalyzer(this.projectRoot);
      const architecture = await analyzer.analyzeProject();
      
      return {
        content: [{
          type: 'text',
          text: `🔍 HourBank Project Structure Analysis:

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

This analysis is used to generate accurate architecture diagrams.
          `
        }]
      };
      
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error analyzing project structure: ${error.message}`
        }],
        isError: true
      };
    }
  }
  
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('HourBank Draw.io MCP Server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new HourBankDrawioServer();
  server.run().catch(console.error);
}

module.exports = HourBankDrawioServer;
