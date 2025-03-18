const config = require('./config');
const ArgillaClient = require('./argilla-client');

/**
 * Creates a chat evaluation dataset in Argilla.
 * @param {string} datasetName - The name of the dataset to create
 * @param {boolean} forceRecreate - Whether to recreate the dataset if it already exists
 * @returns {Promise<Object|null>} The created dataset or null if creation failed
 */
async function createChatEvaluationDataset(datasetName = null, forceRecreate = false) {
    // Use dataset name from config if not provided
    const evalDatasetName = datasetName || config.evaluation.datasetName;

    console.log(`Creating chat evaluation dataset: ${evalDatasetName}`);
    console.log(`API URL: ${config.argilla.apiUrl}`);
    console.log(`API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`);
    console.log(`Workspace: ${config.argilla.workspace}`);

    // Create an Argilla client
    const client = new ArgillaClient(
        config.argilla.apiUrl,
        config.argilla.apiKey,
        config.argilla.username,
        config.argilla.password,
        config.argilla.workspace
    );

    // Dataset fields and questions
    const fields = [
        {
            name: "query",
            title: "User Query",
            required: true,
            settings: {
                type: "text"
            }
        },
        {
            name: "response",
            title: "Assistant Response",
            required: true,
            settings: {
                type: "text",
                use_markdown: true
            }
        },
        {
            name: "system_prompt",
            title: "System Prompt",
            required: false,
            settings: {
                type: "text"
            }
        },
        {
            name: "model",
            title: "Model",
            required: false,
            settings: {
                type: "text"
            }
        }
    ];

    const questions = [
        {
            name: "helpfulness",
            title: "Helpfulness",
            description: "How helpful is the response in addressing the user's query?",
            required: true,
            settings: {
                type: "rating",
                options: [1, 2, 3, 4, 5].map(value => ({ value }))
            }
        },
        {
            name: "accuracy",
            title: "Accuracy",
            description: "How accurate is the information provided in the response?",
            required: true,
            settings: {
                type: "rating",
                options: [1, 2, 3, 4, 5].map(value => ({ value }))
            }
        },
        {
            name: "clarity",
            title: "Clarity",
            description: "How clear and easy to understand is the response?",
            required: true,
            settings: {
                type: "rating",
                options: [1, 2, 3, 4, 5].map(value => ({ value }))
            }
        },
        {
            name: "feedback",
            title: "Additional Feedback",
            description: "Any other comments or feedback on the response?",
            required: false,
            settings: {
                type: "text"
            }
        }
    ];

    // Basic dataset settings (without fields/questions - we'll add them separately)
    const baseSettings = {
        guidelines: "Evaluate the quality and effectiveness of chat assistant responses to user queries.",
        allow_extra_metadata: true
    };

    try {
        // Check if dataset exists
        const existingDataset = await client.getDatasetByName(evalDatasetName);

        if (existingDataset && !forceRecreate) {
            console.log(`Dataset '${evalDatasetName}' already exists with ID: ${existingDataset.id}`);
            return existingDataset;
        }

        let datasetId;

        // Delete existing dataset if force recreate
        if (forceRecreate && existingDataset) {
            console.log(`Deleting existing dataset '${evalDatasetName}'...`);
            await client.deleteDataset(existingDataset.id);
        }

        // Create a new dataset with basic settings
        console.log(`Creating new dataset '${evalDatasetName}'...`);
        const newDataset = await client.createDataset(evalDatasetName, baseSettings);

        if (!newDataset) {
            console.error(`Failed to create dataset '${evalDatasetName}'`);
            return null;
        }

        console.log(`Dataset created with ID: ${newDataset.id}`);
        datasetId = newDataset.id;

        // Add fields
        console.log(`Adding ${fields.length} fields to dataset...`);
        for (const field of fields) {
            console.log(`Adding field '${field.name}'...`);
            const addedField = await client.addFieldToDataset(datasetId, field);
            if (!addedField) {
                console.error(`Failed to add field '${field.name}'`);
            }
        }

        // Add questions
        console.log(`Adding ${questions.length} questions to dataset...`);
        for (const question of questions) {
            console.log(`Adding question '${question.name}'...`);
            const addedQuestion = await client.addQuestionToDataset(datasetId, question);
            if (!addedQuestion) {
                console.error(`Failed to add question '${question.name}'`);
            }
        }

        // Publish the dataset
        console.log(`Publishing dataset ${datasetId}...`);
        const published = await client.publishDataset(datasetId);
        if (!published) {
            console.error(`Failed to publish dataset ${datasetId}`);
        } else {
            console.log(`Dataset ${datasetId} published successfully!`);
        }

        // Get the latest dataset state
        const finalDataset = await client.getDatasetById(datasetId);
        return finalDataset || newDataset;
    } catch (error) {
        console.error(`Error creating chat evaluation dataset: ${error.message}`);
        console.error(error.stack);
        return null;
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    (async () => {
        // Check if force recreate flag is passed
        const forceRecreate = process.argv.length >= 3 &&
            (process.argv[2] === 'true' || process.argv[2] === '--force');

        console.log(`Force recreate: ${forceRecreate}`);
        const dataset = await createChatEvaluationDataset(null, forceRecreate);
        process.exit(dataset ? 0 : 1);
    })();
}

module.exports = createChatEvaluationDataset; 