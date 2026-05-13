# alb_https.tf - HTTPS en el ALB con certificado autofirmado.
#
# Por qué autofirmado:
# - AWS Academy NO deja crear distribuciones de CloudFront (cloudfront:CreateDistribution
#   está denegado en la LabRole).
# - No tenemos un dominio propio para validar un certificado real con ACM.
# - Auth0 (auth0-spa-js) exige que la web esté en "secure origin" (HTTPS).
#
# Solución: generamos un cert autofirmado dentro de Terraform, lo importamos en
# ACM, y lo enganchamos a un listener HTTPS del ALB. La navegación funciona y
# Auth0 reconoce el origen como seguro. Coste: el navegador muestra "Tu
# conexión no es privada" la primera vez; se acepta una vez y a partir de ahí
# todo va bien.

# 1) Clave privada RSA usada para firmar el certificado.
resource "tls_private_key" "alb" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# 2) Certificado autofirmado válido durante 1 año, asociado al DNS del ALB.
resource "tls_self_signed_cert" "alb" {
  private_key_pem = tls_private_key.alb.private_key_pem

  subject {
    common_name  = "gtio-${var.environment}.elb.amazonaws.com"
    organization = "GTIO"
  }

  validity_period_hours = 8760 # 365 días
  early_renewal_hours   = 720  # Regenerar en los últimos 30 días de validez

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]

  # Como no sabemos a priori el DNS exacto del ALB (lo asigna AWS), cubrimos
  # con wildcards los dominios típicos de un ALB en us-east-1.
  dns_names = [
    "*.us-east-1.elb.amazonaws.com",
    "*.elb.amazonaws.com",
  ]
}

# 3) Importamos el cert en ACM para que el ALB pueda usarlo.
resource "aws_acm_certificate" "alb_self_signed" {
  private_key      = tls_private_key.alb.private_key_pem
  certificate_body = tls_self_signed_cert.alb.cert_pem

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "gtio-alb-self-signed-${var.environment}"
    Environment = var.environment
  }
}

# 4) Listener HTTPS en el ALB (puerto 443), mismas rutas que el HTTP.
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.alb_self_signed.arn

  # Por defecto reenvía al frontend (nginx con el SPA compilado).
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# 5) Regla del listener HTTPS para que /api/* vaya a Kong (backend).
resource "aws_lb_listener_rule" "api_https" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}
