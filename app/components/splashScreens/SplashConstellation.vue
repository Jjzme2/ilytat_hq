<template>
  <div class="absolute inset-0 z-0" ref="canvasContainer" @mousemove="onMouseMove">
    <canvas ref="canvas" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
/**
 * SplashConstellation — Interactive particle field.
 * Particles drift slowly and connect when near each other or the cursor.
 * Mouse proximity causes particles to glow and form constellation lines.
 */
const canvas = ref<HTMLCanvasElement>();
const canvasContainer = ref<HTMLDivElement>();
const mouse = reactive({ x: -1000, y: -1000 });

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number;
}

const particles: Particle[] = [];
const PARTICLE_COUNT = 80;
const CONNECTION_DIST = 140;
const MOUSE_DIST = 200;
let animationId = 0;

const onMouseMove = (e: MouseEvent) => {
  const rect = canvasContainer.value?.getBoundingClientRect();
  if (rect) {
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
};

const initParticles = (w: number, h: number) => {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
};

const draw = () => {
  const c = canvas.value;
  if (!c) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const w = c.width;
  const h = c.height;

  ctx.clearRect(0, 0, w, h);

  // Update + draw particles
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    const dMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    const glow = dMouse < MOUSE_DIST ? 1 - dMouse / MOUSE_DIST : 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + glow * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity + glow * 0.5})`;
    ctx.fill();
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]!;
      const b = particles[j]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < CONNECTION_DIST) {
        const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Mouse connections
  for (const p of particles) {
    const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (dist < MOUSE_DIST) {
      const alpha = (1 - dist / MOUSE_DIST) * 0.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  animationId = requestAnimationFrame(draw);
};

onMounted(() => {
  const c = canvas.value;
  const container = canvasContainer.value;
  if (!c || !container) return;

  const resize = () => {
    c.width = container.clientWidth;
    c.height = container.clientHeight;
    if (particles.length === 0) initParticles(c.width, c.height);
  };

  resize();
  window.addEventListener('resize', resize);
  draw();

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  });
});
</script>
