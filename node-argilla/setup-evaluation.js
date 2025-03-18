const testConnection = require("./test-connection");
const createChatEvaluationDataset = require("./create-evaluation-dataset");
const addSampleRecords = require("./add-sample-records");
const config = require("./config");

/**
 * Main setup function that runs all tests and setup steps
 */
async function setupEvaluation() {
    console.log("🔧 Setting up Argilla Evaluation Environment");
    console.log("===========================================");
    console.log("Configuration:");
    console.log(`- API URL: ${config.argilla.apiUrl}`);
    console.log(
        `- API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`,
    );
    console.log(`- Username: ${config.argilla.username || "not set"}`);
    console.log(`- Workspace: ${config.argilla.workspace || "not set"}`);
    console.log(`- Dataset: ${config.evaluation.datasetName}`);
    console.log("===========================================\n");

    // Step 1: Test connection
    console.log("\n📡 STEP 1: Testing API Connection");
    console.log("-----------------------------");
    const connectionResult = await testConnection();
    if (!connectionResult) {
        console.error(
            "❌ Connection test failed. Please check your API settings and try again.",
        );
        process.exit(1);
    }
    console.log("✅ Connection test successful!\n");

    // Step 2: Create evaluation dataset
    console.log("\n📊 STEP 2: Setting up Evaluation Dataset");
    console.log("------------------------------------");
    // Ask about force recreate
    const forceRecreate =
        process.argv.includes("--force") || process.argv.includes("-f");
    console.log(`Force recreate: ${forceRecreate}`);

    const dataset = await createChatEvaluationDataset(null, forceRecreate);
    if (!dataset) {
        console.error(
            "❌ Dataset creation failed. Please check the error messages above.",
        );
        process.exit(1);
    }
    console.log(
        `✅ Dataset "${config.evaluation.datasetName}" setup successful!\n`,
    );

    // Step 3: Add sample records
    console.log("\n📝 STEP 3: Adding Sample Records");
    console.log("-----------------------------");
    // Get number of records to add from command line, default to 2
    let recordCount = 2;
    const countArgIndex = process.argv.findIndex(
        (arg) => arg === "--count" || arg === "-c",
    );
    if (countArgIndex !== -1 && process.argv.length > countArgIndex + 1) {
        const parsedCount = Number.parseInt(process.argv[countArgIndex + 1], 10);
        if (!Number.isNaN(parsedCount) && parsedCount > 0) {
            recordCount = parsedCount;
        }
    }

    console.log(`Adding ${recordCount} sample records...`);
    const recordsResult = await addSampleRecords(recordCount);
    if (!recordsResult) {
        console.error(
            "❌ Adding sample records failed. Please check the error messages above.",
        );
        process.exit(1);
    }
    console.log(`✅ Successfully added ${recordCount} sample records!\n`);

    // Success!
    console.log("\n🎉 Setup Complete!");
    console.log("===========================================");
    console.log(
        `Evaluation dataset "${config.evaluation.datasetName}" is ready for use.`,
    );
    console.log(`You can now access it at: ${config.argilla.apiUrl}`);
    console.log("===========================================");
}

// Run the setup if executed directly
if (require.main === module) {
    setupEvaluation().catch((error) => {
        console.error("❌ Setup failed with error:", error.message);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = setupEvaluation;
