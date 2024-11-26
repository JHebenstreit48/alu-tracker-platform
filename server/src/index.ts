import express from "express";
import path from "node:path";
import cors from "cors";
import apiRoutes from "./routes/api"; // Ensure this matches your folder structure
import { connectToDb } from "./Utility/connection";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for cross-origin requests

app.use("/api", apiRoutes);

app.use(express.static(path.join(process.cwd(), '../client/dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), '../client/dist/index.html'));
});

const main = async () => {
    try {
        await connectToDb(); // Connect to MongoDB
        console.log("Database connected successfully.");
        
        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

main().catch((error) => console.error("Unexpected error:", error));
