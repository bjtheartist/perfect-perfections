/**
 * Square Server-Side Client
 *
 * Used by Express API routes to interact with Square APIs.
 * This file runs on the server only — never imported by frontend code.
 *
 * Square SDK v43+ uses SquareClient / SquareEnvironment.
 */
import { SquareClient, SquareEnvironment } from 'square';

const accessToken = process.env.SQUARE_ACCESS_TOKEN || '';
const environment =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

export const squareClient = new SquareClient({
  token: accessToken,
  environment,
});
