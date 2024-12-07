import { pgSchema, text, uuid } from "drizzle-orm/pg-core";
import { datasets } from "../galaxy/datasets";
import { relations } from "drizzle-orm";

const storageSchema = pgSchema("storage");

export const objects = storageSchema.table("objects", {
    id: uuid("id").primaryKey(),
    name: text("name"),
});

export const objectsRelations = relations(objects, ({ many }) => {
    return {
        datasets: many(datasets),
    };
});
