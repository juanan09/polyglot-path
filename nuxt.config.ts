// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    sessionSecret: process.env.SESSION_PASSWORD || 'polyglot-path-session-secret-min-32-chars!',
  },
  nitro: {
    externals: {
      inline: ['genkitx-groq', 'bcryptjs'],
    },
  },
})
