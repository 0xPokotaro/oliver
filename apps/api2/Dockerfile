FROM node:20-alpine

WORKDIR /app

# ルートのpnpm設定ファイルをコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api2/package.json ./apps/api2/

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --filter @oliver/api2

# Copy source code
COPY apps/api2/src ./apps/api2/src
COPY apps/api2/tsconfig.json ./apps/api2/

WORKDIR /app/apps/api2

# Expose port
EXPOSE 3001

# Start application
CMD ["pnpm", "start"]

