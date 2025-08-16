FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable \
  && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/apps/homarr/build ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
