FROM argilla/argilla-server:latest

# Set user to root for installation operations
USER root

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla

# Install dependencies
RUN apt-get update && apt-get install -y curl git unzip

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm --version

# Download and extract node-argilla from GitHub instead of git clone
RUN mkdir -p /node-argilla
WORKDIR /node-argilla
RUN curl -L https://github.com/the-answerai/node-argilla/archive/refs/heads/main.zip -o node-argilla.zip && \
    unzip node-argilla.zip && \
    mv node-argilla-main/* . && \
    mv node-argilla-main/.* . 2>/dev/null || true && \
    rm -rf node-argilla.zip node-argilla-main

# Install node-argilla dependencies
RUN npm install

# Expose the Argilla port
EXPOSE 6900

# Create a startup script
RUN echo '#!/bin/bash\n\
# Start the Argilla server\n\
exec /entrypoint.sh "$@"\n\
' > /start.sh

RUN chmod +x /start.sh

# Use our startup script
ENTRYPOINT ["/start.sh"]
CMD ["uvicorn", "argilla_server.app:app", "--host", "0.0.0.0", "--port", "6900"] 