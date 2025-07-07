# hOurBank Logo Preview

## Visual Design

```
    🏦 Bank Building
   ┌─────────────────┐
   │ ████████████████ │  ← Bank roof
   │ ║    ⧗    ║     │  ← Hourglass centered
   │ ║   ╱ ╲   ║     │     in bank building
   │ ║  ╱   ╲  ║     │
   │ ║ ╱  •  ╲ ║     │  ← Sand particles
   │ ║╱   •   ╲║     │     falling through
   │ ║    •    ║     │
   │ ║╲   •   ╱║     │
   │ ║ ╲  •  ╱ ║     │
   │ ║  ╲___╱  ║     │
   │ ║    ▓    ║     │  ← Sand collected
   └─┴─────────┴─────┘
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Bank steps
```

## Typography

**Brand Name Styling:**
- `h` - Standard text color (lowercase, friendly)
- `Our` - **Dark blue, bold** (emphasized community)
- `Bank` - Standard text color

**Visual Result:** `hOurBank`

## Color Scheme

- **Primary Blue**: `#2563eb` - Used for hourglass and accents
- **Dark Blue**: `#1e3a8a` - Used for "Our" emphasis
- **Standard Text**: `#1e293b` - Used for "h" and "Bank"
- **Transparent Elements**: Various opacity levels for depth

## Design Philosophy

1. **Community First**: Lowercase "h" makes it approachable and friendly
2. **Ownership Emphasis**: Capital "Our" highlights community ownership
3. **Time & Banking**: Hourglass inside bank building represents time as currency
4. **Professional Yet Approachable**: Clean lines with warm, accessible styling

## Usage Examples

### Navigation Bar
```html
<app-logo [size]="28" [showText]="true"></app-logo>
```
Result: [🏦] hOurBank (medium size)

### Authentication Page
```html
<app-logo [size]="40" [showText]="true" containerClass="large"></app-logo>
```
Result: [🏦] hOurBank (large, prominent)

### Footer
```html
<app-logo [size]="24" [showText]="true" containerClass="small"></app-logo>
```
Result: [🏦] hOurBank (compact)

### Icon Only
```html
<app-logo [size]="32" [showText]="false"></app-logo>
```
Result: [🏦] (icon only)

## Responsive Behavior

- **Desktop**: Full logo with text
- **Tablet**: Slightly smaller but maintains readability
- **Mobile**: Adapts size, may show icon-only in tight spaces

## Accessibility Features

- High contrast ratios for readability
- Scalable SVG for any screen resolution
- Screen reader friendly
- Works with browser zoom up to 200%

## Brand Message

The hOurBank logo communicates:
- **Community ownership** ("Our" emphasized)
- **Time as currency** (hourglass)
- **Trust and stability** (bank building)
- **Modern and approachable** (lowercase "h")
- **Professional service** (clean design)
