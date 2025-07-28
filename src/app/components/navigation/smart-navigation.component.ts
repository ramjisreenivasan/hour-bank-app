import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-smart-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './smart-navigation.component.html',
  styleUrls: ['./smart-navigation.component.scss']
})
export class SmartNavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  isAdmin = false;
  
  // Dropdown states
  showAboutDropdown = false;
  showServicesDropdown = false;
  showAccountDropdown = false;
  
  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to authentication state
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadUserData();
          this.checkAdminStatus(); // Check admin status when authenticated
        } else {
          this.currentUser = null;
          this.isAdmin = false;
        }
      }
    );

    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe(
      (user: User | null) => {
        this.currentUser = user;
        if (user) {
          this.checkAdminStatus(); // Re-check admin status when user changes
        } else {
          this.isAdmin = false;
        }
      }
    );

    // Load initial auth state
    this.authService.checkAuthStatus();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  private loadUserData() {
    // User data is already loaded through currentUser$ subscription
    // This method is kept for consistency but may not be needed
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  private async checkAdminStatus() {
    try {
      this.isAdmin = await this.authService.isCurrentUserAdmin();
    } catch (error) {
      console.error('Error checking admin status in navigation:', error);
      this.isAdmin = false;
    }
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    
    if (this.currentUser.firstName) {
      return this.currentUser.firstName;
    }
    
    if (this.currentUser.username) {
      return this.currentUser.username;
    }
    
    return this.currentUser.email || 'User';
  }

  async signOut() {
    try {
      await this.authService.signOut();
      // Navigation to auth page is handled by AuthService
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Utility methods for dropdown management
  closeAllDropdowns() {
    this.showAboutDropdown = false;
    this.showServicesDropdown = false;
    this.showAccountDropdown = false;
  }

  onDropdownClick(event: Event) {
    event.stopPropagation();
  }
}
