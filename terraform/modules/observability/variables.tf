variable "environment" {
  description = "Nombre del entorno (dev, pre, pro)"
  type        = string
}

variable "aws_region" {
  description = "Región AWS para las métricas del dashboard"
  type        = string
}

variable "alarm_email" {
  description = "Email de destino para notificaciones SNS de alarmas"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN suffix del ALB para métricas CloudWatch"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  type        = string
}

variable "ecs_service_name" {
  description = "Nombre del servicio ECS"
  type        = string
}

variable "db_instance_id" {
  description = "Identifier de la instancia RDS"
  type        = string
}

variable "alarm_5xx_threshold" {
  description = "Umbral de errores 5xx por minuto para disparar alarma"
  type        = number
  default     = 10
}

variable "alarm_latency_threshold" {
  description = "Umbral de latencia P95 en segundos"
  type        = number
  default     = 1
}

variable "alarm_cpu_threshold" {
  description = "Umbral de CPU (%) para ECS y RDS"
  type        = number
  default     = 80
}

variable "alarm_rds_memory_threshold" {
  description = "Umbral mínimo de memoria libre en RDS (bytes)"
  type        = number
  default     = 100000000 # 100 MB
}
