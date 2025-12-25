variable "api_name" {
  description = "API Gateway name"
  type        = string
}

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_function_invoke_arn" {
  description = "Lambda function invoke ARN"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "cors_enabled" {
  description = "Enable CORS for API Gateway"
  type        = bool
  default     = true
}

