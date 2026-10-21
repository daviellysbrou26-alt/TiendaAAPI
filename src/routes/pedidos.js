
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// POST /api/pedidos
router.post('/', async (req, res, next) => {
  const { cliente, items } = req.body || {};

  const cliente_nombre = cliente?.nombre;
  const cliente_correo = cliente?.correo;

  // Validar los datos recibidos

  // Validar los datos recibidos
  if (
    typeof cliente_nombre !== 'string' ||
    !cliente_nombre.trim() ||
    typeof cliente_correo !== 'string' ||
    !cliente_correo.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: 'DATOS_INVALIDOS',
      mensaje: 'Envía cliente_nombre, cliente_correo e items con al menos un producto.'
    });
  }

  for (const item of items) {
    if (
      !Number.isInteger(Number(item.producto_id)) ||
      Number(item.producto_id) <= 0 ||
      !Number.isInteger(Number(item.cantidad)) ||
      Number(item.cantidad) <= 0
    ) {
      return res.status(400).json({
        error: 'ITEM_INVALIDO',
        mensaje: 'Cada artículo necesita producto_id y cantidad como enteros positivos.'
      });
    }
  }

  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    let total = 0;
    const detalles = [];

    // Combinar artículos repetidos del mismo producto
    const cantidades = new Map();

    for (const item of items) {
      const id = Number(item.producto_id);
      const cantidad = Number(item.cantidad);

      cantidades.set(id, (cantidades.get(id) || 0) + cantidad);
    }

    // Verificar stock y calcular el total desde los precios de la BD
    for (const [productoId, cantidad] of cantidades) {
      const [productos] = await conexion.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [productoId]
      );

      if (productos.length === 0) {
        await conexion.rollback();
        return res.status(422).json({
          error: 'PRODUCTO_NO_EXISTE',
          producto_id: productoId
        });
      }

      const producto = productos[0];

      if (producto.stock < cantidad) {
        await conexion.rollback();
        return res.status(422).json({
          error: 'STOCK_INSUFICIENTE',
          producto: producto.nombre,
          stock_disponible: producto.stock,
          cantidad_solicitada: cantidad
        });
      }

      const precio = Number(producto.precio);
      total += precio * cantidad;

      detalles.push({
        producto_id: producto.id,
        cantidad,
        precio_unitario: precio
      });
    }

    total = Math.round((total + Number.EPSILON) * 100) / 100;

    // Crear el pedido
    const [resultado] = await conexion.query(
      `INSERT INTO pedidos
       (cliente_nombre, cliente_correo, estado, total)
       VALUES (?, ?, 'pendiente', ?)`,
      [cliente_nombre.trim(), cliente_correo.trim(), total]
    );

    const pedidoId = resultado.insertId;

    // Guardar los artículos y descontar el stock
    for (const detalle of detalles) {
      await conexion.query(
        `INSERT INTO pedido_items
         (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [
          pedidoId,
          detalle.producto_id,
          detalle.cantidad,
          detalle.precio_unitario
        ]
      );

      await conexion.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [detalle.cantidad, detalle.producto_id]
      );
    }

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido: {
        id: pedidoId,
        cliente_nombre: cliente_nombre.trim(),
        cliente_correo: cliente_correo.trim(),
        estado: 'pendiente',
        total,
        items: detalles
      }
    });
  } catch (error) {
    if (conexion) {
      await conexion.rollback();
    }
    next(error);
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
});

module.exports = router;
// GET /api/v1/pedidos — listar pedidos
router.get('/', async (req, res, next) => {
  try {
    const { estado } = req.query;

    const estadosValidos = [
      'pendiente',
      'pagado',
      'enviado',
      'cancelado'
    ];

    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'ESTADO_INVALIDO',
        mensaje: 'El estado debe ser pendiente, pagado, enviado o cancelado.'
      });
    }

    let sql = `
      SELECT id, cliente_nombre, cliente_correo, estado, total
      FROM pedidos
    `;

    const parametros = [];

    if (estado) {
      sql += ' WHERE estado = ?';
      parametros.push(estado);
    }

    sql += ' ORDER BY id DESC';

    const [pedidos] = await pool.query(sql, parametros);

    res.status(200).json({
      total: pedidos.length,
      pedidos
    });
  } catch (error) {
    next(error);
  }
});

 // GET /api/v1/pedidos/:id — consultar pedido y sus productos
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID_INVALIDO',
        mensaje: 'El ID del pedido debe ser un entero positivo.'
      });
    }

    const [pedidos] = await pool.query(
      `SELECT id, cliente_nombre, cliente_correo, estado, total
       FROM pedidos
       WHERE id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        error: 'PEDIDO_NO_EXISTE',
        mensaje: 'No se encontró el pedido.'
      });
    }

    const [items] = await pool.query(
      `SELECT pi.producto_id, p.nombre AS producto,
              pi.cantidad, pi.precio_unitario
       FROM pedido_items pi
       INNER JOIN productos p ON p.id = pi.producto_id
       WHERE pi.pedido_id = ?`,
      [id]
    );

    res.status(200).json({
      ...pedidos[0],
      items
    });
  } catch (error) {
    next(error);
  }
});

 // PATCH /api/v1/pedidos/:id — cambiar estado
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID_INVALIDO',
        mensaje: 'El ID debe ser un entero positivo.'
      });
    }

    const estadosValidos = [
      'pendiente',
      'pagado',
      'enviado',
      'cancelado'
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'ESTADO_INVALIDO',
        mensaje: 'El estado debe ser pendiente, pagado, enviado o cancelado.'
      });
    }

    const [resultado] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'PEDIDO_NO_EXISTE',
        mensaje: 'No se encontró el pedido.'
      });
    }

    const [pedidos] = await pool.query(
      `SELECT id, cliente_nombre, cliente_correo, estado, total
       FROM pedidos
       WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      mensaje: 'Estado del pedido actualizado',
      pedido: pedidos[0]
    });
  } catch (error) {
    next(error);
  }
});
