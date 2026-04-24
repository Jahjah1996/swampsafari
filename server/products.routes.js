const express = require('express');
const pool = require('./db');
const mockProducts = require('./mock-products');

const router = express.Router();
const canUseFallback = process.env.NODE_ENV !== 'production' || process.env.ALLOW_PRODUCT_FALLBACK === 'true';

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url FROM products WHERE active = 1 ORDER BY id DESC'
    );

    if (!rows.length && canUseFallback) {
      return res.json(mockProducts);
    }

    return res.json(rows);
  } catch (err) {
    console.error(err);
    if (canUseFallback) {
      return res.json(mockProducts);
    }
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url FROM products WHERE id = ? AND active = 1 LIMIT 1',
      [productId]
    );

    if (!rows.length) {
      if (canUseFallback) {
        const fallbackProduct = mockProducts.find((product) => product.id === productId);
        if (fallbackProduct) {
          return res.json(fallbackProduct);
        }
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (canUseFallback) {
      const fallbackProduct = mockProducts.find((product) => product.id === productId);
      if (fallbackProduct) {
        return res.json(fallbackProduct);
      }
    }
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});

module.exports = router;
