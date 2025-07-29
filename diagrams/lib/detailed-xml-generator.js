/**
 * Detailed XML generator for Draw.io diagrams with database tables
 */
const xml2js = require('xml2js');

class DetailedXMLGenerator {
  constructor() {
    this.cellId = 2; // Start after root cells (0, 1)
    this.cells = [];
    this.builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ' }
    });
  }
  
  /**
   * Add a component shape (for services like Lambda, Cognito, etc.)
   */
  addComponent(id, text, x, y, width, height, style) {
    const cellId = this.cellId++;
    
    this.cells.push({
      $: {
        id: cellId.toString(),
        value: text,
        style: style,
        vertex: '1',
        parent: '1'
      },
      mxGeometry: [{
        $: {
          x: x.toString(),
          y: y.toString(),
          width: width.toString(),
          height: height.toString(),
          as: 'geometry'
        }
      }]
    });
    
    return cellId;
  }
  
  /**
   * Add a database table with fields
   */
  addTable(id, table, x, y, width, height, categoryColor) {
    const cellId = this.cellId++;
    
    // Create table header
    const headerText = `${table.name}`;
    
    // Create fields text (show first few fields)
    const fieldsToShow = table.fields.slice(0, 4); // Show first 4 fields
    const fieldsText = fieldsToShow.map(field => {
      const primaryKey = field.isPrimary ? ' (PK)' : '';
      return `• ${field.name}: ${field.type}${primaryKey}`;
    }).join('\\n');
    
    const moreFields = table.fields.length > 4 ? `\\n... +${table.fields.length - 4} more` : '';
    
    const fullText = `${headerText}\\n${fieldsText}${moreFields}`;
    
    // Table style with category color
    const tableStyle = `shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=${categoryColor};strokeColor=#000000;fontColor=#000000;fontSize=11;strokeWidth=2`;
    
    this.cells.push({
      $: {
        id: cellId.toString(),
        value: fullText,
        style: tableStyle,
        vertex: '1',
        parent: '1'
      },
      mxGeometry: [{
        $: {
          x: x.toString(),
          y: y.toString(),
          width: width.toString(),
          height: height.toString(),
          as: 'geometry'
        }
      }]
    });
    
    return cellId;
  }
  
  /**
   * Add a category group box
   */
  addCategoryGroup(categoryName, x, y, width, height, color) {
    const cellId = this.cellId++;
    
    const groupStyle = `rounded=1;whiteSpace=wrap;html=1;fillColor=${color};strokeColor=#000000;strokeWidth=2;opacity=30;fontStyle=1;fontSize=14;fontColor=#333333;align=left;verticalAlign=top;spacingTop=10;spacingLeft=10`;
    
    this.cells.push({
      $: {
        id: cellId.toString(),
        value: categoryName,
        style: groupStyle,
        vertex: '1',
        parent: '1'
      },
      mxGeometry: [{
        $: {
          x: x.toString(),
          y: y.toString(),
          width: width.toString(),
          height: height.toString(),
          as: 'geometry'
        }
      }]
    });
    
    return cellId;
  }
  
  /**
   * Add a relationship connector between tables
   */
  addRelationshipConnector(sourceId, targetId, relationshipType, label = '') {
    const cellId = this.cellId++;
    
    // Different styles for different relationship types
    let connectorStyle;
    switch (relationshipType) {
      case 'hasMany':
        connectorStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#4CAF50;fontColor=#000000;fontSize=10;endArrow=classic;endFill=1;startArrow=none;startFill=0';
        break;
      case 'belongsTo':
        connectorStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#2196F3;fontColor=#000000;fontSize=10;endArrow=classic;endFill=1;startArrow=none;startFill=0';
        break;
      case 'hasOne':
        connectorStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#FF9800;fontColor=#000000;fontSize=10;endArrow=classic;endFill=1;startArrow=none;startFill=0';
        break;
      default:
        connectorStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#666666;fontColor=#000000;fontSize=10';
    }
    
    this.cells.push({
      $: {
        id: cellId.toString(),
        value: label,
        style: connectorStyle,
        edge: '1',
        parent: '1',
        source: sourceId.toString(),
        target: targetId.toString()
      },
      mxGeometry: [{
        $: {
          relative: '1',
          as: 'geometry'
        }
      }]
    });
    
    return cellId;
  }
  
  /**
   * Add a standard connector (for service connections)
   */
  addConnector(sourceId, targetId, label = '', style = null) {
    const cellId = this.cellId++;
    const defaultStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=3;strokeColor=#666666;fontColor=#000000;fontSize=12';
    
    this.cells.push({
      $: {
        id: cellId.toString(),
        value: label,
        style: style || defaultStyle,
        edge: '1',
        parent: '1',
        source: sourceId.toString(),
        target: targetId.toString()
      },
      mxGeometry: [{
        $: {
          relative: '1',
          as: 'geometry'
        }
      }]
    });
    
    return cellId;
  }
  
  /**
   * Add a text label
   */
  addLabel(text, x, y, width, height, style = null) {
    const defaultStyle = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;fontStyle=1;fontColor=#333333';
    
    return this.addComponent(`label_${this.cellId}`, text, x, y, width, height, style || defaultStyle);
  }
  
  /**
   * Add a category label with background
   */
  addCategoryLabel(text, x, y, width, height, backgroundColor) {
    const style = `text;html=1;strokeColor=#000000;fillColor=${backgroundColor};align=center;verticalAlign=middle;whiteSpace=wrap;rounded=1;fontSize=14;fontStyle=1;fontColor=#000000;strokeWidth=2`;
    
    return this.addComponent(`category_${this.cellId}`, text, x, y, width, height, style);
  }
  
  /**
   * Generate the complete detailed Draw.io XML
   */
  generateDetailedXML() {
    const xmlStructure = {
      mxfile: {
        $: {
          host: 'app.diagrams.net',
          modified: new Date().toISOString(),
          agent: 'HourBank Detailed MCP Server',
          version: '1.0.0',
          etag: this.generateEtag(),
          type: 'device'
        },
        diagram: [{
          $: {
            id: 'hourbank-detailed-architecture',
            name: 'HourBank Detailed Architecture'
          },
          mxGraphModel: [{
            $: {
              dx: '2400',
              dy: '1600',
              grid: '1',
              gridSize: '10',
              guides: '1',
              tooltips: '1',
              connect: '1',
              arrows: '1',
              fold: '1',
              page: '1',
              pageScale: '1',
              pageWidth: '2400',
              pageHeight: '1600',
              math: '0',
              shadow: '0'
            },
            root: [{
              mxCell: [
                {
                  $: { id: '0' }
                },
                {
                  $: { id: '1', parent: '0' }
                },
                ...this.cells
              ]
            }]
          }]
        }]
      }
    };
    
    return this.builder.buildObject(xmlStructure);
  }
  
  /**
   * Generate a unique etag for the diagram
   */
  generateEtag() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }
  
  /**
   * Reset the generator for a new diagram
   */
  reset() {
    this.cellId = 2;
    this.cells = [];
  }
  
  /**
   * Get current cell count
   */
  getCellCount() {
    return this.cells.length;
  }
}

module.exports = DetailedXMLGenerator;
