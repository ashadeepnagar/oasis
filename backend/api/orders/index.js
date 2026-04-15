import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // 1. Handle GET (Fetching all orders)
  if (req.method === 'GET') {
    try {
      const { status } = req.query;
      const result = status 
        ? await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC`
        : await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, orders: result.rows });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Handle POST (Creating an order)
  if (req.method === 'POST') {
    const { name, items, total } = req.body;
    try {
      // Duplicate check (60-second window)
      const recentOrder = await sql`
        SELECT * FROM orders 
        WHERE customer_name = ${name} 
        AND items::text = ${JSON.stringify(items)} 
        AND created_at > NOW() - INTERVAL '60 seconds' 
        AND status = 'PENDING'
      `;

      if (recentOrder.rows.length > 0) {
        return res.status(400).json({ error: "Duplicate order detected.", orderId: recentOrder.rows[0].id });
      }

      const result = await sql`
        INSERT INTO orders (customer_name, items, total_price, status, created_at) 
        VALUES (${name}, ${JSON.stringify(items)}, ${total}, 'PENDING', NOW()) 
        RETURNING *
      `;
      return res.json({ success: true, order: result.rows[0], orderId: result.rows[0].id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}