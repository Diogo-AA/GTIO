output "api_url" {
  description = "URL del Load Balancer para acceder a la API (vía Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_url" {
  description = "URL publica del frontend (S3 Website Endpoint)"
  value       = "http://${module.frontend.website_endpoint}"
}

output "frontend_bucket" {
  description = "Bucket S3 donde subir el build del frontend"
  value       = module.frontend.bucket_name
}
