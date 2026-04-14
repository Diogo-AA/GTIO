# ADR-0009 – Implementación de Auth0 para autenticación y autorización

* Estado: Aceptado  
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses , Javier Toussent Fis
* Fecha: 2026-04-14  

Historia técnica: Selección del sistema de autenticación para el backend y su integración con la API.

---

## Contexto y Planteamiento del Problema

El sistema de votación necesita un mecanismo de autenticación y autorización que:

- Permita proteger endpoints del backend.
- Soporte control de acceso por roles.
- Reduzca la complejidad de implementar autenticación propia.
- Sea integrable con ASP.NET Core y con una futura arquitectura desplegada en cloud.

El problema a resolver es:

¿Qué solución utilizamos para gestionar la autenticación y autorización de usuarios en la API?

---

## Opciones Consideradas

- Autenticación propia con JWT
- Auth0
- Firebase Authentication

---

## Decisión

Opción elegida: **Auth0**

Justificación:

Se ha elegido Auth0 porque permite externalizar la autenticación de forma segura, simplifica la gestión de usuarios y tokens, y se integra correctamente con ASP.NET Core mediante JWT Bearer.

Además:

- Reduce el esfuerzo de implementación.
- Evita desarrollar un sistema de login propio.
- Permite definir autorización basada en roles y claims.
- Encaja con un escenario de despliegue futuro en AWS/API Gateway.

---

## Consecuencias

### Positivas

- Menor complejidad en el backend.
- Autenticación basada en estándares.
- Mejor escalabilidad y mantenibilidad.
- Separación clara entre lógica de negocio y gestión de identidad.

### Negativas

- Dependencia de un proveedor externo.
- Necesidad de configurar tenants, aplicaciones, audiencias y roles.
- Posible coste o limitaciones según el plan utilizado.

