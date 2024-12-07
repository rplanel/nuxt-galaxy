import type { Datamap, GalaxyWorkflowParameters } from "@rplanel/galaxy-js"

export interface AnalysisBody {
    name: string
    datamap: Datamap
    parameters: GalaxyWorkflowParameters
    workflowId: number
}