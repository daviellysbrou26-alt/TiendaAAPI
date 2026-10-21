
require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Leer la documentación de Swagger
const swaggerDocument = YAML.parse(
  fs.readFileSync(
    path.join(__dirname, 'docs', 'openapi.yaml'),
    'utf8'
  )
);

// Middleware para recibir JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('TiendaAPI está funcionando');
});

// Ruta para comprobar la conexión con la base de datos
app.get('/api/salud', async (req, res, next) => {
  try {
    const pool = require('./src/models/db');
    const [resultado] = await pool.query('SELECT 1 AS ok');

    res.json({
      estado: 'ok',
      baseDeDatos: resultado.length ? 'conectada' : 'desconectada'
    });
  } catch (error) {
    next(error);
  }
});

// Rutas de la API
app.use('/api/v1/productos', require('./src/routes/productos'));
app.use('/api/v1/pedidos', require('./src/routes/pedidos'));

// Documentación Swagger
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// Ruta para direcciones inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: 'RUTA_NO_ENCONTRADA',
    mensaje: 'La ruta solicitada no existe.'
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: 'ERROR_INTERNO',
    mensaje: 'Ocurrió un error interno en el servidor.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API en http://localhost:${PORT}`);
});
