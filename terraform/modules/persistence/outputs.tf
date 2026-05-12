output "db_address" {
  description = "Endpoint de conexión de la instancia RDS"
  value       = aws_db_instance.mysql.address
}

output "db_instance_id" {
  description = "Identifier de la instancia RDS para métricas CloudWatch"
  value       = aws_db_instance.mysql.id
}
