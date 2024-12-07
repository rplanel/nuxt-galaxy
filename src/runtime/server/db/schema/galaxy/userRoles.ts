import { integer, serial, unique, uuid } from "drizzle-orm/pg-core";
import { galaxy } from ".";

import { relations } from "drizzle-orm";
import { roles } from "./roles";
import { users  } from "../auth/users";


export const userRoles = galaxy.table("user_roles", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (table) => ({
    uniq: unique().on(table.userId, table.roleId)
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id]
    })
}));