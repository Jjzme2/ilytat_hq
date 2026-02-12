<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRBAC, type Role, type Permission } from '../../composables/useRBAC'

const {
    roles,
    permissions,
    loading,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    deletePermission
} = useRBAC()

const activeTab = ref<'roles' | 'definitions'>('roles')
const selectedRole = ref<Role | null>(null)

// --- Role Form ---
const roleForm = reactive({
    id: '',
    name: '',
    description: '',
    permissions: [] as string[]
})

const isEditingRole = ref(false)

const editRole = (role: Role) => {
    selectedRole.value = role
    roleForm.id = role.id
    roleForm.name = role.name
    roleForm.description = role.description
    roleForm.permissions = [...(role.permissions || [])]
    isEditingRole.value = true
}

const startNewRole = () => {
    selectedRole.value = null
    roleForm.id = ''
    roleForm.name = ''
    roleForm.description = ''
    roleForm.permissions = []
    isEditingRole.value = true
}

const saveRole = async () => {
    if (!roleForm.name) return

    if (selectedRole.value) {
        await updateRole(selectedRole.value.id, {
            name: roleForm.name,
            description: roleForm.description,
            permissions: roleForm.permissions
        })
    } else {
        await createRole({
            id: roleForm.id, // Optional, auto-generated if empty
            name: roleForm.name,
            description: roleForm.description,
            permissions: roleForm.permissions
        })
    }
    isEditingRole.value = false
    selectedRole.value = null
}

const cancelEdit = () => {
    isEditingRole.value = false
    selectedRole.value = null
}

// --- Permission Form ---
const permForm = reactive({
    resource: '',
    action: '',
    description: ''
})

const addPermission = async () => {
    if (!permForm.resource || !permForm.action) return
    await createPermission({
        id: '', // Generated
        resource: permForm.resource.toLowerCase(),
        action: permForm.action.toLowerCase(),
        name: `${permForm.resource}:${permForm.action}`,
        description: permForm.description
    })
    permForm.resource = ''
    permForm.action = ''
    permForm.description = ''
}

// --- Computed ---
const groupedPermissions = computed(() => {
    const groups: Record<string, Permission[]> = {}
    permissions.value.forEach(p => {
        const resource = p.resource || 'other'
        if (!groups[resource]) groups[resource] = []
        groups[resource].push(p)
    })
    return groups
})

onMounted(async () => {
    await Promise.all([fetchRoles(), fetchPermissions()])
})
</script>

<template>
    <div class="space-y-6 animate-fade-in text-slate-200">

        <!-- Header & Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-black tracking-tight text-white mb-2">Access Control</h1>
                <p class="text-slate-400">Manage roles and permissions for your organization.</p>
            </div>

            <div class="flex p-1 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 self-start">
                <button @click="activeTab = 'roles'" class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    :class="activeTab === 'roles' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'">
                    Roles
                </button>
                <button @click="activeTab = 'definitions'" class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    :class="activeTab === 'definitions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'">
                    Definitions
                </button>
            </div>
        </div>

        <!-- ROLES TAB -->
        <div v-if="activeTab === 'roles'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Role List -->
            <div class="lg:col-span-1 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-white">Roles</h3>
                    <button @click="startNewRole"
                        class="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-white font-bold transition-colors">
                        + New Role
                    </button>
                </div>

                <div class="space-y-2">
                    <div v-for="role in roles" :key="role.id" @click="editRole(role)"
                        class="p-4 rounded-xl border transition-all cursor-pointer group"
                        :class="selectedRole?.id === role.id ? 'bg-indigo-900/20 border-indigo-500/50 ring-1 ring-indigo-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-bold text-white group-hover:text-indigo-300 transition-colors">{{
                                role.name }}</span>
                            <span class="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{{
                                role.permissions?.length || 0 }} perms</span>
                        </div>
                        <p class="text-xs text-slate-500 line-clamp-2">{{ role.description || 'No description' }}</p>
                    </div>
                </div>

                <div v-if="roles.length === 0 && !loading"
                    class="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    No roles found. Create one to get started.
                </div>
            </div>

            <!-- Role Editor -->
            <div class="lg:col-span-2">
                <div v-if="isEditingRole"
                    class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm sticky top-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-white">{{ selectedRole ? 'Edit Role' : 'Create Role' }}</h2>
                        <div v-if="selectedRole" class="text-[10px] font-mono text-slate-500">ID: {{ selectedRole.id }}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Role Name</label>
                                <input v-model="roleForm.name" type="text"
                                    class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Project Manager" />
                            </div>
                            <div class="space-y-2" v-if="!selectedRole">
                                <label class="text-xs font-bold text-slate-400 uppercase">Role ID (Optional)</label>
                                <input v-model="roleForm.id" type="text"
                                    class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="auto-generated" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-400 uppercase">Description</label>
                            <textarea v-model="roleForm.description" rows="2"
                                class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                placeholder="Describe the role's responsibilities..."></textarea>
                        </div>

                        <!-- Permissions Matrix -->
                        <div class="space-y-2 pt-2">
                            <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Assigned
                                Permissions</label>

                            <div class="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                                <div v-for="(groupPerms, resource) in groupedPermissions" :key="resource"
                                    class="border-b border-slate-800 last:border-0">
                                    <div
                                        class="bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                                        {{ resource }}
                                    </div>
                                    <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <label v-for="perm in groupPerms" :key="perm.id"
                                            class="flex items-start gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                                            <input type="checkbox" :value="perm.id" v-model="roleForm.permissions"
                                                class="mt-1 rounded border-slate-600 text-indigo-600 focus:ring-0 bg-slate-800" />
                                            <div>
                                                <div class="text-sm font-medium text-slate-200">{{ perm.action }}</div>
                                                <div class="text-[10px] text-slate-500">{{ perm.description }}</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div v-if="Object.keys(groupedPermissions).length === 0"
                                    class="p-8 text-center text-slate-500 text-sm">
                                    No permissions defined yet. Go to "Definitions" tab to create some.
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="pt-4 flex items-center justify-end gap-3">
                            <button @click="cancelEdit"
                                class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button @click="saveRole"
                                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95">Save
                                Role</button>
                        </div>
                    </div>
                </div>

                <div v-else
                    class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                    <span class="text-4xl mb-4 opacity-20">🛡️</span>
                    <p>Select a role to edit or create a new one.</p>
                </div>
            </div>
        </div>

        <!-- DEFINITIONS TAB -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Create New -->
            <div class="lg:col-span-1">
                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm sticky top-6">
                    <h2 class="text-lg font-bold text-white mb-4">Define Permission</h2>
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-400 uppercase">Resource</label>
                            <input v-model="permForm.resource" type="text"
                                class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="e.g. users" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-400 uppercase">Action</label>
                            <input v-model="permForm.action" type="text"
                                class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="e.g. create" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold text-slate-400 uppercase">Description</label>
                            <textarea v-model="permForm.description" rows="2"
                                class="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                placeholder="What does this allow?"></textarea>
                        </div>
                        <button @click="addPermission"
                            class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 mt-2">
                            Add Definition
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="lg:col-span-2">
                <div class="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 class="font-bold text-white">All Definitions</h3>
                        <span class="text-xs font-mono text-slate-500">{{ permissions.length }} total</span>
                    </div>

                    <div class="divide-y divide-slate-800/50">
                        <div v-for="perm in permissions" :key="perm.id"
                            class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-sm font-bold text-white">{{ perm.resource }}:{{ perm.action
                                    }}</span>
                                    <span
                                        class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">{{
                                            perm.id }}</span>
                                </div>
                                <p class="text-xs text-slate-500">{{ perm.description }}</p>
                            </div>
                            <button @click="deletePermission(perm.id)"
                                class="text-slate-600 hover:text-rose-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div v-if="permissions.length === 0" class="p-8 text-center text-slate-500 text-sm">
                            No definitions found. Create one using the form.
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
