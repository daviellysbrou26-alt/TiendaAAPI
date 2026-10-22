const router = require('express').Router();
const Pedidos = require('../models/pedidos');

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve un mensaje de error, o null si el cuerpo es válido
function validarPedido(body) {
  const { cliente, items } = body || {};
  if (!cliente || typeof cliente.nombre !== 'string' || !cliente.nombre.trim())
    return 'Falta el nombre del cliente';
  if (typeof cliente.correo !== 'string' || !CORREO.test(cliente.correo))
    return 'El correo no es válido';
  if (!Array.isArray(items) || items.length === 0)
    return 'El pedido debe tener al menos un producto';
  for (const it of items) {
    if (!Number.isInteger(it.producto_id) || !Number.isInteger(it.cantidad) || it.cantidad <= 0)
      return 'Cada producto necesita producto_id y cantidad enteros positivos';
  }
  return null;
}

// POST /api/v1/pedidos — crear pedido
router.post('/', async (req, res, next) => {
  const error = validarPedido(req.body);
  if (error) return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: error });
  try {
    const pedido = await Pedidos.crear(req.body);
    res.status(201).json(pedido);
  } catch (e) {
    if (e instanceof Pedidos.ErrorNegocio)
      return res.status(e.status).json({ error: e.codigo, mensaje: e.message });
    next(e);                                    // error inesperado: lo atiende errores.js
  }
});

// TODO 1 — GET /api/v1/pedidos  (listar, filtro opcional ?estado=)
router.get('/', async (req, res, next) => {
  try {
    const pedidos = await Pedidos.listar(req.query.estado);
    res.json(pedidos);
  } catch (e) {
    if (e instanceof Pedidos.ErrorNegocio)
      return res.status(e.status).json({ error: e.codigo, mensaje: e.message });
    next(e);
  }
});

// TODO 2 — GET /api/v1/pedidos/:id
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: 'ID_INVALIDO', mensaje: 'El id debe ser un entero positivo' });
  try {
    const pedido = await Pedidos.obtenerPorId(id);
    if (!pedido) return res.status(404).json({ error: 'PEDIDO_NO_ENCONTRADO' });
    res.json(pedido);
  } catch (e) { next(e); }
});

// TODO 3 — PATCH /api/v1/pedidos/:id  (cambiar solo el estado)
router.patch('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: 'ID_INVALIDO', mensaje: 'El id debe ser un entero positivo' });

  const { estado } = req.body || {};
  if (!estado || typeof estado !== 'string')
    return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje: 'Debe enviar { "estado": "..." }' });

  try {
    const resultado = await Pedidos.cambiarEstado(id, estado);
    res.json(resultado);
  } catch (e) {
    if (e instanceof Pedidos.ErrorNegocio)
      return res.status(e.status).json({ error: e.codigo, mensaje: e.message });
    next(e);
  }
});

module.exports = router;
