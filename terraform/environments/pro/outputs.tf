output "api_url" {
  description = "URL del Load Balancer para acceder a la API (via Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_url" {
  description = "URL del frontend servida por el mismo ALB que la API"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_ecr_url" {
  description = "URL del repositorio ECR donde se sube la imagen del frontend"
  value       = module.compute.frontend_ecr_repository_url
}

output "grafana_url" {
  description = "URL de Amazon Managed Grafana"
  value       = module.observability.grafana_url
}

output "grafana_workspace_id" {
  description = "ID del workspace AMG"
  value       = module.observability.grafana_workspace_id
}
