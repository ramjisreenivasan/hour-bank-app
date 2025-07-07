# hOurBank Logo Component

A reusable Angular component that displays the hOurBank logo with an hourglass inside a bank building design.

## Features

- **Scalable SVG Design**: Vector-based logo that scales perfectly at any size
- **Hourglass in Bank**: Creative design combining time (hourglass) and banking concepts
- **Emphasized Branding**: "Our" is capitalized to emphasize community ownership
- **Flexible Usage**: Can show icon only or icon with text
- **Responsive**: Adapts to different screen sizes
- **Customizable**: Multiple size and style options

## Usage

### Basic Usage
```html
<app-logo></app-logo>
```

### With Custom Size
```html
<app-logo [size]="40"></app-logo>
```

### Icon Only (No Text)
```html
<app-logo [showText]="false"></app-logo>
```

### With Custom Container Class
```html
<app-logo containerClass="large"></app-logo>
```

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | `number` | `32` | Size of the logo icon in pixels |
| `showText` | `boolean` | `true` | Whether to show the "hOurBank" text |
| `containerClass` | `string` | `''` | Additional CSS class for styling |

## Container Classes

- `small` - Smaller text size
- `large` - Larger text size  
- `extra-large` - Extra large text size
- `icon-only` - Optimized for icon-only display

## Design Elements

### Bank Building
- Rectangular structure with columns
- Steps at the base
- Semi-transparent blue styling

### Hourglass
- Centered within the bank
- Animated sand particles
- Represents time as currency

### Typography
- **h** - Standard text color (lowercase)
- **Our** - Dark blue, bold weight (emphasized)
- **Bank** - Standard text color

## Color Scheme

The logo uses CSS custom properties for theming:
- `--primary-color` - Main brand blue
- `--primary-dark` - Darker blue for emphasis
- `--text-primary` - Standard text color

## Examples in the App

1. **Navigation Bar**: `<app-logo [size]="28" [showText]="true">`
2. **Auth Page**: `<app-logo [size]="40" [showText]="true" containerClass="large">`
3. **Footer**: `<app-logo [size]="28" [showText]="true" containerClass="small">`

## Accessibility

- Uses semantic SVG structure
- Proper color contrast ratios
- Scalable for users with visual impairments
- Works with screen readers
