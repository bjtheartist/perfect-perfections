import React, { useState } from 'react';
import { trackEvent } from '../lib/analytics';

function validateLeadForm(data: Record<string, FormDataEntryValue>): string | null {
  const name = (data.name as string || '').trim();
  if (!name) return 'Please enter your name.';

  const email = (data.email as string || '').trim();
  if (!email) return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';

  const phone = (data.phone as string || '').trim();
  if (phone) {
    if (!/^[0-9\s\-()+ ]+$/.test(phone)) return 'Phone number contains invalid characters.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 20) return 'Phone number must be between 7 and 20 digits.';
  }

  const eventDate = (data.event_date as string || '').trim();
  if (eventDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return 'Event date must be in YYYY-MM-DD format.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(eventDate + 'T00:00:00') < today) return 'Event date cannot be in the past.';
  }

  return null;
}

export const useLeadForm = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('submitting');
    trackEvent('lead_form_submit');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validationError = validateLeadForm(data);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        trackEvent('lead_form_success');
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setErrorMessage('Oops! Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Oops! Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return { status, errorMessage, submitLead };
};
