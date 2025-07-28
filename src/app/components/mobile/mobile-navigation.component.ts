import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="mobile-toolbar">
        <div class="nav-brand">
          <app-logo [size]="24" [showText]="true"></app-logo>
        </div>
        <button class="menu-button" (click)="toggleMenu()" aria-label="Open menu">
          <span class="menu-icon">☰</span>
        </button>
      </div>
    </header>

    <!-- Menu Backdrop -->
    <div class="menu-backdrop" [class.show]="isMenuOpen" (click)="closeMenu()"></div>

    <!-- Mobile Menu -->
    <nav class="mobile-menu" [class.show-menu]="isMenuOpen">
      <div class="menu-header">
        <div class="menu-toolbar">
          <h2>Menu</h2>
          <button class="close-button" (click)="closeMenu()" aria-label="Close menu">
            <span class="close-icon">✕</span>
          </button>
        </div>
      </div>
      
      <div class="menu-content">
        <ul class="menu-list">
          <!-- Guest accessible links -->
          <li class="menu-item">
            <a routerLink="/" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">🏠</span>
              <span class="menu-label">Home</span>
            </a>
          </li>
          
          <li class="menu-item">
            <a routerLink="/services" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">📋</span>
              <span class="menu-label">Browse Services</span>
            </a>
          </li>
          
          <li class="menu-item">
            <a routerLink="/community" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">👥</span>
              <span class="menu-label">Community</span>
            </a>
          </li>

          <li class="menu-divider">
            <span class="divider-label">About & Support</span>
          </li>
          
          <li class="menu-item">
            <a routerLink="/about" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">ℹ️</span>
              <span class="menu-label">About hOurBank</span>
            </a>
          </li>
          
          <li class="menu-item">
            <a routerLink="/donate" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">❤️</span>
              <span class="menu-label">Donate</span>
            </a>
          </li>
          
          <li class="menu-item">
            <a routerLink="/contribute" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">🤝</span>
              <span class="menu-label">Contribute</span>
            </a>
          </li>

          <li class="menu-divider">
            <span class="divider-label">Full Features</span>
          </li>

          <!-- Links that open in browser -->
          <li class="menu-item">
            <button class="menu-link" (click)="openAuthInBrowser()">
              <span class="menu-icon">🔑</span>
              <span class="menu-label">Sign In / Register</span>
              <span class="external-icon">↗</span>
            </button>
          </li>
          
          <li class="menu-item">
            <button class="menu-link" (click)="openDashboardInBrowser()">
              <span class="menu-icon">⊞</span>
              <span class="menu-label">Dashboard</span>
              <span class="external-icon">↗</span>
            </button>
          </li>
          
          <li class="menu-item">
            <button class="menu-link" (click)="openProfileInBrowser()">
              <span class="menu-icon">👤</span>
              <span class="menu-label">Profile</span>
              <span class="external-icon">↗</span>
            </button>
          </li>
          
          <li class="menu-item">
            <button class="menu-link" (click)="openTransactionsInBrowser()">
              <span class="menu-icon">💳</span>
              <span class="menu-label">Transactions</span>
              <span class="external-icon">↗</span>
            </button>
          </li>

          <li class="menu-divider">
            <span class="divider-label">Info</span>
          </li>

          <li class="menu-item">
            <a routerLink="/privacy" (click)="closeMenu()" class="menu-link">
              <span class="menu-icon">🛡️</span>
              <span class="menu-label">Privacy Policy</span>
            </a>
          </li>

          <li class="menu-item info-item">
            <div class="menu-link">
              <span class="menu-icon">📱</span>
              <div class="menu-label">
                <div class="info-title">Mobile Gateway</div>
                <div class="info-subtitle">Full features available in browser</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .mobile-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--primary-color, #2563eb);
      color: white;
    }
    
    .mobile-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      min-height: 56px;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
    }
    
    .menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .menu-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .menu-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      /* Prevent touch events when hidden */
      pointer-events: none;
    }
    
    .menu-backdrop.show {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    
    .mobile-menu {
      position: fixed;
      top: 0;
      right: -300px;
      width: 300px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }
    
    .mobile-menu.show-menu {
      right: 0;
    }
    
    .menu-header {
      background: var(--primary-color, #2563eb);
      color: white;
    }
    
    .menu-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      min-height: 56px;
    }
    
    .menu-toolbar h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .close-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .close-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .menu-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    
    .menu-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .menu-item {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .menu-link {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: inherit;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 1rem;
    }
    
    .menu-link:hover {
      background-color: #f8f9fa;
    }
    
    .menu-link .menu-icon {
      margin-right: 12px;
      color: var(--primary-color, #2563eb);
      font-size: 18px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .menu-label {
      flex: 1;
    }
    
    .external-icon {
      margin-left: 8px;
      color: #666;
      font-size: 14px;
    }
    
    .menu-divider {
      padding: 8px 16px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      margin-top: 16px;
    }
    
    .divider-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #666;
    }
    
    .info-item .menu-link {
      cursor: default;
    }
    
    .info-item .menu-link:hover {
      background-color: transparent;
    }
    
    .info-title {
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .info-subtitle {
      font-size: 0.8em;
      color: #666;
    }
    
    /* Responsive adjustments */
    @media (max-width: 480px) {
      .mobile-menu {
        width: 280px;
        right: -280px;
      }
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
    // Ensure body scroll is restored when component is destroyed
    document.body.style.overflow = '';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    // Prevent body scroll when menu is open, restore when closed
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
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
