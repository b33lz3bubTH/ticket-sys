# Use Node 20.16 alpine as base image
FROM node:20.16-alpine3.19 AS base

# Change the working directory to /build
WORKDIR /

# Copy the package.json and package-lock.json files to the /build directory
COPY package*.json ./

COPY . .
# Install production dependencies and clean the cache
RUN npm ci --omit=dev && npm cache clean --force
RUN npm install
RUN npm run build

# Prisma: Generate & migrate the database
RUN npx prisma generate
RUN npx prisma migrate deploy

# Copy the entire source code into the container

# Document the port that may need to be published
EXPOSE 3000

# Start the application

CMD ["node", "dist/index.js"]
