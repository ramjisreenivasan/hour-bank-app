import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sample-data-watermark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sample-data-watermark" [class.corner]="position === 'corner'" [class.center]="position === 'center'">
      {{ text }}
    </div>
  `,
  styles: [`
    .sample-data-watermark {
      position: fixed;
      font-weight: 700;
      color: rgba(220, 38, 127, 0.9);
      pointer-events: none;
      user-select: none;
      z-index: 1000;
      letter-spacing: 0.1em;
      
      &.corner {
        top: 20px;
        right: 20px;
        font-size: 1rem;
        background: rgba(255, 255, 255, 0.95);
        padding: 8px 16px;
        border-radius: 20px;
        color: rgba(220, 38, 127, 0.9);
        border: 2px solid rgba(220, 38, 127, 0.6);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        font-weight: 800;
        text-transform: uppercase;
        
        @media (max-width: 768px) {
          font-size: 0.8rem;
          padding: 6px 12px;
          top: 10px;
          right: 10px;
        }
      }
      
      &.center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 4rem;
        color: rgba(220, 38, 127, 0.15);
        font-weight: 900;
        text-transform: uppercase;
        
        @media (max-width: 768px) {
          font-size: 2.5rem;
        }
      }
    }
  `]
})
export class SampleDataWatermarkComponent {
  @Input() position: 'corner' | 'center' = 'corner';
  @Input() text: string = 'SAMPLE DATA';
}
