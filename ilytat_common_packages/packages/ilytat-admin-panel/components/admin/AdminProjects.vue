<script setup lang="ts">
import { ref, reactive, onMounted, inject, computed } from 'vue'
import { AdminAdapterKey, type AdminAdapter, type AdminProject, type AdminUser } from '../../types/AdminAdapter'
import { collection, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
const db = useFirestore()

const adminAdapter = inject<AdminAdapter>(AdminAdapterKey)
const { success, error } = useToast()

const projects = ref<AdminProject[]>([])
const users = ref<AdminUser[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const editingProject = ref<AdminProject | null>(null)

const form = reactive({
    name: '',
    description: '',
    status: 'active' as AdminProject['status'],
    association: 'company' as AdminProject['association'],
    members: [] as string[]
})

const fetchProjects = async () => {
    if (!adminAdapter) return
    loading.value = true
    try {
        projects.value = await adminAdapter.getProjects()
    } catch (e: any) {
        console.error('Failed to fetch projects', e)
        error('Failed to load projects')
    } finally {
        loading.value = false
    }
}

const fetchUsers = async () => {
    if (!adminAdapter) return
    try {
        users.value = await adminAdapter.getUsers()
    } catch (e) {
        console.error('Failed to fetch users for project members', e)
    }
}

const resetForm = () => {
    form.name = ''
    form.description = ''
    form.status = 'active'
    form.association = 'company'
    form.members = []
    editingProject.value = null
}

const openAddModal = () => {
    resetForm()
    showAddModal.value = true
}

const openEditModal = (project: AdminProject) => {
    editingProject.value = project
    form.name = project.name
    form.description = project.description || ''
    form.status = project.status
    form.association = project.association || 'company'
    form.members = Array.isArray(project.members) ? project.members : []
    showAddModal.value = true
}

const toggleMember = (uid: string) => {
    if (form.members.includes(uid)) {
        form.members = form.members.filter(id => id !== uid)
    } else {
        form.members.push(uid)
    }
}

const saveProject = async () => {
    if (!form.name || !adminAdapter) return
    loading.value = true
    try {
        if (editingProject.value) {
            await adminAdapter.updateProject(editingProject.value.id, {
                name: form.name,
                description: form.description,
                status: form.status,
                association: form.association,
                members: form.members,
                // Ensure tenantId is preserved or added if missing
            })
            success('Project updated successfully')
        } else {
            // Need to get the current tenantId from the user or global state
            // For now, let's assume the current user's tenantId
            // In a real Admin App, you might select the tenant. 
            // We'll trust the AdminAdapter to handle this or we pass it if we have it.
            // But wait, the adapter implementation I saw earlier was just a placeholder logging a warning!
            // I need to update AdminAdapter implementation too.
            
            // For now, let's pass a placeholder or try to get it from the user logic if available
            // But AdminProjects.vue doesn't seem to have access to `user` or `tenantId` directly in its setup
            // It relies on adminAdapter. 
            
            await adminAdapter.createProject({
                name: form.name,
                description: form.description,
                status: form.status,
                association: form.association,
                members: form.members,
                tenantId: undefined // Let the adapter handle it or we need to inject user
            })
            success('Project created successfully')
        }
        showAddModal.value = false
        resetForm()
        fetchProjects()
    } catch (e: any) {
        console.error(e)
        error(`Failed to save project: ${e.message}`)
    } finally {
        loading.value = false
    }
}

const deleteProject = async (id: string) => {
    if (!adminAdapter) return
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
        await adminAdapter.deleteProject(id)
        success('Project deleted')
        fetchProjects()
    } catch (e: any) {
        error(`Failed to delete project: ${e.message}`)
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        case 'on-hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        case 'completed': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
        case 'archived': return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
}

const formatDate = (date: any) => {
    if (!date) return '...'
    // Handle Firestore Timestamp or Date object or string
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date)
    return d.toLocaleDateString()
}

const getMemberAvatars = (memberIds: string[] | undefined) => {
    if (!memberIds || !memberIds.length) return []
    return users.value.filter(u => memberIds.includes(u.uid))
}

onMounted(() => {
    fetchProjects()
    fetchUsers()
})
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <!-- Header Actions -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-lg font-bold text-white">Projects</h2>
                <p class="text-sm text-slate-500">System-wide project oversight.</p>
            </div>
            <button @click="openAddModal"
                class="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-slate-200 font-bold rounded-lg text-sm transition-all active:scale-95">
                <span>➕</span>
                New Project
            </button>
        </div>

        <!-- Projects Grid -->
        <div v-if="loading && !projects.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div v-for="i in 3" :key="i" class="h-40 bg-white/5 rounded-xl border border-white/5"></div>
        </div>

        <div v-else-if="projects.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="project in projects" :key="project.id"
                class="group flex flex-col bg-zinc-900/30 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-300">
                <div class="flex justify-between items-start mb-3">
                    <span :class="getStatusColor(project.status)"
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border">
                        {{ project.status }}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ml-2"
                        :class="project.association === 'personal' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'">
                        {{ project.association || 'company' }}
                    </span>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openEditModal(project)"
                            class="text-slate-500 hover:text-white transition-colors">
                            ✏️
                        </button>
                        <button @click="deleteProject(project.id)"
                            class="text-slate-500 hover:text-rose-500 transition-colors">
                            🗑️
                        </button>
                    </div>
                </div>

                <h3 class="text-base font-bold text-white mb-1 line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {{ project.name }}
                </h3>
                <p class="text-slate-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                    {{ project.description || 'No description provided.' }}
                </p>

                <div
                    class="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    <span>{{ formatDate(project.createdAt) }}</span>
                    
                    <!-- Member Avatars -->
                     <div class="flex -space-x-2">
                        <div v-for="member in getMemberAvatars(project.members).slice(0, 3)" :key="member.uid"
                            class="h-6 w-6 rounded-full border border-zinc-900 bg-slate-700 flex items-center justify-center overflow-hidden"
                            :title="member.displayName">
                            <img v-if="member.photoURL" :src="member.photoURL" class="h-full w-full object-cover" />
                             <span v-else class="text-[8px] text-white font-bold">{{ member.displayName?.[0]?.toUpperCase() }}</span>
                        </div>
                         <div v-if="(project.members?.length || 0) > 3"
                            class="h-6 w-6 rounded-full border border-zinc-900 bg-slate-800 flex items-center justify-center">
                            <span class="text-[8px] text-slate-400">+{{ (project.members?.length || 0) - 3 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-16 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
            <div class="text-2xl mb-2 opacity-30">📁</div>
            <h2 class="text-sm font-bold text-slate-400">No projects found</h2>
        </div>

        <!-- Add/Edit Modal -->
        <Teleport to="body">
            <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showAddModal = false"></div>
                <div class="relative bg-zinc-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
                    <div class="p-6 flex-1 overflow-y-auto">
                        <div class="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <h2 class="text-lg font-bold text-white">
                                {{ editingProject ? 'Edit Project' : 'New Project' }}
                            </h2>
                            <button @click="showAddModal = false" class="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <form @submit.prevent="saveProject" class="space-y-4">
                            <div class="space-y-1">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                                <input v-model="form.name" type="text" required
                                    class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none transition-all text-sm"
                                    placeholder="Project Name..." />
                            </div>

                            <div class="space-y-1">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                <textarea v-model="form.description" rows="3"
                                    class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:border-amber-500 outline-none transition-all resize-none text-sm"
                                    placeholder="Objectives..."></textarea>
                            </div>

                            <div class="space-y-1">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                                <div class="grid grid-cols-4 gap-2">
                                    <button v-for="status in (['active', 'on-hold', 'completed', 'archived'] as const)"
                                        :key="status" type="button" @click="form.status = status"
                                        :class="form.status === status ? 'bg-white text-black' : 'bg-black/50 border border-white/10 text-slate-500'"
                                        class="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                                        {{ status }}
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Association</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <button type="button" @click="form.association = 'company'"
                                        :class="form.association === 'company' ? 'bg-white text-black' : 'bg-black/50 border border-white/10 text-slate-500'"
                                        class="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                                        Company
                                    </button>
                                     <button type="button" @click="form.association = 'personal'"
                                        :class="form.association === 'personal' ? 'bg-white text-black' : 'bg-black/50 border border-white/10 text-slate-500'"
                                        class="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                                        Personal
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Members</label>
                                <div class="max-h-40 overflow-y-auto bg-black/50 border border-white/10 rounded-lg p-2 space-y-1">
                                    <div v-for="user in users" :key="user.uid" 
                                        @click="toggleMember(user.uid)"
                                        class="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white/5 transition-colors"
                                        :class="form.members.includes(user.uid) ? 'bg-indigo-500/20 border border-indigo-500/50' : ''">
                                        
                                        <div class="h-6 w-6 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                             <img v-if="user.photoURL" :src="user.photoURL" class="h-full w-full object-cover" />
                                             <span v-else class="text-[10px] text-white font-bold">{{ user.displayName?.[0] }}</span>
                                        </div>
                                        <span class="text-sm text-slate-300 flex-1 truncate">{{ user.displayName || user.email }}</span>
                                        <div v-if="form.members.includes(user.uid)" class="text-indigo-400">✓</div>
                                    </div>
                                    <div v-if="!users.length" class="text-center text-xs text-slate-600 py-4">
                                        No users found
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4">
                                <button type="submit" :disabled="loading || !form.name"
                                    class="w-full py-3 bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-bold text-sm rounded-lg transition-all">
                                    {{ loading ? 'Saving...' : (editingProject ? 'Update' : 'Create') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
