import type { SupabaseClient } from '@supabase/supabase-js'
import { GalaxyClient } from '@rplanel/galaxy-js'
import { eq, and } from 'drizzle-orm'
import { datasets } from '../../../db/schema/galaxy/datasets'
import { analysisOuputs } from '../../../db/schema/galaxy/analysisOutputs'
import { histories } from '../../../db/schema/galaxy/histories'
import { useDrizzle } from '../../drizzle'
import { takeUniqueOrThrow } from '../helper'
import { isDatasetTerminalState } from '../datasets'

export async function getOrCreateOutputDataset(
  galaxyDatasetId: string,
  analysisId: number,
  historyId: number,
  jobId: number,
  supabase: SupabaseClient,
  ownerId: string,
) {
  // check if dataset exists
  const datasetDb = await useDrizzle()
    .select()
    .from(datasets)
    .innerJoin(analysisOuputs, eq(datasets.id, analysisOuputs.datasetId))
    .where(and(
      eq(datasets.galaxyId, galaxyDatasetId),
      eq(datasets.historyId, historyId),
      eq(datasets.ownerId, ownerId),
    ))
    .then(takeUniqueOrThrow)
  if (datasetDb) return datasetDb.analysis_ouputs

  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  // get the galaxy client
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const historyDb = await useDrizzle()
    .select()
    .from(histories)
    .where(and(
      eq(histories.id, historyId),
      eq(histories.ownerId, ownerId),
    ))
    .then(takeUniqueOrThrow)
  const galaxyDataset = await galaxyClient.datasets().getDataset(galaxyDatasetId, historyDb.galaxyId)
  const isDatasetTerminal = isDatasetTerminalState(galaxyDataset.state)
  console.log(`${galaxyDataset.state} => is terminale : ${isDatasetTerminal}`)
  if (isDatasetTerminal) {
    const datasetBlob = await galaxyClient.histories()
      .downloadDataset(
        historyDb.galaxyId,
        galaxyDatasetId,
      )
    if (datasetBlob) {
      const { data, error } = await supabase.storage
        .from('analysis_files')
        .upload(`${crypto.randomUUID()}/${galaxyDataset.name}`, datasetBlob)
      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
      }
      if (data) {
        return useDrizzle()
          .insert(datasets)
          .values({
            galaxyId: galaxyDatasetId,
            name: galaxyDataset.name,
            ownerId,
            storageObjectId: data.id,
            historyId,
            uuid: galaxyDataset.uuid,
            dataLines: galaxyDataset.metadata_comment_lines || 0,
            extension: galaxyDataset.extension,
            fileSize: galaxyDataset.file_size,
          })
          .onConflictDoNothing()
          .returning()
          .then(takeUniqueOrThrow)
          .then((datasetDb) => {
            if (datasetDb) return useDrizzle()
              .insert(analysisOuputs)
              .values({
                analysisId,
                datasetId: datasetDb.id,
                jobId,
                state: galaxyDataset.state,
              })
              .returning()
              .onConflictDoNothing()
              .then(takeUniqueOrThrow)
          })
      }
    }
  }
}
export async function synchronizeOutputDataset(
  galaxyDatasetId: string,
  analysisId: number,
  historyId: number,
  jobId: number,
  supabase: SupabaseClient,
  ownerId: string,
) {
  const datasetDb = await getOrCreateOutputDataset(galaxyDatasetId, analysisId, historyId, jobId, supabase, ownerId)
  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  if (datasetDb) {
    const isSync = await isOutputDatasetSync(galaxyDatasetId, jobId, ownerId)
    if (isSync) return
    const isTerminal = isDatasetTerminalState(datasetDb.state)
    if (!isTerminal) {
      const historyDb = await useDrizzle()
        .select()
        .from(histories)
        .where(and(
          eq(histories.id, historyId),
          eq(histories.ownerId, ownerId),
        ))
        .then(takeUniqueOrThrow)
      const galaxyDataset = await galaxyClient.datasets().getDataset(galaxyDatasetId, historyDb.galaxyId)
      if (datasetDb.state !== galaxyDataset.state) {
        await useDrizzle()
          .update(analysisOuputs)
          .set({ state: galaxyDataset.state })
          .where(eq(analysisOuputs.id, datasetDb.id))
          .returning({ updatedId: analysisOuputs.id })
          .then(takeUniqueOrThrow)
      }
    }
  }
}

export async function isOutputDatasetSync(galaxyDatasetId: string, jobId: number, ownerId: string) {
  const datasetDb = await useDrizzle()
    .select({ state: analysisOuputs.state })
    .from(analysisOuputs)
    .innerJoin(datasets, eq(datasets.id, analysisOuputs.datasetId))
    .where(
      and(
        eq(datasets.galaxyId, galaxyDatasetId),
        eq(datasets.ownerId, ownerId),
        eq(analysisOuputs.jobId, jobId),
      ),
    )
    .then(takeUniqueOrThrow)
  return datasetDb?.state ? isDatasetTerminalState(datasetDb.state) : false
}
