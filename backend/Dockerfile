# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S uchqun -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads logs && chown -R uchqun:nodejs uploads logs
USER uchqun
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]
