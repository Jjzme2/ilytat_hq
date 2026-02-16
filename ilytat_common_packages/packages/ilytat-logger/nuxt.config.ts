import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            logLevel: 'info', // Default log level
        }
    },
    // Auto-import utils directory
    imports: {
        dirs: ['utils']
    }
})
