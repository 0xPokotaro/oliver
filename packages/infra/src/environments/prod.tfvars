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
  X402_PAY_TO              = ""
  X402_ASSET               = ""
  X402_MAX_AMOUNT_REQUIRED = ""
  X402_NETWORK             = ""
  X402_MAX_TIMEOUT_SECONDS = ""
  X402_DESCRIPTION         = ""
  FACILITATOR_URL          = ""
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
