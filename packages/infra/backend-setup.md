# Terraform State Backend Setup

This guide creates the remote state backend used by Terraform in CI/CD.

## Resources to create
- S3 bucket (versioned) to store `terraform.tfstate`
- DynamoDB table for state locking

## Example (ap-northeast-1)
```bash
AWS_REGION=ap-northeast-1
STATE_BUCKET=oliver-terraform-state
LOCK_TABLE=terraform-state-lock

# Create S3 bucket (unique name required)
aws s3api create-bucket \
  --bucket "$STATE_BUCKET" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket "$STATE_BUCKET" \
  --versioning-configuration Status=Enabled

# (Optional) Enable default encryption
aws s3api put-bucket-encryption \
  --bucket "$STATE_BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "AES256" }
    }]
  }'

# Create DynamoDB lock table
aws dynamodb create-table \
  --table-name "$LOCK_TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Notes
- Bucket names are global; adjust `STATE_BUCKET` if already taken.
- Keep the bucket private; CI uses IAM credentials from GitHub Secrets.
- First run after adding the backend requires `terraform init -migrate-state`.


