<template>
    <div class="h-full flex flex-col">
        <header class="flex-none px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
                    Settings
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage your account and preferences</p>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin">
            <div class="max-w-4xl space-y-6 md:space-y-8">
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

                <!-- Organization Section Removed (Moved to Admin) -->
                <!-- Mission & Values Section Removed (Moved to Admin) -->

                <!-- Preferences Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">Preferences</h2>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <div>
                                <h3 class="text-sm font-medium text-white">Dark Mode</h3>
                                <p class="text-xs text-zinc-400">Toggle application theme</p>
                            </div>
                            <button 
                                @click="toggleTheme"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-zinc-900"
                                :class="isDark ? 'bg-accent-primary' : 'bg-zinc-700'"
                            >
                                <span 
                                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                    :class="isDark ? 'translate-x-6' : 'translate-x-1'"
                                />
                            </button>
                        </div>
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

                <!-- AI Model Preferences -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-4">AI Model Preference</h2>
                    <ModelSelector />
                </section>

                <!-- Keyboard Shortcuts Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                    <h2 class="text-lg font-semibold text-white mb-1">Keyboard Shortcuts</h2>
                    <p class="text-xs text-zinc-400 mb-4">Click any command to record a custom keybinding.</p>
                    <ClientOnly>
                        <ShortcutManager />
                    </ClientOnly>
                </section>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useIlytatTheme } from '@theme/composables/useIlytatTheme';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import ModelSelector from '~/components/ai/ModelSelector.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { isDark, toggleTheme } = useIlytatTheme();
const userStore = useUser();
const db = useFirestore();
const { tenant, tenantId } = useTenant();
const { success, error: toastError } = useToast();

// Logic moved to components/admin/tabs/OrganizationSettings.vue


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
