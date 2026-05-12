output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "ecs_task_sg_id" {
  value = aws_security_group.ecs_task_sg.id
}
