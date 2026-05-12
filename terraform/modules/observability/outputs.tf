output "sns_topic_arn" {
  description = "ARN del topic SNS de alarmas"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Nombre del dashboard de CloudWatch"
  value       = aws_cloudwatch_dashboard.overview.dashboard_name
}
