terraform {
  required_version = ">= 1.0"

  backend "gcs" {
    bucket = "oliver-terraform-state"
    prefix = "infra/terraform.tfstate"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
