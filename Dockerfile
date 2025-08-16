####################################
# Stage 1: Build with pnpm
####################################
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Enable and pin pnpm
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# 2) Copy only lockfiles + manifest to cache deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 3) Install all workspaces deps
RUN pnpm install --frozen-lockfile

# 4) Copy source code & build your app
COPY . .
RUN pnpm run build

####################################
# Stage 2: Serve the built app
####################################
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy static build output from the builder
COPY --from=builder /app/apps/homarr/build ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
