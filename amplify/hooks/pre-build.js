#!/usr/bin/env node

const { incrementBuildNumber } = require('../../scripts/increment-build.js');

console.log('🚀 Amplify Pre-Build Hook: Incrementing build number...');

try {
  const buildConfig = incrementBuildNumber();
  console.log(`✅ Build number incremented to: ${buildConfig.buildNumber}`);
  console.log(`📅 Build date: ${buildConfig.lastBuildDate}`);
} catch (error) {
  console.error('❌ Failed to increment build number:', error);
  // Don't fail the build, just warn
  console.warn('⚠️  Continuing with build despite build number increment failure');
}
