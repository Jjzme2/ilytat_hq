import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
    css: [
        resolve('./assets/css/animations.css')
    ],
    components: [
        {
            path: resolve('./components'),
            prefix: 'Ilytat'
        }
    ],
    imports: {
        dirs: [resolve('./composables'), resolve('./utils')]
    }
})
