output "instance_public_ip" {
  description = "IP pública de la EC2 del backend (solo SSH)"
  value       = aws_instance.app.public_ip
}

output "alb_dns_name" {
  description = "DNS público del ALB (punto de entrada de la API)"
  value       = aws_lb.app.dns_name
}

output "api_url" {
  description = "URL pública de la API a través del ALB"
  value       = "http://${aws_lb.app.dns_name}"
}

output "ssh_command" {
  description = "Comando para conectarse por SSH a la EC2 del backend"
  value       = "ssh ubuntu@${aws_instance.app.public_ip}"
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