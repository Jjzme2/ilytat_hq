import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '~/config': fileURLToPath(new URL('./config', import.meta.url))
        }
    },
    test: {
        include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
        exclude: ['node_modules', '.nuxt', '.output']
    }
})
