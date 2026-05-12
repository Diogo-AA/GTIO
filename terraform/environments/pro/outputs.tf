output "api_url" {
  description = "URL del Load Balancer para acceder a la API (via Kong)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "grafana_url" {
  description = "URL del Load Balancer para acceder a Grafana"
  value       = "http://${module.compute.alb_dns_name}:3000"
}
