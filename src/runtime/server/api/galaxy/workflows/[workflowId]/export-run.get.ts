import type { GalaxyClient } from '@rplanel/galaxy-js'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const workflowId = getRouterParam(event, 'workflowId')
  const $galaxy: GalaxyClient = event.context?.galaxy
  if (workflowId && $galaxy) {
    return $galaxy.workflows().exportWorkflow(workflowId, 'run')
    // return wf
  }
  else {
    throw createError({ statusCode: 500, statusMessage: 'Could not export workflow' })
  }
})
