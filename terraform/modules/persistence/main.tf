resource "aws_db_subnet_group" "rds_group" {
  name       = "gtio-rds-subnets-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_db_instance" "mysql" {
  identifier              = "gtio-db-votacion-${var.environment}"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = var.instance_class
  allocated_storage       = 20
  storage_encrypted       = true
  backup_retention_period = 7
  db_name                 = var.db_name
  username                = var.db_user
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.rds_group.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = false
}

resource "aws_security_group" "rds_sg" {
  name        = "gtio-rds-sg-${var.environment}"
  description = "Permitir trafico MySQL desde el backend"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Acceso MySQL"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # nosonar
  }
}
