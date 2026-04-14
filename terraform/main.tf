provider "aws" {
  region = var.aws_region
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}


resource "aws_security_group" "backend_sg" {
  name        = "gtio-backend-sg"
  description = "Permitir trafico a Kong y SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kong Gateway API"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "gtio-app-sg"
  }
}

data "aws_key_pair" "lab_key" {
  key_name   = "vockey"

}

resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  key_name      = data.aws_key_pair.lab_key.key_name

  associate_public_ip_address = true

  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y ca-certificates curl gnupg git

              # Instalar Docker
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              chmod a+r /etc/apt/keyrings/docker.gpg

              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
                tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu

              # Despliegue de la aplicacion
              cd /home/ubuntu
              git clone https://github.com/Diogo-AA/GTIO.git
              cd GTIO

              # Crear archivo de entorno para docker-compose
              cat << 'ENVFILE' > .env
              ENVIRONMENT=Production
              PUERTO_API=8000
              DB_CONN_STRING=server=${aws_db_instance.mysql.address};port=${var.db_port};uid=${var.db_user};pwd=${var.db_password};database=${var.db_name};
              ENVFILE

              chown -R ubuntu:ubuntu /home/ubuntu/GTIO

              # Levantar servicios
              docker compose up -d kong-dbless backend
              EOF

  tags = {
    Name = "gtio-backend-instance"
  }
}
