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
      position: absolute;
      font-weight: 700;
      color: rgba(255, 0, 0, 0.15);
      pointer-events: none;
      user-select: none;
      z-index: 10;
      letter-spacing: 0.1em;
      
      &.corner {
        top: 20px;
        right: 20px;
        font-size: 1.2rem;
        background: rgba(255, 255, 255, 0.8);
        padding: 8px 16px;
        border-radius: 20px;
        color: rgba(255, 0, 0, 0.7);
        border: 2px solid rgba(255, 0, 0, 0.3);
        
        @media (max-width: 768px) {
          font-size: 0.9rem;
          padding: 6px 12px;
          top: 10px;
          right: 10px;
        }
      }
      
      &.center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 3rem;
        color: rgba(255, 0, 0, 0.1);
        
        @media (max-width: 768px) {
          font-size: 2rem;
        }
      }
    }
  `]
})
export class SampleDataWatermarkComponent {
  @Input() position: 'corner' | 'center' = 'corner';
  @Input() text: string = 'SAMPLE DATA';
}
