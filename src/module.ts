import { addComponent, addImportsDir, addServerHandler, addServerImportsDir, addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  galaxy: {
    url: string
    apiKey: string
    email: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    // Usually the npm package name of your module
    name: 'nuxt-galaxy',
    // The key in `nuxt.config` that holds your module options
    configKey: 'galaxy',
    // Compatibility constraints
    compatibility: {
      // Semver version of supported nuxt versions
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options for your module, can also be a function returning those
  defaults: {
    galaxy: {
      url: process.env.GALAXY_URL as string,
      apiKey: process.env.GALAXY_API_KEY as string,
      email: process.env.GALAXY_EMAIL as string,
    },
  },
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // The function holding your module logic, it can be asynchronous
  setup(moduleOptions, nuxt) {
    // We create the `experimental` object if it doesn't exist yet
    const resolver = createResolver(import.meta.url)
    // public runtime
    nuxt.options.runtimeConfig.public.galaxy ||= {}

    nuxt.options.runtimeConfig.public.galaxy = defu(nuxt.options.runtimeConfig.public.galaxy, {
      url: moduleOptions.galaxy.url,
    })
    // Private runtime
    nuxt.options.runtimeConfig.galaxy ||= {}
    nuxt.options.runtimeConfig.galaxy = defu(nuxt.options.runtimeConfig.galaxy, {
      apiKey: moduleOptions.galaxy.apiKey,
      email: moduleOptions.galaxy.email,
    })


    // Make sure url and key are set
    if (!nuxt.options.runtimeConfig.public.galaxy.url) {
      console.warn('Missing galaxy url, set it either in `nuxt.config.js` or via env variable')
    }
    if (!nuxt.options.runtimeConfig.galaxy.apiKey) {
      console.warn('Missing galaxy api key, set it either in `nuxt.config.js` or via env variable')
    }

    // From the runtime directory
    addImportsDir(resolver.resolve('./runtime/app/composables'))

    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
    addServerImportsDir(resolver.resolve('./runtime/server/db'))

    // add server routes

    // Galaxy
    addServerHandler({
      route: '/api/galaxy/histories',
      handler: resolver.resolve('./runtime/server/api/galaxy/histories.get'),
      method: 'get',
    })

    addServerHandler({
      route: '/api/galaxy/histories',
      handler: resolver.resolve('./runtime/server/api/galaxy/histories.post'),
      method: 'post',
    })

    addServerHandler({
      route: '/api/galaxy/workflows',
      handler: resolver.resolve('./runtime/server/api/galaxy/workflows.get'),
      method: 'get',
    })

    addServerHandler({
      route: '/api/probe',
      handler: resolver.resolve('./runtime/server/api/probe.get'),
      method: 'get',
    })
    // workflows

    addServerHandler({
      route: '/api/galaxy/workflows/:workflowId',
      handler: resolver.resolve('./runtime/server/api/galaxy/workflows/[workflowId].get'),
      method: 'get',
    })

    addServerHandler({
      route: '/api/galaxy/workflows/:workflowId/input',
      handler: resolver.resolve('./runtime/server/api/galaxy/workflows/[workflowId]/input.get'),
      method: 'get',
    })

    addServerHandler({
      route: '/api/galaxy/workflows/:workflowId/export-run',
      handler: resolver.resolve('./runtime/server/api/galaxy/workflows/[workflowId]/export-run.get'),
      method: 'get',
    })

    // db
    addServerHandler({
      route: '/api/db/analyses',
      handler: resolver.resolve('./runtime/server/api/db/analyses.post'),
      method: 'post',
    })

    addServerHandler({
      route: '/api/db/analyses/:analysisId',
      handler: resolver.resolve('./runtime/server/api/db/analyses/[analysisId].delete'),
      method: 'delete',
    })

    addServerHandler({
      route: '/api/db/workflows',
      handler: resolver.resolve('./runtime/server/api/db/workflows.post'),
      method: 'post',
    })




    /*********************/
    // Add server plugin
    /*********************/
    addServerPlugin(resolver.resolve('./runtime/server/plugins/galaxy'))
    // addServerHandler({
    //   handler: resolver.resolve('./runtime/server/middleware/galaxy'),
    //   middleware: true,
    // })
  },
})
