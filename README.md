# 🎤 Sistema de Votación — Operación Triunfo

Sistema de votación en tiempo real para galas de Operación Triunfo. Los usuarios autenticados pueden votar por sus candidatos favoritos en cada gala, consultar resultados y gestionar su perfil.

## Arquitectura

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │──:5500─▶  Kong API GW │──:8080─▶   Backend    │──:3306─▶    MySQL     │
│  React/Vite  │        │  (JWT, CORS, │        │ ASP.NET Core │        │     8.4      │
│   + Nginx    │        │ Rate-Limit)  │        │  Minimal API │        │              │
└──────────────┘        └──────────────┘        └──────────────┘        └──────────────┘
                              :8000
```

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| **Frontend** | React 19, Vite 7, TypeScript, TailwindCSS 4 | SPA con Auth0, i18n (ES/EN), Playwright E2E |
| **API Gateway** | Kong Gateway 3.7 (DB-less) | Validación JWT (RS256), CORS, rate-limiting (50 req/min) |
| **Backend** | ASP.NET Core 10 (Minimal APIs), .NET 10, Dapper | API REST con autenticación Auth0 y Swagger/OpenAPI |
| **Base de Datos** | MySQL 8.4 | Esquema: `candidatos`, `gala`, `gala_candidatos`, `votos` |
| **IaC** | Terraform ≥ 1.9 + AWS Provider 6.x | EC2 (backend + gateway), EC2 (frontend), RDS MySQL |

## Endpoints de la API

| Método | Ruta | Autorización | Descripción |
|--------|------|-------------|-------------|
| `GET` | `/galas` | Usuario | Listar todas las galas |
| `GET` | `/galas/{id}` | Usuario | Detalle de una gala con sus candidatos |
| `POST` | `/votos` | Usuario | Registrar un voto (usuario extraído del token) |
| `GET` | `/votos?galaId={id}` | Autenticado | Obtener los votos del usuario en una gala |

> La documentación interactiva Swagger está disponible en `/swagger` en entorno de desarrollo.

## Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 22+](https://nodejs.org/) (solo para desarrollo del frontend)
- [.NET 10 SDK](https://dotnet.microsoft.com/) (solo para desarrollo del backend)
- [Terraform ≥ 1.9](https://www.terraform.io/) (solo para el despliegue en AWS)

## Inicio rápido (local)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Diogo-AA/GTIO.git
   cd GTIO
   ```

2. Configurar las variables de entorno. El archivo `.env` raíz contiene la configuración de Auth0 y puertos. Revisar también `BBDD/.env` para las credenciales de MySQL.

3. Levantar toda la infraestructura:
   ```bash
   docker compose up --build -d
   ```

4. Acceder a los servicios:

   | Servicio | URL |
   |----------|-----|
   | Frontend | http://localhost:5500 |
   | Kong API Gateway | http://localhost:8000 |
   | Kong Admin (solo local) | http://127.0.0.1:8001 |
   | MySQL | `localhost:3306` |

## Despliegue en AWS (Terraform)

La infraestructura se provisiona desde `terraform/` y despliega la aplicación en AWS con la siguiente topología:

- **EC2 Backend** — Instancia Ubuntu 24.04 con Docker. Despliega los contenedores `backend` y `kong-dbless`.
- **EC2 Frontend** — Instancia Ubuntu 24.04 con Docker. Despliega el contenedor `frontend` apuntando a la IP pública del backend.
- **RDS MySQL** — Instancia `db.t3.micro` en subredes privadas, accesible únicamente desde el backend vía Security Group.

```bash
cd terraform
terraform init
terraform plan -var="public_key=<tu-clave-pública>" -var="allowed_ssh_cidr=<tu-ip>/32"
terraform apply
```

Las IPs y URLs de acceso se muestran como outputs tras el `apply`.

## Estructura del proyecto

```
GTIO/
├── Backend/              # API REST (.NET 10, Minimal APIs, Dapper)
│   ├── Contracts/        #   DTOs de request/response
│   ├── Data/             #   Repositorios (MySQL + Dapper)
│   ├── Endpoints/        #   Definición de endpoints
│   ├── Models/           #   Entidades de dominio
│   ├── Services/         #   Lógica de negocio
│   └── Dockerfile
├── frontend/             # SPA (React 19 + Vite 7 + TypeScript)
│   ├── src/
│   │   ├── api/          #   Cliente HTTP para la API
│   │   ├── auth/         #   Integración Auth0 SPA
│   │   ├── components/   #   Componentes reutilizables
│   │   ├── i18n/         #   Internacionalización (ES/EN)
│   │   ├── pages/        #   Páginas (Login, Galas, Votar, Perfil, Usuarios)
│   │   ├── router/       #   Rutas protegidas
│   │   └── services/     #   Lógica de servicios
│   └── Dockerfile
├── BBDD/                 # Scripts de inicialización SQL
│   └── init/             #   01: Esquema, 02: Datos iniciales
├── Kong/                 # Configuración declarativa de Kong Gateway
│   └── kong.yml          #   Servicios, rutas, plugins (JWT, CORS, rate-limit)
├── Tests/                # Tests unitarios (xUnit)
├── Tools/
│   └── TestAgent/        # Agente LLM (Groq) para generación automática de tests
├── Docs/
│   ├── ADR/              # Architecture Decision Records (10 ADRs)
│   └── Guías/            # Guías de uso y desarrollo
├── terraform/            # Infraestructura como código (AWS)
│   ├── main.tf           #   VPC, EC2 backend, subredes
│   ├── frontend.tf       #   EC2 frontend
│   ├── rds.tf            #   RDS MySQL
│   ├── variables.tf      #   Variables configurables
│   └── outputs.tf        #   IPs y URLs de salida
└── docker-compose.yaml   # Orquestación de todos los servicios
```

## Calidad de código

El proyecto utiliza [pre-commit](https://pre-commit.com/) con los siguientes hooks:

| Hook | Alcance | Descripción |
|------|---------|-------------|
| **CSharpier** | `*.cs` | Formateador opinionado de C# |
| **Prettier** | JS/TS/JSON/YAML/MD | Formateador de código |

```bash
# Instalación (una sola vez)
pip install pre-commit
pre-commit install

# Ejecución manual
pre-commit run --all-files
```

## Testing

- **Tests unitarios** — Proyecto `Tests/` con xUnit para la capa de servicios.
- **Tests E2E** — Playwright (`frontend/`) para flujos de usuario completos.
- **Test Agent** — Herramienta en `Tools/TestAgent/` que utiliza Groq LLM para la generación automática de tests.

```bash
# Unitarios
dotnet test Tests/

# E2E
cd frontend && npx playwright test
```

## Licencia

[MIT](LICENSE) — © 2026 Diogo AA