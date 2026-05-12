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

variable "auth0_domain" {
  description = "Dominio de Auth0"
  type        = string
}

variable "auth0_client_id" {
  description = "Client ID de Auth0"
  type        = string
}

variable "auth0_audience" {
  description = "Audience de Auth0"
  type        = string
}
