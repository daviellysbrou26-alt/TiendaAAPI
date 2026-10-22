

## Parte A — Express, rutas y controladores

**1. ¿Qué comando inicia un proyecto de Node.js y qué archivo crea? ¿Para qué sirve ese archivo?**  
El comando es `npm init -y`. Crea el archivo `package.json`. Ese archivo es el manifiesto del proyecto: guarda el nombre, la versión, los scripts (como `dev` y `start`) y la lista de dependencias que se instalan con `npm install`.

**2. ¿Qué hace nodemon y por qué conviene durante el desarrollo pero no en producción?**  
Nodemon reinicia automáticamente el servidor cada vez que se guarda un archivo. Esto ahorra tiempo en desarrollo porque no hay que detener y volver a ejecutar el proceso manualmente. En producción no conviene porque consume recursos innecesarios y la aplicación debe ser estable; allí se usa `node index.js` (o un gestor como PM2).

**3. Dibujen o describan las carpetas que crea el instructor. ¿Cuál equivale a src/routes, a src/controllers y a src/models de TiendaAPI?**  
El instructor suele crear una estructura similar a:
- `routes/` → equivale a `src/routes` (define las rutas HTTP)
- `controllers/` → equivale a la lógica que en este taller está repartida entre las rutas y los modelos
- `models/` o una carpeta de base de datos → equivale a `src/models` (habla con MySQL)

En TiendaAPI separamos claramente: las rutas reciben la petición, los modelos ejecutan las consultas SQL y el middleware de errores centraliza los fallos.

**4. En una ruta como /productos/:id, ¿cómo obtiene el código el valor de id? ¿Qué ventaja tiene separar la ruta del controlador?**  
Se obtiene con `req.params.id`. Separar la ruta del controlador (o del modelo) permite reutilizar la lógica, mantener el código más legible y facilitar las pruebas unitarias.

## Parte B — Conectar MySQL y crear el CRUD

**5. ¿Dónde escribe el instructor los datos de conexión? Comparen con lo que harán ustedes en el Paso 4 (archivo .env). ¿Cuál es más seguro y por qué?**  
El instructor coloca los datos de conexión en el código o en un archivo de configuración. Nosotros los guardamos en el archivo .env, lo que nos permite mantenerlos separados del resto del proyecto. Es más seguro porque evitamos que las contraseñas y los datos de acceso se publiquen en GitHub.

**6. Comparen sus tablas con las de tienda que crearon en el Paso 2. ¿Qué tienen en común? ¿Qué clave foránea aparece en ambas?**  
Ambas bases de datos tienen tablas para organizar los productos y sus categorías. La clave foránea que comparten es categoria_id, ubicada en la tabla productos, que permite relacionar cada producto con su categoría. En nuestro caso, también agregamos las tablas pedidos y pedido_items para gestionar las compras.
**7. Hagan una tabla con cada operación del CRUD del video: verbo, ruta y código de estado que responde.**  

| Operación | Verbo  | Ruta típica          | Código de éxito | Notas |
|-----------|--------|----------------------|-----------------|-------|
| Create    | POST   | /productos           | 201             |       |
| Read (lista) | GET | /productos           | 200             |       |
| Read (uno)   | GET | /productos/:id       | 200 / 404       |       |
| Update    | PUT o PATCH | /productos/:id  | 200             |       |
| Delete    | DELETE | /productos/:id       | 200 o 204       |       |

Cualquier código que no coincida con la tabla 2.2.3 de la guía del módulo debe marcarse (por ejemplo, devolver 200 en un POST en lugar de 201).

**8. ¿Las consultas SQL del video usan parámetros (?) o concatenan texto? Expliquen por qué los parámetros evitan la inyección SQL.**  
Usan parámetros (`?`). Los parámetros separan el SQL de los datos: el driver de MySQL escapa automáticamente los valores, por lo que un atacante no puede inyectar código SQL malicioso aunque escriba comillas o sentencias en la URL o en el cuerpo.

**9. Si cambiaran WHERE c.nombre = ? por WHERE c.nombre = ' + categoria + ', ¿qué podría escribir un atacante en la dirección? Relaciónenlo con la pregunta 8.**  
Podría escribir algo como:  
`?categoria=Calzado' OR '1'='1`  
o incluso `; DROP TABLE productos; --`.  
Al concatenar texto se abre la puerta a la inyección SQL. Por eso es obligatorio usar parámetros (`?`).

## Diseño de pedidos (Paso 7)

**10. ¿Por qué cambiar el estado usa PATCH y no PUT?**  
PUT se usa para reemplazar el recurso completo. PATCH se usa para modificar solo una parte del recurso (en este caso únicamente el campo `estado`). Como el cliente no envía todo el pedido, PATCH es el verbo semánticamente correcto.

**11. Si el cliente pide un producto_id que no existe, ¿responderían 404 o 422? Defiendan su elección.**  
Respondemos **422 Unprocessable Entity**. El 404 se reserva para cuando el recurso principal de la URL no existe (por ejemplo, un pedido o un producto consultado por GET /:id). En un POST de pedido, el producto es un dato del cuerpo; si no existe, la petición está bien formada pero no se puede procesar por una regla de negocio → 422.

**12. ¿Por qué pedido_items guarda precio_unitario si el precio ya está en productos? Piensen qué pasa si mañana sube el precio.**  
Se guarda el precio que tenía el producto **en el momento de la compra**. Si mañana el precio sube, el historial de pedidos sigue reflejando exactamente lo que el cliente pagó. Es una buena práctica de auditoría e integridad de datos históricos.

## Complemento opcional (servidor Linux)

**13. En su computadora, ¿qué programa cumple un papel parecido al de Nginx en el video, y por qué su API de Node.js no lo necesita para funcionar en localhost:3000?**  
En desarrollo local no hay un proxy inverso; el propio proceso de Node.js escucha directamente en el puerto 3000. Nginx (o Apache) actúa como proxy inverso y servidor web estático en un entorno de producción, pero para pruebas en localhost no es necesario.

**14. Escriban los dos comandos de CentOS que reemplazan a `apt install nginx` y `ufw allow 'Nginx Full'`, y el comando que evita el error «502 Bad Gateway» causado por SELinux.**  
```bash
sudo dnf install nginx
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
# Evitar 502 por SELinux:
sudo setsebool -P httpd_can_network_connect 1
```

---

## Autoevaluación

1. **¿Qué paso les tomó más tiempo y cómo lo resolvieron?**  
   El Paso 8 (transacción de pedidos) porque hay que manejar correctamente `beginTransaction`, `commit`, `rollback` y `FOR UPDATE`. Se resolvió siguiendo el código de la guía y probando con Thunder Client hasta que la prueba 7 y 8 se comportaran bien.

2. **Expliquen con sus palabras qué habría pasado en la prueba 8 sin la transacción.**  
   En la prueba 7 el primer producto tiene stock y el segundo no. Sin transacción, el stock del primer producto se habría descontado igual y el pedido no se habría creado. Con la transacción todo se revierte (rollback) y el stock queda intacto.

3. **Cada integrante escribe dos líneas sobre el aporte del otro.**  
   **Daviellys:** Genesis fue muy importante en la implementación de los endpoints de productos y en la documentación de Swagger. También ayudó a revisar que las transacciones funcionaran bien y que el stock se descontara correctamente.  
   - **Genesis:** Daviellys se encargó de dejar lista la conexión a la base de datos, el diseño de los endpoints de pedidos y de hacer las pruebas con Thunder Client. Su trabajo en el README y en la bitácora dejó todo muy claro y ordenado.

4. **¿Qué nota se pondrían según la rúbrica? Justifiquen en dos líneas.**  
   Nos pondríamos 95/100. Cumplimos todos los requisitos principales de la rúbrica, incluyendo el reto opcional de cancelación con devolución de stock y la transacción. Solo nos faltaría detallar un poco más algunos problemas en la bitácora.
