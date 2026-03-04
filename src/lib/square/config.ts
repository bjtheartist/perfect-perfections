/**
 * Square SDK Configuration
 *
 * Central config for Square API integration.
 * All credentials come from environment variables — never hardcoded.
 */

export const SQUARE_CONFIG = {
  applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID || '',
  locationId: import.meta.env.VITE_SQUARE_LOCATION_ID || '',
  environment: (import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
} as const;

/** Whether Square is properly configured */
export function isSquareConfigured(): boolean {
  return !!(SQUARE_CONFIG.applicationId && SQUARE_CONFIG.locationId);
}

/** Get the Web Payments SDK script URL based on environment */
export function getSquareScriptUrl(): string {
  return SQUARE_CONFIG.environment === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js';
}
