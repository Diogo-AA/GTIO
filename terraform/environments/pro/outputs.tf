output "api_url" {
  description = "URL del Load Balancer para acceder a la API (via Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_url" {
  description = "URL HTTP directa al ALB (no usar con Auth0, no es HTTPS)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "web_url" {
  description = "URL HTTPS pública de la aplicación (CloudFront). ESTA es la que se mete en el navegador."
  value       = module.compute.cloudfront_url
}

output "frontend_ecr_url" {
  description = "URL del repositorio ECR donde se sube la imagen del frontend"
  value       = module.compute.frontend_ecr_repository_url
}

output "grafana_url" {
  description = "URL del Load Balancer para acceder a Grafana"
  value       = "http://${module.compute.alb_dns_name}:3000"
}
