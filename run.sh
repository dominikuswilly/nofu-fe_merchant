#!/bin/bash

# Script to run the Docker image on Linux x86_64
# Image: app.netbird.cloud:8081/fe-customer/stable/1.0.0

echo "Pulling the Docker image..."
docker pull app.netbird.cloud:8081/fe-customer/stable/1.0.0

echo "Running the Docker container..."
docker run -d -p 80:80 --memory-reservation=4096m --name vue-app --platform linux/amd64 app.netbird.cloud:8081/fe-merchant/stable/1.0.0

echo "Container is running. Access the app at http://localhost:80"
