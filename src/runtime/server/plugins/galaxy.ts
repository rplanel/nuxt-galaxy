import { GalaxyClient } from "@rplanel/galaxy-js";


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const { public: { galaxy: { url } }, galaxy: { apiKey } } = useRuntimeConfig()
    const $galaxy = GalaxyClient.getInstance(apiKey, url)
    event.context.galaxy = $galaxy
  });
})

