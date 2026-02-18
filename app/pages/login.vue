<template>
    <div class="bg-zinc-900 border border-white/5 rounded-2xl p-8 backdrop-blur-sm relative z-20 shadow-2xl">
        <h2 class="text-xl font-bold mb-6 text-center">Sign In</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                <input v-model="email" type="email" required
                    class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
                    placeholder="name@company.com" />
            </div>

            <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                <div class="relative">
                    <input v-model="password" :type="showPassword ? 'text' : 'password'" required
                        class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600 pr-10"
                        placeholder="••••••••" />
                    <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                    </button>
                </div>
                <div class="flex justify-end mt-1">
                    <button type="button" @click="handleForgotPassword"
                        class="text-xs text-blue-400 hover:text-blue-300">
                        Forgot Password?
                    </button>
                </div>
            </div>

            <div v-if="error"
                class="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2 rounded">
                {{ error }}
            </div>

            <button type="submit" :disabled="isLoading"
                class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isLoading"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
        </form>

        <p class="mt-6 text-center text-xs text-zinc-500">
            Internal System. access is restricted.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useCurrentUser } from 'vuefire';
// useToast is auto-imported from the ilytat-notifications Nuxt layer

definePageMeta({
    layout: 'auth',
    middleware: ['guest']
});

// Redirect if already logged in (Fallback for middleware)
const user = useCurrentUser();
const router = useRouter();

watch(user, (currentUser) => {
    if (currentUser) {
        router.replace((route.query.redirect as string) || '/');
    }
}, { immediate: true });

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);


const { signIn, resetPassword } = useUser();
const { add: addToast } = useToast();
const route = useRoute();

const handleLogin = async () => {
    error.value = '';
    isLoading.value = true;

    try {
        await signIn(email.value, password.value);
        addToast('Welcome back', 'success', null, {
            position: 'top-right',
            duration: 3000
        });

        // Check for redirect query param or default to dashboard
        const redirect = router.currentRoute.value.query.redirect as string;
        router.push(redirect || '/');
    } catch (e: any) {
        Logger.error('[Login] Sign in failed', e);
        error.value = e.message || 'Failed to sign in. Please check your credentials.';
        addToast(error.value, 'error', null, {
            position: 'top-right'
        });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (route.query.reason === 'timeout') {
        addToast('You have been logged out due to inactivity.', 'warning', null, {
            position: 'top-center',
            duration: 5000
        });
    }
});


const handleForgotPassword = async () => {
    if (!email.value) {
        addToast('Please enter your email address first', 'warning');
        return;
    }

    try {
        await resetPassword(email.value);
        addToast(`Password reset email sent to ${email.value}`, 'success');
    } catch (e: any) {
        Logger.error('[Login] Reset password failed', e);
        addToast('Failed to send reset email. Please try again.', 'error');
    }
};
</script>
