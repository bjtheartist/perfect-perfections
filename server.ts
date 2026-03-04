import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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

const VALID_LEAD_STATUSES = ["new", "contacted", "booked", "closed"];

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
    const { name, email, phone, event_date, event_type, guests, message } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    // Sanitize and cap string lengths
    const sanitize = (val: any, max: number) =>
      typeof val === "string" ? val.trim().slice(0, max) : "";
    const sanitizedName = sanitize(name, 200);
    const sanitizedEmail = sanitize(email, 254);
    const sanitizedPhone = sanitize(phone, 30);
    const sanitizedEventDate = sanitize(event_date, 20);
    const sanitizedEventType = sanitize(event_type, 100);
    const guestsNum = guests != null && guests !== "" ? Number(guests) : NaN;
    const sanitizedGuests = !isNaN(guestsNum) ? Math.min(Math.max(0, Math.round(guestsNum)), 10000) : null;
    const sanitizedMessage = sanitize(message, 2000);

    try {
      const stmt = db.prepare(`
        INSERT INTO leads (name, email, phone, event_date, event_type, guests, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        sanitizedName, sanitizedEmail, sanitizedPhone,
        sanitizedEventDate, sanitizedEventType, sanitizedGuests, sanitizedMessage
      );
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/leads", (req, res) => {
    try {
      const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", (req, res) => {
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
