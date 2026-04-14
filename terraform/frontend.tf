# frontend.tf - EC2 para el frontend React

resource "aws_security_group" "frontend_sg" {
  name        = "gtio-frontend-sg"
  description = "Permitir trafico HTTPS y SSH al frontend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # nosonar
  }

  ingress {
    description = "HTTPS Frontend"
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
              apt-get install -y ca-certificates curl gnupg git nginx openssl

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
              echo "VITE_API_BASE=http://${aws_instance.app.public_ip}:8000" > .env
              echo "VITE_AUTH0_DOMAIN=dev-bd8co7uzp2no173l.us.auth0.com" >> .env
              echo "VITE_AUTH0_CLIENT_ID=7jmRrkifuWLtHgDzjfk0FKZF56RCnvje" >> .env
              echo "VITE_AUTH0_AUDIENCE=https://api.ot-votacion.com" >> .env

              chown -R ubuntu:ubuntu /home/ubuntu/GTIO

              # Levantar frontend en puerto 5500
              docker compose up -d frontend

              # Certificado autofirmado para HTTPS
              mkdir -p /etc/nginx/ssl
              openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /etc/nginx/ssl/selfsigned.key \
                -out /etc/nginx/ssl/selfsigned.crt \
                -subj "/CN=gtio-frontend"

              # Nginx como proxy HTTPS -> Docker puerto 5500
              {
                echo 'server {'
                echo '    listen 443 ssl;'
                echo '    ssl_certificate /etc/nginx/ssl/selfsigned.crt;'
                echo '    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;'
                echo '    location / {'
                echo '        proxy_pass http://localhost:5500;'
                echo '        proxy_set_header Host $host;'
                echo '        proxy_set_header X-Real-IP $remote_addr;'
                echo '    }'
                echo '}'
              } > /etc/nginx/sites-available/frontend

              ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/frontend
              rm -f /etc/nginx/sites-enabled/default
              systemctl restart nginx
              EOF

  tags = {
    Name = "gtio-frontend-instance"
  }
}
