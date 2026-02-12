<script setup lang="ts">
import { doc, updateDoc, setDoc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useTenant } from '~/composables/useTenant'
import { useUserProfile } from '../../composables/useUserProfile'

const db = useFirestore()
const user = useCurrentUser()
const { tenantId } = useTenant()
const { isAdmin } = useUserProfile()

// Tenant Doc - ensure tenantId is a non-empty string
const tenantDocRef = computed(() => {
    return (user.value && tenantId.value) ? doc(db, 'tenants', tenantId.value) : undefined
})
const { data: tenant, pending } = useDocument(tenantDocRef)

const form = reactive({
    name: '',
    domain: '',
    logo: ''
})

const loading = ref(false)
const message = ref('')

watch(tenant, (t) => {
    if (t) {
        form.name = t.name || ''
        form.domain = t.domain || ''
        form.logo = t.logo || ''
    }
}, { immediate: true })

const saveTenant = async () => {
    if (!isAdmin.value) return
    loading.value = true
    message.value = ''
    try {
        if (!tenantDocRef.value) throw new Error('No tenant document reference found')
        
        // Use setDoc with merge: true to create if missing
        await setDoc(tenantDocRef.value, {
            name: form.name,
            domain: form.domain,
            logo: form.logo
        }, { merge: true })

        message.value = 'Tenant updated successfully!'
        setTimeout(() => message.value = '', 3000)
    } catch (e: any) {
        console.error(e)
        message.value = 'Error updating tenant.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="space-y-8 animate-fade-in text-slate-200">

        <div v-if="!isAdmin"
            class="text-center py-20 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-300">
            <h1 class="text-2xl font-bold mb-2">Restricted Access</h1>
            <p>You do not have permission to manage tenant settings.</p>
        </div>

        <div v-else class="space-y-8">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-black tracking-tight text-white mb-2">Tenant Profile</h1>
                    <p class="text-slate-400">Manage organization details for <span class="text-indigo-400 font-mono">{{
                        tenantId }}</span></p>
                </div>
            </div>

            <!-- Edit Form -->
            <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                <form @submit.prevent="saveTenant" class="space-y-6">
                    <!-- Name -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-slate-400">Organization Name</label>
                        <input v-model="form.name" type="text"
                            class="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-slate-600"
                            placeholder="Acme Corp" />
                    </div>

                    <!-- Domain -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-slate-400">Primary Domain</label>
                        <input v-model="form.domain" type="text"
                            class="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-slate-600 font-mono"
                            placeholder="acme.com" />
                    </div>

                    <!-- Logo URL -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-slate-400">Logo URL</label>
                        <div class="flex gap-4 items-center">
                            <div
                                class="h-12 w-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                <img v-if="form.logo" :src="form.logo" class="h-full w-full object-contain" />
                                <span v-else class="text-xs text-slate-600">No Logo</span>
                            </div>
                            <input v-model="form.logo" type="url"
                                class="flex-1 bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-slate-600 font-mono text-sm"
                                placeholder="https://example.com/logo.png" />
                        </div>
                    </div>

                    <!-- Action -->
                    <div class="pt-4 flex items-center justify-between">
                        <span v-if="message" :class="message.includes('Error') ? 'text-rose-400' : 'text-emerald-400'"
                            class="text-sm font-medium animate-pulse">
                            {{ message }}
                        </span>
                        <span v-else></span>

                        <button type="submit" :disabled="loading"
                            class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ loading ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
