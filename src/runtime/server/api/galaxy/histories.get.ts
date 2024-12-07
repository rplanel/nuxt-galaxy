import type { GalaxyClient } from '@rplanel/galaxy-js'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { defineEventHandler } from 'h3'
import type { Database } from '../../../types/supabase'

export default defineEventHandler(async (event) => {
  if (event.context?.supabase) {
    const { client: supabaseClient }: { user: User, client: SupabaseClient<Database> } = event.context.supabase
    const $galaxy: GalaxyClient = event.context?.galaxy
    const { data: historiesDb } = await supabaseClient
      .schema('galaxy')
      .from('histories')
      .select()
    if (historiesDb) {
      return Promise.all(historiesDb.map((h) => {
        return $galaxy.histories().getHistory(h.galaxy_id)
      }))
    }
  }
})
