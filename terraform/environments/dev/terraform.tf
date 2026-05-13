terraform {
  required_version = ">= 1.9.0"

  cloud {
    organization = "GTIO"
    workspaces {
      name = "GTIO-WORKSPACE-dev"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}
