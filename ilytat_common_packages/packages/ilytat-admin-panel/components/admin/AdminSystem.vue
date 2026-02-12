<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCurrentUser, getCurrentUser } from 'vuefire'
import type { ActivityItem } from '../../types/admin'

import { useEmail } from '#imports'
import { useActivityLog } from '../../composables/useActivityLog'

const { success, error, info, warning } = useToast()
const { sendEmail } = useEmail()
const user = useCurrentUser()
const audit = useActivityLog()

const logs = ref<ActivityItem[]>([])
const refreshing = ref(false)

const refreshLogs = async () => {
    refreshing.value = true
    try {
        logs.value = await audit.adminFetchRecent(50)
    } finally {
        refreshing.value = false
    }
}

onMounted(refreshLogs)

const testToasts = () => {
    success('System integrity verified')
    setTimeout(() => error('Simulated access violation'), 1000)
    setTimeout(() => info('Diagnostic complete'), 2000)
    setTimeout(() => warning('Bandwidth threshold alert'), 3000)
}

const sending = ref(false)
const emailMessage = ref('')
const emailSuccess = ref(false)

const migrating = ref(false)
const seeding = ref(false)
const migrations = ref<any[]>([])
const loadingMigrations = ref(false)
const showSeedWizard = ref(false)
const seedStep = ref(1)
const seedModel = ref('')
const seedData = ref<any>({})

const availableModels = [
    { id: 'User', label: 'User', fields: ['email', 'displayName', 'role', 'tenantId'] },
    { id: 'Project', label: 'Project', fields: ['name', 'description', 'tenantId', 'association'] },
    { id: 'Task', label: 'Task', fields: ['title', 'projectId', 'tenantId', 'assigneeId'] },
    { id: 'Goal', label: 'Goal', fields: ['title', 'description', 'tenantId', 'projectId'] },
    { id: 'Note', label: 'Note', fields: ['title', 'content', 'tenantId'] },
    { id: 'Document', label: 'Document', fields: ['title', 'url', 'tenantId'] }
]

const fetchMigrations = async () => {
    loadingMigrations.value = true
    try {
        const user = await getCurrentUser()
        const token = await user?.getIdToken()
        migrations.value = await $fetch('/api/admin/migrations', {
            headers: { Authorization: `Bearer ${token}` }
        })
    } catch (e: any) {
        error('Failed to load migrations')
    } finally {
        loadingMigrations.value = false
    }
}

const runMigrationById = async (migrationId: string) => {
    if (!confirm(`Execute migration ${migrationId}?`)) return
    migrating.value = true
    try {
        const user = await getCurrentUser()
        const token = await user?.getIdToken()
        const result: any = await $fetch('/api/admin/migrate', {
            method: 'POST',
            body: { migrationId },
            headers: { Authorization: `Bearer ${token}` }
        })
        
        if (result.success) {
            success('Migration completed')
            fetchMigrations()
        } else {
            error(result.message || 'Migration failed')
        }
    } catch (e: any) {
        error('Migration failed: ' + e.message)
    } finally {
        migrating.value = false
        refreshLogs()
    }
}

const selectSeedModel = (modelId: string) => {
    seedModel.value = modelId
    seedData.value = {}
    seedStep.value = 2
}

const executeSeed = async () => {
    seeding.value = true
    try {
        const user = await getCurrentUser()
        const token = await user?.getIdToken()
        await $fetch('/api/admin/seed-wizard', {
            method: 'POST',
            body: {
                model: seedModel.value,
                data: seedData.value
            },
            headers: { Authorization: `Bearer ${token}` }
        })
        success(`${seedModel.value} seeded successfully`)
        showSeedWizard.value = false
    } catch (e: any) {
        error('Seeding failed: ' + e.message)
    } finally {
        seeding.value = false
    }
}

const testEmail = async () => {
    if (!user.value) return
    sending.value = true
    emailMessage.value = ''

    try {
        const result = await sendEmail({
            to_email: user.value.email!,
            subject: 'System Diagnostic: Email Gateway',
            message: 'This is a pulse-check for the automated email dispatch system.'
        })

        if (result.success) {
            emailSuccess.value = true
            emailMessage.value = 'Dispatcher response: SUCCESS'
        } else {
            emailSuccess.value = false
            emailMessage.value = 'Dispatcher response: FAILED'
        }
    } catch (e: any) {
        emailSuccess.value = false
        emailMessage.value = e.message
    } finally {
        sending.value = false
    }
}
const expandedLogs = ref<Record<string, boolean>>({})
const selectedLog = ref<ActivityItem | null>(null)

const handleLogClick = (log: ActivityItem) => {
    // Check if desktop (lg breakpoint)
    if (window.innerWidth >= 1024) {
        selectedLog.value = log
    } else {
        // Mobile behavior: Toggle inline
        expandedLogs.value[log.id] = !expandedLogs.value[log.id]
    }
}

const closeLogModal = () => {
    selectedLog.value = null
}

const searchQuery = ref('')

const filteredLogs = computed(() => {
    if (!searchQuery.value.trim()) return logs.value

    const query = searchQuery.value.toLowerCase()
    return logs.value.filter(log => {
        const matchesAction = log.action.toLowerCase().includes(query)
        const matchesModule = log.module.toLowerCase().includes(query)
        const matchesUser = log.userId?.toLowerCase().includes(query)
        const matchesMetadata = JSON.stringify(log.metadata).toLowerCase().includes(query)

        return matchesAction || matchesModule || matchesUser || matchesMetadata
    })
})
</script>



<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <!-- Column 1 -->
        <div class="space-y-6">
            <!-- Hardware & Modules -->
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-amber-500 mb-4 tracking-widest uppercase text-sm">Hardware & Modules</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button @click="testToasts"
                        class="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors text-left group">
                        <div class="text-amber-500 mb-1 group-hover:scale-110 transition-transform">🔔</div>
                        <div class="text-white font-bold text-sm">Toast Array</div>
                        <p class="text-[10px] text-slate-500 mt-1">Verify global alert overlay system.</p>
                    </button>

                    <button @click="testEmail" :disabled="sending"
                        class="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors text-left group disabled:opacity-50">
                        <div class="text-amber-500 mb-1 group-hover:scale-110 transition-transform">📧</div>
                        <div class="text-white font-bold text-sm">{{ sending ? 'Dispatching...' : 'Email Relay' }}</div>
                        <p class="text-[10px] text-slate-500 mt-1">Pulse-check EmailJS smtp bridge.</p>
                    </button>

                    <button @click="showSeedWizard = true"
                        class="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors text-left group">
                        <div class="text-amber-500 mb-1 group-hover:scale-110 transition-transform">🌱</div>
                        <div class="text-white font-bold text-sm">Seed Wizard</div>
                        <p class="text-[10px] text-slate-500 mt-1">Dynamic data provisioning system.</p>
                    </button>
                </div>
            </div>

            <!-- System Operations -->
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-amber-500 mb-4 tracking-widest uppercase text-sm">System Operations</h3>
                <div class="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                    <div v-if="loadingMigrations" class="text-center py-4 text-slate-500 text-xs animate-pulse">
                        Scanning AI/Migrations...
                    </div>
                    <div v-else-if="migrations.length === 0" class="text-center py-4 text-slate-500 text-xs">
                        No migration files detected.
                    </div>
                    <div v-for="migration in migrations" :key="migration.id"
                        class="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-colors group">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-300 font-mono">{{ migration.label }}</span>
                            <span v-if="migration.executed" class="text-[8px] text-emerald-500 font-bold uppercase mt-0.5">
                                Executed: {{ new Date(migration.executedAt).toLocaleDateString() }}
                            </span>
                            <span v-else class="text-[8px] text-slate-600 font-bold uppercase mt-0.5">
                                Version: {{ migration.version }}
                            </span>
                        </div>
                        <button @click="runMigrationById(migration.id)" :disabled="migrating"
                            class="px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all text-[8px] font-bold uppercase">
                            {{ migration.executed ? 'Re-Run' : 'Run' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Environment -->
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-amber-500 mb-4 tracking-widest uppercase text-sm">System Environment</h3>
                <div class="space-y-3">
                    <div v-for="core in ['Kernel', 'Storage', 'Realtime', 'Search']" :key="core"
                        class="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50">
                        <span class="text-xs text-slate-300 font-mono">{{ core }}_v4.2.0</span>
                        <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded uppercase">Active</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Column 2: Audit Logs -->
        <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col h-[600px]">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <h3 class="text-lg font-bold text-amber-500 tracking-widest uppercase text-sm">Audit Logs</h3>
                    <input v-model="searchQuery" type="text" placeholder="Search logs..."
                        class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-300 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none transition-colors w-40 lg:w-64" />
                </div>
                <button @click="refreshLogs"
                    class="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest"
                    :disabled="refreshing">
                    {{ refreshing ? 'Syncing...' : 'Sync Logs' }}
                </button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                <div v-for="log in filteredLogs" :key="log.id"
                    class="p-3 bg-slate-900 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-amber-500 font-mono text-[10px] font-bold uppercase">{{ log.action }}</span>
                        <span class="text-slate-500 text-[9px] font-mono">{{ log.timestamp?.toDate?.()?.toLocaleString() }}</span>
                    </div>
                    <div class="flex gap-2 mb-2">
                        <span class="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Module: {{ log.module }}</span>
                        <span class="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">ID: {{ log.userId ? log.userId.slice(0, 8) : 'SYSTEM' }}</span>
                    </div>

                    <div @click="handleLogClick(log)" class="cursor-pointer group relative">
                        <pre class="text-[9px] text-slate-500 bg-black/40 p-2 rounded overflow-hidden transition-all duration-300"
                            :class="expandedLogs[log.id] ? 'max-h-[500px] overflow-auto' : 'max-h-12 opacity-80'">{{ JSON.stringify(log.metadata, null, 2) }}</pre>

                        <div v-if="!expandedLogs[log.id]" class="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none lg:hidden"></div>
                        <div class="hidden lg:block absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>

                        <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="lg:hidden text-[8px] text-amber-500 bg-black/80 px-1.5 py-0.5 rounded border border-amber-900/50 font-bold tracking-wider">
                                {{ expandedLogs[log.id] ? 'COLLAPSE' : 'EXPAND' }}
                            </span>
                            <span class="hidden lg:inline-block text-[8px] text-amber-500 bg-black/80 px-1.5 py-0.5 rounded border border-amber-900/50 font-bold tracking-wider">
                                VIEW DETAILS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Audit Log Detail Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="selectedLog" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" @click.self="closeLogModal">
                    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="closeLogModal"></div>
                    <div class="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div class="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900">
                            <div class="flex items-center gap-3">
                                <span class="text-amber-500 font-mono text-sm font-bold uppercase tracking-widest">{{ selectedLog.action }}</span>
                                <span class="text-slate-500 text-xs font-mono px-2 py-0.5 bg-slate-800 rounded">{{ selectedLog.module }}</span>
                            </div>
                            <button @click="closeLogModal" class="text-slate-400 hover:text-white transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="p-6 overflow-y-auto font-mono text-sm space-y-6">
                            <div class="grid grid-cols-2 gap-4 text-xs">
                                <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <span class="block text-slate-500 mb-1 uppercase tracking-widest text-[9px]">Timestamp</span>
                                    <span class="text-emerald-400">{{ selectedLog.timestamp?.toDate?.()?.toLocaleString() ?? 'N/A' }}</span>
                                </div>
                                <div class="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <span class="block text-slate-500 mb-1 uppercase tracking-widest text-[9px]">User ID</span>
                                    <span class="text-indigo-400 break-all">{{ selectedLog.userId }}</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <span class="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Event Payload</span>
                                <div class="relative group/copy">
                                    <pre class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto text-xs leading-relaxed selection:bg-amber-500/30">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
                                </div>
                            </div>
                            <div class="flex gap-4 text-[10px] text-slate-600 uppercase tracking-widest pt-4 border-t border-slate-800/50">
                                <span>Security Level: CLASS 3</span>
                                <span>Event ID: {{ selectedLog.id }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Seeding Wizard Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="showSeedWizard" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="showSeedWizard = false"></div>
                    <div class="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                        <div class="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 class="text-amber-500 font-bold uppercase tracking-widest text-sm">Seeding Wizard</h3>
                            <button @click="showSeedWizard = false" class="text-slate-500 hover:text-white">✕</button>
                        </div>
                        <div class="p-6">
                            <div v-if="seedStep === 1" class="space-y-4">
                                <p class="text-slate-400 text-xs">Select a data model to seed:</p>
                                <div class="grid grid-cols-2 gap-3">
                                    <button v-for="model in availableModels" :key="model.id" @click="selectSeedModel(model.id)"
                                        class="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors text-center">
                                        <span class="text-xs font-bold text-white">{{ model.label }}</span>
                                    </button>
                                </div>
                            </div>
                            <div v-if="seedStep === 2" class="space-y-4">
                                <div class="flex items-center justify-between mb-4">
                                    <button @click="seedStep = 1" class="text-[10px] text-slate-500 hover:text-white uppercase font-bold">← Back</button>
                                    <span class="text-xs text-amber-500 font-bold uppercase">{{ seedModel }} Configuration</span>
                                </div>
                                <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    <div v-for="field in availableModels.find(m => m.id === seedModel)?.fields" :key="field">
                                        <label class="block text-[10px] text-slate-500 uppercase font-bold mb-1">{{ field }}</label>
                                        <input v-model="seedData[field]" type="text"
                                            class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-amber-500 outline-none" />
                                    </div>
                                </div>
                                <button @click="executeSeed" :disabled="seeding"
                                    class="w-full py-3 bg-amber-500 text-black rounded-xl font-black uppercase tracking-tighter hover:bg-amber-400 transition-all disabled:opacity-50">
                                    {{ seeding ? 'PROVISIONING...' : 'EXECUTE SEED' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
