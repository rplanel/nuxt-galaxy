import {
  boolean,
  integer,
  json,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { relations } from 'drizzle-orm'
import type { InvocationState } from '@rplanel/galaxy-js'
import { galaxy, invocationStateEnum } from '../galaxy'
import { users as owners } from '../auth/users'
import { histories } from './histories'
import { workflows } from './workflows'
import { analysisInputs } from './analysisInputs'
import { analysisOuputs } from './analysisOutputs'
import { jobs } from './jobs'

export const analyses = galaxy.table('analyses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  state: invocationStateEnum('state').$type<InvocationState>().notNull(),
  parameters: json('parameters').notNull(),
  datamap: json('datamap').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  historyId: integer('history_id').notNull().unique().references(() =>
    histories.id, { onDelete: 'cascade' },
  ),
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  galaxyId: varchar('galaxy_id', { length: 256 }).notNull(),
  stderr: text('stderr'),
  stdout: text('stdout'),
  invocation: json('invocation').notNull(),
  isSync: boolean('is_sync').notNull().default(false),

})

export const analysesRelations = relations(analyses, ({ one, many }) => {
  return {
    workflow: one(workflows, {
      fields: [analyses.workflowId],
      references: [workflows.id],
    }),
    owner: one(owners, {
      fields: [analyses.ownerId],
      references: [owners.id],
    }),
    history: one(histories, {
      fields: [analyses.historyId],
      references: [histories.id],
    }),
    analysisInputs: many(analysisInputs),
    analysisOuputs: many(analysisOuputs),
    jobs: many(jobs),
  }
})

export type AnalysisDb = typeof analyses.$inferSelect
