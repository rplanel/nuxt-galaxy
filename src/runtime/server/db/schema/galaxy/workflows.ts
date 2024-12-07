import { integer, json, primaryKey, serial, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { galaxy, galaxyItem } from "../galaxy";
import { users } from "./users";
import { tags } from "./tags";
import { analyses } from "./analyses";
/**
 * Workflows
 */
export const workflows = galaxy.table("workflows", {
    id: serial("id").primaryKey(),
    version: integer("version").notNull().default(1),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    definition: json("definition").notNull(),
    ...galaxyItem,
}, (t) => ({
    unique: unique().on(t.galaxyId, t.version),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => {
    return {
        user: one(users, {
            fields: [workflows.userId],
            references: [users.id],
        }),
        workflowTags: many(workflowsToTags),
        analyses: many(analyses),
    };
});

/**
 * workflowsToTags
 */
export const workflowsToTags = galaxy.table("workflows_to_tags", {
    workflowId: integer("workflow_id").notNull().references(() => workflows.id),
    tagId: integer("tag_id").notNull().references(() => tags.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.workflowId, t.tagId] }),
}));

export const workflowsToTagsRelations = relations(
    workflowsToTags,
    ({ one }) => {
        return {
            workflow: one(workflows, {
                fields: [workflowsToTags.workflowId],
                references: [workflows.id],
            }),
            tag: one(tags, {
                fields: [workflowsToTags.tagId],
                references: [tags.id],
            }),
        };
    },
);
