output "ecr_repository_url" {
  description = "URL del repositorio ECR para el backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  description = "DNS público del ALB (punto de entrada de la API)"
  value       = aws_lb.app.dns_name
}

output "api_url" {
  description = "URL pública de la API a través del ALB"
  value       = "http://${aws_lb.app.dns_name}"
}

# ─── Frontend ─────────────────────────────────────────────────────────────────

output "frontend_url" {
  description = "URL pública del frontend"
  value       = "http://${aws_instance.frontend.public_ip}:5500"
}

output "frontend_ssh_command" {
  description = "Comando para conectarse por SSH al frontend"
  value       = "ssh ubuntu@${aws_instance.frontend.public_ip}"
}