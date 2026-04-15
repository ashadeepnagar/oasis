import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { id, action } = req.query; // action can be 'complete' or 'cancel'

  if (req.method !== 'PUT') return res.status(405).end();

  try {
    let result;
    if (action === 'complete') {
      result = await sql`
        UPDATE orders SET status = 'COMPLETED', payment_completed_at = NOW() 
        WHERE id = ${id} RETURNING *`;
    } else if (action === 'cancel') {
      result = await sql`
        UPDATE orders SET status = 'CANCELLED' WHERE id = ${id} RETURNING *`;
    }

    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    return res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}