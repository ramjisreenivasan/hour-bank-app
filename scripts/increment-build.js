#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildConfigPath = path.join(__dirname, '../build-config.json');
const environmentPath = path.join(__dirname, '../src/environments/environment.ts');
const environmentProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

function incrementBuildNumber() {
  try {
    // Read current build config
    const buildConfig = JSON.parse(fs.readFileSync(buildConfigPath, 'utf8'));
    
    // Increment build number
    buildConfig.buildNumber += 1;
    buildConfig.lastBuildDate = new Date().toISOString();
    
    console.log(`🔢 Incrementing build number to: ${buildConfig.buildNumber}`);
    
    // Write updated build config
    fs.writeFileSync(buildConfigPath, JSON.stringify(buildConfig, null, 2));
    
    // Update environment files
    updateEnvironmentFile(environmentPath, buildConfig, false);
    updateEnvironmentFile(environmentProdPath, buildConfig, true);
    
    console.log(`✅ Build number updated successfully!`);
    console.log(`📅 Build date: ${buildConfig.lastBuildDate}`);
    
    return buildConfig;
  } catch (error) {
    console.error('❌ Error incrementing build number:', error);
    process.exit(1);
  }
}

function updateEnvironmentFile(filePath, buildConfig, isProduction) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create the build info object
    const buildInfo = {
      buildNumber: buildConfig.buildNumber,
      buildDate: buildConfig.lastBuildDate,
      version: buildConfig.version,
      environment: isProduction ? 'production' : 'development'
    };
    
    // Replace or add buildInfo in the environment object
    if (content.includes('buildInfo:')) {
      // Replace existing buildInfo
      content = content.replace(
        /buildInfo:\s*\{[^}]*\}/s,
        `buildInfo: ${JSON.stringify(buildInfo, null, 4).replace(/\n/g, '\n  ')}`
      );
    } else {
      // Add buildInfo to the environment object
      content = content.replace(
        /(\s*enableLocalStorage:\s*[^,\n]+[,\n])(\s*)(})/,
        `$1$2buildInfo: ${JSON.stringify(buildInfo, null, 4).replace(/\n/g, '\n  ')}\n$2$3`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`📝 Updated ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
    // Don't exit here, just warn
  }
}

// Run if called directly
if (require.main === module) {
  incrementBuildNumber();
}

module.exports = { incrementBuildNumber };
