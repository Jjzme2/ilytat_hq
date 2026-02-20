<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header
            class="flex-none px-4 md:px-8 py-6 md:py-10 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 transition-all">

            <div>
                <h1 class="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tighter">
                    Operations
                </h1>
                <p class="text-sm md:text-base text-zinc-500 mt-2 font-medium">Coordinate and execute mission-critical initiatives</p>
            </div>
            <button @click="openCreateModal"
                class="w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-accent-primary hover:bg-accent-secondary text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-accent-primary/20 flex items-center justify-center gap-2 group active:scale-95">
                <span class="i-ph-plus-bold text-xl group-hover:rotate-90 transition-transform duration-300"></span>
                Inaugurate Project
            </button>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
            <!-- Loading State -->
            <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i"
                    class="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 h-56 flex flex-col justify-between backdrop-blur-sm">
                    <div>
                        <div class="flex justify-between items-start mb-6">
                            <SkeletonLoader width="60%" height="28px" class="rounded-full" />
                            <SkeletonLoader width="24%" height="24px" :rounded="true" />
                        </div>
                        <SkeletonLoader width="100%" height="16px" class="mb-3 rounded-full" />
                        <SkeletonLoader width="80%" height="16px" class="rounded-full" />
                    </div>
                    <div class="flex items-end justify-between mt-auto">
                        <SkeletonLoader width="30%" height="12px" class="rounded-full" />
                        <SkeletonLoader width="24%" height="8px" :rounded="true" />
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-medium">
                {{ error?.message || 'A catastrophic error occurred during retrieval' }}
            </div>

            <!-- Projects Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="project in projects" @click="router.push(`/projects/${project.id}`)"
                    class="group relative bg-zinc-900/20 border border-white/5 hover:border-accent-primary/50 rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:bg-zinc-900/40 hover:shadow-2xl hover:shadow-accent-primary/5 overflow-hidden active:scale-[0.98]"
                    v-spotlight>
                    <div class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-500"
                        style="background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--accent-rgb), 0.1), transparent 40%);">
                    </div>
                    
                    <!-- Top Section -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex flex-col gap-1 min-w-0 pr-12">
                            <h3 class="text-xl font-bold text-white truncate tracking-tight group-hover:text-accent-primary transition-colors">{{ project.name }}</h3>
                            <div class="flex items-center gap-2">
                                <span :class="[
                                    'text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border',
                                    project.statusColor
                                ]">
                                    {{ project.formattedStatus }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p class="text-sm text-zinc-500 line-clamp-2 h-10 leading-relaxed">{{ project.description || 'System data indicates no detailed objective specified.' }}</p>

                    <!-- Meta Info & Progress -->
                    <div class="mt-8">
                        <div class="flex items-center justify-between mb-2">
                             <div class="flex items-center gap-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                                <span v-if="project.deadline" class="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                    <span class="i-ph-calendar-bold opacity-70 text-accent-primary"></span>
                                    {{ formatDate(project.deadline) }}
                                </span>
                                <span class="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                    <span class="i-ph-lightning-bold opacity-70" :class="project.priorityColor"></span>
                                    <span :class="project.priorityColor">{{ project.priority }}</span>
                                </span>
                            </div>
                            <span class="text-xs font-black text-white/80">{{ project.progress }}%</span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                            <div class="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]" :style="{ width: `${project.progress}%` }">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="projects.length === 0"
                    class="col-span-full flex flex-col items-center justify-center h-80 border-2 border-dashed border-white/5 rounded-3xl text-zinc-600 bg-zinc-900/10">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <span class="i-ph-folder-open-bold text-4xl opacity-50"></span>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">No active operations</h3>
                    <p class="text-sm">Initiate a new project to start tracking progress.</p>
                    <button @click="openCreateModal" class="mt-6 text-accent-primary hover:text-white font-black text-sm uppercase tracking-widest transition-colors">
                        Launch Initial Phase
                    </button>
                </div>
            </div>
        </main>

        <!-- New Project Bottom Sheet -->
        <BottomSheet :is-open="isCreateModalOpen" title="New Operation" @close="isCreateModalOpen = false">
            <template #description>Define the parameters for this new initiative.</template>
            
            <form @submit.prevent="handleCreate" class="space-y-6 pb-2">
                <div class="space-y-4">
                    <div class="group">
                        <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Identity</label>
                        <input v-model="newProjectForm.name" type="text" required
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all shadow-inner"
                            placeholder="e.g. Project Orion" />
                    </div>
                    
                    <div class="group">
                        <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Objective</label>
                        <textarea v-model="newProjectForm.description" rows="3"
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all shadow-inner"
                            placeholder="Mission details..."></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="group">
                            <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Priority</label>
                            <select v-model="newProjectForm.priority"
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer">
                                <option :value="Priority.LOW">Low Priority</option>
                                <option :value="Priority.MEDIUM">Standard Priority</option>
                                <option :value="Priority.HIGH">High Priority</option>
                                <option :value="Priority.CRITICAL">Critical Mission</option>
                            </select>
                        </div>
                        <div class="group">
                            <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Target Date</label>
                            <input v-model="newProjectForm.deadline" type="date"
                                class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Classification <span
                                class="text-accent-primary">*</span></label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            <button type="button" v-for="p in purposeOptions" :key="p"
                                @click="newProjectForm.purpose = p; isCustomPurpose = false" :class="[
                                    'px-4 py-3 text-xs font-bold rounded-xl border transition-all text-center uppercase tracking-tighter',
                                    newProjectForm.purpose === p && !isCustomPurpose
                                        ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                        : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-white'
                                ]">
                                {{ p }}
                            </button>
                            <button type="button" @click="isCustomPurpose = true; newProjectForm.purpose = ''"
                                :class="[
                                    'px-4 py-3 text-xs font-bold rounded-xl border transition-all text-center uppercase tracking-tighter',
                                    isCustomPurpose
                                        ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                        : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-white'
                                ]">
                                Custom
                            </button>
                        </div>
                        <input v-if="isCustomPurpose" v-model="newProjectForm.purpose" type="text"
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-all animate-slide-up"
                            placeholder="Specify custom classification..." required />
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 font-bold">
                    <button type="button" @click="isCreateModalOpen = false"
                        class="px-6 py-3 text-sm text-zinc-500 hover:text-white transition-colors order-2 sm:order-1 capitalize">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isCreating"
                        class="px-8 py-3 bg-accent-primary hover:bg-accent-secondary text-white rounded-2xl text-sm transition-all disabled:opacity-50 shadow-xl shadow-accent-primary/20 order-1 sm:order-2 uppercase tracking-widest">
                        {{ isCreating ? 'Initializing...' : 'Confirm Launch' }}
                    </button>
                </div>
            </form>
        </BottomSheet>
    </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Project } from '~/models/Project';
import { ProjectStatus } from '../../../config/status';
import { Priority } from '../../../config/priority';
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue';
import BottomSheet from '~/components/ui/BottomSheet.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const router = useRouter();
const { projects, isLoading, error, fetchProjects, createProject } = useProjects();
const { success: toastSuccess, error: toastError } = useToast();
const { tenantId } = useTenant();

// Local State
const isCreateModalOpen = ref(false);
const isCreating = ref(false);
const newProjectForm = ref({
    name: '',
    description: '',
    priority: Priority.MEDIUM,
    deadline: '',
    purpose: ''
});
const isCustomPurpose = ref(false);
const purposeOptions = ['Financial', 'Educational', 'Personal', 'Business', 'Health'];

// Init
onMounted(() => {
    fetchProjects();
});

// Actions
const openCreateModal = () => {
    newProjectForm.value = {
        name: '',
        description: '',
        priority: Priority.MEDIUM,
        deadline: '',
        purpose: ''
    };
    isCustomPurpose.value = false;
    isCreateModalOpen.value = true;
};

const handleCreate = async () => {
    isCreating.value = true;
    try {
        const project = new Project({
            name: newProjectForm.value.name,
            description: newProjectForm.value.description,
            priority: newProjectForm.value.priority,
            deadline: newProjectForm.value.deadline ? new Date(newProjectForm.value.deadline) : null,
            status: ProjectStatus.ACTIVE,
            progress: 0,
            purpose: newProjectForm.value.purpose,
            tenantId: null
        });

        await createProject(project);
        isCreateModalOpen.value = false;
        toastSuccess('Project created');
    } catch (e) {
        console.error("Failed to create project", e);
        toastError('Failed to create project');
    } finally {
        isCreating.value = false;
    }
};

// Helpers
const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>
