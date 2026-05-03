# ADR-0011 – Balanceador de carga del backend

* Estado: Aceptado
* Responsables: Jon Arriazu, Diogo Da Cunha, Javier Toussent Fis, Cristian Meneses
* Fecha: 2026-05-03

Historia técnica: Introducción de un balanceador de carga delante del backend para habilitar escalabilidad, alta disponibilidad y un punto de entrada estable de cara a la migración a ECS.

---

## Contexto

Hasta ahora el backend del sistema se desplegaba en una única EC2 con nginx terminando HTTPS y haciendo de proxy a Kong (puerto 8000). Esa arquitectura tiene tres problemas de cara al RFP:

- **Single Point of Failure:** si la EC2 cae, todo el servicio cae.
- **No escalable:** no se puede añadir más capacidad sin un punto de entrada común que reparta tráfico.
- **Bloquea ECS:** la migración a ECS Fargate exige un punto de entrada estable que apunte a las tareas que se levanten y se destruyan dinámicamente.

El sistema debe soportar cargas masivas durante las galas en directo (requisito implícito del RFI), cosa que con una EC2 única es inviable.

---

## Opciones consideradas

| Criterio | ALB | NLB | CLB | Mantener nginx |
|---|---|---|---|---|
| Capa OSI | 7 (HTTP/HTTPS) | 4 (TCP/UDP) | 4 y 7 (limitado) | 7 |
| Routing por path/host | Sí | No | Limitado | Sí (manual) |
| Integración nativa con ECS Fargate | Sí (`target_type=ip`) | Sí | No | No |
| Métricas en CloudWatch | Sí, sin configuración | Sí, sin configuración | Sí | No |
| Soporte HTTPS con ACM | Sí | Sí (passthrough) | Sí | Manual con certs |
| Estado actual en AWS | Recomendado | Recomendado | Deprecated | – |
| Coste mensual aprox. | ~16 USD | ~16 USD | ~18 USD | Solo EC2 |

---

## Decisión

**Application Load Balancer (ALB)**.

Justificación:

El ALB es el único de los cuatro que entiende HTTP y permitirá routing por path o host cuando aparezcan nuevos microservicios (por ejemplo separar `/votos` y `/galas` o servicios de admin). Es el balanceador recomendado por AWS para ECS Fargate y publica métricas en CloudWatch sin configuración adicional, lo que encaja directamente con la siguiente issue de observabilidad. NLB se descarta porque opera en capa 4 y no aporta routing inteligente para una API REST. CLB está deprecated. Mantener nginx no resuelve el SPOF ni facilita la migración a ECS.

---

## Implementación

* Nuevo archivo `terraform/alb.tf` con: SG del ALB, ALB, Target Group, attachment a la EC2 actual y listener HTTP:80.
* Segunda subred pública en `us-east-1b` para cumplir el requisito multi-AZ del ALB.
* SG del backend cerrado: ya no acepta tráfico desde Internet, solo desde el SG del ALB en el puerto 8000 y SSH desde IP propia.
* Eliminado el bloque de nginx del `user_data` de la EC2 del backend.
* Outputs actualizados: nuevo `alb_dns_name`, `api_url` apunta al DNS del ALB.

El Target Group está configurado con `target_type = instance` para apuntar a la EC2 actual. Cuando se complete la migración a ECS Fargate se cambiará a `target_type = ip`.

---

## Consecuencias

### Positivas

- Punto de entrada estable independiente de las instancias detrás.
- Health checks automáticos: las instancias caídas dejan de recibir tráfico.
- Métricas CloudWatch (`RequestCount`, `TargetResponseTime`, `HTTPCode_Target_*`) listas para la siguiente issue de observabilidad.
- Preparado para ECS: cambiar el `target_type` será el único cambio necesario en este TG.

### Negativas

- Coste fijo del ALB (~16 USD/mes corriendo 24/7).
- En este PR se entrega solo HTTP:80; el listener HTTPS:443 con ACM se añadirá cuando exista dominio (issue de DNS).
- La terminación TLS deja de hacerse en la EC2, lo que es positivo arquitectónicamente pero obliga a no olvidar el listener 443 antes de la demo final del RFP.