import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Simple query to test the connection
    const result = await sql`SELECT NOW();`;
    return response.status(200).json({ time: result.rows[0] });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
