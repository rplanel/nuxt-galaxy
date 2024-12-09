export default defineNuxtConfig({
  modules: ['../src/module'],
  imports: {
    autoImport: true,
  },
  devtools: { enabled: true },

  compatibilityDate: '2024-12-07',
  galaxy: {
    galaxy: {
      apiKey: 'my-api-key',
      email: 'myemail@example.com',
      url: 'my-url',
    },
  },
})
