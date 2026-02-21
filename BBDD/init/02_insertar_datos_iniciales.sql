-- 02_insertar_datos_iniciales.sql
USE votacion_db;

-- Gala de ejemplo
INSERT INTO gala (nombre, fecha)
VALUES ('Gala Principal', '2026-03-01');

-- Candidatos de ejemplo
INSERT INTO candidatos (nombre)
VALUES
  ('Candidato A'),
  ('Candidato B'),
  ('Candidato C');

-- Relacionar candidatos con la gala 1
INSERT INTO gala_candidatos (gala_id, candidato_id)
SELECT 1, id FROM candidatos;

-- Usuario de ejemplo
INSERT INTO usuarios (nombre, passwd)
VALUES ('Usuario Demo', 'PASS_DE_EJEMPLO');