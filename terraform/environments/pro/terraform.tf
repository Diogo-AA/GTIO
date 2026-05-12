terraform {
  required_version = ">= 1.9.0"

  cloud {
    organization = "GTIO"
    workspaces {
      name = "GTIO-WORKSPACE-pro"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
