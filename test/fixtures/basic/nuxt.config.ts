import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  runtimeConfig: {
    authTokenName: 'sb-127-auth-token',
  },
  compatibilityDate: '2024-12-07',
  galaxy: {
    apiKey: 'galaxy-api-key',
    email: 'email@example.com',
    url: 'https://galaxy.example.com',
  },
  supabase: { url: 'http://localhost:54323', key: 'anno-key' },

})
