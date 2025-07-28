import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-build-info',
  imports: [CommonModule],
  template: `
    <div class="build-info" *ngIf="showBuildInfo">
      <div class="build-info-content">
        <span class="build-label">Build:</span>
        <span class="build-number">#{{ buildInfo.buildNumber }}</span>
        <span class="build-separator">|</span>
        <span class="build-version">v{{ buildInfo.version }}</span>
        <span class="build-separator">|</span>
        <span class="build-env">{{ buildInfo.environment }}</span>
        <span class="build-separator">|</span>
        <span class="build-date">{{ formatDate(buildInfo.buildDate) }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./build-info.component.scss']
})
export class BuildInfoComponent {
  buildInfo = environment.buildInfo;
  showBuildInfo = !environment.production; // Only show in development

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
