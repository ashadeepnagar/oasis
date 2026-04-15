import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Vercel parses req.body automatically for JSON
  if (req.method === 'POST') {
    const { name, items, total } = req.body;

    try {
      // Step 1: Ensure the table exists in your Neon DB
      await sql`CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT,
        items JSONB,
        total_price INT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;

      // Step 2: Insert the order
      const result = await sql`
        INSERT INTO orders (customer_name, items, total_price, status)
        VALUES (${name}, ${JSON.stringify(items)}, ${total}, 'PENDING')
        RETURNING id;
      `;

      return res.status(200).json({ success: true, orderId: result.rows[0].id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}