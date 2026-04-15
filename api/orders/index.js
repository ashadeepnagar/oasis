import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // This is the simplest query to test if the DB connection is alive
    const result = await sql`SELECT NOW();`;
    
    return res.status(200).json({ 
      success: true, 
      message: "Database connected!", 
      time: result.rows[0] 
    });
  } catch (error) {
    // This will help you see the error in the browser instead of just a crash
    console.error("Database Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: "Check if your Environment Variables are set in Vercel Settings."
    });
  }
}