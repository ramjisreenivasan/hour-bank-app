/**
 * Utility functions for service-related operations
 */

/**
 * Ensures hourlyDuration is always a positive integer
 * @param duration - The duration value to normalize
 * @returns A positive integer representing hours
 */
export function normalizeHourlyDuration(duration: number | undefined | null): number {
  if (duration === undefined || duration === null || isNaN(duration)) {
    return 1; // Default to 1 hour
  }
  
  // Ensure it's a positive integer, minimum 1 hour
  return Math.max(1, Math.floor(Math.abs(duration)));
}

/**
 * Validates service data and normalizes hourlyDuration
 * @param serviceData - The service data to validate
 * @returns Validated service data with normalized hourlyDuration
 */
export function validateAndNormalizeService(serviceData: any): any {
  return {
    ...serviceData,
    hourlyDuration: normalizeHourlyDuration(serviceData.hourlyDuration)
  };
}
