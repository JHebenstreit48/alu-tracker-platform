import express from "express";
import path from "node:path";
import cors from "cors";
import apiRoutes from "./routes/api"; // Import your API routes
import { connectToDb } from "./Utility/connection"; // Import your DB connection logic
import router from "./routes/api/index";

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable cross-origin requests

// API routes
app.use("/api", apiRoutes);

// Serve static files (React frontend) - AFTER API routes
app.use(express.static(path.join(process.cwd(), "../client/dist")));

// Catch-all route for React's client-side routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
});

// Main function to connect to the database and start the server
const main = async () => {
  try {
    await connectToDb(); // Connect to MongoDB
    console.log("Database connected successfully.");

    const PORT = process.env.PORT || 5000; // Use Render's PORT or fallback to 5000 locally
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

// Catch unexpected errors during initialization
main().catch((error) => console.error("Unexpected error:", error));
