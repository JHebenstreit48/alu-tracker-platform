import express from "express";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api"; // Import your API routes
import { connectToDb } from "./Utility/connection"; // Import your DB connection logic

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// API routes
app.use("/api", apiRoutes);

// Serve static files (React frontend) - AFTER API routes
app.use(express.static(path.join(process.cwd(), "../client/dist")));

// Catch-all route for React's client-side routing
app.get("*", (_req, res) => {
    const indexPath = path.join(process.cwd(), "../client/dist/index.html");
    if (require("fs").existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Frontend not found.");
    }
});

// Main function to connect to the database and start the server
const main = async () => {
    try {
        await connectToDb(); // Connect to MongoDB
        console.log("Database connected successfully.");

        const PORT = process.env.PORT || 3001; // Use Render's PORT or fallback to 3001 locally
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

// Catch unexpected errors during initialization
main().catch((error) => console.error("Unexpected error:", error));
