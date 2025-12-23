terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "lambda_function" {
  source = "./modules/lambda-function"

  function_name = var.lambda_function_name
  source_path   = var.lambda_source_path
  handler       = var.lambda_handler
  runtime       = var.lambda_runtime
  environment   = var.lambda_environment
}

module "api_gateway" {
  source = "./modules/api-gateway"

  api_name                 = var.api_name
  lambda_function_name     = module.lambda_function.function_name
  lambda_function_invoke_arn = module.lambda_function.function_invoke_arn
  stage_name              = var.env
  cors_enabled            = var.cors_enabled
}

