const router = require('express').Router();
const Productos = require('../models/productos');

// GET /api/v1/productos  y  GET /api/v1/productos?categoria=Calzado
router.get('/', async (req, res, next) => {
  try {
    res.json(await Productos.listar(req.query.categoria));
  } catch (e) { next(e); }
});

// GET /api/v1/productos/3
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: 'ID_INVALIDO', mensaje: 'El id debe ser un entero positivo' });
  try {
    const producto = await Productos.obtenerPorId(id);
    if (!producto) return res.status(404).json({ error: 'PRODUCTO_NO_ENCONTRADO' });
    res.json(producto);
  } catch (e) { next(e); }
});

module.exports = router;
