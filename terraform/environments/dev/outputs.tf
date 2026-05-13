output "api_url" {
  description = "URL HTTP directa al Load Balancer (no usar desde el navegador con Auth0, no es HTTPS)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "web_url" {
  description = "URL HTTPS pública de la aplicación (CloudFront). ESTA es la que se mete en el navegador."
  value       = module.compute.cloudfront_url
}
