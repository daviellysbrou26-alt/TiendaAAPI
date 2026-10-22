# TiendaAPI

API de tienda en línea construida con Node.js, Express y MySQL (XAMPP) para el curso **INF 323 – Programación Web IV**.

## Cómo ejecutar

1. Tener XAMPP con MySQL en ejecución.
2. Ejecutar el script `db/esquema.sql` en phpMyAdmin (crea la base `tienda`, el usuario `tienda_app` y los datos de prueba).
3. Copiar `.env.example` a `.env` y colocar la contraseña:

```env
DB_PASSWORD=Tienda2026
```

4. Instalar dependencias e iniciar:

```bash
npm install
npm run dev
```

5. Verificar:
   - API: http://localhost:3000/api/salud
   - Documentación: http://localhost:3000/api/docs

## Endpoints de pedidos

| Método | Ruta | Acción | Código de éxito | Códigos de error |
|---|---|---|---|---|
| POST | `/api/v1/pedidos` | Crear un pedido con uno o varios productos | 201 | 400, 422 |
| GET | `/api/v1/pedidos` | Listar pedidos, con filtro opcional por estado | 200 | 400 |
| GET | `/api/v1/pedidos/{id}` | Ver un pedido con sus productos | 200 | 400, 404 |
| PATCH | `/api/v1/pedidos/{id}` | Cambiar solo el estado | 200 | 400, 404, 409 |

### Reglas de negocio

- Un pedido tiene cliente (nombre y correo), fecha, estado y una lista de productos con su cantidad.
- Estados permitidos: pendiente, pagado, enviado y cancelado. Todo pedido nace pendiente.
- La API calcula el total con los precios de la base de datos. El cliente nunca envía precios.
- Si un solo producto no tiene stock suficiente, se rechaza el pedido completo y no se descuenta nada (transacción).
- Los pedidos no se borran, se cancelan. Por eso no hay DELETE.
- **Reto opcional:** al pasar a cancelado se devuelven las unidades al stock. Un pedido ya enviado no se puede cancelar (409).

### Cuerpo de ejemplo (POST)

```json
{
  "cliente": {
    "nombre": "Ana Pérez",
    "correo": "ana@correo.com"
  },
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 4,
      "cantidad": 1
    }
  ]
}
```

## Endpoints de productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/productos` | Lista todos los productos |
| GET | `/api/v1/productos?categoria=Calzado` | Filtra por categoría |
| GET | `/api/v1/productos/{id}` | Obtiene un producto por ID |

## Resultados de pruebas (Paso 10)

| # | Petición | Cuerpo o detalle | Código esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 | POST `/api/v1/pedidos` | Cuerpo del Paso 7 | 201 | 201 OK |
| 2 | GET `/api/v1/productos/1` | El stock bajó 2 unidades respecto a lo anotado | 200 | 200 OK |
| 3 | POST `/api/v1/pedidos` | Cuerpo del Paso 7 sin el bloque cliente | 400 | 400 DATOS_INVALIDOS |
| 4 | POST `/api/v1/pedidos` | `"items": []` | 400 | 400 DATOS_INVALIDOS |
| 5 | POST `/api/v1/pedidos` | `"cantidad": -1` en un producto | 400 | 400 DATOS_INVALIDOS |
| 6 | POST `/api/v1/pedidos` | `"producto_id": 9999` | 422 | 422 PRODUCTO_INEXISTENTE |
| 7 | POST `/api/v1/pedidos` | Producto 1 (ok) + producto 9 cantidad 50 (sin stock) | 422 | 422 STOCK_INSUFICIENTE |
| 8 | GET `/api/v1/productos/1` | El stock no cambió tras la prueba 7 | 200 | 200 OK (stock intacto) |
| 9 | GET `/api/v1/pedidos?estado=pendiente` | Incluye el pedido de la prueba 1 | 200 | 200 OK |
| 10 | GET `/api/v1/pedidos/9999` | Pedido inexistente | 404 | 404 PEDIDO_NO_ENCONTRADO |
| 11 | PATCH `/api/v1/pedidos/{ID}` | `{ "estado": "pagado" }` (ID de la prueba 1) | 200 | 200 OK |
| 12 | PATCH `/api/v1/pedidos/{ID}` | `{ "estado": "perdido" }` | 400 | 400 ESTADO_INVALIDO |

> Capturas guardadas en `docs/`: `swagger.png`, `pruebas.png`, `prueba7.png` y `prueba8.png`.

## Estructura del proyecto

```text
tiendaapi/
├── db/
│   └── esquema.sql
├── docs/
│   ├── respuestas.md
│   ├── bitacora.md
│   ├── openapi.yaml
│   ├── swagger.png
│   ├── pruebas.png
│   ├── prueba7.png
│   └── prueba8.png
├── src/
│   ├── middlewares/
│   │   └── errores.js
│   ├── models/
│   │   ├── db.js
│   │   ├── productos.js
│   │   └── pedidos.js
│   └── routes/
│       ├── productos.js
│       └── pedidos.js
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```
