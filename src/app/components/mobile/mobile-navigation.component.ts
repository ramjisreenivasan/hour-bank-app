import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MobileNavigationService } from '../../services/mobile-navigation.service';
import { PlatformService } from '../../services/platform.service';
import { User } from '../../models/user.model';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  template: `
    <!-- Mobile Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <div class="nav-brand">
            <app-logo [size]="24" [showText]="true"></app-logo>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="toggleMenu()">
            <ion-icon name="menu-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Menu Backdrop -->
    <div class="menu-backdrop" [class.show]="isMenuOpen" (click)="closeMenu()"></div>

    <!-- Mobile Menu -->
    <ion-menu side="end" menuId="main-menu" contentId="main-content" [class.show-menu]="isMenuOpen">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menu</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" (click)="closeMenu()">
              <ion-icon name="close-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
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
    
    /* Ensure proper icon display */
    ion-icon {
      font-family: 'Ionicons';
    }
    
    /* Fallback icons using Font Awesome if Ionicons not available */
    ion-icon[name="menu-outline"]::before {
      content: "☰";
      font-family: inherit;
      font-size: 1.2em;
    }
    
    ion-icon[name="close-outline"]::before {
      content: "✕";
      font-family: inherit;
      font-size: 1.2em;
    }
    
    ion-icon[name="home-outline"]::before {
      content: "🏠";
      font-family: inherit;
    }
    
    ion-icon[name="list-outline"]::before {
      content: "📋";
      font-family: inherit;
    }
    
    ion-icon[name="people-outline"]::before {
      content: "👥";
      font-family: inherit;
    }
    
    ion-icon[name="information-circle-outline"]::before {
      content: "ℹ️";
      font-family: inherit;
    }
    
    ion-icon[name="heart-outline"]::before {
      content: "❤️";
      font-family: inherit;
    }
    
    ion-icon[name="hand-left-outline"]::before {
      content: "🤝";
      font-family: inherit;
    }
    
    ion-icon[name="log-in-outline"]::before {
      content: "🔑";
      font-family: inherit;
    }
    
    ion-icon[name="grid-outline"]::before {
      content: "⊞";
      font-family: inherit;
    }
    
    ion-icon[name="person-outline"]::before {
      content: "👤";
      font-family: inherit;
    }
    
    ion-icon[name="card-outline"]::before {
      content: "💳";
      font-family: inherit;
    }
    
    ion-icon[name="shield-checkmark-outline"]::before {
      content: "🛡️";
      font-family: inherit;
    }
    
    ion-icon[name="phone-portrait-outline"]::before {
      content: "📱";
      font-family: inherit;
    }
    
    ion-icon[name="open-outline"]::before {
      content: "↗";
      font-family: inherit;
    }
    
    ion-item-divider {
      margin-top: 16px;
    }
    
    ion-item p {
      font-size: 0.8em;
      color: var(--ion-color-medium, #666);
      margin: 0;
    }
    
    ion-item h3 {
      margin: 0 0 4px 0;
      font-size: 1em;
    }
  `]
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  isMenuOpen = false;
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
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
