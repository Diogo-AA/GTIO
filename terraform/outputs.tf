output "ecr_repository_url" {
  description = "URL del repositorio ECR para el backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "alb_dns_name" {
  description = "DNS publico del ALB (punto de entrada de la API)"
  value       = aws_lb.app.dns_name
}

output "api_url" {
  description = "URL publica de la API a traves del ALB"
  value       = "http://${aws_lb.app.dns_name}"
}

# --- Frontend ---

output "frontend_url" {
  description = "URL publica del frontend"
  value       = "http://${aws_instance.frontend.public_ip}:5500"
}

output "frontend_ssh_command" {
  description = "Comando para conectarse por SSH al frontend"
  value       = "ssh ubuntu@${aws_instance.frontend.public_ip}"
}

# --- Grafana (Amazon Managed Grafana) ---

output "grafana_url" {
  description = "URL de Amazon Managed Grafana (AMG) - acceso via AWS SSO o SAML"
  value       = "https://${aws_grafana_workspace.main.endpoint}"
}

output "grafana_workspace_id" {
  description = "ID del workspace de Amazon Managed Grafana"
  value       = aws_grafana_workspace.main.id
}