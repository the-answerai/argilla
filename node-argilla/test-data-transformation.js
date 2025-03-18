const config = require('./config');
const { transformChatToArgillaRecords } = require('./transform-chat-data');

function testDataTransformation() {
    console.log("Testing chat data transformation functionality...");

    try {
        // Create a minimal test chat message
        const testChatMessage = {
            chatId: "test-chat-id",
            role: "apiMessage",
            content: "This is a test response",
            createdDate: "2024-09-10T12:00:00Z",
            sessionId: "test-session-id",
            agentReasoning: [
                {
                    agentName: "TestAgent",
                    messages: ["This is a test reasoning message"],
                    state: { test: "value" }
                }
            ],
            usedTools: [
                {
                    tool: "testTool",
                    toolInput: { query: "test query" },
                    toolOutput: "test output"
                }
            ],
            sourceDocuments: [
                {
                    metadata: { source: "Test Source" },
                    pageContent: "This is test page content"
                }
            ]
        };

        console.log("\nStep 1: Testing with a valid chat message...");
        const argillaRecords = transformChatToArgillaRecords([testChatMessage]);

        if (!argillaRecords || !Array.isArray(argillaRecords) || argillaRecords.length !== 1) {
            console.error("❌ Failed to transform chat message or unexpected output");
            console.error("Transformation output:", JSON.stringify(argillaRecords, null, 2));
            return false;
        }

        console.log("✅ Successfully transformed chat message");

        // Verify the record structure
        const record = argillaRecords[0];
        const expectedFields = ["user_query", "ai_response", "agent_reasoning", "used_tools", "source_documents"];
        const expectedMetadata = ["chat_id", "created_date", "session_id"];

        console.log("\nStep 2: Verifying transformed record structure...");

        // Check fields
        if (!record.fields) {
            console.error("❌ Missing fields in transformed record");
            return false;
        }

        const missingFields = expectedFields.filter(f => record.fields[f] === undefined);
        if (missingFields.length > 0) {
            console.error(`❌ Missing expected fields in transformed record: ${missingFields.join(', ')}`);
            return false;
        }

        console.log("✅ All expected fields are present");

        // Check metadata
        if (!record.metadata) {
            console.error("❌ Missing metadata in transformed record");
            return false;
        }

        const missingMetadata = expectedMetadata.filter(m => record.metadata[m] === undefined);
        if (missingMetadata.length > 0) {
            console.error(`❌ Missing expected metadata in transformed record: ${missingMetadata.join(', ')}`);
            return false;
        }

        console.log("✅ All expected metadata is present");

        // Step 3: Test with invalid input
        console.log("\nStep 3: Testing with invalid input...");

        // Test with null
        const nullResult = transformChatToArgillaRecords(null);
        if (!Array.isArray(nullResult) || nullResult.length !== 0) {
            console.error("❌ Unexpected result when transforming null");
            return false;
        }

        // Test with empty array
        const emptyResult = transformChatToArgillaRecords([]);
        if (!Array.isArray(emptyResult) || emptyResult.length !== 0) {
            console.error("❌ Unexpected result when transforming empty array");
            return false;
        }

        console.log("✅ Correctly handles invalid input");

        console.log("\n✅ Data transformation test completed successfully!");
        return true;

    } catch (error) {
        console.error("\n❌ Data transformation test failed with error:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        return false;
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    const result = testDataTransformation();
    process.exit(result ? 0 : 1);
}

module.exports = testDataTransformation; 