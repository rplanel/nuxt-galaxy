import { relations } from 'drizzle-orm'
import { pgSchema, uuid } from 'drizzle-orm/pg-core'
import { analyses } from '../galaxy/analyses'
import { datasets } from '../galaxy/datasets'
import { histories } from '../galaxy/histories'
import { userRoles } from '../galaxy/userRoles'
import { uploadedDatasets } from '../galaxy/uploadedDatasets'

const authSchema = pgSchema('auth')

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

export const usersRelations = relations(users, ({ many, one }) => {
  return {
    analyses: many(analyses),
    datasets: many(datasets),
    uploadedDatasets: many(uploadedDatasets),
    histories: many(histories),
    role: one(userRoles),
  }
})
