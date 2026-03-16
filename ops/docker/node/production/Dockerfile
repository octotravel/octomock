# Base
FROM node:22.15.1-alpine3.21 AS base

WORKDIR /app

COPY package*.json /app
RUN npm install --include=dev --silent --no-audit --no-fund

COPY . /app

ENV NODE_ENV=production

RUN npm run esbuild

# Final
FROM node:22.15.1-alpine3.21 AS final

ENV NODE_ENV=production

WORKDIR /app

COPY --from=base /app/package.json /app/package.json
COPY --from=base /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/better_sqlite3.node
COPY --from=base /app/dist /app/dist

CMD ["node", "--no-warnings", "--max-old-space-size=6144", "/app/dist/index.js"]
