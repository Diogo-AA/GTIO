output "api_url" {
  description = "URL del Load Balancer para acceder a la API (vía Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "frontend_url" {
  description = "URL HTTPS del frontend"
  value       = module.frontend.frontend_url
}
