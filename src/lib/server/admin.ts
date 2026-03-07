import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res.status(503).json({ error: "Admin access is unavailable until ADMIN_SECRET is configured." });
    return;
  }

  const token = req.header("x-admin-token");
  if (token && token === secret) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}
