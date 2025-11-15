import express from "express";
import helmet from "helmet";
import cors from "cors";

import commentsRoutes from "./routes/comments";
import feedbackRoutes from "./routes/feedback";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "32kb" }));

const allowedOrigins = [
  "https://asphaltlegendsunitetracker.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes for comments + feedback
app.use("/api/comments", commentsRoutes);
app.use("/api/feedback", feedbackRoutes);

export default app;