# Use an official node runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /access_data_email

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build the app
RUN npm run build

# Expose port and start the app
EXPOSE 4000
CMD ["npm", "start"]
