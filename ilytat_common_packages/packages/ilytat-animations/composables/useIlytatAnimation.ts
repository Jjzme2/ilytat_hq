import { ref, onMounted } from 'vue'
import { selectWeightedAnimation, type AnimationType } from '../utils/animations'

export const useIlytatAnimation = (type: AnimationType = 'entrance') => {
    const animationClass = ref('')

    onMounted(() => {
        animationClass.value = selectWeightedAnimation(type)
    })

    return {
        animationClass
    }
}
