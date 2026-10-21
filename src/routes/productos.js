
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// GET /api/v1/productos — listar productos
router.get('/', async (req, res, next) => {
  try {
    const [productos] = await pool.query(
      'SELECT * FROM productos ORDER BY id ASC'
    );

    res.status(200).json({
      total: productos.length,
      productos
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/productos/:id — consultar un producto
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID_INVALIDO',
        mensaje: 'El ID debe ser un entero positivo.'
      });
    }

    const [productos] = await pool.query(
      'SELECT * FROM productos WHERE id = ?',
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        error: 'PRODUCTO_NO_EXISTE',
        mensaje: 'No se encontró el producto.'
      });
    }

    res.status(200).json(productos[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
