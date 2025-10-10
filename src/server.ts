import express from "express";
import path from "node:path";
import cors, { type CorsOptions } from "cors";
import dotenv from "dotenv";
import apiRoutes from "@/routes/api";
import { connectToDb } from "@/Utility/connection";
import fs from "fs";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import type { Db } from "mongodb";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// --- CORS: keep localhosts, add prod via env (no trailing slash) ---
const PROD_ORIGIN = (process.env.CLIENT_ORIGIN || "").replace(/\/+$/, "");
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(PROD_ORIGIN ? [PROD_ORIGIN] : []),
];

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/api/*", cors(corsOptions));

console.log(
  "🌐 (data) CORS allowed origins:",
  allowedOrigins.length ? allowedOrigins.join(", ") : "(none)"
);

// ============================
//     🔎 Health/Debug Endpoints
// ============================

// Echo origin + allowed origins (CORS debug)
app.get("/api/health/cors", (req, res) => {
  const origin = req.headers.origin || "(none)";
  res.setHeader("X-Seen-Origin", String(origin));
  res.json({
    ok: true,
    allowedOrigins,
    seenOrigin: origin,
  });
});

// DB health (safe access to connection.db)
app.get("/api/health/db", async (_req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    const carCount = await CarModel.estimatedDocumentCount();

    // stats() requires an established connection and permissions
    let stats: any = null;
    if (state === 1) {
      const db: Db | undefined = (mongoose.connection as any).db;
      if (db && typeof db.stats === "function") {
        try {
          stats = await db.stats();
        } catch {
          // ignore if not permitted
        }
      }
    }

    res.json({
      ok: true,
      mongoState: state,
      carCount,
      dbName: mongoose.connection.name || null,
      stats,
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Minimal cars smoke test
app.get("/api/health/cars-sample", async (_req, res) => {
  try {
    const sample = await CarModel.find({}, { Brand: 1, Model: 1, Class: 1 })
      .sort({ Brand: 1, Model: 1 })
      .limit(3)
      .lean();
    res.json({ ok: true, sample });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Process/runtime snapshot
app.get("/api/health/runtime", (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    ok: true,
    node: process.version,
    uptimeSec: Math.round(process.uptime()),
    rssMB: Math.round(mem.rss / (1024 * 1024)),
    heapUsedMB: Math.round(mem.heapUsed / (1024 * 1024)),
    cwd: process.cwd(),
    envClientOrigin: process.env.CLIENT_ORIGIN || null,
  });
});

// ✅ Simple liveness check
app.get("/api/test", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

// ✅ Serve public images (for cars, logos, etc.)
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// ✅ API routes (brands, cars, etc.)
app.use("/api", apiRoutes);

// ✅ Serve React frontend static files
app.use(express.static(path.join(process.cwd(), "../client/dist")));

// ✅ PROPER Wildcard Route (only log real frontend page fallbacks)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/images")) {
    res.status(404).send("Not found.");
    return;
  }

  console.log("Wildcard triggered for frontend page. Path:", req.path);

  const indexPath = path.join(process.cwd(), "../client/dist/index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not found.");
  }
});

// ✅ Server Start
const main = async () => {
  try {
    await connectToDb();
    console.log("✅ Database connected successfully.");

    const PORT = process.env.PORT || 3001;
    console.log("🔍 Binding to port:", PORT);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

main().catch((error) => console.error("❌ Unexpected error:", error));