CREATE DATABASE IF NOT EXISTS votacion_db;
USE votacion_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  passwd VARCHAR(255) NOT NULL
);

-- Candidatos
CREATE TABLE IF NOT EXISTS candidatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- Gala
CREATE TABLE IF NOT EXISTS gala (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL
);

-- GalaCandidatos (relaciona candidatos con gala)
CREATE TABLE IF NOT EXISTS gala_candidatos (
  gala_id INT NOT NULL,
  candidato_id INT NOT NULL,
  PRIMARY KEY (gala_id, candidato_id),
  FOREIGN KEY (gala_id) REFERENCES gala(id),
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id)
);

-- Votos
CREATE TABLE IF NOT EXISTS votos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  usuario INT NOT NULL,
  candidato INT NOT NULL,
  gala INT NOT NULL,
  FOREIGN KEY (usuario) REFERENCES usuarios(id),
  FOREIGN KEY (candidato) REFERENCES candidatos(id),
  FOREIGN KEY (gala) REFERENCES gala(id)
);