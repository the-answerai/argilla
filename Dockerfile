FROM argilla/argilla-server:latest

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla
ENV ARGILLA_ELASTICSEARCH=http://elasticsearch:9200
ENV ARGILLA_DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/argilla
ENV ARGILLA_REDIS_URL=redis://redis:6379/0

# Install dependencies
RUN apt-get update && apt-get install -y curl gnupg git

# For Render deployment, we'll use OpenSearch instead of Elasticsearch
# Install OpenSearch
RUN curl -fsSL https://artifacts.opensearch.org/publickeys/opensearch.pgp | apt-key add -
RUN echo "deb https://artifacts.opensearch.org/releases/bundle/opensearch/2.x/apt stable main" | tee -a /etc/apt/sources.list.d/opensearch-2.x.list
RUN apt-get update && apt-get install -y opensearch

# Configure OpenSearch 
ENV ARGILLA_SEARCH_ENGINE=opensearch
ENV ARGILLA_OPENSEARCH=http://localhost:9200

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm --version

# Clone node-argilla from GitHub instead of copying
RUN git clone https://github.com/the-answerai/node-argilla.git /node-argilla

# Install node-argilla dependencies
WORKDIR /node-argilla
RUN npm install

# Expose the Argilla port
EXPOSE 6900

# Create a startup script
RUN echo '#!/bin/bash\n\
# Start OpenSearch in the background\n\
service opensearch start\n\
\n\
# Wait for OpenSearch to become available\n\
until curl -s http://localhost:9200 > /dev/null; do\n\
    echo "Waiting for OpenSearch..."\n\
    sleep 5\n\
done\n\
\n\
# Start the Argilla server\n\
exec /entrypoint.sh "$@"\n\
' > /start.sh

RUN chmod +x /start.sh

# Use our startup script
ENTRYPOINT ["/start.sh"]
CMD ["uvicorn", "argilla_server.app:app", "--host", "0.0.0.0", "--port", "6900"] 