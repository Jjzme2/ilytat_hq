<template>
  <div class="absolute inset-0 z-0 flex items-end justify-center pb-[30%] pointer-events-none">
    <div class="font-mono text-[11px] leading-relaxed text-left max-w-md w-full px-8 space-y-0.5">
      <p v-for="(line, i) in visibleLines" :key="i"
        class="transition-opacity duration-300"
        :class="line.type === 'ok' ? 'text-emerald-500/80' : line.type === 'warn' ? 'text-amber-400/70' : 'text-zinc-600'">
        <span class="text-zinc-700 select-none">{{ line.prefix }}</span>
        {{ line.text }}
        <span v-if="i === visibleLines.length - 1 && !allDone" class="inline-block w-2 h-3.5 bg-zinc-500 animate-pulse ml-0.5 align-text-bottom" />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SplashTerminalBoot — Fake system boot sequence with typewriter effect.
 * Lines appear one by one with varying delays for authenticity.
 */

interface BootLine {
  prefix: string;
  text: string;
  type: 'ok' | 'info' | 'warn';
  delay: number;
}

const BOOT_LINES: BootLine[] = [
  { prefix: '[sys] ', text: 'Initializing kernel modules...', type: 'info', delay: 100 },
  { prefix: '[sys] ', text: 'Loading runtime configuration', type: 'info', delay: 200 },
  { prefix: ' ok  ', text: 'Firebase Auth → connected', type: 'ok', delay: 350 },
  { prefix: ' ok  ', text: 'Firestore → real-time sync active', type: 'ok', delay: 250 },
  { prefix: '[net] ', text: 'Establishing secure channels...', type: 'info', delay: 300 },
  { prefix: ' ok  ', text: 'TLS 1.3 handshake complete', type: 'ok', delay: 200 },
  { prefix: '[app] ', text: 'Mounting component tree', type: 'info', delay: 150 },
  { prefix: '[app] ', text: 'Hydrating reactive state', type: 'info', delay: 200 },
  { prefix: ' ok  ', text: 'Theme engine → loaded', type: 'ok', delay: 180 },
  { prefix: ' ok  ', text: 'Module registry → 12 modules active', type: 'ok', delay: 220 },
  { prefix: '[sec] ', text: 'Verifying session integrity', type: 'info', delay: 300 },
  { prefix: ' !!  ', text: 'Rate limiter armed', type: 'warn', delay: 150 },
  { prefix: ' ok  ', text: 'Session validated — access granted', type: 'ok', delay: 250 },
  { prefix: '[hq]  ', text: 'All systems operational. Welcome.', type: 'ok', delay: 100 },
];

const visibleLines = ref<BootLine[]>([]);
const allDone = ref(false);

onMounted(async () => {
  for (const line of BOOT_LINES) {
    await new Promise(r => setTimeout(r, line.delay));
    visibleLines.value = [...visibleLines.value, line];
  }
  allDone.value = true;
});
</script>
