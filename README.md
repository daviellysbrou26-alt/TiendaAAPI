# TiendaAPI — Gestión de pedidos

API REST desarrollada con Node.js, Express y MySQL para gestionar productos y pedidos de una tienda.

## 1. Tecnologías utilizadas

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- Swagger UI
- Thunder Client

## 2. Requisitos previos

- Node.js y npm instalados.
- MySQL funcionando en XAMPP.
- Base de datos `tienda` creada y configurada.
- Variables de conexión configuradas en `.env`.

## 3. Instalación y ejecución

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La API estará disponible en:

`http://localhost:3000`

## 4. Documentación Swagger

Abrir en el navegador:

`http://localhost:3000/api/docs`

## 5. Endpoints de la API

| Método | Ruta | Descripción | Respuesta esperada |
|---|---|---|---|
| GET | `/api/salud` | Comprueba la conexión con la base de datos | 200 |
| GET | `/api/v1/productos` | Lista los productos | 200 |
| GET | `/api/v1/productos/{id}` | Consulta un producto por ID | 200 o 404 |
| POST | `/api/v1/pedidos` | Crea un pedido y calcula su total | 201 |
| GET | `/api/v1/pedidos` | Lista los pedidos; permite filtrar por estado | 200 |
| GET | `/api/v1/pedidos/{id}` | Consulta un pedido con sus artículos | 200 o 404 |
| PATCH | `/api/v1/pedidos/{id}` | Cambia el estado de un pedido | 200, 400 o 404 |

### Estados permitidos

- `pendiente`
- `pagado`
- `enviado`
- `cancelado`

Los pedidos nuevos comienzan en estado `pendiente`. El servidor calcula el total a partir de los productos y las cantidades solicitadas.

## 6. Resultados de las pruebas

| N.º | Prueba | Código esperado |
|---:|---|---:|
| 1 | Crear pedido válido | 201 |
| 2 | Consultar stock del producto | 200 |
| 3 | Pedido sin cliente | 400 |
| 4 | Pedido sin artículos | 400 |
| 5 | Cantidad negativa | 400 |
| 6 | Producto inexistente | 422 |
| 7 | Stock insuficiente | 422 |
| 8 | Verificar stock después de un pedido rechazado | 200 |
| 9 | Listar pedidos | 200 |
| 10 | Consultar pedido inexistente | 404 |
| 11 | Cambiar estado a pagado | 200 |
| 12 | Enviar un estado inválido | 400 |

**Nota:** estos son los códigos esperados. Comprueba las respuestas guardadas en Thunder Client antes de afirmar que todas las pruebas pasaron.

## 7. Estructura del proyecto

```text
tiendaapi/
├── db/
│   └── esquema.sql
├── docs/
│   ├── bitacora.md
│   ├── openapi.yaml
│   └── respuestas.md
├── src/
│   ├── middlewares/
│   │   └── errores.js
│   ├── models/
│   │   └── db.js
│   └── routes/
│       ├── categorias.js
│       ├── pedidos.js
│       └── productos.js
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## 8. Seguridad

- Las credenciales de la base de datos se configuran mediante variables de entorno.
- El archivo `.env` no debe subirse al repositorio.
- La carpeta `node_modules/` tampoco debe incluirse en Git.
- Las consultas SQL deben utilizar parámetros para evitar la inyección SQL.

## 9. Pruebas

Las peticiones se organizan en la colección de Thunder Client `TiendaAPI - Pedidos`.
