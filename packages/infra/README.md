# Infrastructure as Code (Terraform)

このディレクトリには、AWS Lambda などのインフラストラクチャを定義するTerraformコードが含まれています。

## セットアップ

### 1. Terraformの初期化

```bash
cd src
terraform init
```

### 2. 変数ファイルの設定

`terraform.tfvars.example`をコピーして`terraform.tfvars`を作成し、必要な値を設定してください：

```bash
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`には機密情報が含まれるため、Gitにはコミットされません。

### 3. コードの検証

```bash
cd src
terraform fmt
terraform validate
```

## デプロイ

### State 管理（S3 Backend）
- Terraform state は S3 バケット + DynamoDB ロックで管理します。
- バケット・テーブルの作成手順は `backend-setup.md` を参照してください。
- 既存 state を移行する場合は `terraform init -migrate-state` を実行してください。

### デプロイ前の確認

```bash
npm run terraform:plan
```

または

```bash
npm run build:lambda && cd src && terraform plan
```

### デプロイ

```bash
npm run terraform:apply
```

または

```bash
npm run build:lambda && cd src && terraform apply
```

### 削除

```bash
npm run terraform:destroy
```

または

```bash
cd src && terraform destroy
```

## 環境変数

以下の変数を`terraform.tfvars`に設定してください：

- `aws_region`: AWSリージョン（デフォルト: `ap-northeast-1`）
- `env`: 環境名（デフォルト: `dev`）
- `lambda_function_name`: Lambda関数名
- `lambda_source_path`: Lambdaソースコードのパス（デフォルト: `../../apps/api`）
- `lambda_handler`: Lambdaハンドラー（デフォルト: `bootstrap`）
- `lambda_runtime`: Lambdaランタイム（デフォルト: `provided.al2023`）
- `lambda_environment`: Lambda環境変数（以下のキーを含む）
  - `DATABASE_URL`: データベース接続URL
  - `X402_PAY_TO`: X402決済先アドレス
  - `X402_ASSET`: X402アセットアドレス
  - `X402_MAX_AMOUNT_REQUIRED`: 最大必要額
  - `X402_NETWORK`: ネットワーク名
  - `X402_MAX_TIMEOUT_SECONDS`: 最大タイムアウト秒数
  - `X402_DESCRIPTION`: 説明
  - `FACILITATOR_URL`: Facilitator API URL
- `api_name`: API Gateway名
- `cors_enabled`: CORS有効化（デフォルト: `true`）

## 構造

- `src/`: Terraform設定ファイルとモジュール
  - `*.tf`: メインのTerraform設定ファイル
    - `main.tf`: メインのTerraform設定
    - `variables-*.tf`: 変数定義
    - `outputs.tf`: 出力定義
    - `backend.tf`: S3バックエンド設定
    - `provider.tf`: プロバイダー設定
    - `data.tf`: データソース定義
    - `locals.tf`: ローカル変数定義
  - `modules/`: 再利用可能なモジュール
    - `lambda-function/`: Lambda関数モジュール
    - `api-gateway/`: API Gatewayモジュール
    - `rds/`: RDSモジュール
  - `environments/`: 環境別設定ファイル
    - `dev.tfvars`: 開発環境設定
    - `staging.tfvars`: ステージング環境設定
    - `prod.tfvars`: 本番環境設定
- `README.md`: プロジェクトドキュメント
- `package.json`: ビルドスクリプト
- `terraform.tfvars.example`: 設定例

## 環境別デプロイ

環境別の設定ファイルを使用してデプロイできます：

### 開発環境
```bash
cd src
terraform plan -var-file=./environments/dev.tfvars
terraform apply -var-file=./environments/dev.tfvars
```

### ステージング環境
```bash
cd src
terraform plan -var-file=./environments/staging.tfvars
terraform apply -var-file=./environments/staging.tfvars
```

### 本番環境
```bash
cd src
terraform plan -var-file=./environments/prod.tfvars
terraform apply -var-file=./environments/prod.tfvars
```
