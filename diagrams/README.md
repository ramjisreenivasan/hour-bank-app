# HourBank Draw.io MCP Server

This directory contains a custom MCP server that generates architecture diagrams for the HourBank application.

## Features

- ✅ **Automatic Project Analysis**: Scans your HourBank project structure
- ✅ **AWS-Themed Diagrams**: Uses official AWS color palette
- ✅ **High-Level Architecture**: Shows system components and relationships
- ✅ **Detailed Database View**: Shows all 13 database tables with fields and relationships
- ✅ **Multiple Formats**: Generates Draw.io XML, PNG, and SVG
- ✅ **Multiple Resolutions**: 1920x1080 (high-level) and 2400x1600 (detailed)
- ✅ **Grid Layout**: Professional layered architecture view
- ✅ **Table Categorization**: Groups database tables by functional purpose

## Generated Architecture Components

### High-Level Architecture
The server automatically detects and visualizes:
- **Presentation Layer**: Angular Web App + Ionic Mobile App
- **API Layer**: AWS Amplify with GraphQL API Gateway
- **Services Layer**: AWS Cognito (Auth) + Lambda (Logic) + DynamoDB (Data)

### Detailed Architecture
The detailed view includes all database tables organized by category:

**📊 Core Tables (3):**
- User - User profiles and account information (11 fields)
- Service - Services offered by users (13 fields)
- Transaction - Service exchange records (11 fields)

**📊 Scheduling Tables (3):**
- ServiceSchedule - Service availability schedules (7 fields)
- Booking - Time slot reservations (16 fields)
- ScheduleException - Schedule modifications (8 fields)

**📊 Social Tables (1):**
- Rating - User ratings and reviews (7 fields)

**📊 Communication Tables (3):**
- Notification - System notifications (7 fields)
- Message - Direct messages between users (7 fields)
- Conversation - Message threads (5 fields)

**📊 Metadata Tables (2):**
- Category - Service categories (6 fields)
- Skill - Predefined skill definitions (5 fields)

**📊 Moderation Tables (1):**
- Report - User reports for moderation (9 fields)

**🔗 Relationships**: 34 table relationships mapped with proper GraphQL relationship types (hasMany, belongsTo, hasOne)

## Usage

### Command Line Interface

```bash
# Generate high-level architecture diagram (1920x1080)
node diagrams/simple-mcp-server.js generate

# Generate detailed architecture with all database tables (2400x1600)
node diagrams/simple-mcp-server.js detailed

# Generate with custom filename
node diagrams/simple-mcp-server.js generate my-architecture
node diagrams/simple-mcp-server.js detailed my-detailed-architecture

# Analyze project structure
node diagrams/simple-mcp-server.js analyze

# Analyze detailed database structure
node diagrams/simple-mcp-server.js analyze-db
```

### Output Files

Generated files are saved to `diagrams/output/`:

**High-Level Architecture:**
- `hourbank-architecture.drawio` - Editable Draw.io format
- `hourbank-architecture.png` - PNG image (1920x1080)
- `hourbank-architecture.svg` - Vector format

**Detailed Architecture:**
- `hourbank-detailed-architecture.drawio` - Editable Draw.io format with all tables
- `hourbank-detailed-architecture.png` - PNG image (2400x1600)
- `hourbank-detailed-architecture.svg` - Vector format

### Embedding in Documentation

**High-Level Architecture:**
```markdown
# HourBank Architecture

![HourBank Architecture](./diagrams/output/hourbank-architecture.png)

[View Interactive Diagram](./diagrams/output/hourbank-architecture.drawio)
```

**Detailed Architecture:**
```markdown
# HourBank Detailed Architecture

![HourBank Detailed Architecture](./diagrams/output/hourbank-detailed-architecture.png)

[View Interactive Diagram](./diagrams/output/hourbank-detailed-architecture.drawio)
```

## Project Structure

```
diagrams/
├── lib/
│   ├── shape-library.js                  # AWS-themed colors and styles
│   ├── layout-engine.js                  # Grid positioning logic (high-level)
│   ├── detailed-layout-engine.js         # Grid positioning for detailed view
│   ├── architecture-analyzer.js          # Basic project structure analysis
│   ├── detailed-architecture-analyzer.js # Detailed database analysis
│   ├── xml-generator.js                  # Draw.io XML generation (high-level)
│   ├── detailed-xml-generator.js         # Draw.io XML generation (detailed)
│   └── image-exporter.js                 # PNG/SVG export (requires system libs)
├── output/                               # Generated diagrams
├── simple-mcp-server.js                  # Main server (standalone)
├── mcp-drawio-server.js                  # MCP protocol server
└── README.md                             # This file
```

## Dependencies

- `xml2js` - XML generation
- `fs-extra` - File system operations
- `puppeteer` - Image export (optional, requires system libraries)

## Architecture Analysis

### High-Level Analysis
The server analyzes your project by examining:
- `package.json` - Dependencies and versions
- `angular.json` - Angular configuration
- `capacitor.config.ts` - Mobile app setup
- `amplify/` - AWS services configuration

### Detailed Database Analysis
For detailed diagrams, the server additionally analyzes:
- `schema.graphql` - Complete database structure with all tables, fields, and relationships
- GraphQL type definitions with `@model` directive
- Relationship mappings (`@hasMany`, `@belongsTo`, `@hasOne`)
- Field types and constraints
- Table categorization by functional purpose

## Customization

### Colors

Edit `lib/shape-library.js` to customize colors:

```javascript
this.colors = {
  aws_orange: '#FF9900',    // AWS Orange
  aws_blue: '#232F3E',      // AWS Blue
  frontend: '#61DAFB',      // Angular Blue
  mobile: '#3DDC84',        // Android Green
  database: '#FF6B6B',      // Database Red
  auth: '#9B59B6'           // Auth Purple
};
```

### Layout

**High-Level Layout** - Edit `lib/layout-engine.js`:
```javascript
// Modify layer positions and component spacing
this.layers = {
  presentation: { y: 150, height: 120 },
  api: { y: 400, height: 120 },
  services: { y: 650, height: 120 }
};
```

**Detailed Layout** - Edit `lib/detailed-layout-engine.js`:
```javascript
// Modify table categories and positions
this.tableCategories = {
  core: { x: 200, y: 720, width: 500, color: '#FF6B6B' },
  scheduling: { x: 800, y: 720, width: 500, color: '#4ECDC4' },
  // ... more categories
};
```

### Table Categorization

Edit `lib/detailed-architecture-analyzer.js` to modify how tables are categorized:

```javascript
categorizeTable(tableName) {
  const categories = {
    'User': 'core',
    'Service': 'core',
    'Transaction': 'core',
    'Booking': 'scheduling',
    // ... add your custom categorization
  };
  return categories[tableName] || 'other';
}
```

## Troubleshooting

### PNG Export Issues

If PNG export fails with browser launch errors:

1. The Draw.io XML file will still be generated successfully
2. You can open the `.drawio` file in [draw.io](https://app.diagrams.net/)
3. Export to PNG manually from the web interface

### Missing System Libraries

For PNG export to work, you may need:

```bash
# Ubuntu/Debian
sudo apt-get install -y libnspr4 libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2

# Or use the fallback SVG which always works
```

### Schema Parsing Issues

If database analysis fails:
1. Ensure `schema.graphql` exists in the project root
2. Check that GraphQL types use the `@model` directive
3. Verify the schema syntax is valid

## Integration with MCP

This server can be integrated with Q CLI as an MCP server for conversational diagram generation. The MCP protocol version is in `mcp-drawio-server.js`.

## Example Output

### High-Level Architecture
```
┌─────────────┐    ┌─────────────┐
│   Mobile    │    │     Web     │
│    App      │    │    App      │
│  (Ionic)    │    │ (Angular)   │
└─────────────┘    └─────────────┘
        │                   │
        └─────────┬─────────┘
                  │
          ┌─────────────┐
          │ AWS Amplify │
          │ API Gateway │
          └─────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Auth     │ │   Lambda    │ │  DynamoDB   │
│  (Cognito)  │ │ Functions   │ │  Database   │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Detailed Architecture
```
Presentation Layer:  [Mobile App] [Web App]
API Layer:          [GraphQL API] [API Gateway]
Business Logic:     [Cognito] [Lambda] [Amplify]
Data Layer:         
  Core Tables:      [User] [Service] [Transaction]
  Scheduling:       [Booking] [ServiceSchedule] [ScheduleException]
  Social:           [Rating]
  Communication:    [Message] [Conversation] [Notification]
  Metadata:         [Category] [Skill]
  Moderation:       [Report]
```

## License

Part of the HourBank project - see main project LICENSE file.
