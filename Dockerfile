FROM argilla/argilla-server:latest

# Set user to root for installation operations
USER root

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla

# Install minimal dependencies
RUN apt-get update && apt-get install -y curl

# Expose the Argilla port
EXPOSE 6900

# Let the original entrypoint and CMD from the base image run
# This will ensure we use exactly the same startup command that works in the official image 