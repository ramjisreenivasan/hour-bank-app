import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-external-redirect',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content class="ion-padding">
      <div class="redirect-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Opening in Browser</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>This feature requires full web access. Opening in your default browser...</p>
            <ion-button expand="block" (click)="openInBrowser()" color="primary">
              <ion-icon name="open-outline" slot="start"></ion-icon>
              Open in Browser
            </ion-button>
            <ion-button expand="block" fill="clear" (click)="goBack()" color="medium">
              <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
              Go Back
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      min-height: 50vh;
    }
    
    ion-card {
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    
    ion-button {
      margin: 8px 0;
    }
  `]
})
export class ExternalRedirectComponent implements OnInit {
  private webAppUrl = 'https://hourbank.ramjisreenivasan.com';
  private externalPath = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.externalPath = this.route.snapshot.data['externalPath'] || '';
    // Auto-open in browser after a short delay
    setTimeout(() => {
      this.openInBrowser();
    }, 1500);
  }

  async openInBrowser() {
    const fullUrl = `${this.webAppUrl}${this.externalPath}`;
    await Browser.open({ 
      url: fullUrl,
      windowName: '_system'
    });
  }

  goBack() {
    window.history.back();
  }
}
