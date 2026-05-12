output "api_url" {
  description = "URL del Load Balancer para acceder a la API (via Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_url" {
  description = "URL publica del frontend (CloudFront)"
  value       = "https://${module.frontend.cloudfront_domain}"
}

output "frontend_bucket" {
  description = "Bucket S3 donde subir el build del frontend"
  value       = module.frontend.bucket_name
}

output "frontend_distribution_id" {
  description = "ID de la distribucion CloudFront del frontend (para invalidaciones)"
  value       = module.frontend.distribution_id
}

output "grafana_url" {
  description = "URL del Load Balancer para acceder a Grafana"
  value       = "http://${module.compute.alb_dns_name}:3000"
}
