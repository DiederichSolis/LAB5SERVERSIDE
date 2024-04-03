# Usamos la imagen oficial de MySQL
FROM mysql:latest



# Variables de entorno para configurar la base de datos
ENV MYSQL_DATABASE=CHAMPIONS_data
ENV MYSQL_ROOT_PASSWORD=Guate
ENV MYSQL_USER=diederich
ENV MYSQL_PASSWORD=Guate

# Copiamos el script de inicialización de la base de datos a la carpeta de Docker-entrypoint-initdb.d
COPY schema.sql /docker-entrypoint-initdb.d/schema.sql

# Puerto expuesto por el contenedor
EXPOSE 3306