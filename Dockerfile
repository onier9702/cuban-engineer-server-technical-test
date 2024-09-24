FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your NestJS app will run on
EXPOSE 3011

# Create the compiled code to dist folder
RUN npm run build

# Define the command to start your NestJS application
# ChangeMe! to CMD ["npm", "run", "start:dev"] in development environment
CMD ["npm", "run", "start:prod"]
