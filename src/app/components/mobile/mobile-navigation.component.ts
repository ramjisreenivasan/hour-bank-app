import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MobileNavigationService } from '../../services/mobile-navigation.service';
import { PlatformService } from '../../services/platform.service';
import { User } from '../../models/user.model';
import { LogoComponent } from '../logo/logo.component';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <div class="nav-brand">
            <app-logo [size]="24" [showText]="true"></app-logo>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="openMenu()">
            <ion-icon name="menu-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Mobile Menu -->
    <ion-menu side="end" menuId="main-menu" contentId="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
        <ion-list>
          <!-- Guest accessible links -->
          <ion-item button routerLink="/" (click)="closeMenu()">
            <ion-icon name="home-outline" slot="start"></ion-icon>
            <ion-label>Home</ion-label>
          </ion-item>
          
          <ion-item button routerLink="/services" (click)="closeMenu()">
            <ion-icon name="list-outline" slot="start"></ion-icon>
            <ion-label>Browse Services</ion-label>
          </ion-item>
          
          <ion-item button routerLink="/community" (click)="closeMenu()">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            <ion-label>Community</ion-label>
          </ion-item>

          <ion-item-divider>
            <ion-label>About & Support</ion-label>
          </ion-item-divider>
          
          <ion-item button routerLink="/about" (click)="closeMenu()">
            <ion-icon name="information-circle-outline" slot="start"></ion-icon>
            <ion-label>About hOurBank</ion-label>
          </ion-item>
          
          <ion-item button routerLink="/donate" (click)="closeMenu()">
            <ion-icon name="heart-outline" slot="start"></ion-icon>
            <ion-label>Donate</ion-label>
          </ion-item>
          
          <ion-item button routerLink="/contribute" (click)="closeMenu()">
            <ion-icon name="hand-left-outline" slot="start"></ion-icon>
            <ion-label>Contribute</ion-label>
          </ion-item>

          <ion-item-divider>
            <ion-label>Full Features</ion-label>
          </ion-item-divider>

          <!-- Links that open in browser -->
          <ion-item button (click)="openAuthInBrowser()">
            <ion-icon name="log-in-outline" slot="start"></ion-icon>
            <ion-label>Sign In / Register</ion-label>
            <ion-icon name="open-outline" slot="end" color="medium"></ion-icon>
          </ion-item>
          
          <ion-item button (click)="openDashboardInBrowser()">
            <ion-icon name="grid-outline" slot="start"></ion-icon>
            <ion-label>Dashboard</ion-label>
            <ion-icon name="open-outline" slot="end" color="medium"></ion-icon>
          </ion-item>
          
          <ion-item button (click)="openProfileInBrowser()">
            <ion-icon name="person-outline" slot="start"></ion-icon>
            <ion-label>Profile</ion-label>
            <ion-icon name="open-outline" slot="end" color="medium"></ion-icon>
          </ion-item>
          
          <ion-item button (click)="openTransactionsInBrowser()">
            <ion-icon name="card-outline" slot="start"></ion-icon>
            <ion-label>Transactions</ion-label>
            <ion-icon name="open-outline" slot="end" color="medium"></ion-icon>
          </ion-item>

          <ion-item-divider>
            <ion-label>Info</ion-label>
          </ion-item-divider>

          <ion-item button routerLink="/privacy" (click)="closeMenu()">
            <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
            <ion-label>Privacy Policy</ion-label>
          </ion-item>

          <ion-item>
            <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>Mobile Gateway</h3>
              <p>Full features available in browser</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
  `,
  styles: [`
    .nav-brand {
      display: flex;
      align-items: center;
    }
    
    ion-item-divider {
      margin-top: 16px;
    }
    
    ion-item p {
      font-size: 0.8em;
      color: var(--ion-color-medium);
    }
  `]
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private mobileNavService: MobileNavigationService,
    private platformService: PlatformService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial authentication state
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = !!this.currentUser;

    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async openMenu() {
    const menu = document.querySelector('ion-menu');
    if (menu) {
      await menu.open();
    }
  }

  async closeMenu() {
    const menu = document.querySelector('ion-menu');
    if (menu) {
      await menu.close();
    }
  }

  async openAuthInBrowser() {
    await this.mobileNavService.openAuthInBrowser();
    this.closeMenu();
  }

  async openDashboardInBrowser() {
    await this.mobileNavService.openDashboardInBrowser();
    this.closeMenu();
  }

  async openProfileInBrowser() {
    await this.mobileNavService.openProfileInBrowser();
    this.closeMenu();
  }

  async openTransactionsInBrowser() {
    await this.mobileNavService.openTransactionsInBrowser();
    this.closeMenu();
  }
}
