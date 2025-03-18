const config = require('./config');
const ArgillaClient = require('./argilla-client');

async function testConnection() {
    console.log("Testing connection to Argilla API...");
    console.log(`API URL: ${config.argilla.apiUrl}`);
    console.log(`API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`);
    console.log(`Username: ${config.argilla.username}`);
    console.log(`Workspace: ${config.argilla.workspace}`);

    try {
        // Create client with explicit parameters
        console.log("\nCreating Argilla client...");
        const client = new ArgillaClient(
            config.argilla.apiUrl,
            config.argilla.apiKey,
            config.argilla.username,
            config.argilla.password,
            config.argilla.workspace
        );

        // Try a direct API call to check auth and get workspaces
        console.log("\nSending direct API request to /api/v1/me/workspaces...");
        let workspaceResponse;
        try {
            workspaceResponse = await client.client.get('/api/v1/me/workspaces');
            console.log("✅ Direct API call successful!");
            console.log("Response status:", workspaceResponse.status);

            const workspaces = workspaceResponse.data.items || [];
            if (workspaces.length > 0) {
                console.log("✅ Workspaces found:");
                console.log(JSON.stringify(workspaces, null, 2));

                // Set workspace ID for subsequent operations
                const defaultWorkspace = workspaces[0];
                client.workspace = defaultWorkspace;
                console.log(`Using workspace: ${defaultWorkspace.name} (${defaultWorkspace.id})`);
            } else {
                console.error("❌ No workspaces available.");
                return false;
            }
        } catch (apiError) {
            console.error("❌ Direct API call failed!");
            if (apiError.response) {
                console.error("Status:", apiError.response.status);
                console.error("Data:", JSON.stringify(apiError.response.data, null, 2));
            } else if (apiError.request) {
                console.error("No response received. Request was sent but no response.");
            } else {
                console.error("Error setting up request:", apiError.message);
            }
            throw new Error("Direct API call failed");
        }

        // Test listing datasets
        console.log("\nTesting dataset access...");
        try {
            const datasetsResponse = await client.client.get('/api/v1/me/datasets');
            console.log("✅ Successfully retrieved datasets");

            const datasets = datasetsResponse.data.items || [];
            if (datasets.length > 0) {
                console.log(`Available datasets: ${datasets.map(ds => ds.name).join(', ')}`);
            } else {
                console.log("No datasets available in this workspace (this is not an error)");
            }
        } catch (error) {
            console.error("❌ Failed to retrieve datasets");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", JSON.stringify(error.response.data, null, 2));
            }
            return false;
        }

        console.log("\n✅ All connection tests passed successfully!");
        return true;
    } catch (error) {
        console.error("\n❌ Connection test failed with error:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
        return false;
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    (async () => {
        const result = await testConnection();
        process.exit(result ? 0 : 1);
    })();
}

module.exports = testConnection; 