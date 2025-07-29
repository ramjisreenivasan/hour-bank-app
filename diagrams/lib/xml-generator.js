/**
 * Generate Draw.io XML format for diagrams
 */
const xml2js = require('xml2js');

class XMLGenerator {
  constructor() {
    this.cellId = 2; // Start after root cells (0, 1)
    this.cells = [];
    this.builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ' }
    });
  }
  
  /**
   * Add a shape to the diagram
   */
  addShape(id, text, x, y, width, height, style) {
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
   * Add a connector between two shapes
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
   * Add a text label (for layer labels)
   */
  addLabel(text, x, y, width, height, style = null) {
    const defaultStyle = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=16;fontStyle=1;fontColor=#333333';
    
    return this.addShape(`label_${this.cellId}`, text, x, y, width, height, style || defaultStyle);
  }
  
  /**
   * Generate the complete Draw.io XML
   */
  generateXML() {
    const xmlStructure = {
      mxfile: {
        $: {
          host: 'app.diagrams.net',
          modified: new Date().toISOString(),
          agent: 'HourBank MCP Server',
          version: '1.0.0',
          etag: this.generateEtag(),
          type: 'device'
        },
        diagram: [{
          $: {
            id: 'hourbank-architecture',
            name: 'HourBank Architecture'
          },
          mxGraphModel: [{
            $: {
              dx: '1920',
              dy: '1080',
              grid: '1',
              gridSize: '10',
              guides: '1',
              tooltips: '1',
              connect: '1',
              arrows: '1',
              fold: '1',
              page: '1',
              pageScale: '1',
              pageWidth: '1920',
              pageHeight: '1080',
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

module.exports = XMLGenerator;
