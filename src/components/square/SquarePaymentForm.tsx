/**
 * SquarePaymentForm — Embedded PCI-compliant payment form
 *
 * Uses Square's Web Payments SDK via react-square-web-payments-sdk.
 * Card data never touches our servers — Square tokenizes it client-side,
 * and we send the token to our backend to process the payment.
 */
import React from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { SQUARE_CONFIG, isSquareConfigured } from '../../lib/square/config';

interface SquarePaymentFormProps {
  /** Amount in cents to display */
  amountCents: number;
  /** Called with the payment token when card is submitted */
  onTokenize: (token: string) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Whether the form is processing a payment */
  processing?: boolean;
}

export const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  amountCents,
  onTokenize,
  onError,
  processing = false,
}) => {
  if (!isSquareConfigured()) {
    return (
      <div style={{
        padding: '24px',
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p style={{ fontWeight: 600, color: '#92400E', marginBottom: '8px' }}>
          Square Not Configured
        </p>
        <p style={{ color: '#A16207', fontSize: '14px' }}>
          Add VITE_SQUARE_APPLICATION_ID and VITE_SQUARE_LOCATION_ID to your .env file.
          <br />
          Get credentials at{' '}
          <a
            href="https://developer.squareup.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            developer.squareup.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PaymentForm
        applicationId={SQUARE_CONFIG.applicationId}
        locationId={SQUARE_CONFIG.locationId}
        cardTokenizeResponseReceived={(token, buyer) => {
          if (token.errors) {
            const msg = token.errors.map((e) => e.message).join(', ');
            onError?.(msg);
            return;
          }
          if (token.token) {
            onTokenize(token.token);
          }
        }}
      >
        <CreditCard
          buttonProps={{
            isLoading: processing,
            css: {
              backgroundColor: '#0C1B33',
              color: '#FAF9F6',
              fontSize: '16px',
              fontWeight: '600',
              '&:hover': {
                backgroundColor: '#1a2d4d',
              },
            },
          }}
        >
          {processing
            ? 'Processing...'
            : `Pay Deposit — $${(amountCents / 100).toFixed(2)}`}
        </CreditCard>
      </PaymentForm>
    </div>
  );
};
