import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../admin';

function mockReqResNext(headers: Record<string, string> = {}) {
  const req = {
    header: (name: string) => headers[name.toLowerCase()],
  } as unknown as Request;

  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status, json } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, status, json, next };
}

describe('requireAdmin middleware', () => {
  beforeEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it('calls next() with valid x-admin-token', () => {
    process.env.ADMIN_SECRET = 'test-secret';
    const { req, res, next } = mockReqResNext({ 'x-admin-token': 'test-secret' });

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when header is missing', () => {
    process.env.ADMIN_SECRET = 'test-secret';
    const { req, res, next, status, json } = mockReqResNext();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('returns 401 when token is wrong', () => {
    process.env.ADMIN_SECRET = 'test-secret';
    const { req, res, next, status, json } = mockReqResNext({ 'x-admin-token': 'wrong' });

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('calls next() when ADMIN_SECRET is not set (open access)', () => {
    const { req, res, next } = mockReqResNext();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
