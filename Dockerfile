FROM argilla/argilla-server:latest

# Set user to root for installation operations
USER root

# Set environment variables
ENV ARGILLA_HOME_PATH=/var/lib/argilla

# Install dependencies
RUN apt-get update && apt-get install -y curl git

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
# Start the Argilla server\n\
exec /entrypoint.sh "$@"\n\
' > /start.sh

RUN chmod +x /start.sh

# Use our startup script
ENTRYPOINT ["/start.sh"]
CMD ["uvicorn", "argilla_server.app:app", "--host", "0.0.0.0", "--port", "6900"] 