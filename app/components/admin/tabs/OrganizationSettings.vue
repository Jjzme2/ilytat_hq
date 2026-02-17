<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in">
        <!-- Header -->
        <div>
            <h2 class="text-lg font-semibold text-white">Organization Settings</h2>
            <p class="text-sm text-zinc-400">Manage your tenant's branding and core values.</p>
        </div>

        <!-- Organization Section -->
        <section v-if="tenant" class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
            <h3 class="text-base font-medium text-white mb-4">Branding & Integration</h3>
            <div class="space-y-4">
                    <div>
                    <label class="block text-sm font-medium text-zinc-400 mb-1">Company Logo URL</label>
                    <div class="flex gap-2">
                        <input 
                            v-model="logoInput" 
                            type="text" 
                            placeholder="https://example.com/logo.png"
                            class="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors"
                        />
                        <button 
                            @click="saveLogo" 
                            :disabled="isSaving"
                            class="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {{ isSaving ? 'Saving...' : 'Save' }}
                        </button>
                    </div>
                    <p class="text-xs text-zinc-500 mt-1">Enter a direct URL to your company logo image.</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-zinc-400 mb-1">Files API URL</label>
                    <div class="flex gap-2">
                        <input 
                            v-model="filesUrlInput" 
                            type="text" 
                            placeholder="https://api.example.com/files"
                            class="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors"
                        />
                        <button 
                            @click="saveFilesUrl" 
                            :disabled="isSavingFilesUrl"
                            class="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {{ isSavingFilesUrl ? 'Saving...' : 'Save' }}
                        </button>
                    </div>
                    <p class="text-xs text-zinc-500 mt-1">Enter a URL that returns a JSON list of files for the Documents page.</p>
                </div>
                
                <div v-if="tenant.logo" class="mt-4">
                    <p class="text-sm font-medium text-zinc-400 mb-2">Preview</p>
                    <div class="p-4 bg-zinc-800/50 rounded-lg border border-white/5 inline-block">
                        <img :src="tenant.logo" alt="Company Logo" class="h-8 w-auto object-contain" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Mission & Values Section -->
        <section v-if="tenant" class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
            <h3 class="text-base font-medium text-white mb-4">Mission, Pillars & Values</h3>
            <div class="space-y-6">
                <!-- Mission Statement -->
                <div>
                    <label class="block text-sm font-medium text-zinc-400 mb-1">Mission Statement</label>
                    <textarea
                        v-model="missionInput"
                        rows="3"
                        placeholder="To organize the world's information..."
                        class="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors resize-none"
                    ></textarea>
                    <div class="mt-2 flex justify-end">
                        <button
                            @click="saveMission"
                            :disabled="isSavingMission"
                            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-white/5"
                        >
                            {{ isSavingMission ? 'Saving...' : 'Save Mission' }}
                        </button>
                    </div>
                </div>

                <!-- Pillars -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-medium text-zinc-400">Pillars</label>
                        <button @click="addPillar" class="text-xs text-accent-primary hover:text-accent-secondary flex items-center gap-1">
                            <span class="i-heroicons-plus-circle text-lg"></span> Add Pillar
                        </button>
                    </div>
                    <div class="space-y-2">
                        <div v-for="(pillar, index) in pillarsInput" :key="index" class="flex gap-2">
                            <input
                                v-model="pillarsInput[index]"
                                type="text"
                                placeholder="e.g. Customer Obsession"
                                class="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors"
                            />
                            <button @click="removePillar(index)" class="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                                <span class="i-heroicons-trash text-lg"></span>
                            </button>
                        </div>
                        <p v-if="pillarsInput.length === 0" class="text-sm text-zinc-600 italic">No pillars defined.</p>
                    </div>
                    <div v-if="pillarsInput.length > 0" class="mt-2 flex justify-end">
                        <button
                            @click="savePillars"
                            :disabled="isSavingPillars"
                            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-white/5"
                        >
                            {{ isSavingPillars ? 'Saving...' : 'Save Pillars' }}
                        </button>
                    </div>
                </div>

                    <!-- Core Values -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-medium text-zinc-400">Core Values</label>
                        <button @click="addValue" class="text-xs text-accent-primary hover:text-accent-secondary flex items-center gap-1">
                            <span class="i-heroicons-plus-circle text-lg"></span> Add Value
                        </button>
                    </div>
                    <div class="space-y-2">
                        <div v-for="(val, index) in valuesInput" :key="index" class="flex gap-2">
                            <input
                                v-model="valuesInput[index]"
                                type="text"
                                placeholder="e.g. Integrity"
                                class="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors"
                            />
                            <button @click="removeValue(index)" class="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                                <span class="i-heroicons-trash text-lg"></span>
                            </button>
                        </div>
                        <p v-if="valuesInput.length === 0" class="text-sm text-zinc-600 italic">No core values defined.</p>
                    </div>
                        <div v-if="valuesInput.length > 0" class="mt-2 flex justify-end">
                        <button
                            @click="saveValues"
                            :disabled="isSavingValues"
                            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-white/5"
                        >
                            {{ isSavingValues ? 'Saving...' : 'Save Values' }}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { useTenant } from '~/composables/useTenant';

const db = useFirestore();
const { tenant, tenantId } = useTenant();
// Assuming useToast is globally available or auto-imported like in settings.vue
const { success, error: toastError } = useToast();

const logoInput = ref('');
const isSaving = ref(false);

// Initialize input with current logo
watch(() => tenant.value?.logo, (newLogo) => {
    if (newLogo) {
        logoInput.value = newLogo;
    }
}, { immediate: true });

const saveLogo = async () => {
    if (!tenantId.value) return;
    
    isSaving.value = true;
    try {
        const tenantRef = doc(db, 'tenants', tenantId.value);
        await updateDoc(tenantRef, { logo: logoInput.value });
        success('Logo updated successfully');
    } catch (error) {
        console.error('Failed to update logo:', error);
        toastError('Failed to update logo');
    } finally {
        isSaving.value = false;
    }
};

const filesUrlInput = ref('');
const isSavingFilesUrl = ref(false);

watch(() => tenant.value?.filesUrl, (newUrl) => {
    if (newUrl) {
        filesUrlInput.value = newUrl;
    }
}, { immediate: true });

const saveFilesUrl = async () => {
    if (!tenantId.value) return;
    
    isSavingFilesUrl.value = true;
    try {
        const tenantRef = doc(db, 'tenants', tenantId.value);
        await updateDoc(tenantRef, { filesUrl: filesUrlInput.value });
        success('Files URL updated successfully');
    } catch (error) {
        console.error('Failed to update files URL:', error);
        toastError('Failed to update files URL');
    } finally {
        isSavingFilesUrl.value = false;
    }
};

const missionInput = ref('');
const isSavingMission = ref(false);

const pillarsInput = ref<string[]>([]);
const isSavingPillars = ref(false);

const valuesInput = ref<string[]>([]);
const isSavingValues = ref(false);

// Initialize inputs
watch(() => tenant.value, (newTenant) => {
    if (newTenant) {
        if (!missionInput.value && newTenant.missionStatement) missionInput.value = newTenant.missionStatement;
        // Only init if empty to avoid overwriting edits
        if (pillarsInput.value.length === 0 && newTenant.pillars) pillarsInput.value = [...newTenant.pillars];
        if (valuesInput.value.length === 0 && newTenant.coreValues) valuesInput.value = [...newTenant.coreValues];
    }
}, { immediate: true, deep: true });

const saveMission = async () => {
    if (!tenantId.value) return;
    isSavingMission.value = true;
    try {
        const tenantRef = doc(db, 'tenants', tenantId.value);
        await updateDoc(tenantRef, { missionStatement: missionInput.value });
        success('Mission statement updated');
    } catch (e) {
        console.error(e);
        toastError('Failed to update mission');
    } finally {
        isSavingMission.value = false;
    }
};

// Pillars Logic
const addPillar = () => {
    pillarsInput.value.push('');
};
const removePillar = (index: number) => {
    pillarsInput.value.splice(index, 1);
};
const savePillars = async () => {
    if (!tenantId.value) return;
    isSavingPillars.value = true;
    try {
        const cleaned = pillarsInput.value.filter(p => p.trim() !== '');
        const tenantRef = doc(db, 'tenants', tenantId.value);
        await updateDoc(tenantRef, { pillars: cleaned });
        pillarsInput.value = cleaned;
        success('Pillars updated');
    } catch (e) {
        console.error(e);
        toastError('Failed to update pillars');
    } finally {
        isSavingPillars.value = false;
    }
};

// Values Logic
const addValue = () => {
    valuesInput.value.push('');
};
const removeValue = (index: number) => {
    valuesInput.value.splice(index, 1);
};
const saveValues = async () => {
    if (!tenantId.value) return;
    isSavingValues.value = true;
    try {
         const cleaned = valuesInput.value.filter(v => v.trim() !== '');
        const tenantRef = doc(db, 'tenants', tenantId.value);
        await updateDoc(tenantRef, { coreValues: cleaned });
         valuesInput.value = cleaned;
        success('Core values updated');
    } catch (e) {
        console.error(e);
        toastError('Failed to update values');
    } finally {
        isSavingValues.value = false;
    }
};
</script>
