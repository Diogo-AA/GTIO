# ADR-0003 – Elección del Sistema de Base de Datos

* Estado: Aceptado 
* Responsables: Jon Arriazu, Diogo Da Cunha, Cristian Meneses  
* Fecha: 2026-02-17  

Historia técnica: Selección de la base de datos para el sistema de votación basado en Docker.

---

## Contexto y Planteamiento del Problema

El sistema de votación debe:

- Garantizar consistencia en el registro de votos.
- Permitir auditoría y trazabilidad.
- Soportar cargas elevadas en producción.
- Ser desplegable en entornos locales y cloud mediante Docker.

La decisión a resolver es:

¿Qué sistema de base de datos se utilizará para el sistema de votación?

---

## Opciones Consideradas

- MongoDB
- MySQL
- PostgreSQL

---

## Comparativa Técnica

### 1. MongoDB

**Tipo:** No relacional (documental)  
**Modelo:** Documentos JSON (BSON)  

**Ventajas:**

- Esquema flexible.
- Desarrollo rápido.
- Escalado horizontal sencillo.
- Buena integración en arquitecturas distribuidas.

**Desventajas:**

- Modelo menos natural para relaciones entre entidades.
- Integridad referencial no nativa.
- Mayor complejidad para auditoría estructurada.

**Conclusión parcial:**  
Puede ser útil en sistemas con datos poco estructurados o muy cambiantes, pero introduce mayor complejidad para garantizar integridad fuerte en un sistema de votación.

---

### 2. MySQL

**Tipo:** Relacional  
**Modelo:** Tablas con claves primarias y foráneas 

**Ventajas:**

- Muy extendida y estable.
- Amplia documentación y soporte.
- Fácil despliegue en Docker y entornos cloud.
- Curva de aprendizaje moderada.
- Suficiente para modelos de datos estructurados como usuarios, votos y eventos.

**Desventajas:**

- Menos capacidades avanzadas que PostgreSQL en ciertos escenarios complejos.

**Conclusión parcial:**  
Solución equilibrada entre robustez y simplicidad.

---

### 3. PostgreSQL

**Tipo:** Relacional  
**Modelo:** Relacional avanzado  

**Ventajas:**

- Muy robusta.
- Soporte avanzado para consultas complejas.
- Excelente integridad y control transaccional.

**Desventajas:**

- Mayor complejidad en configuración avanzada.
- Puede resultar sobredimensionada para sistemas con modelo de datos sencillo.

**Conclusión parcial:**  
Muy adecuada para sistemas críticos de alta complejidad estructural.

---

## Decisión

Opción elegida: **MySQL**

Justificación:

El sistema de votación planteado no requiere una complejidad estructural elevada ni funcionalidades avanzadas específicas.  
El modelo de datos previsto (usuarios, votos, eventos, resultados) es relacional y estructurado.

Por tanto:

- No se necesita una base de datos con características avanzadas complejas.
- Se prioriza simplicidad.
- Se prioriza menor dificultad de implementación y mantenimiento.
- Se busca una solución robusta pero fácil de trabajar para el equipo.

MySQL ofrece:

- Modelo relacional claro.
- Facilidad de uso.
- Buena integración con Docker y Docker Compose.
- Amplia adopción en entornos productivos.

---

## Consecuencias

### Positivas

- Implementación sencilla.
- Curva de aprendizaje reducida.
- Buena documentación.
- Fácil despliegue en entornos locales y cloud.
- Suficiente robustez para el alcance del proyecto.

### Negativas

- Menor potencia en consultas avanzadas comparado con PostgreSQL.
- Si el sistema creciera en complejidad extrema, podría requerirse reevaluación futura.

---

## Consideraciones Técnicas

La base de datos deberá:

- Ejecutarse en contenedor Docker.
- Integrarse en Docker Compose.
- Permitir persistencia mediante volúmenes.
- Garantizar integridad en escenarios de concurrencia.
- Ser fácilmente replicable en entorno local y cloud.

Esta decisión se considera adecuada para el alcance técnico actual del proyecto.
