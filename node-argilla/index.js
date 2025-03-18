const ArgillaClient = require('./argilla-client');
const createChatbotFeedbackDataset = require('./create-chatbot-dataset');

/**
 * Main entry point for the node-argilla package
 * This script can be run directly to create and publish a chatbot feedback dataset
 */
async function main() {
    try {
        console.log('==================================================');
        console.log('Argilla Node.js Client - Chatbot Dataset Creator');
        console.log('==================================================');
        console.log('Environment:');
        console.log(`- API URL: ${process.env.ARGILLA_API_URL}`);
        console.log(`- Username: ${process.env.ARGILLA_USERNAME}`);
        console.log('Starting setup of chatbot feedback dataset in Argilla...');

        const dataset = await createChatbotFeedbackDataset();

        if (dataset) {
            console.log('\n✅ Dataset created successfully!');
            console.log('Dataset details:');
            console.log(`- Name: ${dataset.name}`);
            console.log(`- ID: ${dataset.id}`);
            console.log(`- Status: ${dataset.status}`);
            console.log(`- Workspace: ${dataset.workspace_id}`);

            if (dataset.status === 'ready') {
                console.log('\n✅ Dataset is published and ready for annotation!');
                console.log('\nYou can now access your dataset:');
                console.log(`Visit ${process.env.ARGILLA_API_URL} to start rating and providing feedback on the chatbot responses.`);
                console.log('Use the following credentials to log in:');
                console.log(`Username: ${process.env.ARGILLA_USERNAME}`);
                console.log(`Password: ${process.env.ARGILLA_PASSWORD}`);
                console.log('\nOnce logged in, navigate to the Datasets section to find your chatbot_feedback dataset.');
            } else {
                console.log('\n⚠️ Dataset was created but is not in "ready" status.');
                console.log('You may need to publish it manually in the Argilla UI before adding records.');
                console.log(`\nVisit ${process.env.ARGILLA_API_URL} and log in with:`);
                console.log(`Username: ${process.env.ARGILLA_USERNAME}`);
                console.log(`Password: ${process.env.ARGILLA_PASSWORD}`);
            }
        } else {
            console.error('\n❌ Failed to create or setup the dataset.');
            console.error('Please check the error messages above for details.');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ An error occurred during execution:');
        console.error(error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Export the client class and utility functions
module.exports = {
    ArgillaClient,
    createChatbotFeedbackDataset,
    // Add a way to run the script directly
    run: main
};

// If this file is being run directly, create the dataset
if (require.main === module) {
    main().catch(err => {
        console.error('Error in main execution:', err);
        process.exit(1);
    });
} 