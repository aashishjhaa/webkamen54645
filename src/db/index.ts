import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const state = globalThis as typeof globalThis & { __webKamenPool?: Pool };
// Creating the lazy pool does not connect. Static pages build without credentials.
export const pool = state.__webKamenPool ?? new Pool({ connectionString:process.env.DATABASE_URL, max:3, idleTimeoutMillis:10000, connectionTimeoutMillis:3500 });
state.__webKamenPool = pool;
export const db = drizzle(pool);
