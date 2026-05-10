# ecs.tf — Task Definition (sidecar: Kong + Backend) y Service ECS

# Security Group para las tareas ECS
# Kong recibe tráfico del ALB en 8000, Backend es interno via localhost
resource "aws_security_group" "ecs_task_sg" {
  name        = "gtio-ecs-task-sg"
  description = "Permitir trafico a Kong desde el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Kong desde el ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "gtio-ecs-task-sg" }
}

# Task Definition con patrón Sidecar: Kong + Backend en el mismo task
# Comparten network namespace → Kong llama a Backend via localhost:8080
resource "aws_ecs_task_definition" "app" {
  family                   = "gtio-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    # ─── Kong API Gateway ───────────────────────────────────────────────
    {
      name      = "kong"
      image     = "kong:3.7"
      essential = true
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]
      # Escribir el config a fichero antes de arrancar Kong
      # (KONG_DECLARATIVE_CONFIG_STRING falla con YAML multi-línea via jsonencode)
      entryPoint = ["/bin/sh", "-c"]
      command    = ["printenv _KONG_CONFIG_CONTENT > /tmp/kong.yml && /docker-entrypoint.sh kong docker-start"]
      environment = [
        { name = "KONG_DATABASE", value = "off" },
        { name = "KONG_DECLARATIVE_CONFIG", value = "/tmp/kong.yml" },
        { name = "_KONG_CONFIG_CONTENT", value = templatefile("${path.module}/templates/kong.yml.tpl", {}) },
        { name = "KONG_PROXY_LISTEN", value = "0.0.0.0:8000" },
        { name = "KONG_ADMIN_LISTEN", value = "127.0.0.1:8001" },
        { name = "KONG_PROXY_ACCESS_LOG", value = "/dev/stdout" },
        { name = "KONG_PROXY_ERROR_LOG", value = "/dev/stderr" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_kong.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "kong"
        }
      }
    },

    # ─── Backend ASP.NET Core ───────────────────────────────────────────
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "ASPNETCORE_ENVIRONMENT", value = "Production" },
        { name = "ASPNETCORE_URLS", value = "http://+:8080" },
        { name = "Db__ConnString", value = "server=${aws_db_instance.mysql.address};port=${var.db_port};uid=${var.db_user};pwd=${var.db_password};database=${var.db_name};" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# Servicio ECS — ejecuta el task y lo registra en el ALB
resource "aws_ecs_service" "app" {
  name            = "gtio-app-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs_task_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "kong"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.http, aws_db_instance.mysql]
}
