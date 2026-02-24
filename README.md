# Sistema de votación de Operación Triunfo

## Introducción

Este proyecto es un sistema de votación estructurado en tres capas: 
- **Frontend:** Archivos estáticos (HTML/JS/CSS) servidos a través de un contenedor Nginx.
- **Backend:** Una API REST desarrollada en ASP.NET Core que gestiona la lógica de usuarios, galas, candidatos y votos.
- **Base de Datos:** Un contenedor MySQL 8.4 para la persistencia de los datos.

## Prerrequisitos

Para ejecutar este proyecto es necesario tener instalado:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Despliegue y ejecución

1. Situarse en el directorio raíz del proyecto (donde se encuentra el archivo `docker-compose.yaml`).
2. Levantar toda la infraestructura ejecutando el siguiente comando:
   ```bash
   docker compose up --build -d
3. Acceder a la web a través de la ruta `http://localhost:5500`.