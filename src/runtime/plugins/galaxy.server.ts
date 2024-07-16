import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'galaxy',
  enforce: 'pre',
  setup() {
    const apiKey = useRuntimeConfig().galaxy.apiKey
    const galaxyApi = $fetch.create({
      baseURL: useRuntimeConfig().public.galaxy.url,
      onRequest({ options }) {
        const headers = options.headers ||= {}
        console.log(headers)
        if (Array.isArray(headers)) {
          headers.push(['x-api-key', apiKey])
        }
        else if (headers instanceof Headers) {
          headers.set('x-api-key', apiKey)
        }
        else {
          headers['x-api-key'] = apiKey
        }
      },
    })
    return {
      provide: {
        galaxyApi,
      },
    }
  },
})
