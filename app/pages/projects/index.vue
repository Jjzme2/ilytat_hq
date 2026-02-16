<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header
            class="flex-none px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">

            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Command Center
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage all ongoing operations and initiatives</p>
            </div>
            <button @click="openCreateModal"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span class="i-ph-plus-bold text-lg"></span>
                New Project
            </button>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center h-64">
                <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {{ error?.message || 'An error occurred' }}
            </div>

            <!-- Projects Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="project in formattedProjects" :key="project.id"
                    @click="router.push(`/projects/${project.id}`)"
                    class="group relative bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 rounded-xl p-5 cursor-pointer transition-all hover:bg-zinc-900/60">
                    <!-- Status Badge -->
                    <div class="absolute top-5 right-5">
                        <span :class="[
                            'text-xs px-2 py-1 rounded-full border',
                            project.statusColor
                           project.statusColor
                        ]">
                            {{ project.formattedStatus }}
                            {{ project.formattedStatus }}
                        </span>
                    </div>

                    <h3 class="text-lg font-semibold text-zinc-100 pr-20 truncate">{{ project.name }}</h3>
                    <p class="text-sm text-zinc-500 mt-2 line-clamp-2 h-10">{{ project.description || 'No description
                        provided.' }}</p>

                    <!-- Meta Info -->
                    <div class="mt-6 flex items-center justify-between text-xs text-zinc-500">
                        <div class="flex items-center gap-3">
                            <span v-if="project.deadline" class="flex items-center gap-1">
                                <span class="i-ph-calendar opacity-70"></span>
                                {{ project.formattedDate }}
                            </span>
                            <span class="flex items-center gap-1">
                                <span class="i-ph-flag opacity-70"></span>
                                <span :class="project.priorityColor">{{ project.capitalizedPriority }}</span>
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
    </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Project } from '~/models/Project';
import { ProjectStatus } from '../../../config/status';
import { Priority } from '../../../config/priority';

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

// Performance Optimization: Memoize formatted values to prevent re-calculation on every render
const formattedProjects = computed(() => {
    return projects.value.map(project => ({
        ...project, // Spread original properties
        // Pre-calculate formatted values
        statusColor: getStatusColor(project.status),
        formattedStatus: formatStatus(project.status),
        formattedDate: formatDate(project.deadline),
        priorityColor: getPriorityColor(project.priority),
        capitalizedPriority: capitalize(project.priority)
    }));
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
            tenantId: tenantId.value
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
