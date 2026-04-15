import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.POSTGRES_URL);

  // 1. GET REQUESTS (For the Dashboard)
  if (req.method === 'GET') {
    const { type } = req.query; // 'pending' or 'all'
    try {
      let result;
      if (type === 'pending') {
        result = await sql`SELECT * FROM orders WHERE status = 'PENDING' ORDER BY created_at DESC`;
      } else {
        result = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      }
      return res.status(200).json({ success: true, orders: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. POST REQUESTS (From the Menu/Cart)
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