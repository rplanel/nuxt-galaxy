import type { GalaxyToolParameters, WorkflowStep } from "@rplanel/galaxy-js";

export interface WorkflowToolsParameters {
    step: WorkflowStep
    parameters?: GalaxyToolParameters[] | undefined
    id: string
}