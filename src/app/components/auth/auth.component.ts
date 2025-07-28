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
  showVerification = false;
  email = '';
  password = '';
  username = '';
  confirmPassword = '';
  verificationCode = '';
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.showVerification = false;
    this.clearForm();
  }

  async onSubmit(): Promise<void> {
    if (this.showVerification) {
      await this.verifyEmail();
    } else if (!this.validateForm()) {
      return;
    } else {
      await this.handleAuth();
    }
  }

  private async handleAuth(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    try {
      if (this.isSignUp) {
        const result = await this.authService.signUp(this.email, this.password, this.username);
        if (result.isSignUpComplete) {
          // Sign up completed without verification (shouldn't happen with email verification enabled)
          this.successMessage = 'Account created successfully! You can now sign in.';
          this.isSignUp = false;
          this.clearForm();
        } else {
          // Verification required
          this.showVerification = true;
          this.successMessage = `Verification code sent to ${this.email}. Please check your email and enter the code below.`;
        }
      } else {
        await this.authService.signIn(this.email, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private async verifyEmail(): Promise<void> {
    if (!this.verificationCode.trim()) {
      this.error = 'Please enter the verification code.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.authService.confirmSignUp(this.email, this.verificationCode.trim());
      this.successMessage = 'Email verified successfully! You can now sign in.';
      this.showVerification = false;
      this.isSignUp = false;
      this.clearForm();
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        this.error = 'Invalid verification code. Please check and try again.';
      } else if (error.name === 'ExpiredCodeException') {
        this.error = 'Verification code has expired. Please request a new code.';
      } else {
        this.error = error.message || 'Verification failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async resendCode(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      await this.authService.resendConfirmationCode(this.email);
      this.successMessage = `New verification code sent to ${this.email}`;
    } catch (error: any) {
      this.error = error.message || 'Failed to resend code. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private handleAuthError(error: any): void {
    if (error.message && error.message.includes('already a signed in user')) {
      this.error = 'Signing out previous session and signing you in...';
      // The auth service will handle the retry automatically
      this.authService.signIn(this.email, this.password).then(() => {
        this.router.navigate(['/dashboard']);
      }).catch((retryError: any) => {
        this.error = retryError.message || 'Sign in failed. Please try again.';
      });
    } else if (error.name === 'UserNotConfirmedException') {
      this.showVerification = true;
      this.error = 'Please verify your email address first.';
      this.resendCode();
    } else {
      this.error = error.message || 'An error occurred. Please try again.';
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
    this.verificationCode = '';
    this.error = '';
    this.successMessage = '';
  }

  async forceSignOut(): Promise<void> {
    this.loading = true;
    try {
      await this.authService.forceSignOut();
      this.successMessage = 'Previous session cleared. You can now sign in.';
      this.clearForm();
    } catch (error: any) {
      this.error = 'Error clearing session: ' + (error.message || 'Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
