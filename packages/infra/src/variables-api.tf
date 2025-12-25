# API Gateway Variables

variable "api_name" {
  description = "API Gateway name"
  type        = string
  default     = "oliver-api-dev"
}

variable "cors_enabled" {
  description = "Enable CORS for API Gateway"
  type        = bool
  default     = true
}
