locals {
  # Common tags applied to all resources
  common_tags = {
    Project     = "Oliver"
    Environment = var.env
    ManagedBy   = "Terraform"
  }

  # Resource naming prefix
  name_prefix = "oliver-${var.env}"
}
