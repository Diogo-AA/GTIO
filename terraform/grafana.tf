# grafana.tf — Grafana en ECS Fargate con CloudWatch como datasource

# ─── CloudWatch Log Group ─────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "grafana" {
  name              = "/ecs/gtio-grafana"
  retention_in_days = 7
}

# ─── Security Group ──────────────────────────────────────────────────────────

resource "aws_security_group" "grafana_sg" {
  name        = "gtio-grafana-sg"
  description = "Permitir trafico a Grafana desde el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Grafana desde el ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "gtio-grafana-sg" }
}

# Permitir puerto 3000 entrante en el ALB (recurso separado para no alterar alb.tf)
resource "aws_vpc_security_group_ingress_rule" "alb_grafana" {
  security_group_id = aws_security_group.alb_sg.id
  from_port         = 3000
  to_port           = 3000
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
  description       = "Acceso a Grafana desde Internet"
}

# ─── ALB: Target Group + Listener ────────────────────────────────────────────

resource "aws_lb_target_group" "grafana" {
  name        = "gtio-grafana-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/api/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = { Name = "gtio-grafana-tg" }
}

resource "aws_lb_listener" "grafana" {
  load_balancer_arn = aws_lb.app.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }
}

# ─── ECS Task Definition ─────────────────────────────────────────────────────
# Grafana se configura al arrancar:
#   1. Se escribe el datasource de CloudWatch en /etc/grafana/provisioning/datasources/
#   2. CloudWatch usa el IAM Task Role (LabRole) — sin credenciales hardcodeadas
#   3. Se lanza Grafana con /run.sh

resource "aws_ecs_task_definition" "grafana" {
  family                   = "gtio-grafana"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "grafana"
      image     = "grafana/grafana:11.0.0"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      # Provisiona el datasource de CloudWatch automáticamente al arrancar
      entryPoint = ["/bin/sh", "-c"]
      command = [
        join(" && ", [
          "mkdir -p /etc/grafana/provisioning/datasources",
          "printf 'apiVersion: 1\\ndatasources:\\n  - name: CloudWatch\\n    type: cloudwatch\\n    isDefault: true\\n    jsonData:\\n      authType: default\\n      defaultRegion: ${var.aws_region}\\n' > /etc/grafana/provisioning/datasources/cloudwatch.yml",
          "/run.sh"
        ])
      ]

      environment = [
        { name = "GF_SECURITY_ADMIN_USER", value = "admin" },
        { name = "GF_SECURITY_ADMIN_PASSWORD", value = "gtio-admin" },
        { name = "GF_AUTH_ANONYMOUS_ENABLED", value = "false" },
        { name = "GF_SERVER_ROOT_URL", value = "http://%(domain)s:3000/" },
        { name = "GF_LOG_LEVEL", value = "info" },
        { name = "GF_INSTALL_PLUGINS", value = "grafana-clock-panel" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.grafana.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "grafana"
        }
      }
    }
  ])
}

# ─── ECS Service ─────────────────────────────────────────────────────────────

resource "aws_ecs_service" "grafana" {
  name            = "gtio-grafana-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.grafana_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.grafana]
}
