# Development Environment Configuration

# Common
aws_region = "ap-northeast-1"
env        = "dev"

# Lambda
lambda_function_name = "oliver-api-dev"
lambda_source_path   = "../../../../apps/api"
lambda_handler       = "bootstrap"
lambda_runtime       = "provided.al2023"

lambda_environment = {
  X402_PAY_TO              = "0x0000000000000000000000000000000000000000"
  X402_ASSET               = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  X402_MAX_AMOUNT_REQUIRED = "0"
  X402_NETWORK             = "base-sepolia"
  X402_MAX_TIMEOUT_SECONDS = "3600"
  X402_DESCRIPTION         = "Access to protected resource"
  X402_CHAIN_ID            = "84532"
  FACILITATOR_URL          = "https://facilitator-dev.example.com"
  SHIPPING_FEE             = "500"
}

# API Gateway
api_name     = "oliver-api-dev"
cors_enabled = true

# RDS
rds_instance_identifier = "oliver-db-dev"
rds_engine              = "postgres"
rds_engine_version      = "15.4"
rds_instance_class      = "db.t4g.micro"
rds_allocated_storage   = 20
rds_db_name             = "oliver"
rds_db_username         = "postgres"
rds_db_password         = "CHANGE_ME" # Change this to a secure password or use AWS Secrets Manager
