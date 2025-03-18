const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Argilla API Client
 * A client for interacting with the Argilla API
 */
class ArgillaClient {
    /**
     * Create a new Argilla client instance
     * @param {string} apiUrl - The URL of the Argilla API
     * @param {string} apiKey - The API key for authentication
     * @param {string} username - The username for authentication
     * @param {string} password - The password for authentication
     * @param {string} workspace - The workspace for the client
     */
    constructor(apiUrl, apiKey, username, password, workspace) {
        this.apiUrl = apiUrl || process.env.ARGILLA_API_URL;
        this.apiKey = apiKey || process.env.ARGILLA_API_KEY;
        this.username = username || process.env.ARGILLA_USERNAME;
        this.password = password || process.env.ARGILLA_PASSWORD;
        this.workspace = workspace || process.env.ARGILLA_WORKSPACE || 'admin';
        this.workspaceId = null;

        if (!this.apiUrl) {
            throw new Error('ARGILLA_API_URL is required');
        }

        if (!this.apiKey) {
            throw new Error('ARGILLA_API_KEY is required');
        }

        // Create default axios instance with base configuration
        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'X-Argilla-Api-Key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(config => {
            console.log(`Sending ${config.method.toUpperCase()} request to ${config.url}`);
            return config;
        });
    }

    /**
     * Get the default workspace ID
     * @returns {Promise<string|null>} The default workspace ID or null if not found
     */
    async getDefaultWorkspaceId() {
        // If we already loaded a workspace id before, return it
        if (this.workspaceId) {
            return this.workspaceId;
        }

        try {
            const response = await this.client.get('/api/v1/me/workspaces');
            const workspaces = response.data.items || [];

            if (workspaces.length === 0) {
                console.error('No workspaces found for the user');
                return null;
            }

            // Check if we have a specified workspace name to find
            if (typeof this.workspace === 'string') {
                // Find workspace by name
                const matchingWorkspace = workspaces.find(ws => ws.name === this.workspace);
                if (matchingWorkspace) {
                    this.workspaceId = matchingWorkspace.id;
                    this.workspace = matchingWorkspace;
                    console.log(`Found workspace by name: ${matchingWorkspace.name} (${matchingWorkspace.id})`);
                    return this.workspaceId;
                }

                console.warn(`Requested workspace "${this.workspace}" not found. Using first available workspace.`);
            }

            // If the workspace is already an object (set by another method) or we didn't find a matching name
            if (typeof this.workspace === 'object' && this.workspace !== null && this.workspace.id) {
                this.workspaceId = this.workspace.id;
                console.log(`Using workspace: ${this.workspace.name} (${this.workspace.id})`);
                return this.workspaceId;
            }

            // Default to first workspace
            this.workspace = workspaces[0];
            this.workspaceId = this.workspace.id;
            console.log(`Using default workspace: ${this.workspace.name} (${this.workspace.id})`);
            return this.workspaceId;
        } catch (error) {
            this.handleError('Error getting workspaces', error);
            return null;
        }
    }

    /**
     * List datasets in a workspace
     * @returns {Promise<Array>} Array of datasets
     */
    async listDatasets() {
        try {
            // Use direct API call for more consistent behavior
            const response = await this.client.get('/api/v1/me/datasets');
            return response.data.items || [];
        } catch (error) {
            this.handleError('Error listing datasets', error);
            return [];
        }
    }

    /**
     * Get a specific dataset by its name
     * @param {string} datasetName - The name of the dataset to retrieve
     * @returns {Promise<Object|null>} The dataset or null if not found
     */
    async getDatasetByName(datasetName) {
        try {
            const datasets = await this.listDatasets();
            return datasets.find(dataset => dataset.name === datasetName) || null;
        } catch (error) {
            this.handleError(`Error getting dataset ${datasetName}`, error);
            return null;
        }
    }

    /**
     * Get a dataset by its ID
     * @param {string} datasetId - The ID of the dataset to retrieve
     * @returns {Promise<Object|null>} The dataset or null if not found
     */
    async getDatasetById(datasetId) {
        try {
            const response = await this.client.get(`/api/v1/datasets/${datasetId}`);
            return response.data;
        } catch (error) {
            this.handleError(`Error getting dataset with ID ${datasetId}`, error);
            return null;
        }
    }

    /**
     * Create a new dataset
     * @param {string} name - The name of the dataset
     * @param {Object} settings - The dataset settings
     * @returns {Promise<Object|null>} The created dataset or null if creation failed
     */
    async createDataset(name, settings) {
        try {
            const workspaceId = await this.getDefaultWorkspaceId();

            if (!workspaceId) {
                console.error('Cannot create dataset without a workspace');
                return null;
            }

            // Ensure fields are properly defined
            const payload = {
                name,
                workspace_id: workspaceId
            };

            // Include settings if provided
            if (settings) {
                payload.settings = settings;

                // Log the full payload for debugging
                console.log('Creating dataset with payload:', JSON.stringify(payload, null, 2));
            }

            const response = await this.client.post('/api/v1/datasets', payload);

            console.log(`Dataset created with ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            this.handleError(`Error creating dataset ${name}`, error);
            return null;
        }
    }

    /**
     * Update dataset fields
     * @param {string} datasetId - The ID of the dataset to update
     * @param {Object} settings - The dataset settings containing fields
     * @returns {Promise<boolean>} Whether the update was successful
     */
    async updateDatasetFields(datasetId, settings) {
        try {
            console.log(`Updating fields for dataset ${datasetId}...`);

            // Get current dataset to preserve existing settings
            const dataset = await this.getDatasetById(datasetId);
            if (!dataset) {
                console.error(`Dataset ${datasetId} not found`);
                return false;
            }

            // Create update payload with existing + new settings
            const payload = {
                ...dataset,
                settings: settings
            };

            // Remove fields that shouldn't be in the update
            const fieldsToRemove = ['id', 'created_at', 'updated_at', 'last_activity_at'];
            for (const field of fieldsToRemove) {
                if (field in payload) {
                    payload[field] = undefined;
                }
            }

            console.log('Updating dataset with payload:', JSON.stringify(payload, null, 2));

            // Update the dataset
            const response = await this.client.put(`/api/v1/datasets/${datasetId}`, payload);
            console.log(`Dataset ${datasetId} updated successfully`);
            return true;
        } catch (error) {
            this.handleError(`Error updating dataset ${datasetId}`, error);
            return false;
        }
    }

    /**
     * Publish a dataset to make it available for record creation
     * @param {string} datasetId - The ID of the dataset to publish
     * @param {Object} settings - Optional settings to update before publishing
     * @returns {Promise<boolean>} Whether the publish was successful
     */
    async publishDataset(datasetId, settings = null) {
        try {
            // If settings are provided, update the fields first
            if (settings) {
                const updateSuccess = await this.updateDatasetFields(datasetId, settings);
                if (!updateSuccess) {
                    console.error(`Failed to update fields for dataset ${datasetId}`);
                }
            }

            // Attempt to publish
            console.log(`Attempting to publish dataset ${datasetId}...`);
            const response = await this.client.put(`/api/v1/datasets/${datasetId}/publish`);
            console.log(`Dataset ${datasetId} published successfully`);
            return true;
        } catch (error) {
            // Check if it's already published (409 Conflict)
            if (error.response && error.response.status === 409) {
                console.log(`Dataset ${datasetId} is already published`);
                return true;
            }

            this.handleError(`Error publishing dataset ${datasetId}`, error);
            return false;
        }
    }

    /**
     * Check if a dataset is published
     * @param {string} datasetId - The ID of the dataset to check
     * @returns {Promise<boolean>} Whether the dataset is published
     */
    async isDatasetPublished(datasetId) {
        try {
            const dataset = await this.getDatasetById(datasetId);
            if (!dataset) return false;

            return dataset.status === 'ready';
        } catch (error) {
            this.handleError(`Error checking if dataset ${datasetId} is published`, error);
            return false;
        }
    }

    /**
     * Create a dataset if it doesn't exist, or get it if it does
     * @param {string} name - The name of the dataset
     * @param {Object} settings - The dataset settings
     * @returns {Promise<Object|null>} The dataset or null if creation/retrieval failed
     */
    async createOrGetDataset(name, settings) {
        try {
            const existingDataset = await this.getDatasetByName(name);

            if (existingDataset) {
                console.log(`Dataset '${name}' already exists with ID: ${existingDataset.id}`);

                // Check if it's published, if not, publish it with settings
                const isPublished = await this.isDatasetPublished(existingDataset.id);
                if (!isPublished) {
                    await this.publishDataset(existingDataset.id, settings);
                }

                return existingDataset;
            }

            const newDataset = await this.createDataset(name, settings);
            if (newDataset) {
                console.log(`Created dataset '${name}' with ID: ${newDataset.id}`);

                // Publish the dataset with settings
                const success = await this.publishDataset(newDataset.id, settings);
                if (!success) {
                    console.error(`Failed to publish dataset ${newDataset.id}`);
                }
            }
            return newDataset;
        } catch (error) {
            this.handleError(`Error creating or getting dataset ${name}`, error);
            return null;
        }
    }

    /**
     * Add records to a dataset
     * @param {string} datasetId - The ID of the dataset
     * @param {Array} records - The records to add
     * @returns {Promise<Object|null>} The response or null if the addition failed
     */
    async addRecordsToDataset(datasetId, records) {
        try {
            // Check if the dataset is published
            const isPublished = await this.isDatasetPublished(datasetId);
            if (!isPublished) {
                console.log(`Dataset ${datasetId} is not published. Publishing now...`);
                // Get the dataset to retrieve the settings
                const dataset = await this.getDatasetById(datasetId);
                if (!dataset) {
                    console.error(`Could not find dataset with ID ${datasetId}`);
                    return null;
                }

                // Try to publish with the dataset's settings
                const publishSuccess = await this.publishDataset(datasetId, dataset.settings);

                if (!publishSuccess) {
                    console.warn(`Warning: Failed to publish dataset ${datasetId}. Will still try to add records.`);
                }
            }

            // Format the records as expected by the API
            const payload = {
                items: records
            };

            console.log(`Sending ${records.length} records to dataset ${datasetId}...`);

            // Use the bulk endpoints for better performance
            const response = await this.client.post(`/api/v1/datasets/${datasetId}/records/bulk`, payload);

            console.log(`Successfully added ${records.length} records to the dataset`);
            return response.data;
        } catch (error) {
            this.handleError(`Error adding records to dataset ${datasetId}`, error);
            console.log('Payload that caused the error:', JSON.stringify(records, null, 2));
            return null;
        }
    }

    /**
     * Delete a dataset
     * @param {string} datasetId - The ID of the dataset to delete
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    async deleteDataset(datasetId) {
        try {
            await this.client.delete(`/api/v1/datasets/${datasetId}`);
            console.log(`Dataset ${datasetId} deleted successfully`);
            return true;
        } catch (error) {
            this.handleError(`Error deleting dataset ${datasetId}`, error);
            return false;
        }
    }

    /**
     * Add a field to a dataset
     * @param {string} datasetId - The ID of the dataset
     * @param {Object} field - The field to add
     * @returns {Promise<Object|null>} The created field or null if creation failed
     */
    async addFieldToDataset(datasetId, field) {
        try {
            console.log(`Adding field '${field.name}' to dataset ${datasetId}...`);
            const response = await this.client.post(`/api/v1/datasets/${datasetId}/fields`, field);
            console.log(`Field '${field.name}' added successfully to dataset ${datasetId}`);
            return response.data;
        } catch (error) {
            this.handleError(`Error adding field '${field.name}' to dataset ${datasetId}`, error);
            return null;
        }
    }

    /**
     * Add a question to a dataset
     * @param {string} datasetId - The ID of the dataset
     * @param {Object} question - The question to add
     * @returns {Promise<Object|null>} The created question or null if creation failed
     */
    async addQuestionToDataset(datasetId, question) {
        try {
            console.log(`Adding question '${question.name}' to dataset ${datasetId}...`);
            const response = await this.client.post(`/api/v1/datasets/${datasetId}/questions`, question);
            console.log(`Question '${question.name}' added successfully to dataset ${datasetId}`);
            return response.data;
        } catch (error) {
            this.handleError(`Error adding question '${question.name}' to dataset ${datasetId}`, error);
            return null;
        }
    }

    /**
     * Setup dataset with fields and questions
     * @param {string} datasetId - The ID of the dataset
     * @param {Object} settings - The dataset settings containing fields and questions
     * @returns {Promise<boolean>} Whether the setup was successful
     */
    async setupDataset(datasetId, settings) {
        try {
            console.log(`Setting up dataset ${datasetId} with fields and questions...`);

            // Add fields
            if (settings.fields && Array.isArray(settings.fields)) {
                console.log(`Adding ${settings.fields.length} fields to dataset ${datasetId}...`);
                for (const fieldData of settings.fields) {
                    const field = {
                        name: fieldData.name,
                        title: fieldData.title || fieldData.name,
                        required: fieldData.required !== undefined ? fieldData.required : true,
                        settings: {
                            type: fieldData.type || 'text',
                            use_markdown: fieldData.use_markdown !== undefined ? fieldData.use_markdown : false
                        }
                    };

                    const createdField = await this.addFieldToDataset(datasetId, field);
                    if (!createdField) {
                        console.error(`Failed to create field '${field.name}'`);
                    }
                }
            }

            // Add questions
            if (settings.questions && Array.isArray(settings.questions)) {
                console.log(`Adding ${settings.questions.length} questions to dataset ${datasetId}...`);
                for (const questionData of settings.questions) {
                    let questionSettings;

                    if (questionData.type === 'rating') {
                        questionSettings = {
                            type: 'rating',
                            options: (questionData.values || [1, 2, 3, 4, 5]).map(value => ({
                                value
                            }))
                        };
                    } else if (questionData.type === 'text') {
                        questionSettings = {
                            type: 'text',
                            use_markdown: questionData.use_markdown !== undefined ? questionData.use_markdown : false
                        };
                    } else {
                        console.warn(`Unsupported question type: ${questionData.type}. Skipping.`);
                        continue;
                    }

                    const question = {
                        name: questionData.name,
                        title: questionData.title || questionData.name,
                        description: questionData.description || '',
                        required: questionData.required !== undefined ? questionData.required : true,
                        settings: questionSettings
                    };

                    const createdQuestion = await this.addQuestionToDataset(datasetId, question);
                    if (!createdQuestion) {
                        console.error(`Failed to create question '${question.name}'`);
                    }
                }
            }

            console.log(`Dataset ${datasetId} setup completed successfully`);
            return true;
        } catch (error) {
            this.handleError(`Error setting up dataset ${datasetId}`, error);
            return false;
        }
    }

    /**
     * Force recreate a dataset by deleting it if it exists and creating a new one
     * @param {string} name - The name of the dataset
     * @param {Object} settings - The dataset settings
     * @returns {Promise<Object|null>} The created dataset or null if creation failed
     */
    async forceRecreateDataset(name, settings) {
        try {
            // First try to get the dataset
            const existingDataset = await this.getDatasetByName(name);

            // If it exists, delete it
            if (existingDataset) {
                console.log(`Dataset '${name}' exists with ID: ${existingDataset.id}. Deleting it...`);
                const deleteSuccess = await this.deleteDataset(existingDataset.id);

                if (!deleteSuccess) {
                    console.error(`Failed to delete dataset ${existingDataset.id}. Cannot recreate.`);
                    return null;
                }

                console.log(`Dataset '${name}' deleted successfully.`);
            }

            // Create a new dataset with minimal settings (without fields and questions)
            console.log(`Creating new dataset '${name}'...`);
            const datasetCreatePayload = {
                name: name,
                guidelines: settings.guidelines || null,
                allow_extra_metadata: settings.allow_extra_metadata !== undefined ? settings.allow_extra_metadata : true
            };

            const newDataset = await this.createDataset(name, datasetCreatePayload);
            if (!newDataset) {
                console.error(`Failed to create dataset '${name}'`);
                return null;
            }

            console.log(`Created dataset '${name}' with ID: ${newDataset.id}`);

            // Setup the dataset with fields and questions
            const setupSuccess = await this.setupDataset(newDataset.id, settings);
            if (!setupSuccess) {
                console.error(`Failed to setup dataset ${newDataset.id}`);
            }

            // Try to publish the dataset
            const publishSuccess = await this.publishDataset(newDataset.id);
            if (!publishSuccess) {
                console.error(`Failed to publish dataset ${newDataset.id}`);
            }

            return newDataset;
        } catch (error) {
            this.handleError(`Error recreating dataset ${name}`, error);
            return null;
        }
    }

    /**
     * Handle errors from the API
     * @param {string} message - A message describing the error context
     * @param {Error} error - The error object
     */
    handleError(message, error) {
        console.error(message);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }

        if (error.config) {
            console.error('Request URL:', error.config.method.toUpperCase(), error.config.url);
            if (error.config.data) {
                try {
                    console.error('Request Data:', JSON.parse(error.config.data));
                } catch (e) {
                    console.error('Request Data (raw):', error.config.data);
                }
            }
        }
    }
}

module.exports = ArgillaClient; 