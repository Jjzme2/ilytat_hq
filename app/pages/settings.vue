<template>
    <div class="h-full flex flex-col">
        <header
            class="flex-none px-4 md:px-6 py-3 md:py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <Breadcrumbs
                    :items="[{ label: 'Home', to: '/', icon: 'i-heroicons-home' }, { label: 'Settings', icon: 'i-heroicons-cog-6-tooth' }]"
                    class="mb-2" />
                <h1
                    class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
                    Settings
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage your account and preferences</p>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin">
            <div class="max-w-4xl space-y-6 md:space-y-8">
                <!-- Profile Section -->
                <section class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-6">
                        <button v-if="!isEditing" @click="startEditing"
                            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors border border-white/5">
                            Edit Profile
                        </button>
                        <div v-else class="flex gap-2">
                            <button @click="cancelEditing"
                                class="px-3 py-2 text-zinc-400 hover:text-white text-sm transition-colors">
                                Cancel
                            </button>
                            <button @click="saveProfile"
                                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors shadow-lg shadow-emerald-900/20">
                                Save
                            </button>
                        </div>
                    </div>

                    <h2 class="text-lg font-semibold text-white mb-6">Profile</h2>

                    <div class="flex flex-col md:flex-row gap-6 md:items-start">
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                            <div
                                class="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-2 ring-white/10">
                                <img v-if="editForm.photoURL || userStore.user.value?.photoURL"
                                    :src="isEditing ? editForm.photoURL : userStore.user.value?.photoURL"
                                    class="w-full h-full rounded-full object-cover" alt="Profile" />
                                <span v-else>{{ userInitials }}</span>
                            </div>
                            <div v-if="isEditing" class="mt-2">
                                <label class="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Photo
                                    URL</label>
                                <input v-model="editForm.photoURL" type="text"
                                    class="w-full bg-zinc-950/50 border border-white/10 rounded px-2 py-1 text-xs text-zinc-300 focus:border-accent-primary focus:outline-none"
                                    placeholder="https://..." />
                            </div>
                        </div>

                        <!-- User Info -->
                        <div class="flex-1 space-y-4 min-w-0">
                            <!-- Name & Handle -->
                            <div>
                                <div v-if="isEditing" class="mb-2">
                                    <label class="block text-xs text-zinc-500 mb-1">Display Name</label>
                                    <input v-model="editForm.displayName" type="text"
                                        class="w-full md:w-64 bg-zinc-950/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent-primary focus:outline-none" />
                                </div>
                                <h3 v-else class="text-xl font-bold text-white">{{ userStore.user.value?.displayName }}
                                </h3>

                                <div class="flex items-center gap-2 mt-1">
                                    <span v-if="userStore.user.value?.username"
                                        class="px-2 py-0.5 rounded-md bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-mono">
                                        {{ userStore.user.value.username }}
                                    </span>
                                    <button v-else @click="claimGlobalID" :disabled="isClaiming"
                                        class="text-xs text-accent-primary hover:text-accent-secondary underline decoration-dotted underline-offset-4">
                                        {{ isClaiming ? 'Generating ID...' : 'Claim Global ID' }}
                                    </button>
                                </div>
                                <p class="text-sm text-zinc-500 mt-1">{{ userStore.user.value?.email }}</p>
                            </div>

                            <!-- Bio -->
                            <div class="max-w-xl">
                                <label v-if="isEditing" class="block text-xs text-zinc-500 mb-1">Bio</label>
                                <textarea v-if="isEditing" v-model="editForm.bio" rows="3"
                                    class="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-accent-primary focus:outline-none resize-none"
                                    placeholder="Tell us about yourself..."></textarea>
                                <p v-else class="text-sm text-zinc-400 leading-relaxed">
                                    {{ userStore.user.value?.bio || 'No bio provided yet.' }}
                                </p>
                            </div>

                            <!-- User Actions -->
                            <div v-if="!isEditing" class="flex gap-4 pt-2">
                                <button @click="handleResetPassword"
                                    class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                                    Reset Password
                                </button>
                                <button v-if="!userStore.firebaseUser.value?.emailVerified" @click="handleVerifyEmail"
                                    class="text-xs text-amber-500/80 hover:text-amber-400 transition-colors">
                                    Verify Email
                                </button>
                            </div>
                        </div>
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
                            <button @click="toggleTheme"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-zinc-900"
                                :class="isDark ? 'bg-accent-primary' : 'bg-zinc-700'">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                    :class="isDark ? 'translate-x-6' : 'translate-x-1'" />
                            </button>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <div>
                                <h3 class="text-sm font-medium text-white">Notifications</h3>
                                <p class="text-xs text-zinc-400">Receive system alerts</p>
                            </div>
                            <button
                                class="relative inline-flex h-6 w-11 items-center rounded-full bg-accent-primary transition-colors">
                                <span
                                    class="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                            </button>
                        </div>

                        <!-- AI Assistant Toggle -->
                        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                                    <span class="i-ph-sparkle-bold text-lg"></span>
                                </div>
                                <div>
                                    <h3 class="text-sm font-medium text-white">AI Assistant Bar</h3>
                                    <p class="text-xs text-zinc-400">Enable the global intelligence layer</p>
                                </div>
                            </div>
                            <button @click="toggleAssistant(!preferences?.assistantEnabled)"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-zinc-900"
                                :class="preferences?.assistantEnabled ? 'bg-accent-primary' : 'bg-zinc-700'">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                    :class="preferences?.assistantEnabled ? 'translate-x-6' : 'translate-x-1'" />
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
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { isDark, toggleTheme } = useIlytatTheme();
const userStore = useUser();
const db = useFirestore();
const { tenant, tenantId } = useTenant();
const { success, error: toastError } = useToast();
const { preferences, loadPreferences, toggleAssistant } = useUserPreferences();

onMounted(async () => {
    await loadPreferences();
});

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

// --- Profile Editing ---
const isEditing = ref(false);
const isClaiming = ref(false);
const editForm = reactive({
    displayName: '',
    bio: '',
    photoURL: ''
});

const startEditing = () => {
    if (!userStore.user.value) return;
    editForm.displayName = userStore.user.value.displayName;
    editForm.bio = userStore.user.value.bio;
    editForm.photoURL = userStore.user.value.photoURL;
    isEditing.value = true;
};

const cancelEditing = () => {
    isEditing.value = false;
};

const saveProfile = async () => {
    if (!userStore.user.value) return;

    try {
        const uid = userStore.user.value.uid;
        const userRef = doc(db, 'users', uid);

        await updateDoc(userRef, {
            displayName: editForm.displayName,
            bio: editForm.bio,
            photoURL: editForm.photoURL
        });

        // Update local state optimistic-ish (or re-init)
        // Ideally useUser would listen to changes, but for now we manually update
        userStore.user.value.displayName = editForm.displayName;
        userStore.user.value.bio = editForm.bio;
        userStore.user.value.photoURL = editForm.photoURL;

        success('Profile updated');
        isEditing.value = false;
    } catch (e) {
        toastError('Failed to update profile');
        console.error(e);
    }
};

const claimGlobalID = async () => {
    if (!userStore.user.value) return;
    isClaiming.value = true;

    try {
        const namePart = userStore.user.value.displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
        const rand = Math.floor(100 + Math.random() * 900); // 3 digits
        const year = new Date().getFullYear().toString().slice(-2);

        const newHandle = `@${namePart}${rand}-${year}`;

        const uid = userStore.user.value.uid;
        await updateDoc(doc(db, 'users', uid), {
            username: newHandle
        });

        userStore.user.value.username = newHandle;
        success(`Claimed Global ID: ${newHandle}`);
    } catch (e) {
        toastError('Failed to claim Global ID');
        console.error(e);
    } finally {
        isClaiming.value = false;
    }
};

const userInitials = computed(() => {
    if (!userStore.user.value) return 'NU';
    const name = userStore.user.value.displayName || '';
    if (!name) return 'NU';
    const parts = name.split(' ').filter(p => p.trim());
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
});

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
