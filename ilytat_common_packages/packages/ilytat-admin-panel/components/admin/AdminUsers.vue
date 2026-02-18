<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue'
import { AdminAdapterKey, type AdminAdapter, type AdminUser } from '../../types/AdminAdapter'
import { useUser } from '~/composables/useUser'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

const adminAdapter = inject<AdminAdapter>(AdminAdapterKey)
const { success, error } = useToast()
const { isSuper } = useUser()
const auth = getAuth()

const users = ref<AdminUser[]>([])
const loading = ref(true)
const inviting = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const showTenantModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const newTenantId = ref('')

const showMessageModal = ref(false)
const showEditModal = ref(false)
const messageContent = ref('')
const editData = ref({ displayName: '', employeeId: 0 as number | null })

const fetchUsers = async () => {
    if (!adminAdapter) return
    loading.value = true
    try {
        users.value = await adminAdapter.getUsers()
    } catch (e: any) {
        console.error('Failed to fetch users', e)
        error('Failed to load users')
    } finally {
        loading.value = false
    }
}

const openMessageModal = (user: AdminUser) => {
    selectedUser.value = user
    messageContent.value = ''
    showMessageModal.value = true
}

const sendMessage = async () => {
    if (!selectedUser.value || !messageContent.value || !adminAdapter) return
    try {
        await adminAdapter.sendMessage(selectedUser.value.uid, messageContent.value)
        success(`Message sent to ${selectedUser.value.email}`)
        showMessageModal.value = false
    } catch (e: any) {
        error(`Failed to send message: ${e.message}`)
    }
}

const openEditModal = (user: AdminUser) => {
    selectedUser.value = user
    editData.value = {
        displayName: user.displayName || '',
        employeeId: user.employeeId || null
    }
    showEditModal.value = true
}

const saveUserEdit = async () => {
    if (!selectedUser.value || !adminAdapter) return
    try {
        await adminAdapter.updateUser(selectedUser.value.uid, {
            displayName: editData.value.displayName,
            employeeId: editData.value.employeeId
        })
        success('User updated successfully')
        showEditModal.value = false
        fetchUsers()
    } catch (e: any) {
        error(`Failed to update user: ${e.message}`)
    }
}

const inviteUser = async () => {
    if (!inviteEmail.value || !adminAdapter) return
    inviting.value = true
    try {
        await adminAdapter.inviteUser(inviteEmail.value, inviteRole.value)
        success(`Invitation sent to ${inviteEmail.value}`)
        inviteEmail.value = ''
        fetchUsers()
    } catch (e: any) {
        console.error('Failed to invite user', e)
        error('Failed to invite user')
    } finally {
        inviting.value = false
    }
}

const performUserAction = async (uid: string, email: string, action: 'send-reset-email' | 'force-reset' | 'clear-reset-flag') => {
    if (!adminAdapter) return
    try {
        if (action === 'send-reset-email') {
            // Use Client SDK to ensure email is actually sent
            await sendPasswordResetEmail(auth, email)
            success(`Reset email sent to ${email}`)
        } else if (action === 'force-reset') {
            await adminAdapter.forceUserReset(uid)
            success(`Force reset flag set for ${email}`)
            fetchUsers()
        }
    } catch (e: any) {
        error(`Action failed: ${e.message}`)
    }
}

const toggleUserStatus = async (userObj: AdminUser) => {
    if (!adminAdapter) return
    const newStatus = !userObj.disabled
    const actionLabel = newStatus ? 'Disable' : 'Enable'

    if (!confirm(`Are you sure you want to ${actionLabel} ${userObj.email}?`)) return

    try {
        await adminAdapter.updateUserStatus(userObj.uid, newStatus)
        success(`User ${actionLabel}d successfully`)
        fetchUsers()
    } catch (e: any) {
        error(`Status update failed: ${e.message}`)
    }
}

const openTenantModal = (user: AdminUser) => {
    selectedUser.value = user
    newTenantId.value = user.tenantId || ''
    showTenantModal.value = true
}

const saveTenant = async () => {
    if (!selectedUser.value || !adminAdapter) return
    try {
        await adminAdapter.assignUserToTenant(selectedUser.value.uid, newTenantId.value)
        success(`User assigned to tenant ${newTenantId.value}`)
        showTenantModal.value = false
        fetchUsers()
    } catch (e: any) {
        error(`Failed to assign tenant: ${e.message}`)
    }
}

const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString()
}

onMounted(fetchUsers)
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <!-- Header / Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-lg font-bold text-white">Users</h2>
                <p class="text-sm text-slate-500">Manage access, roles, and communication.</p>
            </div>

            <div class="flex gap-2 w-full md:w-auto">
                <input v-model="inviteEmail" type="email" placeholder="Email address..."
                    class="bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 w-full md:w-64" />
                <select v-model="inviteRole"
                    class="bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                </select>
                <button @click="inviteUser" :disabled="inviting || !inviteEmail"
                    class="bg-white text-black hover:bg-slate-200 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    {{ inviting ? '...' : 'Invite' }}
                </button>
            </div>
        </div>

        <!-- Data Grid -->
        <div class="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
            <table class="w-full text-left max-w-full">
                <thead>
                    <tr class="border-b border-white/5 bg-white/[0.02]">
                        <th class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th
                            class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-center">
                            ID</th>
                        <th class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tenant
                        </th>
                        <th class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status
                        </th>
                        <th class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Last
                            Active</th>
                        <th
                            class="px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-if="loading">
                        <td colspan="7" class="px-6 py-8 text-center text-slate-500 text-sm">Loading users...</td>
                    </tr>
                    <tr v-else-if="users.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-slate-500 text-sm">No users found.</td>
                    </tr>
                    <tr v-else v-for="user in users" :key="user.uid"
                        class="group hover:bg-white/[0.02] transition-colors">
                        <td class="px-6 py-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-300">
                                    {{ user.email?.[0]?.toUpperCase() }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-slate-200">{{ user.displayName || user.email
                                        }}</span>
                                    <span class="text-[10px] text-slate-600 font-mono">{{ user.uid.substring(0, 8)
                                        }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <span class="text-xs font-mono text-slate-400">#{{ user.employeeId || '??' }}</span>
                        </td>
                        <td class="px-6 py-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium border"
                                :class="user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-slate-500/10 text-slate-400 border-slate-500/10'">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-3">
                            <button @click="openTenantModal(user)"
                                class="text-[10px] text-slate-400 hover:text-white border border-white/5 rounded px-2 py-0.5 bg-white/5 transition-colors font-mono">
                                {{ user.tenantId || 'unassigned' }}
                            </button>
                        </td>
                        <td class="px-6 py-3">
                            <span v-if="user.disabled"
                                class="text-[10px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">Disabled</span>
                            <span v-else
                                class="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                        </td>
                        <td class="px-6 py-3 text-xs text-slate-500">
                            {{ formatDate(user.lastSignInTime) }}
                        </td>
                        <td class="px-6 py-3 text-right">
                            <div
                                class="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="openMessageModal(user)"
                                    class="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-white/10"
                                    title="Send Message">
                                    💬
                                </button>
                                <button @click="openEditModal(user)"
                                    class="p-1.5 text-slate-500 hover:text-white rounded hover:bg-white/10"
                                    title="Edit Professional Info">
                                    📝
                                </button>
                                <button @click="performUserAction(user.uid, user.email, 'send-reset-email')"
                                    class="p-1.5 text-slate-500 hover:text-amber-400 rounded hover:bg-white/10"
                                    title="Send Password Reset Email">
                                    📧
                                </button>
                                <button @click="performUserAction(user.uid, user.email, 'force-reset')"
                                    class="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-white/10"
                                    title="Force Password Reset on Next Login">
                                    🔒
                                </button>
                                <button @click="toggleUserStatus(user)"
                                    class="p-1.5 text-slate-500 hover:text-white rounded hover:bg-white/10"
                                    :title="user.disabled ? 'Enable' : 'Disable'">
                                    {{ user.disabled ? '✅' : '🚫' }}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Tenant Assignment Modal -->
        <Teleport to="body">
            <div v-if="showTenantModal"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div class="absolute inset-0 bg-black/80" @click="showTenantModal = false"></div>
                <div
                    class="relative bg-zinc-900 border border-white/10 w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4">
                    <h3 class="text-lg font-bold text-white">Assign Tenant</h3>
                    <p class="text-sm text-slate-400">Assign {{ selectedUser?.email }} to:</p>
                    <input v-model="newTenantId" placeholder="Tenant ID..."
                        class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
                    <div class="flex justify-end gap-2 pt-2">
                        <button @click="showTenantModal = false"
                            class="px-3 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                        <button @click="saveTenant"
                            class="px-4 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">Save</button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Messaging Modal -->
        <Teleport to="body">
            <div v-if="showMessageModal"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div class="absolute inset-0 bg-black/80" @click="showMessageModal = false"></div>
                <div
                    class="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4">
                    <h3 class="text-lg font-bold text-white">Direct Message</h3>
                    <p class="text-sm text-slate-400">To: {{ selectedUser?.displayName || selectedUser?.email }}</p>
                    <textarea v-model="messageContent" rows="4" placeholder="Type your message..."
                        class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-rose-500/50 outline-none"></textarea>
                    <div class="flex justify-end gap-2 pt-2">
                        <button @click="showMessageModal = false"
                            class="px-3 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                        <button @click="sendMessage" :disabled="!messageContent"
                            class="px-4 py-2 bg-rose-500 text-white font-bold rounded-lg text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors">
                            Send Message
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Edit Profile Modal -->
        <Teleport to="body">
            <div v-if="showEditModal"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div class="absolute inset-0 bg-black/80" @click="showEditModal = false"></div>
                <div
                    class="relative bg-zinc-900 border border-white/10 w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4">
                    <h3 class="text-lg font-bold text-white">Professional Profile</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Display
                                Name</label>
                            <input v-model="editData.displayName"
                                class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Employee ID</label>
                            <input v-model="editData.employeeId" type="number"
                                class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button @click="showEditModal = false"
                            class="px-3 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                        <button @click="saveUserEdit"
                            class="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg text-sm hover:bg-blue-600 transition-colors">Update
                            Profile</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
