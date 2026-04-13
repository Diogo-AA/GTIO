terraform {
  required_version = "1.14.8"

  cloud {
    organization = "GTIO"
    workspaces {
      name = "GTIO-WORKSPACE"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.40.0"
    }
  }
}
