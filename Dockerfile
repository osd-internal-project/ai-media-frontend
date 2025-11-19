# Base image
FROM node:18-alpine AS base

###############################################################################
# Install dependencies
###############################################################################
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only dependency files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

###############################################################################
# Build application
###############################################################################
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy entire project
COPY . .

# Build Next.js standalone output
RUN yarn build

###############################################################################
# Runner (Production)
###############################################################################
FROM base AS runner
WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/public ./public

# Prepare .next directory and set permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone server + static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80
ENV PORT 80
ENV TZ="Asia/Bangkok"

CMD ["node", "server.js"]
