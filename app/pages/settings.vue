<template>
    <div class="h-full flex flex-col">
        <header class="flex-none px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
                    Settings
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage your account and preferences</p>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div class="max-w-6xl mx-auto space-y-8">
                <!-- Profile Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Profile</h2>
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-accent-primary flex items-center justify-center text-white text-xl font-bold">
                            JJ
                        </div>
                        <div>
                            <p class="font-medium text-white">User</p>
                            <p class="text-sm text-zinc-400">staff@ilytat.com</p>
                            <div class="flex items-center gap-2 mt-2">
                                <button 
                                    @click="handleResetPassword" 
                                    class="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                    Reset Password
                                </button>
                                <span v-if="!userStore.firebaseUser.value?.emailVerified" class="text-zinc-600">|</span>
                                <button 
                                    v-if="!userStore.firebaseUser.value?.emailVerified"
                                    @click="handleVerifyEmail" 
                                    class="text-xs text-amber-400 hover:text-amber-300 underline"
                                >
                                    Verify Email
                                </button>
                            </div>
                        </div>
                        <button class="ml-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors border border-white/5">
                            Edit Profile
                        </button>
                    </div>
                </section>

                <!-- Appearance / Themes Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <div class="flex justify-between items-center mb-6 sticky top-0 z-10 bg-zinc-900/95 py-2 backdrop-blur">
                        <div>
                            <h2 class="text-lg font-semibold text-white">Appearance</h2>
                            <p class="text-xs text-zinc-400">Choose your style from our collection</p>
                        </div>
                        <div class="text-sm font-medium px-3 py-1 bg-black/20 rounded-full border border-white/5">
                            Top Themes: <span :class="{'text-red-400': themeStore.savedThemeIds.length >= 10, 'text-accent-primary': themeStore.savedThemeIds.length < 10}">{{ themeStore.savedThemeIds.length }}/10</span>
                        </div>
                    </div>

                    <div class="space-y-8">
                        <div v-for="category in THEME_CATEGORIES" :key="category">
                            <h3 class="text-sm font-medium text-zinc-300 mb-3 pl-1 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-accent-secondary"></span>
                                {{ category }}
                            </h3>
                            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <ThemeCard
                                    v-for="theme in themesByCategory[category]"
                                    :key="theme.id"
                                    :theme="theme"
                                    :is-active="themeStore.activeThemeId === theme.id"
                                    :is-saved="themeStore.savedThemeIds.includes(theme.id)"
                                    @select="themeStore.setTheme"
                                    @toggle-save="handleToggleSave"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Organization Section -->
                <section v-if="tenant" class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Organization</h2>
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
                        
                        <div v-if="tenant.logo" class="mt-4">
                            <p class="text-sm font-medium text-zinc-400 mb-2">Preview</p>
                            <div class="p-4 bg-zinc-800/50 rounded-lg border border-white/5 inline-block">
                                <img :src="tenant.logo" alt="Company Logo" class="h-8 w-auto object-contain" />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Preferences Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Preferences</h2>
                    <div class="space-y-4">
                         <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <div>
                                <h3 class="text-sm font-medium text-white">Notifications</h3>
                                <p class="text-xs text-zinc-400">Receive system alerts</p>
                            </div>
                            <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-accent-primary transition-colors">
                                <span class="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';
import { THEMES, THEME_CATEGORIES, type Theme } from '~/data/themes';
import { doc, updateDoc } from 'firebase/firestore';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const themeStore = useThemeStore();
const userStore = useUser();
const db = useFirestore();
const { tenant, tenantId } = useTenant();
const { success, error: toastError } = useToast();

const logoInput = ref('');
const isSaving = ref(false);

// Initialize input with current logo
watch(() => tenant.value?.logo, (newLogo) => {
    if (newLogo) {
        logoInput.value = newLogo;
    }
}, { immediate: true });

const themesByCategory = computed(() => {
    const grouped: Record<string, Theme[]> = {};
    THEMES.forEach(theme => {
        if (!grouped[theme.category]) {
            grouped[theme.category] = [];
        }
        grouped[theme.category].push(theme);
    });
    return grouped;
});

const handleToggleSave = (id: string) => {
    const success = themeStore.toggleSavedTheme(id);
    if (!success) {
        toastError('You can only have up to 10 top themes.');
    }
};

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

const handleResetPassword = async () => {
    if (!userStore.user.value?.email) return;
    try {
        await userStore.resetPassword(userStore.user.value.email);
        success('Password reset email sent');
    } catch (e) {
        toastError('Failed to send reset email');
        console.error(e);
    }
};

const handleVerifyEmail = async () => {
    try {
        await userStore.verifyEmail();
        success('Verification email sent');
    } catch (e) {
        toastError('Failed to send verification');
        console.error(e);
    }
};
</script>
