terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket         = "oliver-terraform-state-1766515841"
    key            = "infra/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
