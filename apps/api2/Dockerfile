FROM node:20-alpine

WORKDIR /app

# ルートのpnpm設定ファイルをコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# ワークスペースのpackage.jsonをコピー（依存関係解決に必要）
COPY apps/api2/package.json ./apps/api2/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Install pnpm and dependencies
# --filter @oliver/api2... で依存関係も含めてインストール
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --filter @oliver/api2...

# Copy source code（依存関係のソースコードも含める）
COPY apps/api2/src ./apps/api2/src
COPY apps/api2/tsconfig.json ./apps/api2/
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma

WORKDIR /app/apps/api2

# Expose port
EXPOSE 3001

# Start application
CMD ["pnpm", "start"]

