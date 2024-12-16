import type { GalaxyWorkflowInput } from '@rplanel/galaxy-js'
import { defineEventHandler, readBody } from 'h3'
import { getWorkflow } from '../../utils/grizzle/workflows'
import { runAnalysis } from '../../utils/grizzle/analyses.js'
import { addHistory } from '../../utils/grizzle/histories'
import { uploadDatasets } from '../../utils/grizzle/datasets'
import type { AnalysisBody } from '#build/types/nuxt-galaxy'

export default defineEventHandler<{ body: AnalysisBody }>(
  async (event) => {
    if (event.context?.supabase) {
      const { datamap, name, parameters, workflowId } = await readBody(event)
      const { user: supabaseUser } = event.context.supabase
      const workflow = await getWorkflow(workflowId)
      // create galaxy history
      const historyDb = await addHistory(name, supabaseUser.id)

      if (historyDb && workflow) {
      // upload all the datasets
        const datasets = await uploadDatasets(
          datamap,
          historyDb.galaxyId,
          historyDb.id,
          supabaseUser.id,
        )

        // load input dataset sous la forme de datamap mais comme id pg id
        const workflowInput: GalaxyWorkflowInput = {}
        const inputs = datasets.filter(data => data !== undefined)
          .reduce((acc, curr) => {
            if (curr) {
              const { step, galaxyId, insertedId } = curr
              acc[step] = {
                id: galaxyId,
                src: 'hda',
                dbid: insertedId,
              }
            }
            return acc
          }, workflowInput)
        // create the analysis.
        return runAnalysis(
          name,
          historyDb.galaxyId,
          workflow.galaxyId,
          historyDb.id,
          workflow.id,
          supabaseUser.id,
          inputs,
          parameters || {},
          datamap,
        )
      }
    }
  },
)
