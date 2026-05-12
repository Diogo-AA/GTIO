output "bucket_name" {
  description = "Nombre del bucket S3 con los estaticos del frontend"
  value       = aws_s3_bucket.frontend.id
}

output "website_endpoint" {
  description = "URL del S3 Website Endpoint (acceso directo, sin CloudFront)"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}
