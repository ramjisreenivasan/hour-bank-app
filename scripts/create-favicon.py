#!/usr/bin/env python3

from PIL import Image, ImageDraw
import os

def create_favicon():
    """Create a favicon based on the HourBank logo design"""
    
    # Create different sizes for the ICO file
    sizes = [16, 32, 48, 64]
    images = []
    
    for size in sizes:
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Colors based on the original logo
        bg_color = (30, 58, 138, 255)  # Dark blue
        gold_color = (251, 191, 36, 255)  # Gold
        gold_dark = (245, 158, 11, 255)  # Darker gold
        white_color = (255, 255, 255, 255)  # White
        
        # Background with rounded corners
        margin = max(1, size // 16)
        draw.rounded_rectangle(
            [margin, margin, size-margin, size-margin], 
            radius=max(2, size//8), 
            fill=bg_color
        )
        
        # Scale factors based on size
        scale = size / 32.0
        
        # Bank roof (triangle)
        roof_points = [
            (size * 0.125, size * 0.3125),  # Left
            (size * 0.5, size * 0.125),    # Top
            (size * 0.875, size * 0.3125)  # Right
        ]
        draw.polygon(roof_points, fill=gold_color, outline=gold_dark)
        
        # Columns (simplified to 3 rectangles)
        col_width = max(1, int(size * 0.0625))
        col_height = int(size * 0.375)
        col_y = int(size * 0.3125)
        
        # Left column
        draw.rectangle([int(size * 0.1875), col_y, int(size * 0.1875) + col_width, col_y + col_height], fill=gold_color)
        # Center column
        draw.rectangle([int(size * 0.46875), col_y, int(size * 0.46875) + col_width, col_y + col_height], fill=gold_color)
        # Right column
        draw.rectangle([int(size * 0.75), col_y, int(size * 0.75) + col_width, col_y + col_height], fill=gold_color)
        
        # Base platform
        base_y = int(size * 0.6875)
        draw.rectangle([int(size * 0.125), base_y, int(size * 0.875), base_y + max(1, int(size * 0.0625))], fill=gold_color)
        draw.rectangle([int(size * 0.09375), base_y + max(1, int(size * 0.0625)), int(size * 0.90625), base_y + max(2, int(size * 0.125))], fill=gold_dark)
        
        # Hourglass (simplified for small sizes)
        center_x, center_y = size // 2, size // 2
        
        if size >= 32:
            # Detailed hourglass for larger sizes
            hourglass_size = int(size * 0.1875)
            
            # Top ellipse
            draw.ellipse([center_x - hourglass_size, center_y - hourglass_size - int(size * 0.0625), 
                         center_x + hourglass_size, center_y - int(size * 0.0625)], 
                        outline=white_color, width=max(1, size//32))
            
            # Bottom ellipse
            draw.ellipse([center_x - hourglass_size, center_y + int(size * 0.0625), 
                         center_x + hourglass_size, center_y + hourglass_size + int(size * 0.0625)], 
                        outline=white_color, width=max(1, size//32))
            
            # Hourglass sides
            draw.line([center_x - hourglass_size, center_y - hourglass_size - int(size * 0.0625), 
                      center_x - int(size * 0.03125), center_y], fill=white_color, width=max(1, size//32))
            draw.line([center_x + hourglass_size, center_y - hourglass_size - int(size * 0.0625), 
                      center_x + int(size * 0.03125), center_y], fill=white_color, width=max(1, size//32))
            draw.line([center_x - int(size * 0.03125), center_y, 
                      center_x - hourglass_size, center_y + hourglass_size + int(size * 0.0625)], fill=white_color, width=max(1, size//32))
            draw.line([center_x + int(size * 0.03125), center_y, 
                      center_x + hourglass_size, center_y + hourglass_size + int(size * 0.0625)], fill=white_color, width=max(1, size//32))
            
            # Sand (top)
            draw.ellipse([center_x - int(size * 0.125), center_y - hourglass_size, 
                         center_x + int(size * 0.125), center_y - int(size * 0.03125)], fill=gold_color)
            
            # Sand (bottom)
            draw.ellipse([center_x - int(size * 0.09375), center_y + int(size * 0.03125), 
                         center_x + int(size * 0.09375), center_y + int(size * 0.15625)], fill=gold_dark)
            
            # Falling sand
            draw.polygon([
                (center_x - int(size * 0.03125), center_y),
                (center_x, center_y + int(size * 0.03125)),
                (center_x + int(size * 0.03125), center_y)
            ], fill=gold_color)
        
        else:
            # Simplified hourglass for small sizes
            hourglass_size = max(2, size // 8)
            
            # Simple hourglass shape
            draw.polygon([
                (center_x - hourglass_size, center_y - hourglass_size),
                (center_x + hourglass_size, center_y - hourglass_size),
                (center_x - 1, center_y),
                (center_x + 1, center_y),
                (center_x - hourglass_size, center_y + hourglass_size),
                (center_x + hourglass_size, center_y + hourglass_size)
            ], outline=white_color, width=1)
            
            # Sand dots
            draw.ellipse([center_x - 2, center_y - hourglass_size + 1, center_x + 2, center_y - 1], fill=gold_color)
            draw.ellipse([center_x - 1, center_y + 1, center_x + 1, center_y + hourglass_size - 1], fill=gold_dark)
        
        images.append(img)
    
    return images

def main():
    print("🎨 Creating HourBank favicon...")
    
    # Create the favicon images
    images = create_favicon()
    
    # Save as ICO file
    output_path = "/home/awsramji/projects/hourbank/hourbank-app/public/favicon-new.ico"
    images[0].save(output_path, format='ICO', sizes=[(img.width, img.height) for img in images])
    
    # Also save individual PNG files for different uses
    for i, img in enumerate(images):
        size = img.width
        png_path = f"/home/awsramji/projects/hourbank/hourbank-app/public/favicon-{size}x{size}.png"
        img.save(png_path, format='PNG')
        print(f"✅ Created {png_path}")
    
    print(f"✅ Created {output_path}")
    print("🎉 Favicon creation completed!")
    
    # Instructions
    print("\n📋 To use the new favicon:")
    print("1. Replace the existing favicon.ico with favicon-new.ico")
    print("2. Update your index.html to include:")
    print('   <link rel="icon" type="image/x-icon" href="/favicon.ico">')
    print('   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">')
    print('   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">')

if __name__ == "__main__":
    main()
