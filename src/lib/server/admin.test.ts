import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { requireAdmin } from './admin';

describe('requireAdmin', () => {
  const originalSecret = process.env.ADMIN_SECRET;

  beforeEach(() => {
    process.env.ADMIN_SECRET = originalSecret;
  });

  afterEach(() => {
    process.env.ADMIN_SECRET = originalSecret;
  });

  it('allows requests when no secret is configured', () => {
    delete process.env.ADMIN_SECRET;
    const req = { header: vi.fn() } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows requests with a matching admin token', () => {
    process.env.ADMIN_SECRET = 'secret123';
    const req = { header: vi.fn().mockReturnValue('secret123') } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects requests with missing or invalid tokens', () => {
    process.env.ADMIN_SECRET = 'secret123';
    const req = { header: vi.fn().mockReturnValue('wrong') } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
