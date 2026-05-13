# cloudfront.tf - CloudFront delante del ALB para servir el frontend con HTTPS.
#
# Por qué: Auth0 (auth0-spa-js) exige "secure origin", es decir, HTTPS. Como el
# ALB sirve HTTP plano y no tenemos un dominio propio con certificado ACM,
# usamos CloudFront, que da HTTPS automático en *.cloudfront.net.
#
# Topología resultante:
#   Usuario ──HTTPS──▶ CloudFront ──HTTP──▶ ALB ──▶ ECS (frontend / kong+backend)
#
# Importante: la primera vez tarda 5-15 min en desplegarse en todos los edges
# de AWS. En applies posteriores los cambios son casi instantáneos.

resource "aws_cloudfront_distribution" "app" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "GTIO ${var.environment} - SPA + API"
  # Solo edges en EE.UU., Canadá y Europa (suficiente para el lab, mucho más barato).
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "alb-${var.environment}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # El ALB solo escucha en HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 60
    }
  }

  # Comportamiento por defecto (todo lo no estático): reenviar al ALB sin cachear.
  # Esto incluye /, /votos, /galas, /api/*, etc. Usamos políticas managed de AWS
  # para no inventar configuración custom de headers/cookies/query strings.
  default_cache_behavior {
    target_origin_id       = "alb-${var.environment}"
    viewer_protocol_policy = "redirect-to-https" # Si entra por HTTP, redirige a HTTPS
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # CachingDisabled (managed): no cachea NADA. Necesario para que la API y el SPA
    # se comporten siempre como el origen.
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # AllViewer (managed): reenvía TODOS los headers, cookies y query strings.
    # Necesario para que Authorization (Bearer tokens de Auth0) llegue al backend.
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }

  # Para los assets estáticos del frontend (/assets/index-XXXX.js, .css, imágenes)
  # sí cacheamos agresivamente: tienen hash en el nombre, son inmutables.
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "alb-${var.environment}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # CachingOptimized (managed): cachea fuerte con compresión.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  viewer_certificate {
    # Certificado por defecto de CloudFront para *.cloudfront.net. Sin coste,
    # sin tener que registrar dominio ni gestionar ACM.
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "gtio-cloudfront-${var.environment}"
    Environment = var.environment
  }
}
