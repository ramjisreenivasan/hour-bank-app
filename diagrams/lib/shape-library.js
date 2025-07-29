/**
 * AWS-themed color palette and shape definitions for Draw.io diagrams
 */
class ShapeLibrary {
  constructor() {
    // AWS-themed color palette
    this.colors = {
      aws_orange: '#FF9900',
      aws_blue: '#232F3E',
      aws_light_blue: '#4B92DB',
      frontend: '#61DAFB',      // React/Angular blue
      mobile: '#3DDC84',        // Android green
      database: '#FF6B6B',      // Database red
      auth: '#9B59B6',          // Auth purple
      white: '#FFFFFF',
      black: '#000000',
      gray: '#666666'
    };
    
    // Draw.io style definitions
    this.styles = {
      frontend: `rounded=1;fillColor=${this.colors.frontend};strokeColor=${this.colors.black};fontColor=${this.colors.black};fontSize=14;fontStyle=1;strokeWidth=2`,
      backend: `rounded=1;fillColor=${this.colors.aws_orange};strokeColor=${this.colors.black};fontColor=${this.colors.white};fontSize=14;fontStyle=1;strokeWidth=2`,
      database: `shape=cylinder3;fillColor=${this.colors.database};strokeColor=${this.colors.black};fontColor=${this.colors.white};fontSize=14;fontStyle=1;strokeWidth=2`,
      auth: `shape=ellipse;fillColor=${this.colors.auth};strokeColor=${this.colors.black};fontColor=${this.colors.white};fontSize=14;fontStyle=1;strokeWidth=2`,
      mobile: `rounded=1;fillColor=${this.colors.mobile};strokeColor=${this.colors.black};fontColor=${this.colors.black};fontSize=14;fontStyle=1;strokeWidth=2`,
      api: `rounded=1;fillColor=${this.colors.aws_light_blue};strokeColor=${this.colors.black};fontColor=${this.colors.white};fontSize=14;fontStyle=1;strokeWidth=2`
    };
    
    // Connection styles
    this.connectorStyle = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=3;strokeColor=${this.colors.gray};fontColor=${this.colors.black};fontSize=12`;
  }
  
  getShapeStyle(type) {
    return this.styles[type] || this.styles.backend;
  }
  
  getConnectorStyle() {
    return this.connectorStyle;
  }
}

module.exports = ShapeLibrary;
