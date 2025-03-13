# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build TypeScript
RUN npm run build

# Prisma: Generate & migrate the database
RUN npx prisma generate
RUN npx prisma migrate deploy

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
