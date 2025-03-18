# Node.js Client for Argilla

A Node.js client for interacting with the [Argilla](https://argilla.io/) API, allowing you to manage datasets, fields, questions, and records from JavaScript applications.

## Installation

Clone this repository and install dependencies:

```bash
git clone <repository-url>
cd node-argilla
npm install
```

## Configuration

Create a `.env` file in the project root directory with the following variables:

```
ARGILLA_API_URL=http://localhost:6900  # URL of your Argilla instance
ARGILLA_API_KEY=your-api-key           # Your Argilla API key
ARGILLA_USERNAME=admin                 # Your Argilla username (for outputs)
ARGILLA_PASSWORD=password123           # Your Argilla password (for outputs)
```

## Quick Start

Run the example script to create a chatbot feedback dataset:

```bash
node index.js
```

This will:
1. Create a new dataset named "chatbot_feedback"
2. Add fields for user queries and bot responses
3. Add questions for rating responses and providing feedback
4. Publish the dataset
5. Add sample records to the dataset

## Working with Docker Deployment

If you're using the Node.js client with an Argilla server running in Docker, follow these steps:

### 1. Start the Argilla Docker Containers

First, ensure your Argilla server is running in Docker:

```bash
# Navigate to the Docker deployment directory
cd examples/deployments/docker

# Start the containers
docker-compose up -d
```

### 2. Configure the Node.js Client

Update your `.env` file to point to the Docker instance:

```
ARGILLA_API_URL=http://localhost:6900
ARGILLA_API_KEY=argilla.apikey  # Default API key, or use a custom one if created
```

If you've created a custom admin user for Argilla, use that API key instead.

### 3. Verify Connection

You can verify the connection to your Docker deployment by running:

```bash
node -e "const { ArgillaClient } = require('./index'); const client = new ArgillaClient(); client.listDatasets().then(console.log).catch(console.error);"
```

### 4. Troubleshooting Docker Connectivity

If you encounter connection issues:

- Ensure the Argilla containers are running: `docker ps`
- Check Argilla logs for errors: `docker logs docker-argilla-1`
- Verify the API port (6900) is exposed and accessible
- Confirm your API key is valid by logging into the Argilla UI

## Usage

### Import the client

```javascript
const { ArgillaClient } = require('./index');

// Initialize the client
const client = new ArgillaClient();
```

### Working with Datasets

```javascript
// List all datasets
const datasets = await client.listDatasets();

// Get a dataset by name
const dataset = await client.getDatasetByName('chatbot_feedback');

// Create a new dataset
const newDataset = await client.createDataset('my_dataset', {
  guidelines: 'Instructions for annotators',
  allow_extra_metadata: true
});

// Delete a dataset
await client.deleteDataset(datasetId);
```

### Adding Fields to a Dataset

```javascript
// Add a text field
await client.addFieldToDataset(datasetId, {
  name: 'text_input',
  title: 'Text Input',
  required: true,
  settings: {
    type: 'text',
    use_markdown: false
  }
});

// Add an image field
await client.addFieldToDataset(datasetId, {
  name: 'image',
  title: 'Image',
  required: true,
  settings: {
    type: 'image'
  }
});
```

### Adding Questions to a Dataset

```javascript
// Add a rating question
await client.addQuestionToDataset(datasetId, {
  name: 'rating',
  title: 'Quality Rating',
  description: 'Rate the quality from 1 to 5',
  required: true,
  settings: {
    type: 'rating',
    options: [1, 2, 3, 4, 5].map(value => ({ value }))
  }
});

// Add a text question
await client.addQuestionToDataset(datasetId, {
  name: 'feedback',
  title: 'Feedback',
  description: 'Provide feedback',
  required: false,
  settings: {
    type: 'text',
    use_markdown: false
  }
});
```

### Publishing a Dataset

```javascript
// Publish a dataset
await client.publishDataset(datasetId);
```

### Adding Records to a Dataset

```javascript
// Add records to a dataset
const records = [
  {
    fields: {
      text_input: 'Sample text',
      image: 'https://example.com/image.jpg'
    },
    metadata: {
      source: 'node_client',
      timestamp: new Date().toISOString()
    }
  }
];

await client.addRecordsToDataset(datasetId, records);
```

## Creating a Chatbot Feedback Dataset

The included `create-chatbot-dataset.js` script demonstrates how to:

1. Define settings for a dataset including fields and questions
2. Create the dataset
3. Add fields for user queries and bot responses
4. Add rating and feedback questions
5. Publish the dataset
6. Add sample chatbot conversations

You can use this as a template for creating your own custom datasets.

## Common Use Cases

### Data Collection for AI Training

Use this client to:
- Create datasets for collecting training data
- Add fields for text, images, or other data types
- Define questions for annotators
- Add records programmatically from your data sources

### Feedback Collection for AI Models

Collect feedback on AI-generated content:
- Create datasets with fields for AI outputs
- Add questions to rate and provide feedback
- Integrate with your Node.js applications
- Analyze feedback to improve your models

## API Reference

### ArgillaClient

The main client class for interacting with the Argilla API.

#### Constructor

```javascript
const client = new ArgillaClient(apiUrl, apiKey);
```

- `apiUrl` (optional): The URL of the Argilla API. Defaults to `process.env.ARGILLA_API_URL`.
- `apiKey` (optional): The API key for authentication. Defaults to `process.env.ARGILLA_API_KEY`.

#### Methods

- `getDefaultWorkspaceId()`: Get the default workspace ID.
- `listDatasets()`: Get a list of all datasets.
- `getDatasetByName(datasetName)`: Get a dataset by its name.
- `getDatasetById(datasetId)`: Get a dataset by its ID.
- `createDataset(name, settings)`: Create a new dataset.
- `publishDataset(datasetId, settings)`: Publish a dataset.
- `isDatasetPublished(datasetId)`: Check if a dataset is published.
- `addFieldToDataset(datasetId, field)`: Add a field to a dataset.
- `addQuestionToDataset(datasetId, question)`: Add a question to a dataset.
- `setupDataset(datasetId, settings)`: Setup a dataset with fields and questions.
- `addRecordsToDataset(datasetId, records)`: Add records to a dataset.
- `deleteDataset(datasetId)`: Delete a dataset.
- `forceRecreateDataset(name, settings)`: Force recreate a dataset by deleting it if it exists and creating a new one.

## Known Limitations

- The Argilla API doesn't allow updating dataset settings after publishing. If you need to modify a published dataset, you'll need to recreate it.
- When working with the Docker deployment, connection timeouts may occur if the containers are still initializing. Wait a few moments and try again.

## License

MIT 