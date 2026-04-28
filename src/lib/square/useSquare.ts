/**
 * useSquare — React hook for Square integration
 *
 * This is the frontend's single interface to all Square functionality.
 * It talks to our Vercel API routes, which talk to Square.
 * The frontend never imports the Square SDK directly (except Web Payments SDK).
 */
import { useState, useCallback } from 'react';
import type {
  ApiResponse,
  BookingRequest,
  BookingResponse,
  PaymentRequest,
  PaymentResult,
  CatalogData,
  Quote,
} from './types';

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(options?.headers);
    if (options?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : null;

    if (!res.ok) {
      return {
        success: false,
        error: payload?.error || `Request failed (${res.status})`,
      };
    }

    if (!payload || typeof payload.success !== 'boolean') {
      return { success: false, error: 'Invalid API response' };
    }

    return payload as ApiResponse<T>;
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export function useSquare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T>(fn: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (!result.success) setError(result.error || 'Unknown error');
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message } as ApiResponse<T>;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Check if Square is connected and working */
  const checkHealth = useCallback(() => {
    return withLoading(() => apiFetch<{ connected: boolean; catalogItems: number }>('/square/health'));
  }, [withLoading]);

  /** Fetch menu items from Square Catalog */
  const getMenu = useCallback(() => {
    return withLoading(() => apiFetch<CatalogData>('/square/menu'));
  }, [withLoading]);

  /** Get a quote breakdown for a booking */
  const getQuote = useCallback((booking: BookingRequest) => {
    return withLoading(() =>
      apiFetch<Quote>('/square/quote', {
        method: 'POST',
        body: JSON.stringify(booking),
      })
    );
  }, [withLoading]);

  /** Create an order in Square */
  const createOrder = useCallback((booking: BookingRequest) => {
    return withLoading(() =>
      apiFetch<BookingResponse>('/square/orders', {
        method: 'POST',
        body: JSON.stringify(booking),
      })
    );
  }, [withLoading]);

  /** Create and send an invoice with deposit */
  const createInvoice = useCallback(
    (orderId: string, customerEmail: string, depositCents: number, bookingToken: string, dueDate?: string) => {
      return withLoading(() =>
        apiFetch<{ invoiceId: string; publicUrl: string }>('/square/invoices', {
          method: 'POST',
          body: JSON.stringify({ orderId, customerEmail, depositCents, bookingToken, dueDate }),
        })
      );
    },
    [withLoading]
  );

  /** Check invoice status */
  const checkInvoiceStatus = useCallback(
    (invoiceId: string, orderId: string, customerEmail: string, bookingToken: string) => {
      const params = new URLSearchParams({ invoiceId, orderId, customerEmail });
      return withLoading(() =>
        apiFetch<{ invoiceId: string; status: string; publicUrl?: string }>(
          `/square/invoices?${params.toString()}`,
          { headers: { 'x-booking-token': bookingToken } }
        )
      );
    },
    [withLoading]
  );

  /** Process a payment (deposit or full) */
  const processPayment = useCallback((payment: PaymentRequest) => {
    return withLoading(() =>
      apiFetch<PaymentResult>('/square/payments', {
        method: 'POST',
        body: JSON.stringify(payment),
      })
    );
  }, [withLoading]);

  return {
    loading,
    error,
    checkHealth,
    getMenu,
    getQuote,
    createOrder,
    createInvoice,
    checkInvoiceStatus,
    processPayment,
  };
}
