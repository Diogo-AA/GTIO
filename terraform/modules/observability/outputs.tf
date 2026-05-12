output "sns_topic_arn" {
  description = "ARN del topic SNS de alarmas"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Nombre del dashboard de CloudWatch"
  value       = aws_cloudwatch_dashboard.overview.dashboard_name
}

output "grafana_url" {
  description = "URL de Amazon Managed Grafana (acceso via AWS SSO o SAML)"
  value       = "https://${aws_grafana_workspace.main.endpoint}"
}

output "grafana_workspace_id" {
  description = "ID del workspace de Amazon Managed Grafana"
  value       = aws_grafana_workspace.main.id
}
