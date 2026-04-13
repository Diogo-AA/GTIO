# outputs.tf - Valores de salida tras aplicar el plan

output "frontend_url" {
  description = "URL pública del frontend (CloudFront)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 donde se despliegan los archivos del frontend"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (necesario para invalidar caché al redesplegar)"
  value       = aws_cloudfront_distribution.frontend.id
}
