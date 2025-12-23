# Infrastructure as Code (Terraform)

このディレクトリには、AWS Lambda などのインフラストラクチャを定義するTerraformコードが含まれています。

## セットアップ

### 1. Terraformの初期化

```bash
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
terraform fmt
terraform validate
```

## デプロイ

### デプロイ前の確認

```bash
npm run terraform:plan
```

または

```bash
npm run build:lambda && terraform plan
```

### デプロイ

```bash
npm run terraform:apply
```

または

```bash
npm run build:lambda && terraform apply
```

### 削除

```bash
npm run terraform:destroy
```

または

```bash
terraform destroy
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

- `main.tf`: メインのTerraform設定
- `variables.tf`: 変数定義
- `outputs.tf`: 出力定義
- `terraform.tfvars.example`: 変数の例ファイル
- `modules/lambda-function/`: Lambda関数モジュール
- `modules/api-gateway/`: API Gatewayモジュール
