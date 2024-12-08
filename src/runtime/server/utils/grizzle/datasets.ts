import { DatasetsTerminalStates, GalaxyClient } from '@rplanel/galaxy-js'
import type { Datamap, DatasetState, DatasetTerminalState } from '@rplanel/galaxy-js'
import { datasets } from '../../db/schema/galaxy/datasets.js'
import { useDrizzle } from '../drizzle.js'
import { takeUniqueOrThrow } from './helper.js'

export async function uploadDatasets(
  datamap: Datamap,
  galaxyHistoryId: string,
  historyId: number,
  ownerId: string,
) {
  const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
  const galaxyClient = GalaxyClient.getInstance(apiKey, url)
  const t = Object.keys(datamap)
  const datasetEntries = Object.entries(datamap)
  return Promise.all(
    datasetEntries.map(([step, { name, storage_object_id: storageObjectId }]) => {
      const srcUrl
                = 'https://dl.pasteur.fr/fop/C0UDRCyG/defense-finder-prot-sequences-input.fasta'
      return galaxyClient.histories().uploadFile(
        galaxyHistoryId,
        srcUrl,
      ).then((datasetHistory) => {
        return {
          step,
          name,
          uploadedDatasets: datasetHistory.outputs,
        }
      }).then(async ({ uploadedDatasets }) => {
        if (uploadedDatasets.length === 1) {
          const { id: uploadedGalaxyId, name, uuid, file_ext: extension, file_size: fileSize, create_time: createdAt, state } = uploadedDatasets[0]

          if (storageObjectId) {
            return useDrizzle()
              .insert(datasets)
              .values({
                name,
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
    }),
  )
}

export function isDatasetTerminalState(state: DatasetState) {
  return DatasetsTerminalStates.includes(state as DatasetTerminalState)
}
