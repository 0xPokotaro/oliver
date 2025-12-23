variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
  default     = "api-dev"
}

variable "lambda_source_path" {
  description = "Path to Lambda source code"
  type        = string
  default     = "../../apps/api"
}

variable "lambda_handler" {
  description = "Lambda handler"
  type        = string
  default     = "bootstrap"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "provided.al2023"
}

variable "lambda_environment" {
  description = "Lambda environment variables"
  type        = map(string)
  default     = {}
}

variable "api_name" {
  description = "API Gateway name"
  type        = string
  default     = "dev"
}

variable "cors_enabled" {
  description = "Enable CORS for API Gateway"
  type        = bool
  default     = true
}
