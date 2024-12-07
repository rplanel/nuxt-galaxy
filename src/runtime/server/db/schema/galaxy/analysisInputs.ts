import { integer, serial } from "drizzle-orm/pg-core";
import { datasetStateEnum, galaxy } from "../galaxy";
import { datasets } from "./datasets";
import { analyses } from "./analyses";
import { relations } from "drizzle-orm";
import type { DatasetState } from "@rplanel/galaxy-js";

export const analysisInputs = galaxy.table("analysis_inputs", {
    id: serial("id").primaryKey(),
    state: datasetStateEnum("state").$type<DatasetState>().notNull(),
    datasetId: integer("dataset_id").references(() => datasets.id, {onDelete: 'cascade'}).notNull()
        .unique(),
    analysisId: integer("analysis_id").references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
});

export const analysisInputsRelations = relations(analysisInputs, ({ one }) => {
    return {
        dataset: one(datasets, {
            fields: [analysisInputs.datasetId],
            references: [datasets.id],
        }),
        analysis: one(analyses, {
            fields: [analysisInputs.analysisId],
            references: [analyses.id],
        }),
    };
});
