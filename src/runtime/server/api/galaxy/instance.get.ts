// import { useRuntimeConfig } from '@nuxt/kit'
import type { GalaxyClient } from '@rplanel/galaxy-js'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { public: { galaxy: { url } } } = useRuntimeConfig()
  const $galaxy: GalaxyClient = event.context?.galaxy
  const version = await $galaxy.getVersion()
  return { url, ...version }
})
