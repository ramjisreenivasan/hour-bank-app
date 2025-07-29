/**
 * Export Draw.io diagrams to PNG/SVG using Puppeteer
 */
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

class ImageExporter {
  constructor() {
    this.viewportWidth = 1920;
    this.viewportHeight = 1080;
  }
  
  /**
   * Export diagram to PNG format
   */
  async exportToPNG(xmlContent, outputPath) {
    let browser = null;
    
    try {
      // Launch browser with optimized settings
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport to our target resolution
      await page.setViewport({
        width: this.viewportWidth,
        height: this.viewportHeight,
        deviceScaleFactor: 1
      });
      
      // Create HTML with embedded Draw.io viewer
      const html = this.createViewerHTML(xmlContent);
      
      // Set content and wait for diagram to render
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for the diagram to be fully rendered
      await page.waitForSelector('.mxgraph', { timeout: 10000 });
      
      // Additional wait to ensure complete rendering
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: this.viewportWidth,
          height: this.viewportHeight
        }
      });
      
      console.log(`PNG exported successfully: ${outputPath}`);
      
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      throw new Error(`PNG export failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Export diagram to SVG format
   */
  async exportToSVG(xmlContent, outputPath) {
    let browser = null;
    
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({
        width: this.viewportWidth,
        height: this.viewportHeight
      });
      
      const html = this.createViewerHTML(xmlContent);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.mxgraph', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Extract SVG content from the rendered diagram
      const svgContent = await page.evaluate(() => {
        const svgElement = document.querySelector('svg');
        if (svgElement) {
          // Set proper dimensions
          svgElement.setAttribute('width', '1920');
          svgElement.setAttribute('height', '1080');
          svgElement.setAttribute('viewBox', '0 0 1920 1080');
          return svgElement.outerHTML;
        }
        return null;
      });
      
      if (svgContent) {
        await fs.writeFile(outputPath, svgContent, 'utf8');
        console.log(`SVG exported successfully: ${outputPath}`);
      } else {
        throw new Error('Could not extract SVG content');
      }
      
    } catch (error) {
      console.error('Error exporting to SVG:', error);
      // Create a fallback SVG if extraction fails
      await this.createFallbackSVG(outputPath);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Export to both PNG and SVG formats
   */
  async exportToBoth(xmlContent, basePath) {
    const pngPath = basePath.replace(/\.[^/.]+$/, '') + '.png';
    const svgPath = basePath.replace(/\.[^/.]+$/, '') + '.svg';
    
    await Promise.all([
      this.exportToPNG(xmlContent, pngPath),
      this.exportToSVG(xmlContent, svgPath)
    ]);
    
    return { pngPath, svgPath };
  }
  
  /**
   * Create HTML with embedded Draw.io viewer
   */
  createViewerHTML(xmlContent) {
    // Encode XML content for embedding
    const encodedXML = Buffer.from(xmlContent).toString('base64');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HourBank Architecture Diagram</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
        }
        .container {
            width: 1920px;
            height: 1080px;
            position: relative;
            overflow: hidden;
        }
        .mxgraph {
            max-width: 100%;
            border: none;
            background: white;
        }
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="mxgraph" 
             style="max-width:100%;border:1px solid transparent;" 
             data-mxgraph='{"xml":"${encodedXML}","toolbar":"pages zoom layers lightbox"}'>
        </div>
    </div>
    <script>
        // Ensure the diagram is properly sized
        window.addEventListener('load', function() {
            setTimeout(function() {
                const graphs = document.querySelectorAll('.mxgraph');
                graphs.forEach(function(graph) {
                    graph.style.width = '1920px';
                    graph.style.height = '1080px';
                });
            }, 1000);
        });
    </script>
</body>
</html>`;
  }
  
  /**
   * Create a fallback SVG when export fails
   */
  async createFallbackSVG(outputPath) {
    const fallbackSVG = `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="white"/>
  <text x="960" y="540" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
    HourBank Architecture Diagram
  </text>
  <text x="960" y="580" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
    SVG export fallback - please use the .drawio file for full diagram
  </text>
</svg>`;
    
    await fs.writeFile(outputPath, fallbackSVG, 'utf8');
    console.log(`Fallback SVG created: ${outputPath}`);
  }
}

module.exports = ImageExporter;
