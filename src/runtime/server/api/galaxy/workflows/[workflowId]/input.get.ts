import { defineEventHandler, getRouterParam } from 'h3'
import type { GalaxyClient, GalaxyTool } from '@rplanel/galaxy-js'

export default defineEventHandler(async (event) => {
  const workflowId = getRouterParam(event, 'workflowId')
  if (workflowId) {
    const $galaxy: GalaxyClient = event.context?.galaxy
    const galaxyWorkflow = await $galaxy.workflows().getWorkflow(workflowId)
    const workflowSteps = galaxyWorkflow.steps
    const stepToTool: Record<string, string> = {}
    let tools: Record<string, GalaxyTool> = {}
    // get input information for each tools of the workflow
    return Promise.all(
      Object.entries(workflowSteps)
        .filter(([_stepId, value]) => value.type === 'tool')
        .map(([stepId, value]) => {
          if (value.tool_id && value.tool_version) {
            stepToTool[stepId] = value.tool_id
            return $galaxy.tools().getTool(value.tool_id, value.tool_version)
          }
        }),
    ).then((toolsList) => {
      tools = toolsList.reduce<Record<string, GalaxyTool>>((acc, curr) => {
        if (curr?.id) {
          acc[curr.id] = curr
        }
        return acc
      }, {} as Record<string, GalaxyTool>)
      return { galaxyWorkflow, tools, stepToTool }
    })
  }
})
