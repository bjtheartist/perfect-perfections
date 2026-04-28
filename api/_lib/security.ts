import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface BookingTokenPayload {
  orderId: string;
  customerEmail: string;
  totalCents: number;
  depositCents: number;
  exp: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const BOOKING_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (raw?.split(',')[0] || req.socket.remoteAddress || 'unknown').trim();
}

function getSigningSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET
    || process.env.ADMIN_SECRET
    || process.env.SQUARE_ACCESS_TOKEN;
  if (!secret?.trim()) {
    throw new Error('Missing BOOKING_TOKEN_SECRET, ADMIN_SECRET, or SQUARE_ACCESS_TOKEN');
  }
  return secret.trim();
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');
}

export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  options: { name: string; limit: number; windowMs: number }
): boolean {
  const now = Date.now();
  const key = `${options.name}:${getClientIp(req)}`;
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + options.windowMs });
    return false;
  }

  current.count += 1;
  if (current.count > options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ success: false, error: 'Too many requests. Please try again shortly.' });
    return true;
  }

  return false;
}

export function createBookingToken(input: Omit<BookingTokenPayload, 'exp'>): string {
  const payload: BookingTokenPayload = {
    ...input,
    customerEmail: input.customerEmail.trim().toLowerCase(),
    exp: Date.now() + BOOKING_TOKEN_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyBookingToken(
  token: unknown,
  expected: { orderId: string; customerEmail: string; depositCents?: number }
): BookingTokenPayload | null {
  if (typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const computed = Buffer.from(expectedSignature);
  if (provided.length !== computed.length || !timingSafeEqual(provided, computed)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as BookingTokenPayload;
    const email = expected.customerEmail.trim().toLowerCase();
    const matches = payload.orderId === expected.orderId
      && payload.customerEmail === email
      && payload.exp > Date.now()
      && (expected.depositCents === undefined || payload.depositCents === expected.depositCents);

    return matches ? payload : null;
  } catch {
    return null;
  }
}
