CREATE USER  IF NOT EXISTS 'diederich'@'%' IDENTIFIED BY 'Guate';
GRANT ALL PRIVILEGES ON CHAMPIONS_data TO 'diederich'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


-- Tabla Equipos
CREATE TABLE IF NOT EXISTS champions  (
    ID_Equipo INT PRIMARY KEY,
    Nombre VARCHAR(255),
    Ciudad VARCHAR(255),
    Pais VARCHAR(255),
    Nombre_jugador VARCHAR(255),
    Apellido_jugador VARCHAR(255),
    Edad_jugador INT,
    Posicion_jugador VARCHAR(255),
    Equipo_local INT,
    Equipo_visitante INT,
    Goles_Local INT,
    Goles_Visitante INT,
    Fecha_partido DATETIME,
    imagen_base64 MEDIUMTEXT,
    Fase_champions Varchar(255)
);




