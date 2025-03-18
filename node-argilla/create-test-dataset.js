const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const ArgillaClient = require('./argilla-client');
const createChatEvaluationDataset = require('./create-evaluation-dataset');
const { transformChatToArgillaRecords } = require('./transform-chat-data');

/**
 * Generate synthetic test data for chat evaluation
 * @returns {Array} Array of synthetic chat messages
 */
function generateTestData() {
    return [
        // Example 1: High quality response with good tool usage
        {
            "chatId": "test-chat-001",
            "role": "apiMessage",
            "content": "To install Node.js on macOS, you can use Homebrew with the command `brew install node`. Alternatively, you can download the installer from the official Node.js website (https://nodejs.org/). I recommend using the LTS version for better stability.",
            "createdDate": "2024-09-01T10:15:22Z",
            "sessionId": "test-session-001",
            "agentReasoning": [
                {
                    "agentName": "NodeInstallAgent",
                    "messages": [
                        "User asked about Node.js installation on macOS. I'll provide multiple methods with their pros and cons."
                    ],
                    "state": {
                        "currentOS": "macOS"
                    }
                }
            ],
            "usedTools": [
                {
                    "tool": "documentSearch",
                    "toolInput": {
                        "query": "node.js installation macOS"
                    },
                    "toolOutput": "Multiple methods available: Homebrew (brew install node), Official website installer, NVM for version management."
                }
            ],
            "sourceDocuments": [
                {
                    "metadata": {
                        "source": "Node.js Documentation",
                        "date": "2024-05-15"
                    },
                    "pageContent": "Installing Node.js on macOS: You can use package managers like Homebrew (brew install node) or download directly from nodejs.org."
                }
            ]
        },

        // Example 2: Medium quality response with basic tool usage
        {
            "chatId": "test-chat-002",
            "role": "apiMessage",
            "content": "React hooks were introduced in React 16.8. The most commonly used hooks are useState and useEffect.",
            "createdDate": "2024-09-02T14:30:00Z",
            "sessionId": "test-session-002",
            "agentReasoning": [
                {
                    "agentName": "ReactAgent",
                    "messages": [
                        "User is asking about React hooks, will provide basic information."
                    ],
                    "state": {}
                }
            ],
            "usedTools": [
                {
                    "tool": "webSearch",
                    "toolInput": {
                        "query": "when were React hooks introduced"
                    },
                    "toolOutput": "React hooks were introduced in React 16.8 which was released in February 2019."
                }
            ],
            "sourceDocuments": []
        },

        // Example 3: Low quality response with poor tool usage
        {
            "chatId": "test-chat-003",
            "role": "apiMessage",
            "content": "Python is a programming language.",
            "createdDate": "2024-09-03T09:45:10Z",
            "sessionId": "test-session-003",
            "agentReasoning": [
                {
                    "agentName": "PythonAgent",
                    "messages": [
                        "User asked about Python. Giving brief response."
                    ],
                    "state": {}
                }
            ],
            "usedTools": [],
            "sourceDocuments": []
        },

        // Example 4: High quality response with comprehensive reasoning
        {
            "chatId": "test-chat-004",
            "role": "apiMessage",
            "content": "To optimize your Docker container size, you can:\n\n1. Use multi-stage builds to separate build and runtime dependencies\n2. Choose smaller base images like Alpine Linux\n3. Combine RUN commands with && to reduce layers\n4. Remove unnecessary files in the same layer they're created\n5. Use .dockerignore to exclude irrelevant files\n\nHere's an example of a multi-stage build:\n\n```dockerfile\n# Build stage\nFROM node:14 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM nginx:alpine\nCOPY --from=build /app/build /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]\n```\n\nThis approach can reduce your image size significantly.",
            "createdDate": "2024-09-04T16:20:30Z",
            "sessionId": "test-session-004",
            "agentReasoning": [
                {
                    "agentName": "DockerAgent",
                    "messages": [
                        "User is asking about Docker image optimization. Will provide comprehensive best practices with examples.",
                        "Multi-stage builds are important to mention for significant size reduction."
                    ],
                    "state": {
                        "topic": "docker-optimization",
                        "expertise_level": "intermediate"
                    }
                }
            ],
            "usedTools": [
                {
                    "tool": "documentSearch",
                    "toolInput": {
                        "query": "docker container size optimization best practices"
                    },
                    "toolOutput": "Found multiple strategies: multi-stage builds, Alpine images, layer optimization, cleanup in same layer, .dockerignore usage."
                },
                {
                    "tool": "codeGenerator",
                    "toolInput": {
                        "language": "dockerfile",
                        "task": "multi-stage build example for node app"
                    },
                    "toolOutput": "# Build stage\nFROM node:14 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM nginx:alpine\nCOPY --from=build /app/build /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]"
                }
            ],
            "sourceDocuments": [
                {
                    "metadata": {
                        "source": "Docker Documentation",
                        "section": "Best Practices"
                    },
                    "pageContent": "Multi-stage builds are a powerful way to create smaller Docker images. By using multiple FROM statements, you can selectively copy artifacts from one stage to another, leaving behind everything you don't need in the final image."
                },
                {
                    "metadata": {
                        "source": "Docker Blog",
                        "author": "Docker Team"
                    },
                    "pageContent": "Alpine Linux is a minimal Docker image based on Alpine Linux with a complete package index and only 5 MB in size!"
                }
            ]
        },

        // Example 5: Medium quality with some useful information but incomplete
        {
            "chatId": "test-chat-005",
            "role": "apiMessage",
            "content": "GraphQL is a query language for APIs developed by Facebook. It allows clients to request exactly the data they need, making it more efficient than REST in many cases. It uses a single endpoint instead of multiple endpoints like REST.",
            "createdDate": "2024-09-05T11:10:45Z",
            "sessionId": "test-session-005",
            "agentReasoning": [
                {
                    "agentName": "APIAgent",
                    "messages": [
                        "User asked about GraphQL vs REST. Will explain key differences."
                    ],
                    "state": {}
                }
            ],
            "usedTools": [
                {
                    "tool": "webSearch",
                    "toolInput": {
                        "query": "GraphQL vs REST main differences"
                    },
                    "toolOutput": "GraphQL: single endpoint, client specifies data shape, less overfetching. REST: multiple endpoints, fixed data structure, potential over/underfetching."
                }
            ],
            "sourceDocuments": [
                {
                    "metadata": {
                        "source": "GraphQL Documentation"
                    },
                    "pageContent": "GraphQL is a query language for your API, and a server-side runtime for executing queries by using a type system you define for your data."
                }
            ]
        }
    ];
}

/**
 * Main function to create test dataset and load synthetic data
 */
async function main() {
    try {
        console.log("Starting test dataset creation...");

        // Create the evaluation dataset
        const dataset = await createChatEvaluationDataset();
        if (!dataset) {
            console.error("Failed to create or get the evaluation dataset. Exiting.");
            process.exit(1);
        }

        console.log(`Successfully created dataset: ${dataset.name} (ID: ${dataset.id})`);

        // Generate test data
        console.log("Generating synthetic test data...");
        const testData = generateTestData();
        console.log(`Generated ${testData.length} test examples`);

        // Transform data to Argilla records
        console.log("Transforming test data to Argilla records...");
        const argillaRecords = transformChatToArgillaRecords(testData);

        // Add records to the dataset
        if (argillaRecords.length > 0) {
            console.log(`Adding ${argillaRecords.length} test records to dataset ${dataset.name}...`);

            const client = new ArgillaClient(
                config.argilla.apiUrl,
                config.argilla.apiKey,
                config.argilla.username,
                config.argilla.password,
                config.argilla.workspace
            );
            const result = await client.addRecordsToDataset(dataset.id, argillaRecords);

            if (result) {
                console.log(`Successfully added ${argillaRecords.length} test records to dataset ${dataset.name}`);
                console.log("\nYou can now view and evaluate these test records in the Argilla UI.");
                console.log(`Make sure your Argilla server is running and go to: ${process.env.ARGILLA_API_URL || 'http://localhost:6900'}`);
            } else {
                console.error(`Failed to add records to dataset ${dataset.name}`);
            }
        } else {
            console.warn("No records to add to the dataset");
        }

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