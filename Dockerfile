# Use a Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# Using a wildcard for package*.json ensures both are copied if present
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Command to start your application
# This should match your "start" script in package.json
CMD ["npm", "start"]