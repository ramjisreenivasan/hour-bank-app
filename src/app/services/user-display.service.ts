import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDisplayService {

  /**
   * Get the display name for a user, prioritizing username over other options
   */
  getDisplayName(user: User | null | undefined): string {
    if (!user) {
      return 'Unknown User';
    }

    // Priority: username > firstName lastName > firstName > email
    if (user.username) {
      return user.username;
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split('@')[0]; // Use email prefix as fallback
    }

    return 'Unknown User';
  }

  /**
   * Get a short display name (username or first name only)
   */
  getShortDisplayName(user: User | null | undefined): string {
    if (!user) {
      return 'Unknown';
    }

    if (user.username) {
      return user.username;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split('@')[0];
    }

    return 'Unknown';
  }

  /**
   * Get full name if available, otherwise username
   */
  getFullNameOrUsername(user: User | null | undefined): string {
    if (!user) {
      return 'Unknown User';
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.username) {
      return user.username;
    }

    if (user.firstName) {
      return user.firstName;
    }

    return user.email?.split('@')[0] || 'Unknown User';
  }

  /**
   * Get username with fallback to other identifiers
   */
  getUsername(user: User | null | undefined): string {
    if (!user) {
      return 'unknown';
    }

    if (user.username) {
      return user.username;
    }

    // Fallback to email prefix if no username
    if (user.email) {
      return user.email.split('@')[0];
    }

    // Last resort: use first name in lowercase
    if (user.firstName) {
      return user.firstName.toLowerCase().replace(/\s+/g, '_');
    }

    return 'unknown';
  }

  /**
   * Format user for display in lists (e.g., "john_dev (John Doe)")
   */
  getListDisplayName(user: User | null | undefined): string {
    if (!user) {
      return 'Unknown User';
    }

    const username = this.getUsername(user);
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : null;

    if (fullName && fullName !== username) {
      return `${username} (${fullName})`;
    }

    return username;
  }

  /**
   * Get initials for avatar display
   */
  getInitials(user: User | null | undefined): string {
    if (!user) {
      return '??';
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }

    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }

    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return '??';
  }
}
