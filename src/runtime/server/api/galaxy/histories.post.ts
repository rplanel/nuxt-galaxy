import type { GalaxyClient } from '@rplanel/galaxy-js'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const $galaxy: GalaxyClient = event.context?.galaxy
  const galaxyHistory = await $galaxy.histories().createHistory(body.name)
  return galaxyHistory
})
