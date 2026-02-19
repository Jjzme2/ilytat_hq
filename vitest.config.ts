import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    plugins: [vue()],
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
