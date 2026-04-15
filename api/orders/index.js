import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.POSTGRES_URL);

  // --- HANDLE STATUS UPDATES (PUT) ---
  if (req.method === 'PUT') {
    const { id, action } = req.query; // e.g., /api/orders?id=5&action=complete

    try {
      let result;
      if (action === 'complete') {
        result = await sql`
          UPDATE orders 
          SET status = 'COMPLETED', payment_completed_at = NOW() 
          WHERE id = ${id} 
          RETURNING *`;
      } else if (action === 'cancel') {
        result = await sql`
          UPDATE orders 
          SET status = 'CANCELLED' 
          WHERE id = ${id} 
          RETURNING *`;
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ success: true, order: result[0] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // --- KEEP YOUR GET AND POST LOGIC BELOW ---
  // (Include the GET logic for 'pending' and 'all' here as well)
}