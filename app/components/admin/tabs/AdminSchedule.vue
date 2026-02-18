<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-semibold text-white">Organization Schedule</h2>
                <p class="text-sm text-zinc-400"> Upcoming events and critical dates.</p>
            </div>
            <button
                class="px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-medium transition-colors">
                <span class="mr-1">+</span> Add Event
            </button>
        </div>

        <!-- Schedule List -->
        <div class="space-y-3">
            <div v-if="isLoading" class="text-center py-8 text-zinc-500">Loading schedule...</div>
            <div v-else-if="items.length === 0"
                class="text-center py-8 text-zinc-500 bg-zinc-900/40 rounded-xl border border-white/5">
                No upcoming events found.
            </div>
            <div v-else v-for="(item, index) in limitedItems" :key="index"
                class="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex gap-4 items-start hover:border-white/10 transition-colors group">
                <!-- Date column -->
                <div class="flex flex-col items-center min-w-[3rem] pt-1">
                    <span class="text-xs font-bold text-zinc-500 uppercase">{{ new
                        Date(item._date).toLocaleString('default', { month: 'short' }) }}</span>
                    <span class="text-xl font-black text-white leading-none">{{ new Date(item._date).getDate() }}</span>
                </div>

                <!-- Content -->
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h3 class="font-medium text-white">{{ item.title }}</h3>
                        <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {{ item._type }}
                        </span>
                    </div>

                    <p v-if="item.description" class="text-xs text-zinc-400 mt-1 line-clamp-1">{{ item.description }}
                    </p>

                    <div class="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                        <span v-if="item._type === 'event' && item.start" class="flex items-center gap-1">
                            <span class="i-heroicons-clock"></span>
                            {{ new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                        <span v-if="item.location" class="flex items-center gap-1">
                            <span class="i-heroicons-map-pin"></span>
                            {{ item.location }}
                        </span>
                    </div>
                </div>

                <!-- Delete Action -->
                <button v-if="item._type === 'event'" @click="handleDeleteEvent(item.id)"
                    class="p-2 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Event">
                    <span class="i-heroicons-trash"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSchedule } from '~/composables/useSchedule';
import { useToast } from '@ilytat/notifications';
import { onMounted, computed } from 'vue';

const { items, isLoading, fetchSchedule, deleteEvent } = useSchedule();
const { success, error: toastError } = useToast();

// Show next 30 days by default
onMounted(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    fetchSchedule(start, end);
});

const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            await deleteEvent(id);
            success('Event deleted');
        } catch (e) {
            console.error('Failed to delete event', e);
            toastError('Failed to delete event');
        }
    }
};

// Casting to any to avoid strict type checks in template similar to ScheduleWidget
const limitedItems = computed(() => (items.value as any[]).slice(0, 10)); // Show top 10
</script>
