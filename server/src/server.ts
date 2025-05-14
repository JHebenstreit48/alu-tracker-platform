import express from "express";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "@/routes/api";
import { connectToDb } from "@/Utility/connection";
import fs from "fs";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
const isDev = process.env.NODE_ENV !== "production";

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://asphaltlegendsunitetracker.netlify.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Serve public images (for cars, logos, etc.)
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// ✅ API routes (brands, cars, etc.)
app.use("/api", apiRoutes);

// ✅ Health check route (for Render diagnostics or uptime testing)
app.get("/api/test", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

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
