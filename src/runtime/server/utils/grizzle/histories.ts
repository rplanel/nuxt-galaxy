import { DatasetsTerminalStates, GalaxyClient, type DatasetTerminalState, type HistoryState } from '@rplanel/galaxy-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { eq, and } from 'drizzle-orm'
import { createError } from 'h3'
import { histories, type HistoryWithAnalysisDB } from '../../db/schema/galaxy/histories'

import { useDrizzle } from '../drizzle'
import { analyses } from '../../db/schema/galaxy/analyses'
import type { Database } from '../../../types/supabase'
import { analysisInputs } from '../../db/schema/galaxy/analysisInputs'
import { datasets } from '../../db/schema/galaxy/datasets'
import { getCurrentUser } from './user'
import { takeUniqueOrThrow } from './helper.js'
import { getOrCreateJob, isJobSync, synchronizeJob } from './jobs'
import { synchronizeInputDataset } from './datasets/input'
import { getInvocationOutputs } from './analyses'

// const supabase = useSupabaseClient();

export async function addHistory(name: string, ownerId: string) {
  const { public: { galaxy: { url } }, galaxy: { apiKey, email } } = useRuntimeConfig()
  const currentUser = await getCurrentUser(url, email)
  if (currentUser) {
    const { user } = currentUser
    // get the galaxy client
    const galaxyClient = GalaxyClient.getInstance(apiKey, url)
    const galaxyHistory = await galaxyClient.histories().createHistory(name)
    if (galaxyHistory?.id) {
      try {
        const historiesDb = await useDrizzle().insert(histories)
          .values(
            {
              name: name,
              ownerId,
              state: 'new',
              userId: user.id,
              galaxyId: galaxyHistory.id,
            },
          ).returning({
            id: histories.id,
            galaxyId: histories.galaxyId,
          })

        if (historiesDb && historiesDb.length === 1) {
          return historiesDb[0]
        }
        else {
          createError({
            statusCode: 500,
            statusMessage: 'Should have created only one history',
          })
        }
      }
      catch (error) {
        // delete galaxy history
        console.log(error)
        await galaxyClient.histories().deleteHistory(galaxyHistory.id)
      }
    }
    else {
      throw createError({
        statusCode: 500,
        statusMessage: 'No Galaxy id return',
      })
    }
  }
  else {
    throw createError({
      statusCode: 500,
      statusMessage: 'No current user found',
    })
  }
}

export async function synchronizeHistory(historyId: number, ownerId: string, supabase: SupabaseClient<Database>) {
  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const historyDb: HistoryWithAnalysisDB = await useDrizzle()
    .select()
    .from(histories)
    .innerJoin(analyses, eq(analyses.historyId, histories.id))
    .where(and(eq(histories.id, historyId), eq(histories.ownerId, ownerId)))
    .then(takeUniqueOrThrow)
  if (historyDb) {
    const isSync = await isHistorySync(historyId, historyDb.analyses.id, ownerId)
    if (isSync) {
      return
    }
    const galaxyHistoryId = historyDb.histories.galaxyId

    // check inputs
    const analysisInputsDb = await useDrizzle()
      .select()
      .from(analysisInputs)
      .innerJoin(datasets, eq(datasets.id, analysisInputs.datasetId))
      .where(
        and(
          eq(analysisInputs.analysisId, historyDb.analyses.id),
          eq(datasets.ownerId, ownerId),
        ),
      )
    for (const analysisInput of analysisInputsDb) {
      synchronizeInputDataset(
        analysisInput.datasets.galaxyId,
        historyDb.analyses.id,
        historyId,
        supabase,
        ownerId,
      )
    }
    // if history not sync, need to sync jobs
    await synchronizeJobs(historyDb.analyses.id, historyDb.histories.id, ownerId, supabase)
    // Make a Galaxy request only if the state is not terminal
    if (!isHistoryTerminalState(historyDb.histories.state)) {
      const galaxyHistory = await galaxyClient.histories().getHistory(galaxyHistoryId)
      if (historyDb.histories.state !== galaxyHistory.state) {
        await useDrizzle()
          .update(histories)
          .set({ state: galaxyHistory.state })
          .where(eq(histories.id, historyId))
          .returning({ historyId: histories.id, state: histories.state })
          .then(takeUniqueOrThrow)
      }
    }
  }
}

export async function synchronizeJobs(
  analysisId: number,
  historyId: number,
  ownerId: string,
  supabase: SupabaseClient<Database>,
) {
  const invocationOutputs = await getInvocationOutputs(analysisId, ownerId)
  if (invocationOutputs) {
    return Promise.all(Object
      .entries(invocationOutputs)
      .map(async ([galaxyJobId, { galaxyDatasetIds, stepId }]) => {
        return synchronizeJob(
          galaxyJobId,
          stepId,
          analysisId,
          historyId,
          galaxyDatasetIds,
          ownerId,
          supabase,
        )
      }),
    )
  }
}

export function isHistoryTerminalState(state: HistoryState) {
  return DatasetsTerminalStates.includes(state as DatasetTerminalState)
}

export async function isHistorySync(historyId: number, analysisId: number, ownerId: string) {
  // historydb.issync OR history in terminal state AND Job sync

  const historyDb = await useDrizzle()
    .select()
    .from(analyses)
    .innerJoin(histories, eq(histories.id, analyses.historyId))
    .where(
      and(
        eq(histories.id, historyId),
        eq(histories.ownerId, ownerId),
      ),
    )
    .then(takeUniqueOrThrow)
    // historyDb.analyses.

  const isSync = historyDb.histories.isSync
  if (isSync) return true

  // need to get all the jobs that have outputs and all the outputs for each job
  const jobsWithOutputs = await getInvocationOutputs(analysisId, ownerId)
  // console.log(jobsWithOutputs)
  if (jobsWithOutputs) {
    const allJobsSync = await Promise.all(
      Object.entries(jobsWithOutputs)
        .map(async ([galaxyJobId, { galaxyDatasetIds, stepId }]) => {
          const jobDb = await getOrCreateJob(analysisId, galaxyJobId, stepId, ownerId)
          return isJobSync(jobDb.id, galaxyDatasetIds, ownerId)
        }))
    const historyIsSync = isHistoryTerminalState(historyDb.histories.state) && allJobsSync.every(d => d)
    // update history entry to set flag isSync to true

    if (historyIsSync) {
      await useDrizzle()
        .update(histories)
        .set({ isSync: true })
        .where(and(
          eq(histories.ownerId, ownerId),
          eq(histories.id, historyId),
        ))
    }
    return historyIsSync
  }
  return false
}
