import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: '@ilytat/messaging',
        configKey: 'ilytatMessaging',
    },
    setup(_options, nuxt) {
        const resolver = createResolver(import.meta.url)

        addComponentsDir({ path: resolver.resolve('./components') })
        addImportsDir(resolver.resolve('./composables'))
    }
})
