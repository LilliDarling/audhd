FROM node:latest

ENV NODE_ENV=development
ENV GENERATE_SOURCEMAP=false
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

RUN corepack enable && \
    corepack prepare pnpm@latest --activate

RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install

COPY --chown=node:node . .

CMD ["pnpm", "run", "web", "--", "--port", "8082"]