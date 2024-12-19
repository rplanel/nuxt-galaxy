import { GalaxyClient, JobTerminalStates, type JobState, type JobTerminalState } from '@rplanel/galaxy-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { eq, and } from 'drizzle-orm'
import type { Database } from '../../../types/database'
import { useDrizzle } from '../drizzle'
import { jobs } from '../../db/schema/galaxy/jobs'
import { isOutputDatasetSync, synchronizeOutputDataset } from './datasets/output.js'
import { takeUniqueOrThrow } from './helper'
import { useRuntimeConfig } from '#imports'

export async function getOrCreateJob(analysisId: number, galaxyJobId: string, stepId: number, ownerId: string) {
  // check if the job exists
  const jobExist = await useDrizzle()
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.galaxyId, galaxyJobId),
        eq(jobs.analysisId, analysisId),
      ),
    ).then(takeUniqueOrThrow)

  if (jobExist) return jobExist

  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  // get the galaxy client
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const galaxyJob = await galaxyClient.jobs().getJob(galaxyJobId)
  const { state, tool_id: toolId, create_time: createdAt, stderr, stdout, exit_code: exitCode } = galaxyJob
  return await useDrizzle()
    .insert(jobs)
    .values({
      galaxyId: galaxyJobId,
      stepId,
      state,
      toolId,
      ownerId,
      createdAt: new Date(createdAt),
      stderr,
      stdout,
      exitCode,
      analysisId,

    })
    .onConflictDoUpdate({
      target: [jobs.analysisId, jobs.galaxyId],
      set: { state, stderr, stdout, exitCode },
    })
    .returning()
    .then(takeUniqueOrThrow)
}

export async function synchronizeJob(
  galaxyJobId: string,
  stepId: number,
  analysisId: number,
  historyId: number,
  galaxyDatasetIds: string[],
  ownerId: string,
  supabase: SupabaseClient<Database>,
) {
  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const jobDb = await getOrCreateJob(analysisId, galaxyJobId, stepId, ownerId)
  const isSync = await isJobSync(jobDb.id, galaxyDatasetIds, ownerId)

  if (isSync) return
  await synchronizeOutputDatasets(jobDb.id, galaxyDatasetIds, analysisId, historyId, ownerId, supabase)
  const isJobDbterminal = isJobTerminalState(jobDb.state)

  if (!isJobDbterminal) {
    const galaxyJob = await galaxyClient.jobs().getJob(galaxyJobId)
    if (jobDb.state !== galaxyJob.state) {
      await useDrizzle()
        .update(jobs)
        .set({
          state: galaxyJob.state,
          stderr: galaxyJob.stderr,
          stdout: galaxyJob.stdout,
        })
        .where(eq(jobs.id, jobDb.id))
        .returning({
          jobId: jobs.id,
          state: jobs.state,
        })
        .then(takeUniqueOrThrow)
    }
  }
}

export async function synchronizeOutputDatasets(
  jobId: number,
  galaxyDatasetIds: string[],
  analysisId: number,
  historyId: number,
  ownerId: string,
  supabase: SupabaseClient<Database>,
) {
  return Promise.all(galaxyDatasetIds.map(async (galaxyDatasetId) => {
    // Check if dataset in the db
    return synchronizeOutputDataset(galaxyDatasetId, analysisId, historyId, jobId, supabase, ownerId)
  }))
}

export async function isJobSync(jobId: number, datasetIds: string[] | undefined, ownerId: string) {
  const jobDb = await useDrizzle()
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.ownerId, ownerId),
      ),
    )
    .then(takeUniqueOrThrow)
  const isSync = jobDb.isSync

  if (isSync) return true
  if (datasetIds) {
    const jobIsSync = await Promise.all(datasetIds?.map((id) => {
      return isOutputDatasetSync(id, jobId, ownerId)
    })).then((datasetsSync) => {
      return datasetsSync.every(d => d)
    }) && isJobTerminalState(jobDb.state)

    if (jobIsSync) {
      await useDrizzle()
        .update(jobs)
        .set({ isSync: true })
        .where(and(
          eq(jobs.ownerId, ownerId),
          eq(jobs.id, jobId),
        ))
    }
    return jobIsSync
  }
  return false

  // jobdb.isSync OR job terminal state AND all output datasets in the db are sync
}

export function isJobTerminalState(state: JobState) {
  // add state pause since event if not a terminal state, we want to stop the sync because user have no access to galaxy job
  const additionalState: JobState[] = ['paused']
  return [...additionalState, ...JobTerminalStates].includes(state as JobTerminalState)
}
