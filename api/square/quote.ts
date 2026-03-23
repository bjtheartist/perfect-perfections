import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildSquareQuote,
  createSquareClient,
  getErrorMessage,
  handleCors,
  normalizeBooking,
  requireMethods,
  validateQuoteRequest,
} from '../_lib/square.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST'])) return;
  if (!requireMethods(req, res, ['POST'])) return;

  const booking = normalizeBooking(req.body);
  const validationError = validateQuoteRequest(booking);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  try {
    const quote = await buildSquareQuote(booking, createSquareClient());
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
}
