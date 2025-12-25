# Production Environment Configuration

# Common
aws_region = "ap-northeast-1"
env        = "prod"

# Lambda
lambda_function_name = "oliver-api-prod"
lambda_source_path   = "../../../../apps/api"
lambda_handler       = "bootstrap"
lambda_runtime       = "provided.al2023"

lambda_environment = {
  X402_PAY_TO              = "0x0000000000000000000000000000000000000000"
  X402_ASSET               = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  X402_MAX_AMOUNT_REQUIRED = "0"
  X402_NETWORK             = "base"
  X402_MAX_TIMEOUT_SECONDS = "3600"
  X402_DESCRIPTION         = "Access to protected resource"
  X402_CHAIN_ID            = "8453"
  FACILITATOR_URL          = "https://facilitator.example.com"
  SHIPPING_FEE             = "500"
}

# API Gateway
api_name     = "oliver-api-prod"
cors_enabled = true

# RDS
rds_instance_identifier = "oliver-db-prod"
rds_engine              = "postgres"
rds_engine_version      = "15.4"
rds_instance_class      = "db.t4g.medium"
rds_allocated_storage   = 100
rds_db_name             = "oliver"
rds_db_username         = "postgres"
rds_db_password         = "CHANGE_ME" # Change this to a secure password or use AWS Secrets Manager
