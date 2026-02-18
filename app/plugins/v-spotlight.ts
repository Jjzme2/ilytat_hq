export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('spotlight', {
        mounted(el) {
            el.addEventListener('mousemove', (e: MouseEvent) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--mouse-x', `${x}px`);
                el.style.setProperty('--mouse-y', `${y}px`);
            });
        }
    });
});
