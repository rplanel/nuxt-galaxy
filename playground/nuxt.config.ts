export default defineNuxtConfig({
  modules: ['../src/module'],
  imports: {
    autoImport: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    authTokenName: 'sb-eazhbrrdowqbzbbfjgxa-auth-token',
    // public: {
    //   supabase: {
    //     url: 'http://localhost:54323', key: 'anno-key' },
    // },

  },
  compatibilityDate: '2024-12-07',
  supabase: {

  },

})
