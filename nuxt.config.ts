import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    './ilytat_common_packages/packages/ilytat-command-palette',
    './ilytat_common_packages/packages/ilytat-notifications',
    './ilytat_common_packages/packages/ilytat-admin-panel',
    './ilytat_common_packages/packages/ilytat-finance'
  ],
  future: {
    compatibilityVersion: 4,
  },
  devServer: {
    port: 2945,
  },
  compatibilityDate: '2026-02-11',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-vuefire'
  ],
  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: false
    },
    admin: {
      serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? process.env.GOOGLE_APPLICATION_CREDENTIALS
        : undefined
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    }
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['firebase-admin']
      }
    },
    plugins: [
      tailwindcss(),
    ],
  },
  alias: {
    '~/config': fileURLToPath(new URL('./config', import.meta.url)),
    '@admin': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-admin-panel', import.meta.url)),
    '@ilytat/notifications': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-notifications/index.ts', import.meta.url))
  },
  css: [
    '~/assets/css/main.css'
  ],
  app: {
    head: {
      title: 'HQ.ILYTAT.com',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Digital Product Studio Operating System' }
      ]
    }
  },
  runtimeConfig: {
    // Server-only (never sent to browser)
    cloudflareR2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    cloudflareR2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    cloudflareR2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    cloudflareR2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID
    }
  }
})
