import { defineNuxtModule, createResolver, addPlugin, addImportsDir } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: '@ilytat/theme',
        configKey: 'ilytatTheme',
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(options, nuxt) {
        const { resolve } = createResolver(import.meta.url)

        // Auto-import composables
        addImportsDir(resolve('./composables'))

        // Add Tailwind configuration if needed by the consumer?
        // For now, we assume consumer has Tailwind set up, but we might need to inject our preset.
    }
})
