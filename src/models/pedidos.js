const pool = require('./db');

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'cancelado'];
exports.ESTADOS = ESTADOS;

// Error con código HTTP, para reglas de negocio (stock, producto inexistente)
class ErrorNegocio extends Error {
  constructor(status, codigo, mensaje) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}
exports.ErrorNegocio = ErrorNegocio;

exports.crear = async ({ cliente, items }) => {
  const conn = await pool.getConnection();     // una sola conexión para toda la transacción
  try {
    await conn.beginTransaction();
    let total = 0;
    const lineas = [];

    for (const item of items) {
      // FOR UPDATE bloquea la fila: dos clientes no pueden comprar la última unidad a la vez
      const [rows] = await conn.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [item.producto_id]
      );
      const prod = rows[0];
      if (!prod)
        throw new ErrorNegocio(422, 'PRODUCTO_INEXISTENTE', `No existe el producto ${item.producto_id}`);
      if (prod.stock < item.cantidad)
        throw new ErrorNegocio(422, 'STOCK_INSUFICIENTE', `Solo quedan ${prod.stock} de ${prod.nombre}`);

      total += prod.precio * item.cantidad;
      lineas.push({ producto_id: prod.id, nombre: prod.nombre, cantidad: item.cantidad, precio_unitario: prod.precio });
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, prod.id]);
    }

    total = Math.round(total * 100) / 100;
    const [resultado] = await conn.query(
      'INSERT INTO pedidos (cliente_nombre, cliente_correo, total) VALUES (?, ?, ?)',
      [cliente.nombre, cliente.correo, total]
    );
    const pedidoId = resultado.insertId;

    for (const l of lineas) {
      await conn.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, l.producto_id, l.cantidad, l.precio_unitario]
      );
    }

    await conn.commit();
    return {
      id: pedidoId,
      cliente_nombre: cliente.nombre,
      cliente_correo: cliente.correo,
      estado: 'pendiente',
      total,
      items: lineas
    };
  } catch (e) {
    await conn.rollback();                      // deshace todo lo hecho en esta transacción
    throw e;
  } finally {
    conn.release();                             // devuelve la conexión al pool
  }
};

// TODO 1 — listar pedidos (más reciente primero), filtro opcional por estado
exports.listar = async (estado) => {
  if (estado) {
    if (!ESTADOS.includes(estado)) {
      throw new ErrorNegocio(400, 'ESTADO_INVALIDO', `Estado no permitido. Use: ${ESTADOS.join(', ')}`);
    }
    const [rows] = await pool.query(
      'SELECT * FROM pedidos WHERE estado = ? ORDER BY creado_en DESC',
      [estado]
    );
    return rows;
  }
  const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY creado_en DESC');
  return rows;
};

// TODO 2 — obtener pedido por id con sus items (incluye nombre del producto)
exports.obtenerPorId = async (id) => {
  const [pedidos] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
  const pedido = pedidos[0];
  if (!pedido) return null;

  const [items] = await pool.query(
    `SELECT pi.producto_id, p.nombre, pi.cantidad, pi.precio_unitario
     FROM pedido_items pi
     JOIN productos p ON p.id = pi.producto_id
     WHERE pi.pedido_id = ?`,
    [id]
  );
  pedido.items = items;
  return pedido;
};

// TODO 3 — cambiar solo el estado (+ reto opcional: devolver stock al cancelar)
exports.cambiarEstado = async (id, nuevoEstado) => {
  if (!ESTADOS.includes(nuevoEstado)) {
    throw new ErrorNegocio(400, 'ESTADO_INVALIDO', `Estado no permitido. Use: ${ESTADOS.join(', ')}`);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Bloquear el pedido para evitar condiciones de carrera
    const [pedidos] = await conn.query(
      'SELECT id, estado FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );
    const pedido = pedidos[0];
    if (!pedido) {
      throw new ErrorNegocio(404, 'PEDIDO_NO_ENCONTRADO', `No existe el pedido ${id}`);
    }

    // Reto opcional: un pedido ya enviado no se puede cancelar
    if (nuevoEstado === 'cancelado' && pedido.estado === 'enviado') {
      throw new ErrorNegocio(409, 'PEDIDO_YA_ENVIADO', 'Un pedido ya enviado no se puede cancelar');
    }

    // Reto opcional: al cancelar, devolver las unidades al stock
    if (nuevoEstado === 'cancelado' && pedido.estado !== 'cancelado') {
      const [items] = await conn.query(
        'SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = ?',
        [id]
      );
      for (const item of items) {
        await conn.query(
          'UPDATE productos SET stock = stock + ? WHERE id = ?',
          [item.cantidad, item.producto_id]
        );
      }
    }

    const [resultado] = await conn.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [nuevoEstado, id]
    );

    if (resultado.affectedRows === 0) {
      throw new ErrorNegocio(404, 'PEDIDO_NO_ENCONTRADO', `No existe el pedido ${id}`);
    }

    await conn.commit();
    return { id: Number(id), estado: nuevoEstado };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};
