/**
 * Detailed layout engine for positioning database tables and components
 */
class DetailedLayoutEngine {
  constructor() {
    this.canvas = { 
      width: 2400,  // Wider canvas for detailed view
      height: 1600, // Taller canvas for more tables
      padding: 100
    };
    
    // Define layers for detailed architecture
    this.layers = {
      presentation: { 
        y: 80, 
        height: 120,
        label: 'Presentation Layer'
      },
      api: { 
        y: 280, 
        height: 120,
        label: 'API Layer'
      },
      business: { 
        y: 480, 
        height: 120,
        label: 'Business Logic Layer'
      },
      data: { 
        y: 680, 
        height: 800,
        label: 'Data Layer'
      }
    };
    
    // Table categories and their positions within data layer
    this.tableCategories = {
      core: { 
        x: 200, 
        y: 720, 
        width: 500, 
        label: 'Core Tables',
        color: '#FF6B6B'
      },
      scheduling: { 
        x: 800, 
        y: 720, 
        width: 500, 
        label: 'Scheduling Tables',
        color: '#4ECDC4'
      },
      social: { 
        x: 1400, 
        y: 720, 
        width: 400, 
        label: 'Social Tables',
        color: '#45B7D1'
      },
      communication: { 
        x: 200, 
        y: 1100, 
        width: 500, 
        label: 'Communication Tables',
        color: '#96CEB4'
      },
      metadata: { 
        x: 800, 
        y: 1100, 
        width: 400, 
        label: 'Metadata Tables',
        color: '#FFEAA7'
      },
      moderation: { 
        x: 1300, 
        y: 1100, 
        width: 300, 
        label: 'Moderation Tables',
        color: '#DDA0DD'
      }
    };
    
    // Standard component dimensions
    this.componentSize = {
      width: 180,
      height: 80,
      spacing: 20
    };
    
    this.tableSize = {
      width: 140,
      height: 100,
      spacing: 20
    };
  }
  
  /**
   * Calculate positions for detailed architecture with all database tables
   */
  calculateDetailedArchitecturePositions(architecture) {
    const positions = {};
    const centerX = this.canvas.width / 2;
    
    // Layer 1: Presentation Layer
    positions.mobile = {
      x: centerX - 300,
      y: this.layers.presentation.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    positions.web = {
      x: centerX + 120,
      y: this.layers.presentation.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    // Layer 2: API Layer
    positions.graphql = {
      x: centerX - 200,
      y: this.layers.api.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    positions.apigateway = {
      x: centerX + 20,
      y: this.layers.api.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    // Layer 3: Business Logic Layer
    positions.cognito = {
      x: centerX - 300,
      y: this.layers.business.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    positions.lambda = {
      x: centerX - 90,
      y: this.layers.business.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    positions.amplify = {
      x: centerX + 120,
      y: this.layers.business.y,
      width: this.componentSize.width,
      height: this.componentSize.height
    };
    
    // Layer 4: Data Layer - Position tables by category
    if (architecture.database && architecture.database.tables) {
      const tablePositions = this.calculateTablePositions(architecture.database.tables);
      Object.assign(positions, tablePositions);
    }
    
    // Add layer labels
    positions.layer_labels = {
      presentation: {
        x: 50,
        y: this.layers.presentation.y + 30,
        width: 180,
        height: 25
      },
      api: {
        x: 50,
        y: this.layers.api.y + 30,
        width: 180,
        height: 25
      },
      business: {
        x: 50,
        y: this.layers.business.y + 30,
        width: 180,
        height: 25
      },
      data: {
        x: 50,
        y: this.layers.data.y + 30,
        width: 180,
        height: 25
      }
    };
    
    // Add category labels
    positions.category_labels = {};
    Object.entries(this.tableCategories).forEach(([category, config]) => {
      positions.category_labels[category] = {
        x: config.x,
        y: config.y - 30,
        width: config.width,
        height: 25,
        color: config.color
      };
    });
    
    return positions;
  }
  
  /**
   * Calculate positions for database tables grouped by category
   */
  calculateTablePositions(tables) {
    const positions = {};
    const tablesByCategory = this.groupTablesByCategory(tables);
    
    Object.entries(tablesByCategory).forEach(([category, categoryTables]) => {
      const categoryConfig = this.tableCategories[category];
      if (!categoryConfig) return;
      
      const tablesPerRow = Math.floor(categoryConfig.width / (this.tableSize.width + this.tableSize.spacing));
      
      categoryTables.forEach((table, index) => {
        const row = Math.floor(index / tablesPerRow);
        const col = index % tablesPerRow;
        
        positions[`table_${table.name}`] = {
          x: categoryConfig.x + (col * (this.tableSize.width + this.tableSize.spacing)),
          y: categoryConfig.y + (row * (this.tableSize.height + this.tableSize.spacing)),
          width: this.tableSize.width,
          height: this.tableSize.height,
          category: category,
          table: table
        };
      });
    });
    
    return positions;
  }
  
  /**
   * Group tables by their category
   */
  groupTablesByCategory(tables) {
    const grouped = {};
    
    Object.values(tables).forEach(table => {
      const category = table.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(table);
    });
    
    return grouped;
  }
  
  /**
   * Calculate relationship connector positions
   */
  calculateRelationshipConnectors(positions, relationships) {
    const connectors = [];
    
    relationships.forEach(rel => {
      const fromPos = positions[`table_${rel.from}`];
      const toPos = positions[`table_${rel.to}`];
      
      if (fromPos && toPos) {
        connectors.push({
          from: `table_${rel.from}`,
          to: `table_${rel.to}`,
          type: rel.type,
          fromPos: {
            x: fromPos.x + fromPos.width / 2,
            y: fromPos.y + fromPos.height / 2
          },
          toPos: {
            x: toPos.x + toPos.width / 2,
            y: toPos.y + toPos.height / 2
          }
        });
      }
    });
    
    return connectors;
  }
  
  /**
   * Get canvas dimensions for detailed view
   */
  getDetailedCanvasDimensions() {
    return this.canvas;
  }
  
  /**
   * Get category configuration
   */
  getCategoryConfig(category) {
    return this.tableCategories[category];
  }
  
  /**
   * Get all category configurations
   */
  getAllCategoryConfigs() {
    return this.tableCategories;
  }
}

module.exports = DetailedLayoutEngine;
