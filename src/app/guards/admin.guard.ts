import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      // First check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/auth']);
        observer.next(false);
        observer.complete();
        return;
      }

      // Check if user has admin privileges
      this.checkAdminPrivileges().then(isAdmin => {
        if (isAdmin) {
          observer.next(true);
        } else {
          this.router.navigate(['/dashboard']);
          observer.next(false);
        }
        observer.complete();
      }).catch(error => {
        console.error('Admin guard error:', error);
        this.router.navigate(['/dashboard']);
        observer.next(false);
        observer.complete();
      });
    });
  }

  private async checkAdminPrivileges(): Promise<boolean> {
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
      
      return isAdminGroup || isAdminEmail || isAdminUsername;
    } catch (error) {
      console.error('Error checking admin privileges:', error);
      return false;
    }
  }
}
