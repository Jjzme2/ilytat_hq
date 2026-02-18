<template>
  <div 
    class="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded" 
    :class="[
      rounded ? 'rounded-full' : 'rounded-md',
      customClass
    ]"
    :style="{ 
      width: width || '100%', 
      height: height || '20px' 
    }"
  ></div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string;
  rounded?: boolean;
  customClass?: string;
}>();
</script>
