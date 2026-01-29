### BiblioDigital - Sistema de Gestión de Préstamos de Libros

BiblioDigital es una solución integral para la administración de bibliotecas modernas. Combina la potencia de Spring Boot para el backend, la velocidad de búsqueda de Elasticsearch y una interfaz dinámica desarrollada en React con Tailwind CSS.

El sistema permite no solo gestionar el inventario de libros (CRUD), sino también monitorear en tiempo real el estado de los préstamos, alertando visualmente cuando un libro ha superado el plazo de entrega.

🚀 Funcionalidades Clave

### 1. Motor de Búsqueda Inteligente (Elasticsearch)

  Integración con Elasticsearch para realizar búsquedas de texto completo en milisegundos. El sistema busca por título, autor o sinopsis de forma sincronizada con la base de datos MySQL.

### 2. Gestión de Alquileres y Control de Retrasos

  - Lógica de Préstamo: Permite registrar alquileres con un máximo de 7 días.

  Alertas Visuales:
  - 🟢 Disponible: Listo para alquilar.
  - 🟡 Alquilado: En posesión de un usuario dentro del plazo.
  - 🔴 Retraso en el alquiler: Si la fecha actual supera la fechaFin, el estado cambia automáticamente a rojo con una animación de pulso (animate-pulse) para alertar al administrador.

### 3. Sistema de Críticas y Reseñas

  Los usuarios pueden calificar los libros mediante un sistema de estrellas y dejar comentarios detallados, fomentando la interacción comunitaria.

### 4. Diseño Responsivo (Mobile-First)

  Interfaz adaptada para cualquier dispositivo (móvil, tablet o escritorio) utilizando Tailwind CSS, garantizando una experiencia de usuario fluida en cualquier pantalla.

🛠️ Stack Tecnológico

Backend:

  - Java 17+
  
  - Spring Boot 3
  
  - Spring Data JPA (MySQL)
  
  - Spring Data Elasticsearch
  
  - Hibernate

Frontend:

  - React (Vite)
  
  - Tailwind CSS
  
  - Lucide React (Iconografía)

Base de Datos / Búsqueda:

  - MySQL (Persistencia de datos)

Elasticsearch (Motor de búsqueda)

⚙️ Configuración e Instalación

Requisitos Previos

  - MySQL Server corriendo.
  
  - Elasticsearch 7+ o 8+ instalado y activo.
  
  - Node.js y npm instalados.

1. Clonar el repositorio

```
  git clone [https://github.com/kprieto/Biblioteca.git]
```


2. Configuración del Backend (Java)

- Abre el proyecto en IntelliJ IDEA.

- Configura el archivo src/main/resources/application.properties:

```
spring.datasource.url=jdbc:mysql://localhost:3306/librarydb
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña

# Elasticsearch
spring.elasticsearch.uris=http://localhost:9200
```


Ejecuta la clase BibliotecaApplication.java.

3. Configuración del Frontend (React)

- Abre una terminal en la carpeta /frontend.

- Instala las dependencias:

```
npm install
```


- Inicia el servidor de desarrollo:

```
npm run dev
```


📊 Arquitectura de Datos

El proyecto utiliza un patrón de Doble Escritura:

Cuando se crea o edita un libro, los datos se guardan primero en MySQL para asegurar la integridad.

Inmediatamente después, se sincronizan con Elasticsearch para habilitar la búsqueda rápida.

La lógica de Retraso se calcula dinámicamente en el Frontend comparando getTodayDate() con el campo fechaFin del último alquiler registrado en el objeto Libro.


✒️ Autor
- Ana Karen Prieto Parra
