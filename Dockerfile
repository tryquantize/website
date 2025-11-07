FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install

# Copy source code
COPY . .

# Build frontend
RUN yarn build

# Expose port
EXPOSE 3001

# Start server
CMD ["yarn", "tsx", "apps/api/index.ts"]