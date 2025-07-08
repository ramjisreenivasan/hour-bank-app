import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { LogoComponent } from '../logo/logo.component';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: User | null = null;
  isAdmin = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial authentication state
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = !!this.currentUser;
    
    if (this.isAuthenticated) {
      this.checkAdminStatus();
    }

    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      
      if (this.isAuthenticated) {
        this.checkAdminStatus();
      } else {
        this.isAdmin = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private async checkAdminStatus(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      const currentUser = await getCurrentUser();
      
      // Check for admin group membership in Cognito
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
      const isAdminGroup = groups.includes('admin') || groups.includes('Admin');
      
      // Check for admin email patterns (backup method)
      const adminEmails = [
        'admin@hourbank.com',
        'administrator@hourbank.com'
      ];
      const userEmail = currentUser.signInDetails?.loginId || '';
      const isAdminEmail = adminEmails.includes(userEmail.toLowerCase());
      
      // Check for admin username patterns
      const username = currentUser.username || '';
      const isAdminUsername = username.toLowerCase().includes('admin');
      
      this.isAdmin = isAdminGroup || isAdminEmail || isAdminUsername;
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
