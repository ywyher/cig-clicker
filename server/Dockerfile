FROM node:22-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile
COPY client/ ./client/
COPY server/ ./server/
RUN pnpm --filter server build

FROM node:22-alpine
WORKDIR /app
RUN npm i -g pnpm
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/server/package.json ./server/package.json
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/server/build ./server/build
EXPOSE 2567
CMD ["node", "server/build/index.js"]