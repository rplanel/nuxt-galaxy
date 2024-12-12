import { boolean, integer, serial, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { HistoryState } from '@rplanel/galaxy-js'
import { galaxy, galaxyItem, historyStateEnum } from '../galaxy'
import { users as owners } from '../auth/users'
import { users } from './users'
import { analyses } from './analyses'
import { datasets } from './datasets'

export const histories = galaxy.table('histories', {
  id: serial('id').primaryKey(),
  state: historyStateEnum('state').$type<HistoryState>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  isSync: boolean('is_sync').notNull().default(false),
  ...galaxyItem,
})

export const historiesRelations = relations(histories, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [histories.userId],
      references: [users.id],
    }),
    owner: one(owners, {
      fields: [histories.ownerId],
      references: [owners.id],
    }),
    analysis: one(analyses),
    datasets: many(datasets),
  }
})
