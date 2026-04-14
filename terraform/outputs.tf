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
