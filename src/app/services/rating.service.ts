import { Injectable } from '@angular/core';
import { Transaction } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  constructor() { }

  /**
   * Calculate the average rating for a user based on completed transactions where they were the provider
   * @param userId - The user ID to calculate rating for
   * @param allTransactions - All transactions in the system
   * @returns Average rating (1-5) or 5.0 if no ratings exist
   */
  calculateUserAverageRating(userId: string, allTransactions: Transaction[]): number {
    // Find completed transactions where this user was the provider and has a rating
    const ratedTransactions = allTransactions.filter(transaction => 
      transaction.providerId === userId && 
      transaction.status === 'COMPLETED' && 
      transaction.rating && 
      transaction.rating > 0
    );
    
    console.log(`RatingService: Rating calculation for user ${userId}:`, {
      totalTransactions: allTransactions.length,
      ratedTransactions: ratedTransactions.length,
      ratings: ratedTransactions.map(t => t.rating)
    });
    
    // If no rated transactions, return default rating of 5.0
    if (ratedTransactions.length === 0) {
      return 5.0;
    }
    
    // Calculate average rating
    const totalRating = ratedTransactions.reduce((sum, transaction) => sum + (transaction.rating || 0), 0);
    const averageRating = totalRating / ratedTransactions.length;
    
    // Round to 1 decimal place
    return Math.round(averageRating * 10) / 10;
  }

  /**
   * Get rating statistics for a user
   * @param userId - The user ID to get stats for
   * @param allTransactions - All transactions in the system
   * @returns Object with rating statistics
   */
  getUserRatingStats(userId: string, allTransactions: Transaction[]): {
    averageRating: number;
    totalRatings: number;
    ratingBreakdown: { [key: number]: number };
  } {
    const ratedTransactions = allTransactions.filter(transaction => 
      transaction.providerId === userId && 
      transaction.status === 'COMPLETED' && 
      transaction.rating && 
      transaction.rating > 0
    );

    const averageRating = this.calculateUserAverageRating(userId, allTransactions);
    const totalRatings = ratedTransactions.length;
    
    // Create rating breakdown (count of each rating 1-5)
    const ratingBreakdown: { [key: number]: number } = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    ratedTransactions.forEach(transaction => {
      if (transaction.rating) {
        const rating = Math.round(transaction.rating);
        if (rating >= 1 && rating <= 5) {
          ratingBreakdown[rating]++;
        }
      }
    });

    return {
      averageRating,
      totalRatings,
      ratingBreakdown
    };
  }

  /**
   * Format rating for display (e.g., "4.5" or "5.0")
   * @param rating - The rating number
   * @returns Formatted rating string
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get star display array for UI (filled/empty stars)
   * @param rating - The rating number
   * @returns Array of booleans indicating filled stars
   */
  getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= roundedRating);
    }
    
    return stars;
  }
}
