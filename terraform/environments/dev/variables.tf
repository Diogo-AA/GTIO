variable "db_user" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "alarm_email" {
  description = "Email de destino para alertas de CloudWatch"
  type        = string
}
