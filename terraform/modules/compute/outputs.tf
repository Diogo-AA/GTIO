output "alb_dns_name" {
  description = "DNS name del ALB"
  value       = aws_lb.app.dns_name
}

output "alb_arn_suffix" {
  description = "ARN suffix del ALB para métricas CloudWatch"
  value       = aws_lb.app.arn_suffix
}

output "ecs_task_sg_id" {
  description = "ID del Security Group de las tareas ECS"
  value       = aws_security_group.ecs_task_sg.id
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nombre del servicio ECS"
  value       = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  description = "URL del repositorio ECR del backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_backend_log_group_name" {
  description = "Nombre del log group del backend"
  value       = aws_cloudwatch_log_group.ecs_backend.name
}

output "ecs_kong_log_group_name" {
  description = "Nombre del log group de Kong"
  value       = aws_cloudwatch_log_group.ecs_kong.name
}
