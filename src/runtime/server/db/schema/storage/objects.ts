import { pgSchema, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { datasets } from '../galaxy/datasets'

const storageSchema = pgSchema('storage')

export const objects = storageSchema.table('objects', {
  id: uuid('id').primaryKey(),
  name: text('name'),
})

export const objectsRelations = relations(objects, ({ many }) => {
  return {
    datasets: many(datasets),
  }
})
