import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogoComponent } from '../logo/logo.component';
import { SocialLoginComponent } from '../social-login/social-login.component';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, LogoComponent, SocialLoginComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isSignUp = false;
  email = '';
  password = '';
  username = '';
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.clearForm();
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      if (this.isSignUp) {
        await this.authService.signUp(this.email, this.password, this.username);
        this.error = 'Please check your email to verify your account, then sign in.';
        this.isSignUp = false;
      } else {
        await this.authService.signIn(this.email, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      // Handle specific error messages
      if (error.message && error.message.includes('already a signed in user')) {
        this.error = 'Signing out previous session and signing you in...';
        // The auth service will handle the retry automatically
        try {
          await this.authService.signIn(this.email, this.password);
          this.router.navigate(['/dashboard']);
        } catch (retryError: any) {
          this.error = retryError.message || 'Sign in failed. Please try again.';
        }
      } else {
        this.error = error.message || 'An error occurred. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required.';
      return false;
    }

    if (this.isSignUp) {
      if (!this.username) {
        this.error = 'Username is required for sign up.';
        return false;
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match.';
        return false;
      }
      if (this.password.length < 8) {
        this.error = 'Password must be at least 8 characters long.';
        return false;
      }
    }

    return true;
  }

  private clearForm(): void {
    this.email = '';
    this.password = '';
    this.username = '';
    this.confirmPassword = '';
    this.error = '';
  }

  async forceSignOut(): Promise<void> {
    this.loading = true;
    try {
      await this.authService.forceSignOut();
      this.error = 'Previous session cleared. You can now sign in.';
      this.clearForm();
    } catch (error: any) {
      this.error = 'Error clearing session: ' + (error.message || 'Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
