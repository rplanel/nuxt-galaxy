import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  runtimeConfig: {
    public: {
      supabase: { url: 'http://localhost:54323', key: 'anno-key' },
    },

  },
  compatibilityDate: '2024-12-07',

})
