export default defineNuxtConfig({
  modules: ['../src/module'],
  imports: {
    autoImport: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    // public: {
    //   supabase: {
    //     url: 'http://localhost:54323', key: 'anno-key' },
    // },
    supabase: {
      authTokenName: 'sb-127-auth-token',
    },

  },
  compatibilityDate: '2024-12-07',
  supabase: {

  },

})
