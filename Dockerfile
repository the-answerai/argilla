FROM argilla/argilla-server:latest

# Set user to root for installation operations
USER root

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla

# Install minimal dependencies
RUN apt-get update && apt-get install -y curl

# Expose the Argilla port
EXPOSE 6900

# Use the original entrypoint from the base image
CMD ["uvicorn", "argilla_server.app:app", "--host", "0.0.0.0", "--port", "6900"] 