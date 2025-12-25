# Infrastructure as Code (Terraform)

このディレクトリには、AWS Lambda などのインフラストラクチャを定義するTerraformコードが含まれています。

## セットアップ

### 1. Terraformの初期化

```bash
npm run terraform:init
```

または

```bash
cd src
terraform init
```

### 2. 環境変数の設定

環境別の設定ファイル（`src/environments/*.tfvars`）を編集して、必要な値を設定してください。

**重要**: 以下の値は実際の環境に合わせて変更してください：
- `X402_PAY_TO`: 実際の支払先アドレス
- `FACILITATOR_URL`: 実際のFacilitator APIのURL
- `rds_db_password`: セキュアなパスワード（AWS Secrets Managerの使用を推奨）

### 3. コードの検証

```bash
npm run terraform:fmt
npm run terraform:validate
```

または

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

### クイックデプロイ（デフォルト値使用）

デフォルト値（開発環境相当）でデプロイする場合：

```bash
# 確認
npm run terraform:plan

# デプロイ
npm run terraform:apply

# 削除
npm run terraform:destroy
```

**注意**: これらのコマンドは自動的にLambda関数をビルドしてからTerraformを実行します。

## 設定変数

環境別の設定ファイル（`src/environments/*.tfvars`）で以下の変数を設定します：

### インフラ設定
- `aws_region`: AWSリージョン（例: `ap-northeast-1`）
- `env`: 環境名（`dev`, `staging`, `prod`）
- `lambda_function_name`: Lambda関数名（例: `oliver-api-dev`）
- `api_name`: API Gateway名（例: `oliver-api-dev`）
- `cors_enabled`: CORS有効化（デフォルト: `true`）

### Lambda設定
- `lambda_source_path`: Lambdaソースコードのパス
- `lambda_handler`: Lambdaハンドラー（`bootstrap`）
- `lambda_runtime`: Lambdaランタイム（`provided.al2023`）

### アプリケーション環境変数（`lambda_environment`）
- `X402_PAY_TO`: X402決済先アドレス
- `X402_ASSET`: X402アセットアドレス（USDCなど）
- `X402_MAX_AMOUNT_REQUIRED`: 最大必要額
- `X402_NETWORK`: ネットワーク名（`base`, `base-sepolia`）
- `X402_MAX_TIMEOUT_SECONDS`: 最大タイムアウト秒数
- `X402_DESCRIPTION`: 説明
- `X402_CHAIN_ID`: チェーンID（Base: `8453`, Base Sepolia: `84532`）
- `FACILITATOR_URL`: Facilitator API URL
- `SHIPPING_FEE`: 配送料

**注意**: `DATABASE_URL`はRDSから自動的に設定されるため、手動設定は不要です。

### RDS設定
- `rds_instance_identifier`: RDSインスタンス識別子
- `rds_engine`: データベースエンジン（`postgres`）
- `rds_engine_version`: エンジンバージョン
- `rds_instance_class`: インスタンスクラス
- `rds_allocated_storage`: ストレージ容量（GB）
- `rds_db_name`: データベース名
- `rds_db_username`: マスターユーザー名
- `rds_db_password`: マスターパスワード（要変更）

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
- `backend-setup.md`: S3バックエンドセットアップガイド
- `terraform.tfvars.example`: （非推奨）環境別ファイルを使用してください

## 環境別デプロイ

環境別の設定ファイルを使用してデプロイできます。

### npmスクリプトを使用（推奨）

最も簡単な方法は、npmスクリプトを使用することです：

```bash
# 開発環境
npm run plan:dev      # デプロイ前の確認
npm run deploy:dev    # デプロイ実行

# ステージング環境
npm run plan:staging
npm run deploy:staging

# 本番環境
npm run plan:prod
npm run deploy:prod
```

**注意**: これらのコマンドは自動的にLambda関数をビルドしてからTerraformを実行します。

### Terraformコマンドを直接使用

より細かい制御が必要な場合は、Terraformコマンドを直接実行できます：

#### 開発環境（dev）
```bash
npm run build:lambda
cd src
terraform plan -var-file=./environments/dev.tfvars
terraform apply -var-file=./environments/dev.tfvars
```

#### ステージング環境（staging）
```bash
npm run build:lambda
cd src
terraform plan -var-file=./environments/staging.tfvars
terraform apply -var-file=./environments/staging.tfvars
```

#### 本番環境（prod）
```bash
npm run build:lambda
cd src
terraform plan -var-file=./environments/prod.tfvars
terraform apply -var-file=./environments/prod.tfvars
```

### 環境の削除

```bash
cd src
terraform destroy -var-file=./environments/{env}.tfvars
```

**警告**: 本番環境の削除は慎重に行ってください。データが失われる可能性があります。
