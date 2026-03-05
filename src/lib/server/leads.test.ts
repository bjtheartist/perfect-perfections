import { describe, expect, it } from 'vitest';
import { parseLeadPayload } from './leads';

describe('parseLeadPayload', () => {
  it('requires name and email', () => {
    const missingPayload = parseLeadPayload(undefined);
    expect(missingPayload.ok).toBe(false);
    if (!missingPayload.ok) expect(missingPayload.error).toBe('Name is required');

    const missingName = parseLeadPayload({
      name: '',
      email: 'test@example.com',
    } as any);
    expect(missingName.ok).toBe(false);
    if (!missingName.ok) expect(missingName.error).toBe('Name is required');

    const missingEmail = parseLeadPayload({
      name: 'Test User',
      email: '',
    } as any);
    expect(missingEmail.ok).toBe(false);
    if (!missingEmail.ok) expect(missingEmail.error).toBe('Valid email is required');
  });

  it('rejects invalid email formats', () => {
    const result = parseLeadPayload({
      name: 'Test User',
      email: 'not-an-email',
    } as any);
    expect(result.ok).toBe(false);
  });

  it('sanitizes strings and clamps guests', () => {
    const longName = 'a'.repeat(300);
    const longEmail = `${'b'.repeat(260)}@example.com`;
    const payload = {
      name: `  ${longName}  `,
      email: longEmail,
      phone: '  123-456-7890  ',
      event_date: '  2026-02-20  ',
      event_type: '  Wedding  ',
      guests: 12000,
      message: 'c'.repeat(3000),
    } as any;

    const result = parseLeadPayload(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name.length).toBe(200);
      expect(result.value.email.length).toBe(254);
      expect(result.value.phone).toBe('123-456-7890');
      expect(result.value.event_date).toBe('2026-02-20');
      expect(result.value.event_type).toBe('Wedding');
      expect(result.value.guests).toBe(10000);
      expect(result.value.message.length).toBe(2000);
    }
  });

  it('rounds and normalizes guest counts', () => {
    const fractional = parseLeadPayload({
      name: 'Test User',
      email: 'test@example.com',
      guests: '12.6',
    } as any);
    expect(fractional.ok).toBe(true);
    if (fractional.ok) expect(fractional.value.guests).toBe(13);

    const negative = parseLeadPayload({
      name: 'Test User',
      email: 'test@example.com',
      guests: -4,
    } as any);
    expect(negative.ok).toBe(true);
    if (negative.ok) expect(negative.value.guests).toBe(0);

    const empty = parseLeadPayload({
      name: 'Test User',
      email: 'test@example.com',
      guests: '',
    } as any);
    expect(empty.ok).toBe(true);
    if (empty.ok) expect(empty.value.guests).toBeNull();
  });
});
