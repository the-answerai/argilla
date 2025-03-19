#!/usr/bin/env python3
import os
import subprocess
import sys

def main():
    print("Running post-deploy setup for Argilla on Heroku")
    
    # Set the working directory to argilla-server
    os.chdir('argilla-server')
    
    # Run database migrations
    print("Running database migrations...")
    subprocess.check_call([sys.executable, "-m", "alembic", "upgrade", "head"])
    
    # Create default user
    print("Creating default user...")
    subprocess.check_call([sys.executable, "-m", "argilla_server", "database", "users", "create_default"])
    
    print("Post-deploy setup completed successfully")

if __name__ == "__main__":
    main() 