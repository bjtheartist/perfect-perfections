/**
 * useSquare — React hook for Square integration
 *
 * This is the frontend's single interface to all Square functionality.
 * It talks to our Express API routes, which talk to Square.
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
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
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
    (orderId: string, customerEmail: string, depositCents: number, dueDate?: string) => {
      return withLoading(() =>
        apiFetch<{ invoiceId: string; publicUrl: string }>('/square/invoices', {
          method: 'POST',
          body: JSON.stringify({ orderId, customerEmail, depositCents, dueDate }),
        })
      );
    },
    [withLoading]
  );

  /** Check invoice status */
  const checkInvoiceStatus = useCallback(
    (invoiceId: string) => {
      return withLoading(() =>
        apiFetch<{ invoiceId: string; status: string; publicUrl?: string }>(
          `/square/invoices?invoiceId=${encodeURIComponent(invoiceId)}`
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
