# Etapa 1: Construcción (Usando Eclipse Temurin con Maven)
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

