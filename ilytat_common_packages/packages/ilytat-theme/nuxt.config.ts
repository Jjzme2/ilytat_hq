import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
    alias: {
        '@ilytat/theme': currentDir
    },
    css: [
        join(currentDir, './assets/css/theme.css')
    ]
})
