# Argilla Deployment Guide

This guide provides step-by-step instructions for deploying Argilla to a server using Docker.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git installed to clone the repository

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/argilla-io/argilla.git
cd argilla
```

### 2. Start Argilla with Docker Compose

Navigate to the Docker deployment directory:

```bash
cd examples/deployments/docker
```

Start the services:

```bash
docker-compose up -d
```

This will start the following containers:

- `docker-argilla-1`: The main Argilla application server
- `docker-worker-1`: Background worker for processing tasks
- `docker-postgres-1`: PostgreSQL database for storing application data
- `docker-elasticsearch-1`: Elasticsearch for search functionality
- `docker-redis-1`: Redis for caching and task queues

### 3. Verify the Deployment

Check if all containers are running:

```bash
docker ps
```

You should see all the containers listed above with "Up" status.

### 4. Check Logs for Any Issues

```bash
docker logs docker-argilla-1
```

### 5. User Authentication

#### Default Credentials

Argilla creates a default user:

- Username: `argilla`
- Password: `1234`
- API Key: `argilla.apikey`

#### Create a New Admin User (Recommended)

If the default credentials don't work or for security purposes, create a new admin user:

```bash
docker exec -it docker-argilla-1 python3 -m argilla_server database users create \
  --first-name Admin \
  --username admin \
  --password password123 \
  --role admin \
  --workspace default
```

This will create a new admin user and display the generated API key which you should save for programmatic access.

### 6. Access the Web Interface

Open your browser and navigate to:

```
http://your-server-ip:6900
```

If deploying locally, use:

```
http://localhost:6900
```

### 7. Test the Connection

After logging in with your credentials, you can verify that everything is working correctly by:

1. Creating a new dataset
2. Adding some records
3. Performing basic operations in the UI

### 8. Programmatic Access

#### Python Client

To connect to Argilla from Python:

```python
import argilla as rg

client = rg.Argilla(
    api_url="http://your-server-ip:6900",
    api_key="your-api-key"  # Use the API key generated when creating the user
)

# Test connection
datasets = client.get_datasets()
print(datasets)
```

#### Node.js Client

You can also interact with Argilla using our Node.js client:

1. First, clone the node-argilla repository:

```bash
git clone https://github.com/argilla-io/node-argilla.git
cd node-argilla
npm install
```

2. Create a `.env` file with your Argilla credentials:

```
ARGILLA_API_URL=http://localhost:6900  # Your Argilla server URL
ARGILLA_API_KEY=your-api-key           # Your API key from step 5
ARGILLA_USERNAME=admin                 # Your username for output messages
ARGILLA_PASSWORD=password123           # Your password for output messages
```

3. Use the client in your Node.js code:

```javascript
const { ArgillaClient } = require('./index');

// Initialize the client
const client = new ArgillaClient();

// List datasets
async function listDatasets() {
    const datasets = await client.listDatasets();
    console.log('Available datasets:', datasets);
}

// Create a chatbot feedback dataset with example data
async function createDemoDataset() {
    const { createChatbotFeedbackDataset } = require('./index');
    const dataset = await createChatbotFeedbackDataset();
    if (dataset) {
        console.log(`Dataset created with ID: ${dataset.id}`);
    }
}

// Run the example
listDatasets().catch(console.error);
```

4. Or run the included example script:

```bash
node index.js
```

## Troubleshooting

### Authentication Issues

If you're having trouble logging in with the default credentials:

1. Check if the server is properly initialized:

   ```bash
   docker logs docker-argilla-1
   ```

2. Create a new admin user as described above.

3. Verify the default credentials directly from the container:

   ```bash
   docker exec -it docker-argilla-1 python3 -c "from argilla_server.constants import DEFAULT_USERNAME, DEFAULT_PASSWORD, DEFAULT_API_KEY; print(f'Default username: {DEFAULT_USERNAME}\nDefault password: {DEFAULT_PASSWORD}\nDefault API key: {DEFAULT_API_KEY}')"
   ```

### Container Issues

If containers aren't starting properly:

1. Check for port conflicts:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. Increase resource limits if containers are crashing due to memory constraints.

3. Check the logs of each container for specific errors:

   ```bash
   docker logs docker-elasticsearch-1
   docker logs docker-postgres-1
   docker logs docker-redis-1
   ```

## Maintenance

### Backup

It's recommended to regularly backup your PostgreSQL database:

```bash
docker exec -t docker-postgres-1 pg_dumpall -c -U postgres > dump_$(date +%Y-%m-%d_%H_%M_%S).sql
```

### Updates

To update Argilla:

1. Pull the latest changes:

   ```bash
   git pull
   ```

2. Rebuild and restart the containers:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Security Considerations

For production environments:

1. Change the default passwords
2. Use HTTPS with a proper certificate
3. Configure proper network security rules
4. Set up proper backups
5. Consider using authentication providers like OAuth or SAML
