# frontend.tf - EC2 para el frontend React

resource "aws_security_group" "frontend_sg" {
  name        = "gtio-frontend-sg"
  description = "Permitir trafico HTTP y SSH al frontend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # nosonar
  }

  ingress {
    description = "HTTP Frontend"
    from_port   = 5500
    to_port     = 5500
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "gtio-frontend-sg" }
}

resource "aws_instance" "frontend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  key_name      = data.aws_key_pair.lab_key.key_name

  associate_public_ip_address = true # nosonar

  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

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

              # Despliegue del frontend
              cd /home/ubuntu
              git clone https://github.com/Diogo-AA/GTIO.git
              cd GTIO

              # Variables de entorno para build del frontend
              cat << 'ENVFILE' > .env
              VITE_API_BASE=http://${aws_instance.app.public_ip}:8000
              VITE_AUTH0_DOMAIN=dev-bd8co7uzp2no173l.us.auth0.com
              VITE_AUTH0_CLIENT_ID=7jmRrkifuWLtHgDzjfk0FKZF56RCnvje
              VITE_AUTH0_AUDIENCE=https://api.ot-votacion.com
              ENVFILE

              chown -R ubuntu:ubuntu /home/ubuntu/GTIO

              # Levantar frontend en puerto 80
              docker compose up -d frontend
              EOF

  tags = {
    Name = "gtio-frontend-instance"
  }
}
