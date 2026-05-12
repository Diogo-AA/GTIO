output "api_url" {
  description = "URL del Load Balancer para acceder a la API (vía Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}
