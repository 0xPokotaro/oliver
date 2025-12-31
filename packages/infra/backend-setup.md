# Terraform State Backend Setup (GCS)

このガイドでは、Terraformで使用するリモートstateバックエンド（GCS）を作成します。

## 作成するリソース

- GCSバケット（バージョニング有効）: `terraform.tfstate`を保存

## セットアップ手順

```bash
PROJECT_ID=your-project-id
BUCKET_NAME=oliver-terraform-state
REGION=asia-northeast1

# GCSバケットを作成
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME

# バージョニングを有効化
gsutil versioning set on gs://$BUCKET_NAME

# (オプション) バケットのライフサイクル管理
gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
```

## 注意事項

- バケット名はグローバルで一意である必要があります
- バケットはプライベートに保ってください
- 初回実行時は`terraform init`を実行してください
