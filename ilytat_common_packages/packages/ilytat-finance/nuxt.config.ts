// https://nuxt.com/docs/guide/directory-structure/nuxt.config
export default defineNuxtConfig({
    components: [
        {
            path: './components',
            pathPrefix: false,
            global: true
        }
    ],
    imports: {
        dirs: ['composables']
    }
})
