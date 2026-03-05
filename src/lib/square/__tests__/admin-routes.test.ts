import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// Mock squareClient before importing routes
vi.mock('../client.js', () => ({
  squareClient: {
    orders: { search: vi.fn() },
    payments: { list: vi.fn() },
    customers: { list: vi.fn(), get: vi.fn() },
    catalog: {
      list: vi.fn(async () => ({
        [Symbol.asyncIterator]: async function* () {
          // empty catalog
        },
      })),
    },
  },
}));

import express from 'express';
import request from 'supertest';
import routes from '../routes.js';
import { squareClient } from '../client.js';

const app = express();
app.use(express.json());
app.use(routes);

const ADMIN_TOKEN = 'test-admin-secret';

function asyncIterable<T>(items: T[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) yield item;
    },
  };
}

beforeAll(() => {
  process.env.ADMIN_SECRET = ADMIN_TOKEN;
  process.env.SQUARE_LOCATION_ID = 'LOC123';
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /square/admin/orders', () => {
  it('returns OrderSummary[] with resolved customer names', async () => {
    vi.mocked(squareClient.orders.search).mockResolvedValue({
      orders: [
        {
          id: 'order-1',
          referenceId: 'PP-001',
          customerId: 'cust-1',
          state: 'OPEN',
          totalMoney: { amount: BigInt(50000), currency: 'USD' },
          metadata: { eventType: 'Wedding', eventDate: '2026-06-15', guestCount: '50' },
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
    } as any);

    vi.mocked(squareClient.customers.get).mockResolvedValue({
      customer: { id: 'cust-1', givenName: 'Jane', familyName: 'Doe' },
    } as any);

    const res = await request(app)
      .get('/square/admin/orders')
      .set('x-admin-token', ADMIN_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: 'order-1',
      customerName: 'Jane Doe',
      state: 'OPEN',
      totalCents: 50000,
      eventType: 'Wedding',
    });
  });

  it('rejects without admin token', async () => {
    const res = await request(app).get('/square/admin/orders');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});

describe('GET /square/admin/transactions', () => {
  it('returns TransactionSummary[] with card details', async () => {
    vi.mocked(squareClient.payments.list).mockResolvedValue(
      asyncIterable([
        {
          id: 'pay-1',
          orderId: 'order-1',
          amountMoney: { amount: BigInt(12500), currency: 'USD' },
          status: 'COMPLETED',
          cardDetails: { card: { cardBrand: 'VISA', last4: '4242' } },
          receiptUrl: 'https://receipt.example.com',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ]) as any,
    );

    const res = await request(app)
      .get('/square/admin/transactions')
      .set('x-admin-token', ADMIN_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: 'pay-1',
      amountCents: 12500,
      status: 'COMPLETED',
      cardBrand: 'VISA',
      last4: '4242',
    });
  });

  it('rejects without admin token', async () => {
    const res = await request(app).get('/square/admin/transactions');
    expect(res.status).toBe(401);
  });
});

describe('GET /square/admin/customers', () => {
  it('returns CustomerSummary[]', async () => {
    vi.mocked(squareClient.customers.list).mockResolvedValue(
      asyncIterable([
        {
          id: 'cust-1',
          givenName: 'John',
          familyName: 'Smith',
          emailAddress: 'john@example.com',
          phoneNumber: '555-0100',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ]) as any,
    );

    const res = await request(app)
      .get('/square/admin/customers')
      .set('x-admin-token', ADMIN_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: 'cust-1',
      displayName: 'John Smith',
      emailAddress: 'john@example.com',
    });
  });

  it('rejects without admin token', async () => {
    const res = await request(app).get('/square/admin/customers');
    expect(res.status).toBe(401);
  });
});
