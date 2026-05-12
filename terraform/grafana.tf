# grafana.tf — Amazon Managed Grafana (AMG)
# Servicio gestionado de AWS: no requiere ECS, contenedores ni ALB listeners propios.
# AWS gestiona la alta disponibilidad, actualizaciones y escalado automáticamente.
#
# NOTA SOBRE AWS ACADEMY / LABROLE:
#   AMG requiere que AWS IAM Identity Center (SSO) esté habilitado en la cuenta.
#   En cuentas de laboratorio esto puede no estar disponible; en ese caso el workspace
#   se crea pero no se pueden asignar usuarios SSO directamente.
#   Alternativa: cambiar authentication_providers = ["SAML"] con un IdP externo.

# ─── Data source: cuenta AWS actual ──────────────────────────────────────────

data "aws_caller_identity" "current" {}

# ─── IAM Role para Amazon Managed Grafana ────────────────────────────────────
# AMG asume este rol para leer métricas y logs de CloudWatch sin credenciales
# hardcodeadas. AWS gestiona la rotación y el ciclo de vida del rol.

resource "aws_iam_role" "grafana_amg" {
  name        = "gtio-grafana-amg-role"
  description = "Rol que Amazon Managed Grafana asume para acceder a CloudWatch"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "grafana.amazonaws.com" }
        Action    = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = { Name = "gtio-grafana-amg-role" }
}

# Política inline: permisos de lectura sobre CloudWatch (métricas + logs)
resource "aws_iam_role_policy" "grafana_cloudwatch" {
  name = "gtio-grafana-cloudwatch-policy"
  role = aws_iam_role.grafana_amg.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudWatchRead"
        Effect = "Allow"
        Action = [
          # Métricas
          "cloudwatch:DescribeAlarmsForMetric",
          "cloudwatch:DescribeAlarmHistory",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:ListMetrics",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetInsightRuleReport",
          # CloudWatch Logs
          "logs:DescribeLogGroups",
          "logs:GetLogGroupFields",
          "logs:StartQuery",
          "logs:StopQuery",
          "logs:GetQueryResults",
          "logs:GetLogEvents",
          # Dimensiones EC2
          "ec2:DescribeTags",
          "ec2:DescribeInstances",
          "ec2:DescribeRegions",
          # Resource tags
          "tag:GetResources"
        ]
        Resource = "*"
      }
    ]
  })
}

# ─── Amazon Managed Grafana Workspace ────────────────────────────────────────
# aws_grafana_workspace es el recurso nativo de AWS para AMG.
# Equivale a crear el workspace desde la consola: Grafana → Create workspace.

resource "aws_grafana_workspace" "main" {
  name        = "gtio-grafana"
  description = "Observabilidad GTIO — métricas ECS, ALB, RDS via CloudWatch"

  # Solo accede a recursos de esta cuenta AWS
  account_access_type = "CURRENT_ACCOUNT"

  # Proveedor de autenticación:
  #   "AWS_SSO"  → requiere IAM Identity Center habilitado en la cuenta (recomendado en producción)
  #   "SAML"     → integración con IdP externo (Okta, Azure AD, etc.)
  # En AWS Academy usar "SAML" si SSO no está disponible.
  authentication_providers = ["AWS_SSO"]

  # SERVICE_MANAGED: AWS gestiona los permisos del workspace automáticamente.
  # CUSTOMER_MANAGED: el cliente gestiona los permisos (necesita role_arn).
  permission_type = "SERVICE_MANAGED"

  # Rol IAM que Grafana usará para leer CloudWatch
  role_arn = aws_iam_role.grafana_amg.arn

  # Datasources habilitados en el workspace (se muestran en la UI de AMG)
  data_sources = ["CLOUDWATCH", "PROMETHEUS", "XRAY"]

  # Canales de notificación disponibles para alertas de Grafana
  notification_destinations = ["SNS"]

  # Versión de Grafana gestionada por AWS
  grafana_version = "10.4"

  tags = {
    Name      = "gtio-grafana"
    ManagedBy = "terraform"
  }
}

# ─── SNS: permitir que AMG publique alertas en el topic de alarmas ────────────

resource "aws_sns_topic_policy" "grafana_amg_publish" {
  arn = aws_sns_topic.alarms.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowGrafanaAMGPublish"
        Effect    = "Allow"
        Principal = { Service = "grafana.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.alarms.arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}
