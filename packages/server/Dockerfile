# Server Dockerfile
# This image runs the Node.js Express backend server

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/shared ./packages/shared

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source files
COPY packages/server ./packages/server
COPY tsconfig.json ./

# Install tsx for running TypeScript
RUN yarn add tsx

# Expose the server port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Run the server
CMD ["yarn", "tsx", "packages/server/index.ts"]
