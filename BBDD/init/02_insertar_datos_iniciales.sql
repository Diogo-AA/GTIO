-- 02_insertar_datos_iniciales.sql
USE votacion_db;

-- Gala de ejemplo
INSERT IGNORE INTO gala (nombre, fecha)
VALUES ('Gala Principal', '2026-03-01');

-- Candidatos de ejemplo
INSERT IGNORE INTO candidatos (nombre)
VALUES
  ('Candidato A'),
  ('Candidato B'),
  ('Candidato C');

-- Relacionar candidatos con la gala 1
INSERT IGNORE INTO gala_candidatos (gala_id, candidato_id)
SELECT 1, id FROM candidatos;