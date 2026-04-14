const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Connection Settings
const pool = new Pool({
  user: 'cafe_admin',         // Your default postgres user
  host: 'db.acuwlrdatgpuilpnskpd.supabase.co',
  database: 'cafe_db01',
  password: 'P@$$w0rd4all', // Your actual DB password
  port: 5432,
});

// Endpoint to receive orders from HTML - saves with PENDING status
app.post('/api/orders', async (req, res) => {
  const { name, items, total } = req.body;
  try {
    // Check for duplicate order in the last 60 seconds
    const recentOrder = await pool.query(
      'SELECT * FROM orders WHERE customer_name = $1 AND items = $2 AND created_at > NOW() - INTERVAL \'60 seconds\' AND status = \'PENDING\'',
      [name, JSON.stringify(items)]
    );

    if (recentOrder.rows.length > 0) {
      return res.status(400).json({ 
        error: "Duplicate order detected. Please wait before placing another order.",
        orderId: recentOrder.rows[0].id 
      });
    }

    const result = await pool.query(
      'INSERT INTO orders (customer_name, items, total_price, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [name, JSON.stringify(items), total, 'PENDING']
    );
    res.json({ success: true, order: result.rows[0], orderId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Endpoint to update order status to COMPLETED after payment
app.put('/api/orders/:id/complete', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, payment_completed_at = NOW() WHERE id = $2 RETURNING *',
      ['COMPLETED', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Admin endpoint: Get all PENDING orders
app.get('/api/orders/pending', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
      ['PENDING']
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Admin endpoint: Get all orders (with filter by status)
app.get('/api/orders/all', async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM orders';
    let params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params = [status];
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Admin endpoint: Cancel an order
app.put('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      ['CANCELLED', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(3000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:3000'));
