// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    externals: {
      inline: ['genkitx-groq'],
    },
  },
})
