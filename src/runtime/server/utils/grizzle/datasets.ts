import { DatasetsTerminalStates, GalaxyClient } from '@rplanel/galaxy-js'
import type { Datamap, DatasetState, DatasetTerminalState } from '@rplanel/galaxy-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { datasets } from '../../db/schema/galaxy/datasets.js'
import { objects } from '../../db/schema/storage/objects.js'
import { eq, useDrizzle } from '../drizzle.js'
import { takeUniqueOrThrow } from './helper.js'
import { useRuntimeConfig } from '#imports'
import type { Database } from '~/src/runtime/types/database.js'
import { parseURL, stringifyParsedURL, withoutProtocol } from 'ufo'

export async function uploadDatasets(
  datamap: Datamap,
  galaxyHistoryId: string,
  historyId: number,
  ownerId: string,
  supabase: SupabaseClient<Database>,
) {
  const { public: { galaxy: { url } }, galaxy: { apiKey, localDocker } } = useRuntimeConfig()
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const datasetEntries = Object.entries(datamap)
  return Promise.all(
    datasetEntries.map(async ([step, { name, storage_object_id: storageObjectId }]) => {
      if (storageObjectId) {
        const storageObject = await useDrizzle()
          .select()
          .from(objects)
          .where(eq(objects.id, storageObjectId))
          .then(takeUniqueOrThrow)

        if (storageObject && storageObject?.name) {
          const { data } = await supabase.storage
            .from('analysis_files')
            .createSignedUrl(storageObject.name, 60)
          if (data) {
            const { signedUrl }
              = data
            let sanitizedSignedUrl = signedUrl
            
            if (localDocker) {
              const parsedSignedUrl = parseURL(signedUrl)
              parsedSignedUrl.host = 'host.docker.internal'
              sanitizedSignedUrl = withoutProtocol(stringifyParsedURL(parsedSignedUrl))
            }
            return galaxyClient.histories().uploadFile(
              galaxyHistoryId,
              sanitizedSignedUrl,
            ).then((datasetHistory) => {
              return {
                step,
                name,
                uploadedDatasets: datasetHistory.outputs,
              }
            }).then(async ({ uploadedDatasets }) => {
              if (uploadedDatasets.length === 1) {
                const { id: uploadedGalaxyId, name, uuid, file_ext: extension, file_size: fileSize, create_time: createdAt } = uploadedDatasets[0]
                if (storageObjectId) {
                  return useDrizzle()
                    .insert(datasets)
                    .values({
                      datasetName: name,
                      ownerId,
                      storageObjectId,
                      historyId,
                      uuid,
                      extension,
                      fileSize,
                      createdAt: new Date(createdAt),
                      dataLines: 0,
                      galaxyId: uploadedGalaxyId,
                    })
                    .returning({
                      insertedId: datasets.id,
                      galaxyId: datasets.galaxyId,
                    })
                    .then(takeUniqueOrThrow)
                }
              }
            }).then((datasetDb) => {
              if (datasetDb) {
                const { galaxyId, insertedId } = datasetDb
                return {
                  step,
                  galaxyId,
                  insertedId,
                }
              }
            })
          }
        }
      }
      else {
        throw new Error('Storage object id is required')
      }
    }),
  )
}

export function isDatasetTerminalState(state: DatasetState) {
  return DatasetsTerminalStates.includes(state as DatasetTerminalState)
}
