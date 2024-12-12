import { serial } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { galaxy } from '../galaxy'
import { userRoles } from './userRoles'
import { rolePermissions } from './rolePermissions'
import { RoleTypes, type RoleType } from '~/src/runtime/types'

export const roleTypeEnum = galaxy.enum('role_type', RoleTypes)
export const roles = galaxy.table('roles', {
  id: serial('id').primaryKey(),
  name: roleTypeEnum('name').$type<RoleType>().notNull(),
})

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}))
