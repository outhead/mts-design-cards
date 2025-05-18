#!/bin/bash

# Simple script for deployment to Cloudflare Pages
# Author: egoro
# Run: ./go-deploy.sh

# Make this script executable if it's not already
if [ ! -x "$0" ]; then
    chmod +x "$0"
fi

# Check if the deployment script exists
if [ -f "./cloudflare-deploy.sh" ]; then
    # Make it executable if it's not already
    if [ ! -x "./cloudflare-deploy.sh" ]; then
        chmod +x "./cloudflare-deploy.sh"
    fi
    
    # Run the deployment script
    ./cloudflare-deploy.sh
else
    echo "Error: File cloudflare-deploy.sh not found!"
    exit 1
fi 