/**
 * Utility functions for service-related operations
 */

/**
 * Generate random duration between 1-4 hours for services
 * @returns Random number between 1 and 4 (inclusive)
 */
export function getRandomServiceDuration(): number {
  return Math.floor(Math.random() * 4) + 1; // Returns 1, 2, 3, or 4
}

/**
 * Generate multiple random durations for a list of services
 * @param count Number of durations to generate
 * @returns Array of random durations
 */
export function getRandomServiceDurations(count: number): number[] {
  return Array.from({ length: count }, () => getRandomServiceDuration());
}

/**
 * Format service duration for display
 * @param hours Number of hours
 * @returns Formatted string (e.g., "2 hours", "1 hour")
 */
export function formatServiceDuration(hours: number): string {
  return hours === 1 ? '1 hour' : `${hours} hours`;
}
