import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { workflows } from '../../db/schema/galaxy/workflows'
import { useDrizzle } from '../drizzle'
import { takeUniqueOrThrow } from './helper'
import { getCurrentUser } from './user'
import { useRuntimeConfig } from '#imports'

export async function getCurrentGalaxyWorkflow() {
  const { public: { galaxy: { url } }, galaxy: { email } } = useRuntimeConfig()
  const currentUser = await getCurrentUser(url, email)
  if (currentUser) {
    const { user } = currentUser
    const galaxyWorkflows = await useDrizzle().select().from(workflows).where(
      eq(workflows.userId, user.id),
    )
    if (galaxyWorkflows.length === 1) {
      return galaxyWorkflows[0]
    }
    else {
      if (galaxyWorkflows.length === 0) {
        throw createError('No galaxy workflow defined')
      }
      else {
        throw createError('Multiple galaxy user.')
      }
    }
  }
}

export async function getWorkflow(workflowId: number) {
  const { public: { galaxy: { url } }, galaxy: { email } } = useRuntimeConfig()
  const currentUser = await getCurrentUser(url, email)
  if (currentUser) {
    const { user } = currentUser
    const galaxyWorkflows = await useDrizzle()
      .select()
      .from(workflows)
      .where(
        eq(workflows.id, workflowId),
      ).then(takeUniqueOrThrow)
    return galaxyWorkflows.userId === user.id ? galaxyWorkflows : undefined
  }
}
