import { and, eq, gte, lt, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contactGuards } from '@/db/schema';

type State = 'pending'|'sent'|'failed';
type Decision = 'reserved'|'already-sent'|'busy'|'limited';
const DAY = 86400000, WINDOW = 900000;
const local = new Map<string,{client:string;status:State;created:number;updated:number}>();
function existing(status:string,updated:number,now:number):Decision|undefined {
  if(status==='sent'&&now-updated<DAY)return 'already-sent';
  if(status==='pending'&&now-updated<90000)return 'busy';
  if(status==='failed'&&now-updated<12000)return 'limited';
}
export async function reserveInquiry(fingerprint:string,clientKey:string):Promise<Decision> {
  const now=Date.now();
  // Without Postgres, provider idempotency remains global; throttling is per instance.
  if (!process.env.DATABASE_URL) {
    for(const [k,r] of local)if(now-r.updated>DAY)local.delete(k);
    const row=local.get(fingerprint);const decision=row&&existing(row.status,row.updated,now);if(decision)return decision;
    if(local.size>2000||[...local.values()].filter(r=>r.client===clientKey&&now-r.created<WINDOW).length>=5)return 'limited';
    local.set(fingerprint,{client:clientKey,status:'pending',created:now,updated:now});return 'reserved';
  }
  return db.transaction(async tx=>{
    // Locks coordinate concurrent invocations, including separate Vercel instances.
    await tx.execute(sql`select pg_advisory_xact_lock(301, hashtext(${clientKey}))`);
    await tx.execute(sql`select pg_advisory_xact_lock(302, hashtext(${fingerprint}))`);
    await tx.delete(contactGuards).where(lt(contactGuards.updatedAt,new Date(now-DAY)));
    const [row]=await tx.select().from(contactGuards).where(eq(contactGuards.fingerprint,fingerprint)).limit(1);
    const decision=row&&existing(row.status,row.updatedAt.getTime(),now);if(decision)return decision;
    const [recent]=await tx.select({n:count()}).from(contactGuards).where(and(eq(contactGuards.clientKey,clientKey),gte(contactGuards.createdAt,new Date(now-WINDOW))));
    if(Number(recent.n)>=5)return 'limited';
    await tx.insert(contactGuards).values({fingerprint,clientKey,status:'pending'}).onConflictDoUpdate({target:contactGuards.fingerprint,set:{status:'pending',updatedAt:new Date(now)}});
    return 'reserved';
  });
}
export async function finishInquiry(fingerprint:string,status:State) {
  if(!process.env.DATABASE_URL){const row=local.get(fingerprint);if(row){row.status=status;row.updated=Date.now();}return;}
  await db.update(contactGuards).set({status,updatedAt:new Date()}).where(eq(contactGuards.fingerprint,fingerprint));
}
