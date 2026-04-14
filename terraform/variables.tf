variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the Docker host"
  type        = string
  default     = "t3.small"
}

variable "db_host" {
  description = "Host de la Base de Datos Externa"
  type        = string
  default     = "bbdd_votacion_mysql"
}

variable "db_user" {
  description = "Usuario de la Base de Datos Externa"
  type        = string
  default     = "user"
}

variable "db_password" {
  description = "Contraseña de la Base de Datos Externa"
  type        = string
  sensitive   = true
  default     = "pass"
}

variable "db_name" {
  description = "Nombre de la base de datos"
  type        = string
  default     = "votacion_db"
}

variable "db_port" {
  description = "Puerto de la Base de Datos Externa"
  type        = number
  default     = 3306
}

variable "public_key" {
  description = "Clave SSH publica para acceder a la EC2"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "IP permitida para acceder por SSH"
  type        = string
}
