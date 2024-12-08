import { serial, uuid, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { galaxy } from '../galaxy'
import { objects } from '../storage/objects'
import { users as owners } from '../auth/users'

export const uploadedDatasets = galaxy.table('uploaded_datasets', {
  id: serial('id').primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  name: text('name'),
  storageObjectId: uuid('storage_object_id').notNull().references(
    () => objects.id, { onDelete: 'cascade' },
  ).unique(),

})

export const analysisOuputsRelations = relations(uploadedDatasets, ({ one }) => {
  return {
    owner: one(owners, {
      fields: [uploadedDatasets.ownerId],
      references: [owners.id],
    }),
    storageObject: one(objects, {
      fields: [uploadedDatasets.storageObjectId],
      references: [objects.id],
    }),
  }
})

export type UploadedDatasetDb = typeof uploadedDatasets.$inferSelect
