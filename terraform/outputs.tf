output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "api_url" {
  description = "Kong API Gateway URL"
  value       = "http://${aws_instance.app.public_ip}:8000"
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh ubuntu@${aws_instance.app.public_ip}"
}

# ─── Frontend ─────────────────────────────────────────────────────────────────

output "frontend_url" {
  description = "URL pública del frontend (S3 website)"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 donde se despliegan los archivos del frontend"
  value       = aws_s3_bucket.frontend.id
}
