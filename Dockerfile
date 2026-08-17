# Build client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY shared/package*.json ./shared/
RUN cd shared && npm ci
COPY shared/ ./shared/
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
WORKDIR /app/client
RUN npm run build

# Production
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/src ./server/src
COPY shared ./shared

COPY --from=client-builder /app/client/dist ./server/public

RUN mkdir -p /app/data/input /app/data/output /app/data/conf /app/data/trash /app/data/fonts
RUN chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=3002
ENV DATA_DIR=/app/data
WORKDIR /app/server
EXPOSE 3002

USER node
CMD ["node", "src/index.js"]
