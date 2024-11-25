"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("./routes/api")); // Ensure this matches your folder structure
const connection_1 = require("./Utility/connection");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json()); // Parse JSON requests
app.use((0, cors_1.default)()); // Enable CORS for cross-origin requests
const main = async () => {
    try {
        await (0, connection_1.connectToDb)(); // Connect to MongoDB
        console.log("Database connected successfully.");
        // Register API routes
        app.use("/api", api_1.default);
        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (error) {
        console.error("Failed to start server:", error);
    }
};
main().catch((error) => console.error("Unexpected error:", error));
