import { integer, serial, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { DatasetState } from '@rplanel/galaxy-js'
import { datasetStateEnum, galaxy } from '../galaxy'
import { datasets } from './datasets'
import { analyses } from './analyses'
import { jobs } from './jobs'

export const analysisOuputs = galaxy.table('analysis_ouputs', {
  id: serial('id').primaryKey(),
  state: datasetStateEnum('state').$type<DatasetState>().notNull(),
  datasetId: integer('dataset_id').references(() => datasets.id, { onDelete: 'cascade' }).notNull(),
  analysisId: integer('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
}, t => ({
  unique: unique().on(t.datasetId, t.jobId),
}))

export const analysisOuputsRelations = relations(analysisOuputs, ({ one }) => {
  return {
    dataset: one(datasets, {
      fields: [analysisOuputs.datasetId],
      references: [datasets.id],
    }),
    analysis: one(analyses, {
      fields: [analysisOuputs.analysisId],
      references: [analyses.id],
    }),
    job: one(jobs, {
      fields: [analysisOuputs.jobId],
      references: [jobs.id],
    }),
  }
})
