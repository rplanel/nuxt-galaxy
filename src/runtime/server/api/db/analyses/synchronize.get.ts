import { defineEventHandler } from 'h3'
import { synchronizeAnalyses } from '../../../utils/grizzle/analyses'

export default defineEventHandler(
  async (event) => {
    if (event.context?.supabase) {
      const { user: supabaseUser, client: supabaseClient } = event.context.supabase
      return await synchronizeAnalyses(supabaseClient.id, supabaseUser.id)
    }
  },
)
