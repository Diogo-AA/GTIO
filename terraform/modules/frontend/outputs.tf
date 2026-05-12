output "bucket_name" {
  description = "Nombre del bucket S3 con los estaticos del frontend"
  value       = aws_s3_bucket.frontend.id
}

output "distribution_id" {
  description = "ID de la distribucion CloudFront del frontend"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain" {
  description = "Dominio publico del frontend servido por CloudFront"
  value       = aws_cloudfront_distribution.frontend.domain_name
}
