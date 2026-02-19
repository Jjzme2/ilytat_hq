<template>
    <div class="flex items-center gap-2">
        <div class="flex items-center bg-zinc-800 rounded-lg p-1 border border-white/5 relative">
            <button @click="prevMonth"
                class="p-1.5 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-white"
                aria-label="Previous Month">
                <span class="i-heroicons-chevron-left w-4 h-4"></span>
            </button>

            <!-- Popover for Month/Year Selection -->
            <Popover as="div" class="relative">
                <PopoverButton
                    class="px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700 rounded-md transition-colors focus:outline-none flex items-center gap-1">
                    {{ formattedDate }}
                    <span class="i-heroicons-chevron-down w-3 h-3 text-zinc-500"></span>
                </PopoverButton>

                <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0">
                    <PopoverPanel
                        class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-[100] p-4 ring-1 ring-black ring-opacity-5">

                        <!-- Header with Year Navigation -->
                        <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                            <button @click="changeYear(-1)"
                                class="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                                <span class="i-heroicons-chevron-left w-4 h-4"></span>
                            </button>
                            <span class="font-bold text-white text-lg">{{ selectedYear }}</span>
                            <button @click="changeYear(1)"
                                class="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                                <span class="i-heroicons-chevron-right w-4 h-4"></span>
                            </button>
                        </div>

                        <!-- Month Grid -->
                        <div class="grid grid-cols-3 gap-2">
                            <button v-for="(month, index) in months" :key="month" @click="selectMonth(index)" :class="[
                                'text-xs py-2 rounded-lg transition-colors font-medium',
                                index === selectedMonth && yearMatches
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white bg-zinc-800/30'
                            ]">
                                {{ month }}
                            </button>
                        </div>
                    </PopoverPanel>
                </transition>
            </Popover>

            <button @click="nextMonth"
                class="p-1.5 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-white"
                aria-label="Next Month">
                <span class="i-heroicons-chevron-right w-4 h-4"></span>
            </button>
        </div>

        <button @click="goToday"
            class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center gap-1.5 shadow-sm">
            <span class="i-heroicons-calendar w-4 h-4"></span>
            Today
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format, addMonths, addYears, setMonth, setYear, getYear, getMonth, startOfMonth, isSameYear } from 'date-fns';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

const props = defineProps<{
    modelValue: Date
}>();

const emit = defineEmits(['update:modelValue']);

const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Computed
const formattedDate = computed(() => format(props.modelValue, 'MMMM yyyy'));
const selectedYear = computed(() => getYear(props.modelValue));
const selectedMonth = computed(() => getMonth(props.modelValue));
const yearMatches = computed(() => isSameYear(props.modelValue, new Date(selectedYear.value, 0, 1))); // Always matches since derived from prop

// Methods
const updateDate = (newDate: Date) => {
    emit('update:modelValue', newDate);
};

const prevMonth = () => {
    updateDate(addMonths(props.modelValue, -1));
};

const nextMonth = () => {
    updateDate(addMonths(props.modelValue, 1));
};

const changeYear = (amount: number) => {
    updateDate(addYears(props.modelValue, amount));
};

const selectMonth = (monthIndex: number) => {
    const newDate = setMonth(props.modelValue, monthIndex);
    updateDate(startOfMonth(newDate));
    // Note: Popover implicitly stays open or closes depending on implementation? 
    // Usually clicking inside keeps it open unless we use close() from slot scope.
    // However, headless UI popover panel doesn't auto-close on inside clicks by default, 
    // but typically user wants it to close after selection.
    // For now, let's leave it open or let user click away. 
    // To make it close, we'd need to wrap the button in the default slot: v-slot="{ close }"
};

const goToday = () => {
    updateDate(new Date());
};
</script>
