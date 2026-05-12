variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the Frontend Docker host"
  type        = string
  default     = "t3.small"
}

variable "db_user" {
  description = "Usuario de la Base de Datos RDS"
  type        = string
}

variable "db_password" {
  description = "Contraseña de la Base de Datos RDS"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Nombre de la base de datos"
  type        = string
  default     = "votacion_db"
}

variable "db_port" {
  description = "Puerto de la Base de Datos RDS"
  type        = number
  default     = 3306
}

variable "backend_image_tag" {
  description = "Tag de la imagen del backend en ECR"
  type        = string
  default     = "latest"
}
variable "alarm_email" {
  description = "Email al que se envían las notificaciones de alarmas CloudWatch"
  type        = string
}