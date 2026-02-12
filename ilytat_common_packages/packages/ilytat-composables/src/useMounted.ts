import { ref, onMounted, readonly } from 'vue';

export function useMounted() {
    const isMounted = ref(false);

    onMounted(() => {
        isMounted.value = true;
    });

    return readonly(isMounted);
}
