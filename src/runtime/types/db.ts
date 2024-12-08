import type { Database } from './supabase'

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
