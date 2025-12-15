# Stage 1: Build the application
FROM node:16-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Node (using 'serve' package)
FROM node:16-alpine as production-stage

# Set working directory
WORKDIR /app

# Install 'serve' globally (lightweight static server)
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build-stage /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 8080 (or change to 80 if preferred)
EXPOSE 8080

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start the server (serves from /app/dist on port 3000 by default, but we map to 8080)
CMD ["serve", "-s", "dist", "-l", "8080"]