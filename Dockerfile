FROM argilla/argilla-server:latest

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla
ENV ARGILLA_ELASTICSEARCH=http://elasticsearch:9200
ENV ARGILLA_DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/argilla
ENV ARGILLA_REDIS_URL=redis://redis:6379/0

# Copy the node-argilla package
COPY ./node-argilla /node-argilla

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm --version

# Install node-argilla dependencies
WORKDIR /node-argilla
RUN npm install

# Expose the Argilla port
EXPOSE 6900

# The entrypoint is inherited from the base image
# This will start the Argilla server by default 