import express from "express";
import path from "node:path";
import cors, { type CorsOptions } from "cors";
import dotenv from "dotenv";
import compression from "compression";
import apiRoutes from "@/routes/api";
import { connectToDb } from "@/Utility/connection";
import fs from "fs";
import mongoose from "mongoose";
import CarModel from "@/models/car/schema";
import type { Db } from "mongodb";

dotenv.config();

const app = express();

// ============================
//         Middleware
// ============================
app.use(express.json());
app.use(compression());

// --- CORS ---
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
//     Health/Debug Endpoints
// ============================
app.get("/api/health/cors", (req, res) => {
  const origin = req.headers.origin || "(none)";
  res.setHeader("X-Seen-Origin", String(origin));
  res.json({ ok: true, allowedOrigins, seenOrigin: origin });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const carCount = await CarModel.estimatedDocumentCount();

    let stats: any = null;
    if (state === 1) {
      const db: Db | undefined = (mongoose.connection as any).db;
      if (db && typeof db.stats === "function") {
        try { stats = await db.stats(); } catch { /* ignore */ }
      }
    }

    res.json({ ok: true, mongoState: state, carCount, dbName: mongoose.connection.name || null, stats });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

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

// ✅ Simple liveness
app.get("/api/test", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

// ✅ Serve ONLY small UI icons from this repo
//    (car photos live on the Image Vault)
const ICONS_DIR = path.join(process.cwd(), "public/images/icons");
app.use(
  "/images/icons",
  express.static(ICONS_DIR, {
    maxAge: "365d",
    immutable: true,
  })
);

// ✅ API routes (brands, cars, etc.)
app.use("/api", apiRoutes);

// ✅ Serve built frontend (if present in this repo)
app.use(express.static(path.join(process.cwd(), "../client/dist")));

// ✅ Wildcard for real FE pages (don’t swallow API 404s)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/images/icons")) {
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

// ============================
//          Server Start
// ============================
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