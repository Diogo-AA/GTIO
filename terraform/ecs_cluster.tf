# ecs_cluster.tf — Cluster ECS y CloudWatch Log Groups

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

resource "aws_ecs_cluster" "main" {
  name = "gtio-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/gtio-backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ecs_kong" {
  name              = "/ecs/gtio-kong"
  retention_in_days = 7
}
