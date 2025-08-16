# Stage 1: build the Next.js app
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy source & build
COPY . .
RUN npm run build

# Stage 2: produce a lean production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production deps
COPY --from=builder /app/package*.json ./
RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]
