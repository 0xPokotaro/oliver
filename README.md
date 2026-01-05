# Oliver

## Quick start

### データベースセットアップ

環境変数を設定してください。`.env`ファイルをルートディレクトリに作成し、以下を設定します：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/oliver?schema=public"
JWT_SECRET="your-jwt-secret-key"
PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# API用の環境変数
OPENAI_API_KEY="your_openai_api_key_here"
MERCHANT_ADDRESS="0x0000000000000000000000000000000000000000"
FACILITATOR_BASE_URL="http://localhost:3000"
DEFAULT_CURRENCY="0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"  # オプション: デフォルトはAvalanche C-Chain USDC
PORT=3001  # オプション: デフォルトは3001
```

データベースのセットアップ：

```bash
# データベースパッケージに移動
cd packages/database

# Prisma Clientを生成
pnpm prisma:gen

# マイグレーションを実行
pnpm prisma:migrate

# DBをリセットしてシードデータを投入（開発環境のみ）
pnpm prisma:reset
```

詳細な手順については、[packages/database/README.md](packages/database/README.md)を参照してください。

### EVMノードの起動

```bash
yarn evm:node
yarn evm:deploy:erc20
```
