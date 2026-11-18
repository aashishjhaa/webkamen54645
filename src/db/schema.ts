import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';

// Only keyed fingerprints and delivery state are retained; never the visitor's message.
export const contactGuards = pgTable('contact_delivery_guards', {
  fingerprint: varchar('fingerprint', { length:64 }).primaryKey(),
  clientKey: varchar('client_key', { length:64 }).notNull(),
  status: varchar('status', { length:12 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone:true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone:true }).defaultNow().notNull(),
}, table => [index('contact_guard_client_created').on(table.clientKey,table.createdAt),index('contact_guard_expiry').on(table.updatedAt)]);
