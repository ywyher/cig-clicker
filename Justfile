dev:
  pnpm --filter client --filter server --parallel dev
server:
  pnpm --filter server dev
client:
  pnpm --filter client dev