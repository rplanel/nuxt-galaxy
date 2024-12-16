import type { GalaxyToolParameters, WorkflowStep, HistoryState, InvocationState, JobState, Datamap, GalaxyWorkflowParameters } from '@rplanel/galaxy-js'
import type { users } from '../server/db/schema/galaxy/users.js'
import type { uploadedDatasets } from '../server/db/schema/galaxy/uploadedDatasets.js'
import type { instances } from '../server/db/schema/galaxy/instances.js'
import type { histories } from '../server/db/schema/galaxy/histories.js'
import type { analyses } from '../server/db/schema/galaxy/analyses.js'
import type { datasets } from '../server/db/schema/galaxy/datasets.js'
import type { Database } from './database.js'

export interface WorkflowToolsParameters {
  step: WorkflowStep
  parameters?: GalaxyToolParameters[] | undefined
  id: string
}
export type RowAnalysis = Database['galaxy']['Tables']['analyses']['Row']
export type RowAnalysisInput = Database['galaxy']['Tables']['analysis_inputs']['Row']
export type RowAnalysisOutputs = Database['galaxy']['Tables']['analysis_ouputs']['Row']
export type RowAnalysisJob = Database['galaxy']['Tables']['jobs']['Row']
export type RowAnalaysisDataset = Database['galaxy']['Tables']['datasets']['Row']
export interface AnalysisInputsWithDatasets extends RowAnalysisInput {
  datasets: RowAnalaysisDataset
}
export interface AnalysisOutputsWithDatasets extends RowAnalysisOutputs {
  datasets: RowAnalaysisDataset
}
export type AnalysisIOWithDatasets = AnalysisInputsWithDatasets | AnalysisOutputsWithDatasets
export interface AnalysisDetail extends RowAnalysis {
  workflows: Database['galaxy']['Tables']['workflows']['Row']
  histories: Database['galaxy']['Tables']['histories']['Row']
  jobs?: RowAnalysisJob[]
  analysis_inputs?: AnalysisInputsWithDatasets[]
  analysis_ouputs?: AnalysisOutputsWithDatasets[]
}
export interface Sync {
  isTerminalState: boolean
  updated: boolean
}
export interface SyncDatasets extends Sync {
  datasetId: number
}
export interface SyncJob extends Sync {
  state: JobState
  jobId: number
  isSync: boolean
  stderr?: string | null
  stdout?: string | null
  outputs?: SyncDatasets[]
}
export interface SyncHistory extends Sync {
  state: HistoryState
  historyId: number
  isSync: boolean
  jobs?: SyncJob[]
  outputs?: SyncDatasets[]
}
export interface UpdatedAnalysisLog extends Sync {
  analysisId: number
  state: InvocationState
  history: SyncHistory
  isSync: boolean
}
export interface AnalysisBody {
  name: string
  datamap: Datamap
  parameters: GalaxyWorkflowParameters
  workflowId: number
}
export declare const RoleTypes: readonly ['admin', 'user']
export type RoleType = typeof RoleTypes[number]
export declare const RolePermissions: readonly ['workflows.insert', 'workflows.delete', 'instances.insert', 'instances.delete']
export type RolePermission = typeof RolePermissions[number]
export type AnalysisDb = typeof analyses.$inferSelect
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UploadedDatasetDb = typeof uploadedDatasets.$inferSelect
export type Instance = typeof instances.$inferSelect
export type NewInstance = typeof instances.$inferInsert
export type HistoryDb = typeof histories.$inferSelect
export interface HistoryWithAnalysisDB {
  histories: HistoryDb
  analyses: AnalysisDb
}
export type DatasetDb = typeof datasets.$inferSelect