
import { integer, serial, unique } from "drizzle-orm/pg-core";
import { galaxy } from "../galaxy";
import { roles } from "./roles";
import { relations } from "drizzle-orm";


const RolePermissions = [
  'workflows.insert',
  'workflows.delete',
  'instances.insert',
  'instances.delete',
] as const
export type RolePermission = typeof RolePermissions[number];
export const rolePermissionsTypeEnum = galaxy.enum(
  "role_permissions_type",
  RolePermissions
);


export const rolePermissions = galaxy.table("role_permissions", {
  id: serial("id").primaryKey(),
  permission: rolePermissionsTypeEnum('permission').$type<RolePermission>().notNull(),
  roleId: integer('role_id').notNull().references(() => roles.id)
}, (table) => ({
  uniq: unique().on(table.permission, table.roleId)
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => {
  return {
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id]
    })
  }
})