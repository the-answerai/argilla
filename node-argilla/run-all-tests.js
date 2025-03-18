const testConnection = require('./test-connection');
const testDatasetCreation = require('./test-dataset-creation');
const testDataTransformation = require('./test-data-transformation');
const config = require('./config');

async function runAllTests() {
    console.log("=========================================");
    console.log("RUNNING ALL CHAT EVALUATION SYSTEM TESTS");
    console.log("=========================================\n");

    // Test 1: Connection to Argilla API
    console.log("TEST 1: Connection to Argilla API");
    console.log("=========================================");
    const connectionTestResult = await testConnection();

    if (!connectionTestResult) {
        console.error("\n❌ Connection test failed. Cannot continue with other tests.");
        process.exit(1);
    }

    console.log("\n✅ Connection test passed.");
    console.log("\n=========================================");

    // Test 2: Dataset creation
    console.log("TEST 2: Dataset Creation");
    console.log("=========================================");
    const datasetTestResult = await testDatasetCreation();

    if (!datasetTestResult) {
        console.error("\n❌ Dataset creation test failed.");
        process.exit(1);
    }

    console.log("\n✅ Dataset creation test passed.");
    console.log("\n=========================================");

    // Test 3: Data transformation
    console.log("TEST 3: Data Transformation");
    console.log("=========================================");
    const transformationTestResult = testDataTransformation();

    if (!transformationTestResult) {
        console.error("\n❌ Data transformation test failed.");
        process.exit(1);
    }

    console.log("\n✅ Data transformation test passed.");
    console.log("\n=========================================");

    // All tests passed
    console.log("\n🎉 ALL TESTS PASSED! The chat evaluation system is ready to use.");
    console.log("\nYou can now run:");
    console.log("  - node create-test-dataset.js (to create a test dataset with synthetic data)");
    console.log("  - node load-chat-evaluation.js (to load your own chat data)");
    console.log("\nAfter that, access the Argilla UI to start evaluation:");
    console.log(`  ${config.argilla.apiUrl}\n`);

    process.exit(0);
}

// Run all tests
runAllTests(); 