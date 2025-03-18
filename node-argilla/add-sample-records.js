const config = require("./config");
const ArgillaClient = require("./argilla-client");

/**
 * Add sample records to the chat evaluation dataset
 * @param {number} count - Number of sample records to add
 * @returns {Promise<boolean>} Whether the operation was successful
 */
async function addSampleRecords(count = 2) {
    console.log(
        `Adding ${count} sample records to dataset: ${config.evaluation.datasetName}`,
    );
    console.log(`API URL: ${config.argilla.apiUrl}`);
    console.log(
        `API Key: ${config.argilla.apiKey.substring(0, 5)}...${config.argilla.apiKey.substring(config.argilla.apiKey.length - 5)}`,
    );

    try {
        // Create Argilla client
        const client = new ArgillaClient(
            config.argilla.apiUrl,
            config.argilla.apiKey,
            config.argilla.username,
            config.argilla.password,
            config.argilla.workspace,
        );

        // Get the dataset
        const dataset = await client.getDatasetByName(
            config.evaluation.datasetName,
        );
        if (!dataset) {
            console.error(
                `Dataset ${config.evaluation.datasetName} not found. Please create it first.`,
            );
            return false;
        }

        console.log(`Found dataset with ID: ${dataset.id}`);

        // Create sample records
        const sampleRecords = [];

        // Sample 1: Basic question about environment variables
        sampleRecords.push({
            fields: {
                query: "How do I use environment variables in Node.js?",
                response:
                    "In Node.js, you can access environment variables using `process.env`. For example, to access an environment variable named 'PORT', you would use `process.env.PORT`.\n\nFor local development, it's common to use the `dotenv` package to load environment variables from a `.env` file:\n\n1. Install dotenv: `npm install dotenv`\n2. Create a `.env` file in your project root with your variables:\n   ```\n   PORT=3000\n   API_KEY=your_api_key\n   ```\n3. At the top of your main file, add: `require('dotenv').config()`\n\nNow you can access these variables through `process.env.PORT` and `process.env.API_KEY`.",
                system_prompt: "You are a helpful programming assistant.",
                model: "gpt-4-turbo",
            },
            metadata: {
                source: "sample-script",
            },
        });

        // Sample 2: Complex question about API design
        sampleRecords.push({
            fields: {
                query:
                    "What's the best way to design a RESTful API for my e-commerce application?",
                response:
                    '# RESTful API Design for E-commerce\n\nHere\'s a structured approach to designing a RESTful API for your e-commerce application:\n\n## 1. Resource Identification\n\nStart by identifying core resources such as:\n- Products\n- Categories\n- Users/Customers\n- Orders\n- Reviews\n- Cart\n\n## 2. Define URI Structure\n\nFollow these URI patterns:\n\n```\n/products                  # List products\n/products/{id}             # Specific product\n/products/{id}/reviews     # Reviews for a product\n/categories               # List categories\n/categories/{id}          # Specific category\n/categories/{id}/products # Products in a category\n/users                    # List users (admin)\n/users/{id}               # Specific user\n/orders                   # List orders (admin or filtered by user)\n/orders/{id}              # Specific order\n/cart                     # Current user\'s cart\n```\n\n## 3. Use HTTP Methods Properly\n\n- GET: Retrieve resources\n- POST: Create new resources\n- PUT: Update existing resources (complete replacement)\n- PATCH: Partial update of resources\n- DELETE: Remove resources\n\n## 4. Implement Versioning\n\nAdd API versioning in the URI path:\n```\n/api/v1/products\n```\n\n## 5. Use Proper Status Codes\n\n- 200: Success\n- 201: Created\n- 204: No Content (after DELETE)\n- 400: Bad Request\n- 401: Unauthorized\n- 403: Forbidden\n- 404: Not Found\n- 500: Server Error\n\n## 6. Support Filtering, Sorting & Pagination\n\n```\n/products?category=electronics&sort=price&order=asc&page=2&limit=20\n```\n\n## 7. Design Authentication\n\nUse JWT (JSON Web Tokens) or OAuth 2.0 for secure authentication.\n\n## 8. Include HATEOAS Links\n\nProvide navigational information in responses:\n\n```json\n{\n  "id": 123,\n  "name": "Smartphone",\n  "price": 599.99,\n  "_links": {\n    "self": { "href": "/api/v1/products/123" },\n    "reviews": { "href": "/api/v1/products/123/reviews" },\n    "category": { "href": "/api/v1/categories/5" }\n  }\n}\n```\n\n## 9. Implement Rate Limiting\n\nTo prevent abuse, add headers like:\n```\nX-RateLimit-Limit: 100\nX-RateLimit-Remaining: 98\nX-RateLimit-Reset: 1540000000\n```\n\n## 10. Document Your API\n\nUse Swagger/OpenAPI for interactive documentation.\n\n## Example Implementation Tools\n\n- Node.js + Express.js\n- NestJS (more structured for large applications) \n- Swagger for documentation\n- MongoDB or PostgreSQL for database\n- Redis for caching and rate limiting',
                system_prompt:
                    "You are an expert software architect specializing in API design.",
                model: "claude-3-opus-20240229",
            },
            metadata: {
                source: "sample-script",
                difficulty: "advanced",
            },
        });

        // Add more samples if requested
        if (count > 2) {
            for (let i = 3; i <= count; i++) {
                sampleRecords.push({
                    fields: {
                        query: `Sample question ${i}: What are the benefits of using TypeScript?`,
                        response: `Sample answer ${i}: TypeScript offers several benefits over plain JavaScript:\n\n1. **Static Type Checking**: Catch errors during development instead of runtime\n2. **Improved IDE Support**: Better autocomplete, navigation, and refactoring\n3. **Better Documentation**: Types serve as documentation\n4. **Safer Refactoring**: Make large-scale changes with confidence\n5. **Enhanced Readability**: Code intent is clearer with types\n6. **Improved Collaboration**: Easier for teams to understand each other's code\n7. **Gradual Adoption**: Can be introduced incrementally to JavaScript projects`,
                        system_prompt: "You are a helpful coding assistant.",
                        model: "sample-model",
                    },
                    metadata: {
                        source: "sample-script",
                        index: i,
                    },
                });
            }
        }

        // Limit to the requested count
        const recordsToAdd = sampleRecords.slice(0, count);

        // Add the records to the dataset
        console.log(
            `Adding ${recordsToAdd.length} records to dataset ${dataset.id}...`,
        );
        const result = await client.addRecordsToDataset(dataset.id, recordsToAdd);

        if (!result) {
            console.error("❌ Failed to add records to the dataset");
            return false;
        }

        console.log("✅ Successfully added sample records to the dataset!");
        return true;
    } catch (error) {
        console.error("❌ Error adding sample records:", error.message);
        console.error(error.stack);
        return false;
    }
}

// Run the function if this script is executed directly
if (require.main === module) {
    (async () => {
        // Get count from command line arguments, default to 2
        const count =
            process.argv.length >= 3 ? Number.parseInt(process.argv[2], 10) : 2;

        // Validate count
        if (Number.isNaN(count) || count < 1) {
            console.error(
                "Please provide a valid count of records to add (must be a positive integer)",
            );
            process.exit(1);
        }

        console.log(`Adding ${count} sample records...`);
        const result = await addSampleRecords(count);
        process.exit(result ? 0 : 1);
    })();
}

module.exports = addSampleRecords;
