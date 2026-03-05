import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { LEAD_STATUSES } from "./src/lib/api/leads.js";
import { requireAdmin } from "./src/lib/server/admin.js";
import { parseLeadPayload } from "./src/lib/server/leads.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("leads.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    event_date TEXT,
    event_type TEXT,
    guests INTEGER,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const VALID_LEAD_STATUSES = LEAD_STATUSES;

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3001");

  // Security headers (CSP disabled for Vite inline scripts)
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(express.json());

  // Rate limiting on API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api/", apiLimiter);

  // API Routes
  app.post("/api/leads", (req, res) => {
    const parsed = parseLeadPayload(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const {
      name,
      email,
      phone,
      event_date,
      event_type,
      guests,
      message,
    } = parsed.value;

    try {
      const stmt = db.prepare(`
        INSERT INTO leads (name, email, phone, event_date, event_type, guests, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        name, email, phone,
        event_date, event_type, guests, message
      );
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/leads", requireAdmin, (req, res) => {
    try {
      const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_LEAD_STATUSES.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_LEAD_STATUSES.join(", ")}` });
      return;
    }

    try {
      db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Square API routes (only loaded when credentials are present)
  if (process.env.SQUARE_ACCESS_TOKEN) {
    const { default: squareRoutes } = await import("./src/lib/square/routes.js");
    app.use("/api", squareRoutes);
    console.log(`Square API: Connected (${process.env.SQUARE_ENVIRONMENT || 'sandbox'})`);
  } else {
    console.log("Square API: Skipped (no SQUARE_ACCESS_TOKEN in .env)");
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
