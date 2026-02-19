<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header
            class="flex-none px-4 md:px-6 py-4 md:py-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <Breadcrumbs
                    :items="[{ label: 'Home', to: '/', icon: 'i-heroicons-home' }, { label: 'Schedule', icon: 'i-heroicons-calendar' }]"
                    class="mb-2" />
                <h1 class="text-2xl md:text-3xl font-bold text-white">Schedule</h1>
                <p class="text-zinc-500 text-xs md:text-sm mt-1">Manage your time, tasks, and goals.</p>
            </div>
            <div class="flex items-center gap-2 md:gap-3 flex-wrap">
                <div class="flex items-center bg-zinc-800 rounded-lg p-1 border border-white/5">
                    <button @click="changeMonth(-1)"
                        class="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white">
                        <span class="i-ph-caret-left"></span>
                    </button>
                    <span
                        class="px-2 md:px-3 text-sm font-medium text-white min-w-[100px] md:min-w-[120px] text-center">
                        {{ formatMonth(currentDate) }}
                    </span>
                    <button @click="changeMonth(1)"
                        class="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white">
                        <span class="i-ph-caret-right"></span>
                    </button>
                </div>
                <button @click="today"
                    class="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-white/5">
                    Today
                </button>
                <button @click="showEventModal = true"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/10">
                    New Event
                </button>
            </div>
        </header>

        <!-- Main Content -->
        <div class="flex-1 overflow-hidden flex flex-col md:flex-row h-full">
            <!-- Left: Calendar (Flexible) -->
            <div class="flex-1 p-3 md:p-6 overflow-auto border-r border-white/5 bg-zinc-950">
                <div
                    class="grid grid-cols-7 gap-px bg-zinc-800/50 border border-zinc-800 rounded-lg overflow-hidden min-h-[500px]">
                    <!-- Day Headers -->
                    <div v-for="(day, i) in weekDays" :key="day"
                        class="bg-zinc-900/80 p-1.5 md:p-3 text-center text-[10px] md:text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span class="hidden md:inline">{{ day }}</span>
                        <span class="md:hidden">{{ weekDaysShort[i] }}</span>
                    </div>

                    <!-- Days -->
                    <div v-for="(date, index) in calendarDays" :key="index" :class="[
                        'bg-zinc-900/30 p-1 md:p-2 min-h-[80px] flex flex-col gap-1 transition-colors hover:bg-zinc-900/50 relative group cursor-pointer border-t border-l border-white/5',
                        !isSameMonth(date, currentDate) ? 'bg-zinc-950/30 text-zinc-600' : 'text-zinc-300',
                        isToday(date) ? 'bg-blue-500/5' : '',
                        isSameDay(date, selectedDate) ? 'ring-2 ring-inset ring-blue-500/50 bg-blue-500/10' : ''
                    ]" @click="handleDayClick(date)">
                        <span :class="[
                            'text-[10px] md:text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                            isToday(date) ? 'bg-blue-500 text-white' : 'text-zinc-500'
                        ]">
                            {{ date.getDate() }}
                        </span>

                        <!-- Event Dots/Previews -->
                        <div class="flex flex-col gap-0.5 mt-1">
                            <div v-for="item in getItemsForDate(date).slice(0, 3)" :key="(item as any).id" :class="[
                                'px-1 py-0.5 text-[9px] rounded truncate',
                                getItemColor(item)
                            ]">
                                {{ (item as any).title }}
                            </div>
                            <div v-if="getItemsForDate(date).length > 3" class="text-[9px] text-zinc-600 pl-1">
                                +{{ getItemsForDate(date).length - 3 }} more
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Daily Agenda (Fixed Width) -->
            <div
                class="w-full md:w-96 bg-zinc-900/30 backdrop-blur-sm border-l border-white/5 flex flex-col h-[50vh] md:h-full">
                <!-- Agenda Header -->
                <div class="p-4 border-b border-white/5 flex flex-col gap-4 bg-zinc-900/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-white font-semibold">{{ format(selectedDate, 'EEEE, MMM d') }}</h2>
                            <p class="text-xs text-zinc-500 mt-0.5">{{ getItemsForDate(selectedDate).length }} items</p>
                        </div>
                        <button @click="openEventModalForDate(selectedDate)"
                            class="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/10">
                            <span class="i-ph-plus-bold"></span>
                        </button>
                    </div>

                    <!-- Smart Input -->
                    <div class="relative group">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg transition-opacity opacity-0 group-hover:opacity-100">
                        </div>
                        <div
                            class="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                            <span class="i-ph-sparkle text-blue-400 mr-2 animate-pulse"></span>
                            <input v-model="smartInput" @keydown.enter="handleSmartAdd" :disabled="isParsing"
                                type="text" placeholder="&quot;Lunch with Bob tomorrow at 1pm&quot;"
                                class="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none" />
                            <button v-if="smartInput" @click="handleSmartAdd" :disabled="isParsing"
                                class="p-1 hover:bg-white/10 rounded-lg transition-colors text-blue-400">
                                <span v-if="isParsing" class="i-ph-spinner animate-spin"></span>
                                <span v-else class="i-ph-arrow-right"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Agenda List -->
                <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    <div v-if="getItemsForDate(selectedDate).length === 0" class="text-center py-10 text-zinc-500">
                        <span class="i-ph-calendar-blank text-4xl mb-2 block opacity-30"></span>
                        <p class="text-sm">No events planned</p>
                        <button @click="openEventModalForDate(selectedDate)"
                            class="text-xs text-blue-400 hover:text-blue-300 mt-2">
                            Add an event
                        </button>
                    </div>

                    <div v-for="item in getItemsForDate(selectedDate)" :key="(item as any).id"
                        @click="handleItemClick(item)"
                        class="group p-3 bg-zinc-800/40 hover:bg-zinc-800/60 border border-white/5 rounded-xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg">
                        <div class="flex items-start gap-3">
                            <div :class="getItemIconClass(item)" class="mt-0.5 p-1.5 rounded-lg shrink-0">
                                <span :class="getItemIcon(item)"></span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-zinc-200 truncate">{{ (item as any).title }}</h3>
                                <p class="text-xs text-zinc-500 mt-0.5" v-if="(item as any).start">
                                    {{ getEventTimeRange(item) }}
                                </p>
                                <p class="text-xs text-zinc-500 mt-0.5"
                                    v-else-if="(item as any).deadline || (item as any).targetDate">
                                    {{ getEventDeadline(item) }}
                                </p>
                            </div>
                        </div>
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
                                <input v-model="eventForm.title" type="text" required
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                                <textarea v-model="eventForm.description" rows="3"
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Start</label>
                                    <input v-model="eventForm.start" type="datetime-local" required
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">End</label>
                                    <input v-model="eventForm.end" type="datetime-local" required
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            <div class="flex justify-between mt-6">
                                <button v-if="editingEvent" type="button" @click="handleDeleteRequest"
                                    class="px-4 py-2 text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                                    <span class="i-heroicons-trash"></span> Delete
                                </button>
                                <div v-else></div> <!-- Spacer -->

                                <div class="flex gap-3">
                                    <button type="button" @click="closeModal"
                                        class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" :disabled="isLoading"
                                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
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
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { fetchSchedule, items, createEvent, updateEvent, deleteEvent, isLoading } = useSchedule();
const { success, error: showError } = useToast();
const { fire: fireConfetti } = useConfetti();

// State
const currentDate = ref(new Date());
const selectedDate = ref(new Date()); // Selection state for Agenda
const showEventModal = ref(false);
const editingEvent = ref<any>(null);
const smartInput = ref('');
const isParsing = ref(false);

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
    selectedDate.value = new Date(); // Select today as well
};

const formatMonth = (date: Date) => format(date, 'MMMM yyyy');
const isToday = (date: Date) => _isToday(date);
const isSameSelection = (date: Date, date2: Date) => isSameMonth(date, date2);
// Wait, `isSameMonth` is imported from `date-fns`. Let's use that.
// But I need to check if the import in script setup is aliased or not. It is `isSameMonth`.
// So I can use it directly.

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

const getItemIconClass = (item: any) => {
    if (item._type === 'event') return 'bg-purple-500/10 text-purple-400';
    if (item._type === 'task') return 'bg-blue-500/10 text-blue-400';
    if (item._type === 'goal') return 'bg-emerald-500/10 text-emerald-400';
    return 'bg-zinc-800 text-zinc-400';
};

const getItemIcon = (item: any) => {
    if (item._type === 'event') return 'i-ph-calendar-blank';
    if (item._type === 'task') return 'i-ph-check-square';
    if (item._type === 'goal') return 'i-ph-target';
    return 'i-ph-circle';
};

const getEventTimeRange = (item: any) => {
    if (!item.start || !item.end) return '';
    return `${format(new Date(item.start), 'h:mm a')} - ${format(new Date(item.end), 'h:mm a')}`;
};

const getEventDeadline = (item: any) => {
    const dateStr = item.deadline || item.targetDate;
    if (!dateStr) return '';
    return `Due: ${format(new Date(dateStr), 'h:mm a')}`;
};

// Modal handlers
const handleDayClick = (date: Date) => {
    selectedDate.value = date;
    // Don't open modal on click anymore, just select for Agenda
};

const openEventModalForDate = (date: Date) => {
    // Pre-fill date
    const start = new Date(date);
    start.setHours(9, 0, 0, 0); // Default 9 AM
    const end = new Date(date);
    end.setHours(10, 0, 0, 0); // Default 1 hour duration

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

// Smart Add
const handleSmartAdd = async () => {
    if (!smartInput.value.trim()) return;
    isParsing.value = true;

    try {
        const timezoneOffset = new Date().getTimezoneOffset();
        const parsed = await $fetch<any>('/api/ai/parse-date', {
            method: 'POST',
            body: {
                input: smartInput.value,
                timezoneOffset
            }
        });

        if (parsed) {
            // Create event directly
            await createEvent({
                title: parsed.title,
                description: parsed.description || '',
                start: new Date(parsed.start),
                end: new Date(parsed.end),
                isAllDay: false
            });

            fireConfetti({
                origin: { x: 0.8, y: 0.2 }, // Top right-ish
                spread: 70
            });

            smartInput.value = '';
            success('Event created!');

            // If the date is different, jump to it
            if (!isSameDay(new Date(parsed.start), selectedDate.value)) {
                selectedDate.value = new Date(parsed.start);
                currentDate.value = new Date(parsed.start); // Also move calendar view
            }
        }
    } catch (e) {
        console.error(e);
        showError('Failed to parse event. Try again.');
    } finally {
        isParsing.value = false;
    }
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
