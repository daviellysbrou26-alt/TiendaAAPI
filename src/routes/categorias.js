
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// GET /api/categorias
router.get('/', async (req, res, next) => {
  try {
    const [categorias] = await pool.query(`
      SELECT id, nombre
      FROM categorias
      ORDER BY id
    `);

    res.json({
      total: categorias.length,
      categorias
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
