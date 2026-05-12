# ALB
resource "aws_security_group" "alb_sg" {
  name        = "gtio-alb-sg-${var.environment}"
  description = "Permitir HTTP/HTTPS al ALB desde Internet"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "app" {
  name               = "gtio-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "backend" {
  name        = "gtio-backend-tg-${var.environment}"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    path                = "/"
    matcher             = "200-499"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ECS Cluster y Logs
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

resource "aws_ecs_cluster" "main" {
  name = "gtio-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/gtio-backend-${var.environment}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ecs_kong" {
  name              = "/ecs/gtio-kong-${var.environment}"
  retention_in_days = 7
}

# ECR
resource "aws_ecr_repository" "backend" {
  name                 = "gtio-backend-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "backend_policy" {
  repository = aws_ecr_repository.backend.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last 5 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 5
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}

# ECS Task & Service
resource "aws_security_group" "ecs_task_sg" {
  name        = "gtio-ecs-task-sg-${var.environment}"
  description = "Permitir trafico a Kong desde el ALB"
  vpc_id      = var.vpc_id

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
}

resource "aws_ecs_task_definition" "app" {
  family                   = "gtio-app-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
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
        { name = "ASPNETCORE_ENVIRONMENT", value = title(var.environment) },
        { name = "ASPNETCORE_URLS", value = "http://+:8080" },
        { name = "Db__ConnString", value = "server=${var.db_address};port=${var.db_port};uid=${var.db_user};pwd=${var.db_password};database=${var.db_name};" }
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

resource "aws_ecs_service" "app" {
  name            = "gtio-app-svc-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [aws_security_group.ecs_task_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "kong"
    container_port   = 8000
  }
}
