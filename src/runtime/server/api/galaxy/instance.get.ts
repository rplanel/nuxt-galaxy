// import { useRuntimeConfig } from '@nuxt/kit'
import type { GalaxyClient, GalaxyVersion } from '@rplanel/galaxy-js'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<{ url: string, version_major: string, version_minor: string }> => {
  const { public: { galaxy: { url } } } = useRuntimeConfig()
  const $galaxy: GalaxyClient = event.context?.galaxy
  const version: GalaxyVersion = await $galaxy.getVersion()
  return { url, ...version }
})
