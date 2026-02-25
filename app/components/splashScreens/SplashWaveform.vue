<template>
  <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
    <div class="flex items-end gap-[3px] h-24">
      <div v-for="(bar, i) in bars" :key="i"
        class="w-[3px] rounded-full bg-gradient-to-t from-accent-primary/60 to-accent-secondary/40"
        :style="{
          height: bar.height + 'px',
          transition: 'height 0.15s ease-out',
          opacity: 0.4 + bar.height / 100 * 0.6,
        }" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SplashWaveform — Audio waveform visualization with smooth sine-wave bars.
 * Multiple layered sine waves create an organic, rhythmic pulsing effect.
 */

const BAR_COUNT = 48;
const bars = ref(Array.from({ length: BAR_COUNT }, () => ({ height: 4 })));
let animationId = 0;
let startTime = 0;

const animate = (time: number) => {
  if (!startTime) startTime = time;
  const elapsed = (time - startTime) / 1000;

  bars.value = bars.value.map((_, i) => {
    const normalizedPos = i / BAR_COUNT;
    // Layer multiple sine waves at different frequencies for organic feel
    const wave1 = Math.sin(normalizedPos * Math.PI * 3 + elapsed * 2.5) * 30;
    const wave2 = Math.sin(normalizedPos * Math.PI * 5 + elapsed * 1.8 + 1) * 15;
    const wave3 = Math.sin(normalizedPos * Math.PI * 7 + elapsed * 3.2 + 2) * 8;
    const pulse = Math.sin(elapsed * 1.2) * 10 + 10;

    const height = Math.max(4, Math.abs(wave1 + wave2 + wave3) + pulse);
    return { height: Math.min(height, 80) };
  });

  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  animationId = requestAnimationFrame(animate);
  onUnmounted(() => cancelAnimationFrame(animationId));
});
</script>
