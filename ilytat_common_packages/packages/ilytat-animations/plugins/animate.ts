import { defineNuxtPlugin } from '#app'
import { selectWeightedAnimation, type AnimationType } from '../utils/animations'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('ilytat-animate', {
        mounted(el, binding) {
            const type = (binding.value as AnimationType) || 'entrance'
            const animationClass = selectWeightedAnimation(type)

            el.classList.add('ilytat-animate-active')
            el.classList.add(animationClass)

            // Add a rarity badge indicator in dev mode if it's very rare?
            // Optional: hide it after some time or keep it
        }
    })
})
