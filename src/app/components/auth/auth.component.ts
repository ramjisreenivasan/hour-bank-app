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
  phoneNumber = '';
  contactMethod: 'email' | 'phone' = 'email'; // Track selected contact method
  emailOrUsername = ''; // For sign-in, can be either email or username
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

  get currentContactValue(): string {
    return this.contactMethod === 'email' ? this.email : this.phoneNumber;
  }

  async onSubmit(): Promise<void> {
    if (this.showVerification) {
      await this.verifyContact();
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
        const contact = this.currentContactValue;
        const result = await this.authService.signUp(contact, this.password, this.username, this.contactMethod);
        if (result.isSignUpComplete) {
          // Sign up completed without verification (shouldn't happen with verification enabled)
          this.successMessage = 'Account created successfully! You can now sign in.';
          this.isSignUp = false;
          this.clearForm();
        } else {
          // Verification required
          this.showVerification = true;
          const contactType = this.contactMethod === 'email' ? 'email' : 'phone number';
          const checkMessage = this.contactMethod === 'email' ? 'check your email' : 'check your text messages';
          this.successMessage = `Verification code sent to your ${contactType} (${contact}). Please ${checkMessage} and enter the code below.`;
        }
      } else {
        await this.authService.signIn(this.emailOrUsername, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private async verifyContact(): Promise<void> {
    if (!this.verificationCode.trim()) {
      this.error = 'Please enter the verification code.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const contact = this.currentContactValue;
      await this.authService.confirmSignUp(contact, this.verificationCode.trim());
      const contactType = this.contactMethod === 'email' ? 'Email' : 'Phone number';
      this.successMessage = `${contactType} verified successfully! You can now sign in.`;
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
      const contact = this.currentContactValue;
      await this.authService.resendConfirmationCode(contact);
      const contactType = this.contactMethod === 'email' ? 'email' : 'phone number';
      this.successMessage = `New verification code sent to your ${contactType} (${contact})`;
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
      this.authService.signIn(this.emailOrUsername, this.password).then(() => {
        this.router.navigate(['/dashboard']);
      }).catch((retryError: any) => {
        this.error = retryError.message || 'Sign in failed. Please try again.';
      });
    } else if (error.name === 'UserNotConfirmedException') {
      // If user tries to sign in with email but hasn't verified, show verification
      if (this.emailOrUsername.includes('@')) {
        this.email = this.emailOrUsername; // Set email for verification
        this.showVerification = true;
        this.error = 'Please verify your email address first.';
        this.resendCode();
      } else {
        this.error = 'Please verify your email address first. Try signing in with your email instead of username.';
      }
    } else {
      this.error = error.message || 'An error occurred. Please try again.';
    }
  }

  private validateForm(): boolean {
    if (this.isSignUp) {
      // Validate contact method
      if (this.contactMethod === 'email') {
        if (!this.email || !this.email.includes('@')) {
          this.error = 'Please enter a valid email address.';
          return false;
        }
      } else {
        if (!this.phoneNumber || this.phoneNumber.length < 10) {
          this.error = 'Please enter a valid phone number (at least 10 digits).';
          return false;
        }
      }
      
      if (!this.password) {
        this.error = 'Password is required.';
        return false;
      }
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
    } else {
      if (!this.emailOrUsername || !this.password) {
        this.error = 'Email/Username and password are required.';
        return false;
      }
    }

    return true;
  }

  private clearForm(): void {
    this.email = '';
    this.phoneNumber = '';
    this.emailOrUsername = '';
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
