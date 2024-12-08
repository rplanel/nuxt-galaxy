import { serial, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

import { galaxy } from '../galaxy'
import { users } from './users'

/**
 * Instances
 */

export const instances = galaxy.table('instances', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 256 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
})

export const instancesRelations = relations(instances, ({ many }) => {
  return {
    users: many(users),
  }
})

export type Instance = typeof instances.$inferSelect
export type NewInstance = typeof instances.$inferInsert
