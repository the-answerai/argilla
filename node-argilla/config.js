const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

// Load environment variables from .env file
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error.message);
    console.warn("Will attempt to use environment variables if they exist...");
}

// Set default values and ensure required variables are present
const config = {
    // Argilla API configuration
    argilla: {
        apiUrl: process.env.ARGILLA_API_URL || "http://localhost:6900",
        apiKey: process.env.ARGILLA_API_KEY || "argilla.apikey",
        username: process.env.ARGILLA_USERNAME || "admin",
        password: process.env.ARGILLA_PASSWORD || "password123",
        workspace: process.env.ARGILLA_WORKSPACE || "admin",
    },

    // Chat evaluation configuration
    evaluation: {
        datasetName: process.env.DATASET_NAME || "chat_evaluation",
        recordsPerPage: Number.parseInt(process.env.RECORDS_PER_PAGE || "10", 10),
    },
};

// Log configuration (without sensitive data)
console.log("Configuration loaded:");
console.log(`- Argilla API URL: ${config.argilla.apiUrl}`);
console.log(
    `- Argilla API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`,
);
console.log(`- Argilla Workspace: ${config.argilla.workspace}`);
console.log(`- Evaluation Dataset Name: ${config.evaluation.datasetName}`);

module.exports = config;
