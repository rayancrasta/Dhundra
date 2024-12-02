# Use an official Node.js image as base
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the entire frontend code
COPY . .

# Build the React app
RUN npm run build

# Expose port for the frontend
EXPOSE 3000

# Start the app using the production build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
