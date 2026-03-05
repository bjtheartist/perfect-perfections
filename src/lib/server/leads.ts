import type { LeadCreateRequest } from "../api/leads.js";

type SanitizedLead = {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_type: string;
  guests: number | null;
  message: string;
};

export type LeadParseResult =
  | { ok: true; value: SanitizedLead }
  | { ok: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sanitizeGuests(value: unknown) {
  const guestNumber = value != null && value !== "" ? Number(value) : NaN;
  return !Number.isNaN(guestNumber)
    ? Math.min(Math.max(0, Math.round(guestNumber)), 10000)
    : null;
}

export function parseLeadPayload(payload: Partial<LeadCreateRequest> | null | undefined): LeadParseResult {
  const { name, email, phone, event_date, event_type, guests, message } = (payload ?? {}) as LeadCreateRequest;

  if (!name || typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "Name is required" };
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Valid email is required" };
  }

  return {
    ok: true,
    value: {
      name: sanitizeString(name, 200),
      email: sanitizeString(email, 254),
      phone: sanitizeString(phone, 30),
      event_date: sanitizeString(event_date, 20),
      event_type: sanitizeString(event_type, 100),
      guests: sanitizeGuests(guests),
      message: sanitizeString(message, 2000),
    },
  };
}
