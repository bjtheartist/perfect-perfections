/**
 * Square Integration — Public API
 *
 * Import from here, not from individual files.
 *
 * Usage:
 *   import { useSquare, isSquareConfigured } from '../lib/square';
 *   import { SquarePaymentForm } from '../components/square/SquarePaymentForm';
 */

// Frontend-safe exports (no server-side imports)
export { SQUARE_CONFIG, isSquareConfigured, getSquareScriptUrl } from './config';
export { useSquare } from './useSquare';
export type {
  MenuItem,
  MenuModifier,
  BookingRequest,
  BookingResponse,
  Quote,
  QuoteLineItem,
  PaymentRequest,
  PaymentResult,
  CustomerInfo,
  ApiResponse,
} from './types';
