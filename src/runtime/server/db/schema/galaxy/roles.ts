import { serial } from "drizzle-orm/pg-core";
import { galaxy } from "../galaxy";
import { userRoles } from "./userRoles";
import { relations } from "drizzle-orm";
import { rolePermissions } from './rolePermissions'
// 20240718100453

const RoleTypes = [
    "admin",
    "user",
] as const;

export type RoleType = typeof RoleTypes[number];
export const roleTypeEnum = galaxy.enum("role_type", RoleTypes);


export const roles = galaxy.table("roles", {
    id: serial("id").primaryKey(),
    name: roleTypeEnum('name').$type<RoleType>().notNull(),
})

export const rolesRelations = relations(roles, ({ many }) => ({
    userRoles: many(userRoles),
    rolePermissions: many(rolePermissions)
}));