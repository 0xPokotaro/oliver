# Cloud Run Variables

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "container_image" {
  description = "Container image URL"
  type        = string
}

variable "environment" {
  description = "Environment variables for Cloud Run"
  type        = map(string)
  default     = {}
}

