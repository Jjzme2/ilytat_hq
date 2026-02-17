<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header class="flex-none px-4 md:px-6 py-4 md:py-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white">Schedule</h1>
                <p class="text-zinc-500 text-xs md:text-sm mt-1">Manage your time, tasks, and goals.</p>
            </div>
            <div class="flex items-center gap-2 md:gap-3 flex-wrap">
                <div class="flex items-center bg-zinc-800 rounded-lg p-1 border border-white/5">
                    <button @click="changeMonth(-1)" class="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white">
                        <span class="i-ph-caret-left"></span>
                    </button>
                    <span class="px-2 md:px-3 text-sm font-medium text-white min-w-[100px] md:min-w-[120px] text-center">
                        {{ formatMonth(currentDate) }}
                    </span>
                    <button @click="changeMonth(1)" class="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white">
                        <span class="i-ph-caret-right"></span>
                    </button>
                </div>
                <button 
                    @click="today"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                >
                    Today
                </button>
                <button 
                    @click="showEventModal = true"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/10"
                >
                    New Event
                </button>
            </div>
        </header>

        <!-- Calendar Grid -->
        <div class="flex-1 overflow-auto bg-zinc-950 p-3 md:p-6">
            <div class="grid grid-cols-7 gap-px bg-zinc-800/50 border border-zinc-800 rounded-lg overflow-hidden h-full min-h-[400px] md:min-h-[600px]">
                <!-- Day Headers -->
                <div v-for="(day, i) in weekDays" :key="day" class="bg-zinc-900/80 p-1.5 md:p-3 text-center text-[10px] md:text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <span class="hidden md:inline">{{ day }}</span>
                    <span class="md:hidden">{{ weekDaysShort[i] }}</span>
                </div>

                <!-- Days -->
                <div 
                    v-for="(date, index) in calendarDays" 
                    :key="index"
                    :class="[
                        'bg-zinc-900/30 p-1 md:p-2 min-h-[60px] md:min-h-[100px] flex flex-col gap-0.5 md:gap-1 transition-colors hover:bg-zinc-900/50 relative group',
                        !isSameMonth(date, currentDate) ? 'bg-zinc-950/30 text-zinc-600' : 'text-zinc-300',
                        isToday(date) ? 'bg-blue-500/5' : ''
                    ]"
                    @click="handleDayClick(date)"
                >
                    <span 
                        :class="[
                            'text-[10px] md:text-xs font-medium w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full mb-0.5 md:mb-1',
                            isToday(date) ? 'bg-blue-500 text-white' : 'text-zinc-500'
                        ]"
                    >
                        {{ date.getDate() }}
                    </span>

                    <!-- Events -->
                    <div 
                        v-for="item in getItemsForDate(date)" 
                        :key="(item as any).id"
                        :class="[
                            'px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded truncate cursor-pointer transition-transform hover:scale-[1.02]',
                            getItemColor(item)
                        ]"
                        @click.stop="handleItemClick(item)"
                    >
                        <span :class="getItemIcon(item)" class="mr-1 opacity-70"></span>
                        {{ (item as any).title }}
                    </div>
                </div>
            </div>
        </div>

        <!-- New Event Modal -->
        <ClientOnly>
            <Dialog :open="showEventModal" @close="closeModal" class="relative z-50">
                <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                <div class="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel class="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
                        <DialogTitle class="text-xl font-bold text-white mb-4">
                            {{ editingEvent ? 'Edit Event' : 'New Event' }}
                        </DialogTitle>

                        <form @submit.prevent="handleSubmit" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                                <input 
                                    v-model="eventForm.title" 
                                    type="text" 
                                    required
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                                <textarea 
                                    v-model="eventForm.description" 
                                    rows="3"
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Start</label>
                                    <input 
                                        v-model="eventForm.start" 
                                        type="datetime-local" 
                                        required
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">End</label>
                                    <input 
                                        v-model="eventForm.end" 
                                        type="datetime-local" 
                                        required
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div class="flex justify-between mt-6">
                                <button
                                    v-if="editingEvent"
                                    type="button"
                                    @click="handleDeleteRequest"
                                    class="px-4 py-2 text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                >
                                    <span class="i-heroicons-trash"></span> Delete
                                </button>
                                <div v-else></div> <!-- Spacer -->

                                <div class="flex gap-3">
                                    <button 
                                        type="button" 
                                        @click="closeModal"
                                        class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        :disabled="isLoading"
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {{ isLoading ? 'Saving...' : 'Save' }}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, isToday as _isToday } from 'date-fns';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { fetchSchedule, items, createEvent, updateEvent, deleteEvent, isLoading } = useSchedule();
const { success, error: showError } = useToast();

// State
const currentDate = ref(new Date());
const showEventModal = ref(false);
const editingEvent = ref<any>(null);

const eventForm = ref({
    title: '',
    description: '',
    start: '',
    end: ''
});

// Calendar Logic
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const calendarDays = computed(() => {
    const start = startOfWeek(startOfMonth(currentDate.value));
    const end = endOfWeek(endOfMonth(currentDate.value));
    return eachDayOfInterval({ start, end });
});

// Actions
const loadSchedule = async () => {
    const start = startOfWeek(startOfMonth(currentDate.value));
    const end = endOfWeek(endOfMonth(currentDate.value));
    await fetchSchedule(start, end);
};

onMounted(() => {
    loadSchedule();
});

watch(currentDate, () => {
    loadSchedule();
});

const changeMonth = (delta: number) => {
    currentDate.value = addMonths(currentDate.value, delta);
};

const today = () => {
    currentDate.value = new Date();
};

const formatMonth = (date: Date) => format(date, 'MMMM yyyy');
const isToday = (date: Date) => _isToday(date);

const getItemsForDate = (date: Date) => {
    // Filter items where date part matches
    return items.value.filter(item => isSameDay(item._date, date));
};

const getItemColor = (item: any) => {
    if (item._type === 'event') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    if (item._type === 'task') return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    if (item._type === 'goal') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    return 'bg-zinc-700 text-zinc-300';
};

const getItemIcon = (item: any) => {
    if (item._type === 'event') return 'i-ph-calendar-blank';
    if (item._type === 'task') return 'i-ph-check-square';
    if (item._type === 'goal') return 'i-ph-target';
    return 'i-ph-circle';
};

// Modal handlers
const handleDayClick = (date: Date) => {
    // Pre-fill date
    const start = new Date(date);
    start.setHours(9, 0, 0, 0); // Default 9 AM
    const end = new Date(date);
    end.setHours(10, 0, 0, 0); // Default 1 hour duration
    
    // Adjust logic for timezone offset for input[type="datetime-local"]
    // Simple rough ISO string with local offset
    const toLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    eventForm.value = {
        title: '',
        description: '',
        start: toLocalISO(start),
        end: toLocalISO(end)
    };
    editingEvent.value = null;
    showEventModal.value = true;
};

const handleItemClick = (item: any) => {
    if (item._type !== 'event') {
        // Navigate or show details for tasks/goals?
        // For now just ignore non-events or maybe show toast saying "Managed in filtered view"
        return; 
    }
    
    editingEvent.value = item;
    
    const toLocalISO = (d: any) => {
        const date = new Date(d); // Ensure date object
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    eventForm.value = {
        title: item.title,
        description: item.description,
        start: toLocalISO(item.start),
        end: toLocalISO(item.end)
    };
    showEventModal.value = true;
};

const closeModal = () => {
    showEventModal.value = false;
    editingEvent.value = null;
};

const handleDeleteRequest = async () => {
    if (!editingEvent.value) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            await deleteEvent(editingEvent.value.id);
            success('Event deleted');
            closeModal();
            loadSchedule(); // Refresh
        } catch (e: any) {
            showError(e.message || 'Failed to delete event');
        }
    }
};

const handleSubmit = async () => {
    try {
        const payload = {
            title: eventForm.value.title,
            description: eventForm.value.description,
            start: new Date(eventForm.value.start),
            end: new Date(eventForm.value.end)
        };

        if (editingEvent.value) {
            await updateEvent(editingEvent.value.id, payload);
            success('Event updated');
        } else {
            await createEvent(payload);
            success('Event created');
        }
        closeModal();
        loadSchedule(); // Refresh to ensure order/content
    } catch (e: any) {
        showError(e.message || 'Failed to save event');
    }
};

</script>
