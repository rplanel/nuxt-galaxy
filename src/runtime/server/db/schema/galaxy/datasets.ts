import {
  integer,
  primaryKey,
  serial,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { eq, getTableColumns, relations } from 'drizzle-orm'
import { galaxy, galaxyItem } from '../galaxy'
import { users as owners } from '../auth/users'
import { objects } from '../storage/objects'
import { tags } from './tags'
import { analysisInputs } from './analysisInputs'
import { histories } from './histories'
import { analysisOuputs } from './analysisOutputs'

/**
 * Datasets
 */

const { name, ...galaxyItemNoName } = galaxyItem

export const datasets = galaxy.table('datasets', {
  id: serial('id').primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  historyId: integer('history_id').notNull().references(() => histories.id, { onDelete: 'cascade' }),
  storageObjectId: uuid('storage_object_id').notNull().references(
    () => objects.id, { onDelete: 'cascade' },
  ),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  uuid: uuid('uuid').notNull().unique(),
  extension: varchar('extension', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  dataLines: integer('data_lines'),
  datasetName: varchar('dataset_name', { length: 256 }).notNull(),
  ...galaxyItemNoName,
}, t => ({
  unique: unique().on(t.historyId, t.galaxyId),
}),
)

export const datasetsRelations = relations(datasets, ({ many, one }) => {
  return {
    datasetTags: many(datasetsToTags),
    analysisInput: one(analysisInputs),
    analysisOuput: one(analysisOuputs),
    owner: one(owners, {
      fields: [datasets.ownerId],
      references: [owners.id],
    }),
    history: one(histories, {
      fields: [datasets.historyId],
      references: [histories.id],
    }),
    storageObject: one(objects, {
      fields: [datasets.storageObjectId],
      references: [objects.id],
    }),
  }
})

/**
 * datasets view
 */

export const datasetsWithStoragePath = galaxy.view('datasets_with_storage_path')
  .as(
    (qb) => {
      return qb.select({
        ...getTableColumns(datasets),
        storageObjectPath: objects.name,
      }).from(datasets)
        .innerJoin(objects, eq(datasets.storageObjectId, objects.id))
    },
  )

/**
 * Datasets tags
 */

export const datasetsToTags = galaxy.table('datasets_to_tags', {
  datasetId: integer('dataset_id').notNull().references(() => datasets.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, t => ({
  pk: primaryKey({ columns: [t.datasetId, t.tagId] }),
}))

export const datasetsToTagsRelations = relations(datasetsToTags, ({ one }) => {
  return {
    dataset: one(datasets, {
      fields: [datasetsToTags.datasetId],
      references: [datasets.id],
    }),
    tag: one(tags, {
      fields: [datasetsToTags.tagId],
      references: [tags.id],
    }),
  }
})
