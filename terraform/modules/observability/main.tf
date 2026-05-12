# SNS Topic para notificaciones de alarmas
resource "aws_sns_topic" "alarms" {
  name = "gtio-alarms-${var.environment}"
  tags = { Name = "gtio-alarms-${var.environment}" }
}

resource "aws_sns_topic_subscription" "alarms_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# Dashboard
resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "gtio-overview-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ALB - Peticiones por minuto"
          region = var.aws_region
          view   = "timeSeries"
          stat   = "Sum"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ALB - Latencia (P50, P95, P99)"
          region = var.aws_region
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p50" }],
            ["...", { stat = "p95" }],
            ["...", { stat = "p99" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "ECS backend - CPU y memoria"
          region = var.aws_region
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name, { stat = "Average" }],
            [".", "MemoryUtilization", ".", ".", ".", ".", { stat = "Average" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "RDS - CPU y memoria libre"
          region = var.aws_region
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.db_instance_id, { stat = "Average" }],
            [".", "FreeableMemory", ".", ".", { stat = "Average", yAxis = "right" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 24
        height = 6
        properties = {
          title  = "Backend - Errores extraídos de logs"
          region = var.aws_region
          view   = "timeSeries"
          period = 60
          metrics = [
            ["GTIO/Logs", "BackendErrors-${var.environment}", { stat = "Sum" }]
          ]
        }
      }
    ]
  })
}

# Alarmas críticas

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "gtio-alb-5xx-rate-${var.environment}"
  alarm_description   = "ALB devuelve más de ${var.alarm_5xx_threshold} errores 5xx por minuto"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = var.alarm_5xx_threshold
  treat_missing_data  = "notBreaching"
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "alb_latency_p95" {
  alarm_name          = "gtio-alb-latency-p95-${var.environment}"
  alarm_description   = "Latencia P95 del ALB por encima de ${var.alarm_latency_threshold}s durante 5 minutos"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p95"
  threshold           = var.alarm_latency_threshold
  treat_missing_data  = "notBreaching"
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "gtio-ecs-cpu-high-${var.environment}"
  alarm_description   = "CPU del servicio ECS por encima del ${var.alarm_cpu_threshold}% durante 5 minutos"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_cpu_threshold
  treat_missing_data  = "notBreaching"
  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "gtio-rds-cpu-high-${var.environment}"
  alarm_description   = "CPU de la RDS por encima del ${var.alarm_cpu_threshold}% durante 5 minutos"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_cpu_threshold
  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_memory" {
  alarm_name          = "gtio-rds-memory-low-${var.environment}"
  alarm_description   = "Memoria libre de la RDS por debajo de ${var.alarm_rds_memory_threshold / 1000000}MB"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_rds_memory_threshold
  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}

# Queries guardadas de Logs Insights

resource "aws_cloudwatch_query_definition" "errores_backend" {
  name = "GTIO/${var.environment}/backend/errores"

  log_group_names = [
    var.ecs_backend_log_group_name
  ]

  query_string = <<-EOT
    fields @timestamp, @message
    | filter @message like /(?i)(error|exception|fail)/
    | sort @timestamp desc
    | limit 100
  EOT
}

resource "aws_cloudwatch_query_definition" "kong_5xx" {
  name = "GTIO/${var.environment}/kong/5xx"

  log_group_names = [
    var.ecs_kong_log_group_name
  ]

  query_string = <<-EOT
    fields @timestamp, @message
    | filter @message like / 5\d\d /
    | sort @timestamp desc
    | limit 100
  EOT
}

resource "aws_cloudwatch_query_definition" "latencia_kong" {
  name = "GTIO/${var.environment}/kong/latencia-alta"

  log_group_names = [
    var.ecs_kong_log_group_name
  ]

  query_string = <<-EOT
    fields @timestamp, @message
    | parse @message /request_time=(?<lat>[0-9\.]+)/
    | filter lat > 0.5
    | sort lat desc
    | limit 50
  EOT
}

resource "aws_cloudwatch_query_definition" "todos_logs" {
  name = "GTIO/${var.environment}/all/recientes"

  log_group_names = [
    var.ecs_backend_log_group_name,
    var.ecs_kong_log_group_name
  ]

  query_string = <<-EOT
    fields @timestamp, @log, @message
    | sort @timestamp desc
    | limit 200
  EOT
}

# Metric Filter: contar líneas de error en el backend
# Genera una métrica custom GTIO/Logs/BackendErrors a partir de los logs

resource "aws_cloudwatch_log_metric_filter" "backend_errors" {
  name           = "gtio-backend-errors-${var.environment}"
  log_group_name = var.ecs_backend_log_group_name
  pattern        = "?ERROR ?Error ?error ?EXCEPTION ?Exception ?exception ?FAIL ?Fail ?fail"

  metric_transformation {
    name          = "BackendErrors-${var.environment}"
    namespace     = "GTIO/Logs"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# Alarma sobre la métrica extraída de logs

resource "aws_cloudwatch_metric_alarm" "backend_errors_high" {
  alarm_name          = "gtio-backend-errors-high-${var.environment}"
  alarm_description   = "Más de ${var.alarm_backend_errors_threshold} errores en logs del backend en 1 minuto"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BackendErrors-${var.environment}"
  namespace           = "GTIO/Logs"
  period              = 60
  statistic           = "Sum"
  threshold           = var.alarm_backend_errors_threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
}


