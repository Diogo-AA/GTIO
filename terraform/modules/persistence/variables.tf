variable "environment" {
  description = "Nombre del entorno"
  type        = string
}

variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs de subredes privadas para RDS"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups permitidos para acceder a RDS"
  type        = list(string)
}

variable "db_user" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type    = string
  default = "votacion_db"
}

variable "db_port" {
  type    = number
  default = 3306
}

variable "instance_class" {
  type    = string
  default = "db.t3.micro"
}
