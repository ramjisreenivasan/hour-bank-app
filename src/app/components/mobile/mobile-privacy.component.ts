import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-mobile-privacy',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Privacy Policy</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="privacy-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>HourBank Mobile Gateway</ion-card-title>
            <ion-card-subtitle>Privacy Policy Summary</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <p><strong>Last Updated:</strong> January 25, 2025</p>
            
            <h3>What We DON'T Collect</h3>
            <ion-list>
              <ion-item>
                <ion-icon name="shield-checkmark" slot="start" color="success"></ion-icon>
                <ion-label>No personal information</ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="shield-checkmark" slot="start" color="success"></ion-icon>
                <ion-label>No location or device tracking</ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="shield-checkmark" slot="start" color="success"></ion-icon>
                <ion-label>No usage analytics</ion-label>
              </ion-item>
              <ion-item>
                <ion-icon name="shield-checkmark" slot="start" color="success"></ion-icon>
                <ion-label>No local data storage</ion-label>
              </ion-item>
            </ion-list>

            <h3>What We Display</h3>
            <p>This app only shows publicly available community information:</p>
            <ul>
              <li>Service titles and descriptions</li>
              <li>Provider usernames (anonymized IDs)</li>
              <li>Service categories and ratings</li>
              <li>Community activity intended for sharing</li>
            </ul>

            <h3>How It Works</h3>
            <p>This mobile app is a gateway that:</p>
            <ul>
              <li>Displays public community services</li>
              <li>Opens your web browser for account features</li>
              <li>Uses secure HTTPS communication</li>
              <li>Requires minimal permissions</li>
            </ul>

            <ion-button 
              expand="block" 
              fill="outline" 
              (click)="openFullPolicy()"
              class="policy-button">
              <ion-icon name="document-text-outline" slot="start"></ion-icon>
              View Full Privacy Policy
            </ion-button>

            <div class="contact-section">
              <h3>Contact Information</h3>
              <p><strong>Developer:</strong> Ramji Sreenivasan</p>
              <p><strong>Email:</strong> ramjisreenivasan&#64;gmail.com</p>
              <p><strong>Address:</strong><br>
              13055 Garridan Ave<br>
              Windermere, FL 34786<br>
              United States</p>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Key Benefits</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="benefits-grid">
              <div class="benefit-item">
                <ion-icon name="eye-off" color="primary"></ion-icon>
                <p>No Tracking</p>
              </div>
              <div class="benefit-item">
                <ion-icon name="lock-closed" color="primary"></ion-icon>
                <p>Secure</p>
              </div>
              <div class="benefit-item">
                <ion-icon name="leaf" color="primary"></ion-icon>
                <p>Lightweight</p>
              </div>
              <div class="benefit-item">
                <ion-icon name="people" color="primary"></ion-icon>
                <p>Community Focused</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .privacy-content {
      max-width: 600px;
      margin: 0 auto;
    }

    h3 {
      color: var(--ion-color-primary);
      margin-top: 20px;
      margin-bottom: 10px;
    }

    ul {
      padding-left: 20px;
      margin: 10px 0;
    }

    li {
      margin-bottom: 5px;
    }

    .policy-button {
      margin: 20px 0;
    }

    .contact-section {
      background: var(--ion-color-light);
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .contact-section p {
      margin: 5px 0;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .benefit-item {
      text-align: center;
      padding: 15px;
      background: var(--ion-color-light);
      border-radius: 8px;
    }

    .benefit-item ion-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }

    .benefit-item p {
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class MobilePrivacyComponent {

  async openFullPolicy() {
    await Browser.open({
      url: 'https://hourbank.ramjisreenivasan.com/mobile-privacy-policy',
      windowName: '_system'
    });
  }
}
