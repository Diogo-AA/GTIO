# rds.tf - Base de Datos MySQL

resource "aws_db_subnet_group" "rds_group" {
  name       = "gtio-rds-subnets"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_db_instance" "mysql" {
  identifier              = "gtio-db-votacion"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro" # Capa gratuita
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
  name        = "gtio-rds-sg"
  description = "Permitir trafico MySQL desde el backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Acceso MySQL solo desde el Backend"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"

    security_groups = [aws_security_group.backend_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # nosonar
  }

  lifecycle {
    ignore_changes = all
  }
}
