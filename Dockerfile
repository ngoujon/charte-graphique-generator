# Build client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production
FROM node:20-alpine
WORKDIR /app

# Copy server package and install
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/src ./src

# Copy built client into server public
COPY --from=client-builder /app/client/dist ./public

# Create data directories
RUN mkdir -p /app/data/input /app/data/output /app/data/conf
RUN chmod -R a+rX /app

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

CMD ["node", "src/index.js"]
