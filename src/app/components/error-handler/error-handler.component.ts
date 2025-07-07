import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { errorLogger } from '../../utils/error-logger';

@Component({
  selector: 'app-error-handler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="error">
      <div class="error-card" [ngClass]="'severity-' + severity">
        <div class="error-header">
          <i class="error-icon" [ngClass]="getIconClass()"></i>
          <h3 class="error-title">{{ getErrorTitle() }}</h3>
          <button class="close-btn" (click)="dismissError()" *ngIf="dismissible">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="error-content">
          <p class="error-message">{{ getErrorMessage() }}</p>
          
          <div class="error-details" *ngIf="showDetails">
            <button class="toggle-details-btn" (click)="toggleDetails()">
              {{ showDetailedInfo ? 'Hide' : 'Show' }} Details
              <i class="fas" [ngClass]="showDetailedInfo ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <div class="detailed-info" *ngIf="showDetailedInfo">
              <div class="detail-section" *ngIf="context?.userId">
                <strong>User ID:</strong> {{ context.userId }}
              </div>
              <div class="detail-section" *ngIf="context?.operation">
                <strong>Operation:</strong> {{ context.operation }}
              </div>
              <div class="detail-section" *ngIf="context?.component">
                <strong>Component:</strong> {{ context.component }}
              </div>
              <div class="detail-section" *ngIf="context?.timestamp">
                <strong>Time:</strong> {{ formatTimestamp(context.timestamp) }}
              </div>
              <div class="detail-section" *ngIf="errorId">
                <strong>Error ID:</strong> {{ errorId }}
              </div>
            </div>
          </div>
          
          <div class="error-actions" *ngIf="showActions">
            <button class="btn btn-primary" (click)="retryAction()" *ngIf="retryable">
              <i class="fas fa-redo"></i> Retry
            </button>
            <button class="btn btn-secondary" (click)="reportError()" *ngIf="reportable">
              <i class="fas fa-bug"></i> Report Issue
            </button>
            <button class="btn btn-info" (click)="showHelp()" *ngIf="helpAvailable">
              <i class="fas fa-question-circle"></i> Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./error-handler.component.scss']
})
export class ErrorHandlerComponent implements OnInit {
  @Input() error: Error | string | null = null;
  @Input() context: any = {};
  @Input() severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  @Input() category: 'user' | 'service' | 'transaction' | 'booking' | 'auth' | 'api' | 'ui' | 'system' = 'system';
  @Input() dismissible: boolean = true;
  @Input() showDetails: boolean = true;
  @Input() showActions: boolean = true;
  @Input() retryable: boolean = false;
  @Input() reportable: boolean = true;
  @Input() helpAvailable: boolean = true;
  @Input() onRetry?: () => void;
  @Input() onDismiss?: () => void;

  showDetailedInfo: boolean = false;
  errorId: string = '';

  ngOnInit() {
    if (this.error) {
      this.errorId = this.generateErrorId();
      this.logError();
    }
  }

  getErrorTitle(): string {
    switch (this.category) {
      case 'user':
        return 'User Account Issue';
      case 'service':
        return 'Service Error';
      case 'transaction':
        return 'Transaction Problem';
      case 'booking':
        return 'Booking Issue';
      case 'auth':
        return 'Authentication Error';
      case 'api':
        return 'Connection Problem';
      case 'ui':
        return 'Display Issue';
      default:
        return 'System Error';
    }
  }

  getErrorMessage(): string {
    if (!this.error) return 'An unknown error occurred';
    
    const message = this.error instanceof Error ? this.error.message : this.error;
    
    // Provide user-friendly messages for common errors
    if (message.includes('User not found')) {
      return 'The requested user profile could not be found. This might be because the user account was deleted or the ID is incorrect.';
    }
    
    if (message.includes('Not Authorized')) {
      return 'You don\'t have permission to perform this action. Please check your account status or try signing in again.';
    }
    
    if (message.includes('Network Error') || message.includes('fetch')) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    
    if (message.includes('GraphQL error')) {
      return 'There was a problem processing your request. Our technical team has been notified.';
    }
    
    return message;
  }

  getIconClass(): string {
    switch (this.severity) {
      case 'critical':
        return 'fas fa-exclamation-triangle text-danger';
      case 'high':
        return 'fas fa-exclamation-circle text-warning';
      case 'medium':
        return 'fas fa-info-circle text-info';
      default:
        return 'fas fa-info text-muted';
    }
  }

  toggleDetails(): void {
    this.showDetailedInfo = !this.showDetailedInfo;
  }

  dismissError(): void {
    this.error = null;
    if (this.onDismiss) {
      this.onDismiss();
    }
  }

  retryAction(): void {
    if (this.onRetry) {
      this.onRetry();
    }
  }

  reportError(): void {
    const errorReport = {
      errorId: this.errorId,
      message: this.getErrorMessage(),
      context: this.context,
      severity: this.severity,
      category: this.category,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log the error report
    console.log('📧 Error Report Generated:', errorReport);
    
    // In a real application, you would send this to your support system
    alert('Error report generated. Check the console for details. In production, this would be sent to our support team.');
  }

  showHelp(): void {
    const helpUrls: { [key: string]: string } = {
      user: '/help/user-accounts',
      service: '/help/services',
      transaction: '/help/transactions',
      booking: '/help/bookings',
      auth: '/help/authentication',
      api: '/help/connectivity',
      ui: '/help/interface',
      system: '/help/general'
    };

    const helpUrl = helpUrls[this.category] || '/help';
    window.open(helpUrl, '_blank');
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(): void {
    if (!this.error) return;

    errorLogger.logError({
      error: this.error,
      context: {
        ...this.context,
        errorId: this.errorId,
        component: 'ErrorHandlerComponent'
      },
      severity: this.severity,
      category: this.category
    });
  }
}
