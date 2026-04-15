import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.POSTGRES_URL);

  // --- 1. HANDLE UPDATES (PUT) ---
  if (req.method === 'PUT') {
    const { id, action } = req.query; 
    try {
      let result;
      if (action === 'complete') {
        result = await sql`UPDATE orders SET status = 'COMPLETED', payment_completed_at = NOW() WHERE id = ${id} RETURNING *`;
      } else if (action === 'cancel') {
        result = await sql`UPDATE orders SET status = 'CANCELLED' WHERE id = ${id} RETURNING *`;
      }
      return res.status(200).json({ success: true, order: result[0] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- 2. HANDLE FETCHING (GET) ---
  if (req.method === 'GET') {
    const { type } = req.query;
    try {
      // We ALIAS the columns here to match dashboard.js expectations
      const query = type === 'pending' 
        ? await sql`SELECT id, customer_name, items, total_price, status, created_at FROM orders WHERE status = 'PENDING' ORDER BY created_at DESC`
        : await sql`SELECT id, customer_name, items, total_price, status, created_at FROM orders ORDER BY created_at DESC`;
      
      return res.status(200).json({ success: true, orders: query });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- 3. HANDLE CREATION (POST) ---
  if (req.method === 'POST') {
    const { name, items, total } = req.body;
    try {
      const result = await sql`
        INSERT INTO orders (customer_name, items, total_price, status)
        VALUES (${name}, ${JSON.stringify(items)}, ${total}, 'PENDING')
        RETURNING id;
      `;
      return res.status(200).json({ success: true, orderId: result[0].id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}