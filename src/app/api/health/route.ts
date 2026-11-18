import { db } from '@/db';
import { sql } from 'drizzle-orm';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET() {
  try { if(process.env.DATABASE_URL)await db.execute(sql`select 1`);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({ok:false},{status:503}); }
}
