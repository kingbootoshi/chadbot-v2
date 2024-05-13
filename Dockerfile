# Use a Node.js base image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Compile TypeScript (if necessary)
RUN npx tsc

# Command to run your app
CMD ["npx", "tsx", "telegram/index.ts"]