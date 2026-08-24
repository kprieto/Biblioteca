# Etapa 1: construir la aplicación
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

# Copia TODO el código fuente (incluyendo la carpeta del frontend)
COPY . .

# Ejecuta el build de Maven
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]


# Etapa 2: ejecutar la aplicación
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

