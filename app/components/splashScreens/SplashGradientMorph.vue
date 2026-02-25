<template>
  <div class="absolute inset-0 z-0 overflow-hidden">
    <!-- Morphing gradient blobs -->
    <div class="splash-blob splash-blob-1" />
    <div class="splash-blob splash-blob-2" />
    <div class="splash-blob splash-blob-3" />

    <!-- Floating orbs -->
    <div v-for="orb in orbs" :key="orb.id"
      class="absolute rounded-full blur-sm animate-pulse pointer-events-none"
      :style="{
        width: orb.size + 'px',
        height: orb.size + 'px',
        left: orb.x + '%',
        top: orb.y + '%',
        background: orb.color,
        opacity: orb.opacity,
        animationDuration: orb.duration + 's',
        animationDelay: orb.delay + 's',
      }" />
  </div>
</template>

<script setup lang="ts">
/**
 * SplashGradientMorph — Slowly morphing metallic gradients with floating orbs.
 * Pure CSS animations — no canvas, no JS loop. Performant and premium.
 */
const orbs = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 8,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  color: [
    'rgba(139, 92, 246, 0.6)',
    'rgba(59, 130, 246, 0.5)',
    'rgba(236, 72, 153, 0.4)',
    'rgba(245, 158, 11, 0.3)',
  ][Math.floor(Math.random() * 4)],
  opacity: 0.3 + Math.random() * 0.5,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
}));
</script>

<style scoped>
.splash-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  animation: morph 12s ease-in-out infinite alternate;
}

.splash-blob-1 {
  width: 500px; height: 500px;
  top: -15%; left: -10%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.35), rgba(59, 130, 246, 0.15));
  animation-delay: 0s;
}

.splash-blob-2 {
  width: 450px; height: 450px;
  bottom: -10%; right: -10%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.1));
  animation-delay: -4s;
}

.splash-blob-3 {
  width: 350px; height: 350px;
  top: 30%; left: 40%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2), rgba(59, 130, 246, 0.1));
  animation-delay: -8s;
}

@keyframes morph {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(30px, -20px) scale(1.1) rotate(10deg); }
  66% { transform: translate(-20px, 20px) scale(0.9) rotate(-5deg); }
  100% { transform: translate(10px, 10px) scale(1.05) rotate(3deg); }
}
</style>
