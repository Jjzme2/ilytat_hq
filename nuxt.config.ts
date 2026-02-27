import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Force correct service account path for development
if (process.env.NODE_ENV !== 'production') {
  const rootDir = dirname(fileURLToPath(import.meta.url))
  process.env.GOOGLE_APPLICATION_CREDENTIALS = join(rootDir, 'app/server/keys/ilytat-structure-firebase-adminsdk-fbsvc-b33fbfaee5.json')
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  serverDir: 'app/server',
  extends: [
    './ilytat_common_packages/packages/ilytat-command-palette',
    './ilytat_common_packages/packages/ilytat-notifications',
    './ilytat_common_packages/packages/ilytat-admin-panel',
    './ilytat_common_packages/packages/ilytat-finance',
    './ilytat_common_packages/packages/ilytat-logger',
    './ilytat_common_packages/packages/ilytat-theme',
    './ilytat_common_packages/packages/ilytat-ai-tracking',
    './ilytat_common_packages/packages/ilytat-seo',
    './ilytat_common_packages/packages/ilytat-search'
  ],
  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true
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
      serviceAccount: process.env.NODE_ENV === 'production' && process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
            ?.replace(/^["']|["']$/g, '')  // Strip surrounding quotes (Heroku paste artifact)
            ?.replace(/\\n/g, '\n'),
        }
        : fileURLToPath(new URL('./app/server/keys/ilytat-structure-firebase-adminsdk-fbsvc-b33fbfaee5.json', import.meta.url))
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
      tailwind(),
    ],
  },
  alias: {
    '~/config': fileURLToPath(new URL('./config', import.meta.url)),
    '@admin': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-admin-panel', import.meta.url)),
    '@ilytat/notifications': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-notifications/index.ts', import.meta.url)),
    '@theme': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-theme', import.meta.url)),
    '@messaging': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-messaging', import.meta.url)),
    '@ai-tracking': fileURLToPath(new URL('./ilytat_common_packages/packages/ilytat-ai-tracking', import.meta.url))
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
    plaidClientId: process.env.NUXT_PLAID_CLIENT_ID,
    plaidSecret: process.env.NUXT_PLAID_SECRET,
    plaidEnv: process.env.NUXT_PLAID_ENV || 'sandbox',
    geminiApiKey: process.env.GEMINI_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePriceStarter: process.env.STRIPE_PRICE_STARTER,
    stripePriceGrowth: process.env.STRIPE_PRICE_GROWTH,
    stripePriceScale: process.env.STRIPE_PRICE_SCALE,
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
  }
})

// Force rebuild
// Force rebuild Tue Feb 24 02:15:44 PM CST 2026
