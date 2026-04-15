import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Use the automatically injected Vercel environment variable
  const sql = neon(process.env.POSTGRES_URL);

  if (req.method === 'POST') {
    const { name, items, total } = req.body;

    try {
      // Create table if missing
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name TEXT,
          items JSONB,
          total_price INT,
          status TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Insert order
      const result = await sql`
        INSERT INTO orders (customer_name, items, total_price, status)
        VALUES (${name}, ${JSON.stringify(items)}, ${total}, 'PENDING')
        RETURNING id;
      `;

      return res.status(200).json({ success: true, orderId: result[0].id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}