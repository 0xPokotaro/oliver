# Main Infrastructure Resources

# Create RDS first (without Lambda security group reference)
module "rds" {
  source = "./modules/rds"

  db_instance_identifier     = var.rds_instance_identifier
  engine                     = var.rds_engine
  engine_version             = var.rds_engine_version
  instance_class             = var.rds_instance_class
  allocated_storage          = var.rds_allocated_storage
  db_name                    = var.rds_db_name
  db_username                = var.rds_db_username
  db_password                = var.rds_db_password
  vpc_id                     = data.aws_vpc.default.id
  subnet_ids                 = data.aws_subnets.default.ids
  allowed_security_group_ids = []
}

# Create Lambda with RDS connection URL
module "lambda_function" {
  source = "./modules/lambda-function"

  function_name = var.lambda_function_name
  source_path   = var.lambda_source_path
  handler       = var.lambda_handler
  runtime       = var.lambda_runtime
  vpc_id        = data.aws_vpc.default.id
  subnet_ids    = data.aws_subnets.default.ids
  environment = merge(
    var.lambda_environment,
    {
      DATABASE_URL = module.rds.database_url
    }
  )
}

# Add Lambda security group to RDS security group
resource "aws_security_group_rule" "rds_allow_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.lambda_function.security_group_id
  security_group_id        = module.rds.security_group_id
  description              = "Allow access from Lambda"
}

module "api_gateway" {
  source = "./modules/api-gateway"

  api_name                   = var.api_name
  lambda_function_name       = module.lambda_function.function_name
  lambda_function_invoke_arn = module.lambda_function.function_invoke_arn
  stage_name                 = var.env
  cors_enabled               = var.cors_enabled
}
