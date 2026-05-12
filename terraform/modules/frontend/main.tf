data "aws_caller_identity" "current" {}

# --------------------------------------------------------------------------
# S3 Bucket – Almacena el build del frontend (React SPA)
# --------------------------------------------------------------------------
# AWS Academy NO permite:
#   1. Crear distribuciones CloudFront (falta cloudfront:CreateDistribution)
#   2. Aplicar bucket policies publicas (BlockPublicPolicy a nivel de cuenta)
#
# Solucion: Servir directamente desde el S3 Website Endpoint.
# Los objetos se suben con --acl public-read durante el deploy (CI/CD).
# --------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket = "gtio-frontend-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

# ObjectWriter permite usar ACLs por objeto (necesario para public-read en upload)
resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "ObjectWriter"
  }
}

# Desbloquear ACLs publicas a nivel de bucket (la cuenta puede bloquear policies,
# pero normalmente NO bloquea ACLs en AWS Academy)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = true # Dejamos bloqueado, no lo necesitamos
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Website hosting: rutas inexistentes sirven index.html (SPA con React Router)
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}
