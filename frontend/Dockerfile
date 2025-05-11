# Use same Dockerfile for both environments
ARG NODE_ENV=development
FROM node:18-alpine AS base

WORKDIR /app

# Common layers for both environments
COPY package.json package-lock.json* ./

# Install dependencies differently based on environment
RUN if [ "$NODE_ENV" = "production" ]; then \
    npm ci --prefer-offline --no-audit --progress=false; \
    else \
    npm install --no-audit --progress=false; \
    fi

COPY . .

# Production-specific stage
FROM base AS production
RUN npm run build

# Security setup (production only)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]

# Development-specific stage
FROM base AS development

ENV NODE_ENV development

# Enable debugging
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS="--inspect=0.0.0.0:9229"

# Use proper volumes in docker-compose instead
EXPOSE 3000 9229

CMD ["npm", "run", "dev"]