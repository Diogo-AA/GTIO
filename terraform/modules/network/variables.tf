variable "environment" {
  description = "Nombre del entorno (dev, pre, pro)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}
