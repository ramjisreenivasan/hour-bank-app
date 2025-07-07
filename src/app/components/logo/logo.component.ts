import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container" [class]="containerClass">
      <div class="logo-icon">
        <img 
          src="/hb-logo-v1.png"
          alt="HourBank Logo"
          [style.width.px]="size"
          [style.height.px]="size"
          class="logo-image"
        />
      </div>
      <div class="logo-text" *ngIf="showText">
        <span class="brand-h">h</span><span class="brand-our">Our</span><span class="brand-bank">Bank</span>
      </div>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-image {
      object-fit: contain;
      transition: transform 0.2s ease;
      border-radius: 4px;
    }

    .logo-container:hover .logo-image {
      transform: scale(1.05);
    }

    .logo-text {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--text-primary, #1e293b);
      letter-spacing: -0.02em;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .brand-h {
      color: var(--text-primary, #1e293b);
      font-weight: 700;
    }

    .brand-our {
      color: var(--primary-color, #2563eb);
      font-weight: 800;
      text-transform: uppercase;
    }

    .brand-bank {
      color: var(--text-primary, #1e293b);
      font-weight: 700;
    }

    /* Size variations */
    .logo-container.small .logo-text {
      font-size: 1.2rem;
    }

    .logo-container.large .logo-text {
      font-size: 2rem;
    }

    .logo-container.extra-large .logo-text {
      font-size: 2.5rem;
    }

    /* Icon-only styles */
    .logo-container.icon-only {
      gap: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .logo-container {
        gap: 0.5rem;
      }
      
      .logo-text {
        font-size: 1.3rem;
      }
      
      .logo-container.large .logo-text {
        font-size: 1.6rem;
      }
    }

    /* High DPI displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .logo-image {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    }
  `]
})
export class LogoComponent {
  @Input() size: number = 32;
  @Input() showText: boolean = true;
  @Input() containerClass: string = '';
}
