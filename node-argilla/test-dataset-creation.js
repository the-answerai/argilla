const config = require('./config');
const ArgillaClient = require('./argilla-client');

async function testDatasetCreation() {
    console.log('Testing dataset creation...');
    console.log(`API URL: ${config.argilla.apiUrl}`);
    console.log(`API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`);
    console.log(`Workspace: ${config.argilla.workspace}`);
    console.log(`Test Dataset Name: ${config.evaluation.datasetName}-test`);

    try {
        // Create client
        const client = new ArgillaClient(
            config.argilla.apiUrl,
            config.argilla.apiKey,
            config.argilla.username,
            config.argilla.password,
            config.argilla.workspace
        );

        // Create a test dataset
        const testDatasetName = `${config.evaluation.datasetName}-test`;

        // Define test dataset settings based on our evaluation schema
        const datasetSettings = {
            guidelines: "Test dataset for evaluation",
            allow_extra_metadata: true,
            fields: [
                {
                    name: "query",
                    title: "User Query",
                    required: true,
                    type: "text"
                },
                {
                    name: "response",
                    title: "Assistant Response",
                    required: true,
                    type: "text",
                    use_markdown: true
                },
                {
                    name: "system_prompt",
                    title: "System Prompt",
                    required: false,
                    type: "text"
                },
                {
                    name: "model",
                    title: "Model",
                    required: false,
                    type: "text"
                }
            ],
            questions: [
                {
                    name: "helpfulness",
                    title: "Helpfulness",
                    description: "How helpful is the response in addressing the user's query?",
                    required: true,
                    type: "rating",
                    values: [1, 2, 3, 4, 5]
                },
                {
                    name: "accuracy",
                    title: "Accuracy",
                    description: "How accurate is the information provided in the response?",
                    required: true,
                    type: "rating",
                    values: [1, 2, 3, 4, 5]
                },
                {
                    name: "clarity",
                    title: "Clarity",
                    description: "How clear and easy to understand is the response?",
                    required: true,
                    type: "rating",
                    values: [1, 2, 3, 4, 5]
                },
                {
                    name: "feedback",
                    title: "Additional Feedback",
                    description: "Any other comments or feedback on the response?",
                    required: false,
                    type: "text"
                }
            ]
        };

        console.log(`Creating test dataset: ${testDatasetName}`);
        const dataset = await client.forceRecreateDataset(testDatasetName, datasetSettings);

        if (!dataset) {
            console.error('❌ Dataset creation failed');
            return false;
        }

        console.log('✅ Dataset creation successful!');
        console.log(`Dataset ID: ${dataset.id}`);
        console.log(`Dataset name: ${dataset.name}`);

        // Add a sample record
        const sampleRecord = {
            fields: {
                query: "How do I configure environment variables in Node.js?",
                response: "You can configure environment variables in Node.js using the `dotenv` package. First, install it with `npm install dotenv`, then create a `.env` file in your project root, and finally add `require('dotenv').config()` at the top of your main file.",
                system_prompt: "You are a helpful assistant.",
                model: "test-model"
            },
            metadata: {
                source: "test-script"
            }
        };

        console.log('Adding a sample record to the dataset...');
        const result = await client.addRecordsToDataset(dataset.id, [sampleRecord]);

        if (!result) {
            console.error('❌ Failed to add sample record');
            return false;
        }

        console.log('✅ Sample record added successfully!');
        return true;
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    (async () => {
        const result = await testDatasetCreation();
        process.exit(result ? 0 : 1);
    })();
}

module.exports = testDatasetCreation; 