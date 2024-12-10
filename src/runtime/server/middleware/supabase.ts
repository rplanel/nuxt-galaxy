import { defineEventHandler, parseCookies } from 'h3'
import type { Database } from '../../types/supabase'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event)
  const { supabase: { authTokenName } } = useRuntimeConfig()
  if (cookies[authTokenName]) {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient<Database>(event)
    event.context.supabase = { user, client }
  }
})
