import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";

import commentsRoutes from "@/routes/api/comments";
import feedbackRoutes from "@/routes/api/feedback";
import internalRoutes from "@/routes/api/internal";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "32kb" }));

// CORS: primary + optional extras (comma-separated)
const primary = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const extras = (process.env.EXTRA_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [primary, ...extras];

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: false,
};

app.use(cors(corsOptions));

console.log(
  "🌐 CORS allowed origins:",
  allowedOrigins.length ? allowedOrigins.join(", ") : "(none)"
);

// Simple health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount APIs
app.use("/api/comments", commentsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/internal", internalRoutes);

const PORT = Number(process.env.PORT) || 3004;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🟣 ALU Tracker platform API listening on http://0.0.0.0:${PORT}`
  );
});