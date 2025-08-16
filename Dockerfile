FROM node:20.2.0-slim
WORKDIR /app

ARG PORT=7575

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NODE_OPTIONS '--no-experimental-fetch'

COPY next.config.js ./
COPY public ./public
COPY package.json yarn.lock ./
COPY src ./src
COPY scripts ./scripts
COPY drizzle ./drizzle
COPY cli ./cli
COPY tsconfig.json ./tsconfig.json

RUN mkdir /data

# Install dependencies and build
RUN apt update && apt install -y openssl wget
RUN npm install -g yarn
RUN yarn install
RUN yarn build

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY ./scripts/run.sh ./scripts/run.sh
RUN chmod +x ./scripts/run.sh

COPY ./drizzle/migrate ./migrate
COPY ./tsconfig.json ./migrate/tsconfig.json

# Migration setup
RUN mv node_modules _node_modules
RUN rm package.json
RUN cp ./migrate/package.json ./package.json
RUN yarn
RUN cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/_node_modules/better-sqlite3/build/Release/better_sqlite3.node
RUN mv node_modules ./migrate/node_modules
RUN mv _node_modules node_modules

RUN echo '#!/bin/bash\nnode /app/cli/cli.js "$@"' > /usr/bin/homarr
RUN chmod +x /usr/bin/homarr
RUN cd /app/cli && yarn --immutable

EXPOSE $PORT
ENV PORT=${PORT}
ENV DATABASE_URL "file:/data/db.sqlite"
ENV AUTH_TRUST_HOST="true"
ENV PORT 7575
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

VOLUME [ "/app/data/configs" ]
VOLUME [ "/data" ]
ENTRYPOINT ["sh", "./scripts/run.sh"]
