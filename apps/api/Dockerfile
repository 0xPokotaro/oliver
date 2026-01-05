FROM node:20-alpine

WORKDIR /app

# ルートのpnpm設定ファイルをコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# ワークスペースのpackage.jsonをコピー（依存関係解決に必要）
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Prismaファイルを先にコピー（postinstallスクリプトでprisma generateが実行されるため）
COPY packages/database/prisma ./packages/database/prisma

# Install pnpm and dependencies
# --filter @oliver/api... で依存関係も含めてインストール
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --filter @oliver/api...

# Copy source code（依存関係のソースコードも含める）
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/

WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Start application
CMD ["pnpm", "start"]

