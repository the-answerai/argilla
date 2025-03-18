FROM argilla/argilla-server:latest

# Set user to root for installation operations
USER root

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla
ENV ARGILLA_SEARCH_ENGINE=database
ENV ARGILLA_DATABASE_URL=sqlite:////var/lib/argilla/argilla.db
ENV ARGILLA_DISABLE_TELEMETRY=1

# Install minimal dependencies
RUN apt-get update && apt-get install -y curl

# Create necessary directories with proper permissions
RUN mkdir -p /var/lib/argilla && chmod -R 777 /var/lib/argilla

# Expose the Argilla port
EXPOSE 6900

# Let the original entrypoint and CMD from the base image run
# This will ensure we use exactly the same startup command that works in the official image 