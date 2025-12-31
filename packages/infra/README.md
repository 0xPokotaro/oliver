# Infrastructure as Code (Terraform)

このディレクトリには、GCP Cloud Run などのインフラストラクチャを定義するTerraformコードが含まれています。

## セットアップ

### 1. GCPプロジェクトの準備

- GCPプロジェクトを作成
- Cloud Run APIを有効化
- GCSバケットを作成（Terraform state用）

### 2. GCSバケットの作成

```bash
gsutil mb -p YOUR_PROJECT_ID -l asia-northeast1 gs://oliver-terraform-state
```

### 3. 認証設定

```bash
gcloud auth application-default login
```

### 4. Terraformの初期化

```bash
npm run terraform:init
```

または

```bash
cd src
terraform init
```

### 5. 環境変数の設定

`src/environments/dev.tfvars`を編集して、必要な値を設定してください：

- `gcp_project_id`: GCPプロジェクトID
- `container_image`: コンテナイメージURL（例: `gcr.io/your-project-id/oliver-api-dev:latest`）
- `environment.DATABASE_URL`: Supabaseの接続文字列

### 6. コードの検証

```bash
npm run terraform:fmt
npm run terraform:validate
```

## デプロイ

### クイックデプロイ

```bash
# 確認
npm run plan

# デプロイ
npm run deploy
```

**注意**: これらのコマンドは自動的にDockerイメージをビルドしてからTerraformを実行します。

### 削除

```bash
cd src
terraform destroy -var-file=./environments/dev.tfvars
```

## 設定変数

`src/environments/dev.tfvars`で以下の変数を設定します：

- `gcp_project_id`: GCPプロジェクトID
- `gcp_region`: GCPリージョン（デフォルト: `asia-northeast1`）
- `service_name`: Cloud Runサービス名
- `container_image`: コンテナイメージURL
- `environment`: 環境変数のマップ（`DATABASE_URL`など）

## 構造

- `src/`: Terraform設定ファイル
  - `main.tf`: Cloud Runサービスの定義
  - `variables.tf`: 変数定義
  - `variables-common.tf`: 共通変数定義
  - `outputs.tf`: 出力定義
  - `backend.tf`: GCSバックエンド設定
  - `provider.tf`: プロバイダー設定
  - `locals.tf`: ローカル変数定義
  - `environments/`: 環境別設定ファイル
    - `dev.tfvars`: 開発環境設定
- `README.md`: プロジェクトドキュメント

## アーキテクチャ

- **Cloud Run**: `apps/api2`をデプロイ（複数のAPIエンドポイントを1つのサービスで処理）
- **Supabase**: データベース（Terraform外で管理）
- **GCS**: Terraform state管理
