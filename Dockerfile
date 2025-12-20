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

# Accept build arguments (these are set at docker build time)
ARG VUE_APP_BACKEND_URL=http://apinofudev.bengkelfajarjaya.com/api/customer
ARG NODE_ENV=production

# Set as environment variables for the build process
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL
ENV NODE_ENV=$NODE_ENV

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

# Expose port 8080 (or change to 80 if preferred)
EXPOSE 8080

# Directly run the serve command with CMD (no entrypoint script needed)
CMD ["serve", "-s", "dist", "-l", "8080"]
