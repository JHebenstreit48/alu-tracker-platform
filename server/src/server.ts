import express from "express";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "@/routes/api";
import { connectToDb } from "@/Utility/connection";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Serve public images
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// ✅ API routes
app.use("/api", apiRoutes);

// ✅ Serve React frontend static files
app.use(express.static(path.join(process.cwd(), "../client/dist")));

// 🛑 VERY IMPORTANT: Fix "*" wildcard route
app.get("*", (req, res) => {
  console.log("Wildcard triggered. Requested Path:", req.path); // ADD THIS

  if (req.path.startsWith("/api") || req.path.startsWith("/images")) {
    res.status(404).send("Not found.");
    return;
  }

  const indexPath = path.join(process.cwd(), "../client/dist/index.html");
  if (require("fs").existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not found.");
  }
});


const main = async () => {
  try {
    await connectToDb();
    console.log("✅ Database connected successfully.");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

main().catch((error) => console.error("❌ Unexpected error:", error));
