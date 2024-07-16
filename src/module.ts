import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addServerScanDir, addServerImportsDir } from '@nuxt/kit'
import { defu } from 'defu'

export * from './types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * A FQDN or IP for a given instance of Galaxy
   * @default process.env.GALAXY_URL
   * @example 'http://localhost:9000'
   * @type string
   */
  url: string

  /**
   * User’s API key for the given instance of Galaxy, obtained from the user preferences.
   * @default process.env.GALAXY_API_KEY
   * @type string
   */
  apiKey: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'galaxy',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    url: process.env.GALAXY_URL as string,
    apiKey: process.env.GALAXY_API_KEY as string,
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Public runtimeConfig
    _nuxt.options.runtimeConfig.public.galaxy = defu(_nuxt.options.runtimeConfig.public.galaxy, {
      url: _options.url,
    })

    // Private runtimeConfig
    _nuxt.options.runtimeConfig.galaxy = defu(_nuxt.options.runtimeConfig.galaxy, {
      apiKey: _options.apiKey,
    })

    // Make sure url and key are set
    if (!_nuxt.options.runtimeConfig.public.galaxy.url) {
      console.warn('Missing Galaxy url, set it either in `nuxt.config.js` or via env variable')
    }
    if (!_nuxt.options.runtimeConfig.galaxy.apiKey) {
      console.warn('Missing Galaxy api key, set it either in `nuxt.config.js` or via env variable')
    }

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugins/galaxy.server'))

    // addServerHandler({
    //   route: '/api/galaxy/hello',
    //   handler: resolver.resolve('./runtime/server/api/index.get'),
    // })
    addServerScanDir(resolver.resolve('./runtime/server'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

  },
})
