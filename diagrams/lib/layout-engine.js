/**
 * Grid layout engine for positioning components in a 1920x1080 canvas
 */
class LayoutEngine {
  constructor() {
    this.canvas = { 
      width: 1920, 
      height: 1080,
      padding: 100
    };
    
    // Define layers for architecture diagram
    this.layers = {
      presentation: { 
        y: 150, 
        height: 120,
        label: 'Presentation Layer'
      },
      api: { 
        y: 400, 
        height: 120,
        label: 'API Layer'
      },
      services: { 
        y: 650, 
        height: 120,
        label: 'Services Layer'
      }
    };
    
    // Standard component dimensions
    this.componentSize = {
      width: 200,
      height: 100,
      spacing: 150
    };
  }
  
  /**
   * Calculate positions for HourBank architecture components
   */
  calculateArchitecturePositions() {
    const positions = {};
    const centerX = this.canvas.width / 2;
    
    // Layer 1: Presentation Layer (Mobile + Web)
    positions.mobile = {
      x: centerX - 300,
      y: this.layers.presentation.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    positions.web = {
      x: centerX + 100,
      y: this.layers.presentation.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    // Layer 2: API Layer (Amplify API Gateway)
    positions.amplify = {
      x: centerX - 100,
      y: this.layers.api.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    // Layer 3: Services Layer (Auth, Lambda, Database)
    positions.cognito = {
      x: centerX - 400,
      y: this.layers.services.y,
      width: 180,
      height: this.componentSize.height
    };
    
    positions.lambda = {
      x: centerX - 90,
      y: this.layers.services.y,
      width: 180,
      height: this.componentSize.height
    };
    
    positions.dynamodb = {
      x: centerX + 220,
      y: this.layers.services.y,
      width: 180,
      height: this.componentSize.height
    };
    
    // Add layer labels
    positions.layer_labels = {
      presentation: {
        x: 50,
        y: this.layers.presentation.y + 40,
        width: 150,
        height: 30
      },
      api: {
        x: 50,
        y: this.layers.api.y + 40,
        width: 150,
        height: 30
      },
      services: {
        x: 50,
        y: this.layers.services.y + 40,
        width: 150,
        height: 30
      }
    };
    
    return positions;
  }
  
  /**
   * Calculate positions for lifecycle diagrams
   */
  calculateLifecyclePositions(steps) {
    const positions = {};
    const cols = 3;
    const rows = Math.ceil(steps.length / cols);
    
    const startX = 200;
    const startY = 200;
    const stepX = 400;
    const stepY = 250;
    
    steps.forEach((step, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      positions[step.id] = {
        x: startX + (col * stepX),
        y: startY + (row * stepY),
        width: 300,
        height: 100
      };
    });
    
    return positions;
  }
  
  /**
   * Get canvas dimensions
   */
  getCanvasDimensions() {
    return this.canvas;
  }
}

module.exports = LayoutEngine;
