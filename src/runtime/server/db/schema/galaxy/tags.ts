import { serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workflowsToTags } from "./workflows";
import { galaxy } from "../galaxy";
import { datasetsToTags } from "./datasets";

/**
 * Tags
 */
export const tags = galaxy.table("tags", {
    id: serial("id").primaryKey(),
    label: varchar("label", { length: 75 }).notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => {
    return {
        workflows: many(workflowsToTags),
        datasets: many(datasetsToTags),
    };
});
