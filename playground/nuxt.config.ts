export default defineNuxtConfig({
  modules: ['../src/module'],
  imports: {
    autoImport: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      supabase: { url: 'http://localhost:54323', key: 'anno-key' },
    },

  },
  compatibilityDate: '2024-12-07',

})
