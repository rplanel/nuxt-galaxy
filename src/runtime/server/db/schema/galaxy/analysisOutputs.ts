import { integer, serial, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { DatasetState } from '@rplanel/galaxy-js'
import { datasetStateEnum, galaxy } from '../galaxy'
import { datasets } from './datasets'
import { analyses } from './analyses'
import { jobs } from './jobs'

export const analysisOutputs = galaxy.table('analysis_outputs', {
  id: serial('id').primaryKey(),
  state: datasetStateEnum('state').$type<DatasetState>().notNull(),
  datasetId: integer('dataset_id').references(() => datasets.id, { onDelete: 'cascade' }).notNull(),
  analysisId: integer('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
}, t => ({
  unique: unique().on(t.datasetId, t.jobId),
}))

export const analysisOutputsRelations = relations(analysisOutputs, ({ one }) => {
  return {
    dataset: one(datasets, {
      fields: [analysisOutputs.datasetId],
      references: [datasets.id],
    }),
    analysis: one(analyses, {
      fields: [analysisOutputs.analysisId],
      references: [analyses.id],
    }),
    job: one(jobs, {
      fields: [analysisOutputs.jobId],
      references: [jobs.id],
    }),
  }
})
