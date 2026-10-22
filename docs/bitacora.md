# Bitácora del proyecto TiendaAPI

**Pareja:** Genesis y Daviellys  
**Asignatura:** INF 323 – Programación Web IV (Módulo 2)

## Registro de actividades

### Paso 1. Preparación del entorno

- **Fecha:** Domingo 18 de octubre de 2026
- **Piloto:** Genesis
- **Actividad:** Instalación y configuración de XAMPP, Node.js, Visual Studio Code y Git en ambas computadoras.
- **Problemas resueltos:** Se verificó la instalación de las herramientas mediante los comandos `node -v`, `npm -v` y `git --version`.

### Paso 2. Base de datos

- **Fecha:** Domingo 18 de octubre de 2026
- **Piloto:** Daviellys
- **Actividad:** Creación de la base de datos `tienda`, configuración del usuario `tienda_app` y registro de 10 productos de prueba.
- **Problemas resueltos:** Se verificaron las tablas y los datos registrados mediante phpMyAdmin.

### Paso 3. Video guía y respuestas

- **Fecha:** Domingo 18 de octubre de 2026
- **Piloto:** Genesis y Daviellys
- **Actividad:** Revisión del video educativo de freeCodeCamp y elaboración conjunta de las respuestas de las preguntas 1 a 8 en `docs/respuestas.md`.
- **Problemas resueltos:** Se organizaron las respuestas con base en los temas estudiados en el material de la guía.

### Paso 4. Proyecto Node.js

- **Fecha:** Lunes 19 de octubre de 2026
- **Piloto:** Genesis
- **Actividad:** Creación de la estructura del proyecto con Node.js y Express, configuración de las variables de entorno y preparación de la conexión con MySQL.
- **Problemas resueltos:** Se verificó el funcionamiento inicial del servidor mediante la ruta `/api/salud`.

### Paso 5. Repositorio compartido

- **Fecha:** Lunes 19 de octubre de 2026
- **Piloto:** Genesis y Daviellys
- **Actividad:** Creación del repositorio privado en GitHub y clonación del proyecto para trabajar desde ambas computadoras.
- **Problemas resueltos:** Daviellys configuró su archivo `.env` y verificó el funcionamiento de la API desde su computadora.

### Paso 6. Productos

- **Fecha:** Lunes 19 de octubre de 2026
- **Piloto:** Daviellys
- **Actividad:** Implementación y prueba de los endpoints para listar productos, filtrar por categoría y consultar un producto por su identificador.
- **Problemas resueltos:** Se revisaron las respuestas de la API para consultas válidas, solicitudes incorrectas y productos inexistentes.

### Paso 7. Diseño de pedidos

- **Fecha:** Martes 20 de octubre de 2026
- **Piloto:** Genesis
- **Actividad:** Diseño y documentación de los endpoints de pedidos, incluyendo métodos HTTP, rutas, códigos de respuesta y reglas de negocio en `README.md`.
- **Problemas resueltos:** Se organizaron las operaciones disponibles y los resultados esperados para las solicitudes de pedidos.

### Paso 8. Pedidos y transacciones

- **Fecha:** Martes 20 de octubre de 2026
- **Piloto:** Daviellys y Genesis
- **Actividad:** Implementación de las operaciones para crear, listar, consultar y actualizar pedidos mediante POST, GET y PATCH. Se trabajó con transacciones para controlar las existencias.
- **Problemas resueltos:** Se contemplaron las validaciones de los pedidos y el rechazo de operaciones cuando no hay stock suficiente, evitando descuentos parciales en pedidos rechazados. También se trabajó en la devolución de existencias al cancelar pedidos.

### Paso 9. Documentación de la API

- **Fecha:** Miércoles 21 de octubre de 2026
- **Piloto:** Daviellys
- **Actividad:** Elaboración del archivo `docs/openapi.yaml` e integración de Swagger UI para documentar las operaciones de la API.
- **Problemas resueltos:** Se organizaron las rutas y los métodos disponibles para facilitar la consulta y las pruebas de los endpoints.
- **Evidencia:** Captura de la documentación guardada como `docs/swagger.png`.

### Paso 10. Evidencia de pruebas de pedidos y transacciones

- **Fecha:** Miércoles 21 de octubre de 2026
- **Piloto:** Genesis
- **Actividad:** Ejecución de pruebas con Thunder Client para verificar la creación de pedidos, las validaciones, las respuestas de error y el control de existencias.
- **Problemas resueltos:** Se verificaron los casos de solicitudes inválidas, productos inexistentes y stock insuficiente. Se revisó que una solicitud rechazada por falta de stock devolviera el código HTTP 422 y que las existencias permanecieran sin cambios.
- **Evidencia:** Capturas de las pruebas guardadas en `docs/pruebas.png`, `docs/prueba7.png` y `docs/prueba8.png`.

## Resultado final

Se trabajó en el desarrollo de TiendaAPI utilizando Node.js, Express y MySQL. Se implementaron operaciones para consultar productos y gestionar pedidos, se preparó la documentación mediante README y Swagger, y se realizaron pruebas con Thunder Client para revisar las respuestas de la API y el control de existencias.

La bitácora registra las actividades realizadas por Genesis y Daviellys durante el desarrollo del taller, así como las herramientas utilizadas y las evidencias preparadas.

---
<!-- Commit final de Daviellys -->
