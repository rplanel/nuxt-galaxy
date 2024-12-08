import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as histories from '../db/schema/galaxy/histories'
import * as analyses from '../db/schema/galaxy/analyses'
import * as datasets from '../db/schema/galaxy/datasets'
import * as instances from '../db/schema/galaxy/instances'
import * as users from '../db/schema/galaxy/users.js'
import * as tags from '../db/schema/galaxy/tags.js'
import * as workflows from '../db/schema/galaxy/workflows.js'
import * as analysisInputs from '../db/schema/galaxy/analysisInputs.js'
import * as analysisOutputs from '../db/schema/galaxy/analysisOutputs.js'
import * as uploadedDatasets from '../db/schema/galaxy/uploadedDatasets'

export { and, eq, or, sql } from 'drizzle-orm'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!)

export function useDrizzle() {
  return drizzle(client, {
    schema: {
      ...histories,
      ...analyses,
      ...datasets,
      ...instances,
      ...users,
      ...tags,
      ...workflows,
      ...analysisInputs,
      ...analysisOutputs,
      ...uploadedDatasets,
    },
  })
}
