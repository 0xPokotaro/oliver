variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "source_path" {
  description = "Path to Lambda source code"
  type        = string
}

variable "handler" {
  description = "Lambda handler"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "environment" {
  description = "Lambda environment variables"
  type        = map(string)
  default     = {}
}

