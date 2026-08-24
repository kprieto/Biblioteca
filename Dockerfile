# Etapa de compilación
FROM node:24-alpine
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build
COPY . .
# Compila el .jar ignorando los tests para mayor velocidad
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copia el .jar generado
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]





