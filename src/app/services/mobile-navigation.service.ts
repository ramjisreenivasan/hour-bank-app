import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class MobileNavigationService {
  private webAppUrl = 'https://hourbank.ramjisreenivasan.com';

  constructor(private platformService: PlatformService) {}

  async openInBrowser(path: string) {
    if (this.platformService.isMobile()) {
      const fullUrl = `${this.webAppUrl}${path}`;
      await Browser.open({ 
        url: fullUrl,
        windowName: '_system'
      });
      return true;
    }
    return false;
  }

  async openAuthInBrowser() {
    return this.openInBrowser('/auth');
  }

  async openDashboardInBrowser() {
    return this.openInBrowser('/dashboard');
  }

  async openProfileInBrowser() {
    return this.openInBrowser('/profile');
  }

  async openTransactionsInBrowser() {
    return this.openInBrowser('/transactions');
  }

  async openMyServicesInBrowser() {
    return this.openInBrowser('/my-services');
  }

  async openMessagesInBrowser() {
    return this.openInBrowser('/messages');
  }

  async openBookingsInBrowser() {
    return this.openInBrowser('/bookings');
  }

  async openAdminInBrowser() {
    return this.openInBrowser('/admin');
  }
}
