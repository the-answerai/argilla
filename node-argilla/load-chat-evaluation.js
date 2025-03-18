const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const ArgillaClient = require('./argilla-client');
const createChatEvaluationDataset = require('./create-evaluation-dataset');
const { transformChatToArgillaRecords } = require('./transform-chat-data');

/**
 * Load chat data from a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Array} - Array of chat message objects
 */
function loadChatData(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error loading chat data from ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Main function to create the evaluation dataset and load chat data
 */
async function main() {
    try {
        console.log("Starting chat evaluation dataset creation and data loading process...");

        // Create the evaluation dataset
        const dataset = await createChatEvaluationDataset();
        if (!dataset) {
            console.error("Failed to create or get the evaluation dataset. Exiting.");
            process.exit(1);
        }

        console.log(`Successfully created/got dataset: ${dataset.name} (ID: ${dataset.id})`);

        // Load chat data from JSON file
        const chatDataFile = path.join(__dirname, 'examples', 'answerai-chat-example.json');
        console.log(`Loading chat data from ${chatDataFile}...`);

        const chatData = loadChatData(chatDataFile);
        if (!chatData || chatData.length === 0) {
            console.error("No chat data found or data is empty. Exiting.");
            process.exit(1);
        }

        console.log(`Loaded ${chatData.length} chat messages`);

        // Transform chat data to Argilla records
        console.log("Transforming chat data to Argilla records...");
        const argillaRecords = transformChatToArgillaRecords(chatData);

        console.log(`Transformed ${argillaRecords.length} records`);

        // Add records to the dataset
        if (argillaRecords.length > 0) {
            console.log(`Adding ${argillaRecords.length} records to dataset ${dataset.name}...`);

            const client = new ArgillaClient(
                config.argilla.apiUrl,
                config.argilla.apiKey,
                config.argilla.username,
                config.argilla.password,
                config.argilla.workspace
            );
            const result = await client.addRecordsToDataset(dataset.id, argillaRecords);

            if (result) {
                console.log(`Successfully added ${argillaRecords.length} records to dataset ${dataset.name}`);
                console.log("\nYou can now view and evaluate these records in the Argilla UI.");
                console.log(`Make sure your Argilla server is running and go to: ${config.argilla.apiUrl}`);
            } else {
                console.error(`Failed to add records to dataset ${dataset.name}`);
            }
        } else {
            console.warn("No records to add to the dataset");
        }

        console.log("Process completed successfully!");

    } catch (error) {
        console.error("Error in main process:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the main function if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = main; 