<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header
            class="flex-none px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">

            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Command Center
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage all ongoing operations and initiatives</p>
            </div>
            <button @click="openCreateModal"
                class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <span class="i-ph-plus-bold text-lg"></span>
                New Project
            </button>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin">
            <!-- Loading State -->
            <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="i in 6" :key="i"
                    class="bg-zinc-900/40 border border-white/5 rounded-xl p-5 h-48 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <SkeletonLoader width="60%" height="24px" />
                            <SkeletonLoader width="20%" height="20px" :rounded="true" />
                        </div>
                        <SkeletonLoader width="100%" height="16px" class="mb-2" />
                        <SkeletonLoader width="80%" height="16px" />
                    </div>
                    <div class="flex items-end justify-between mt-4">
                        <SkeletonLoader width="30%" height="12px" />
                        <SkeletonLoader width="24%" height="6px" :rounded="true" />
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {{ error?.message || 'An error occurred' }}
            </div>

            <!-- Projects Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="project in projects" @click="router.push(`/projects/${project.id}`)"
                    class="group relative bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 rounded-xl p-5 cursor-pointer transition-all hover:bg-zinc-900/60 overflow-hidden"
                    v-spotlight>
                    <div class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
                        style="background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.1), transparent 40%);">
                    </div>
                    <!-- Status Badge -->
                    <div class="absolute top-5 right-5">
                        <span :class="[
                            'text-xs px-2 py-1 rounded-full border',
                            project.statusColor
                        ]">
                            {{ project.formattedStatus }}
                        </span>
                    </div>

                    <h3 class="text-lg font-semibold text-zinc-100 pr-20 truncate">{{ project.name }}</h3>
                    <p class="text-sm text-zinc-500 mt-2 line-clamp-2 h-10">{{ project.description || 'No description provided.' }}</p>

                    <!-- Meta Info -->
                    <div class="mt-6 flex items-center justify-between text-xs text-zinc-500">
                        <div class="flex items-center gap-3">
                            <span v-if="project.deadline" class="flex items-center gap-1">
                                <span class="i-ph-calendar opacity-70"></span>
                                {{ formatDate(project.deadline) }}
                            </span>
                            <span class="flex items-center gap-1">
                                <span class="i-ph-flag opacity-70"></span>
                                <span :class="project.priorityColor">{{ capitalize(project.priority) }}</span>
                            </span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${project.progress}%` }">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="projects.length === 0"
                    class="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    <span class="i-ph-projector-screen text-4xl mb-4 opacity-50"></span>
                    <p>No active projects found</p>
                    <button @click="openCreateModal" class="mt-4 text-blue-400 hover:text-blue-300 text-sm">
                        Create your first project
                    </button>
                </div>
            </div>
        </main>

        <!-- Create Modal (Simple for now) -->
        <ClientOnly>
            <Dialog :open="isCreateModalOpen" @close="isCreateModalOpen = false" class="relative z-50">
                <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                <div class="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel class="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
                        <DialogTitle class="text-xl font-bold text-white mb-4">New Project</DialogTitle>

                        <form @submit.prevent="handleCreate" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Project Name</label>
                                <input v-model="newProjectForm.name" type="text" required
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Q4 Marketing Campaign" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                                <textarea v-model="newProjectForm.description" rows="3"
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Brief overview of the project..."></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                                    <select v-model="newProjectForm.priority"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                                        <option :value="Priority.LOW">Low</option>
                                        <option :value="Priority.MEDIUM">Medium</option>
                                        <option :value="Priority.HIGH">High</option>
                                        <option :value="Priority.CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Deadline</label>
                                    <input v-model="newProjectForm.deadline" type="date"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            <div class="flex justify-end gap-3 mt-6">
                                <button type="button" @click="isCreateModalOpen = false"
                                    class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="isCreating"
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                    {{ isCreating ? 'Creating...' : 'Create Project' }}
                                </button>
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
import { Project } from '~/models/Project';
import { ProjectStatus } from '../../../config/status';
import { Priority } from '../../../config/priority';
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue';

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
    deadline: ''
});

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
        deadline: ''
    };
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
