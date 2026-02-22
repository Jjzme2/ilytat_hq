<template>
    <div class="chk-theme min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background Accents -->
        <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none contrast-150 brightness-150"></div>

        <div class="w-full max-w-md relative z-10 animate-fade-in-up">
            <!-- Logo area -->
            <div class="flex flex-col items-center mb-10">
                <div class="w-16 h-16 bg-gradient-to-tr from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-accent-primary/20 mb-4">
                    <span class="text-xl font-black italic">HQ</span>
                </div>
                <h1 class="text-2xl font-bold text-white tracking-widest uppercase">ILYTAT</h1>
                <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Intelligence Layer Access</p>
            </div>

            <div class="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl relative group overflow-hidden">
                <!-- Hover light effect -->
                <div class="absolute -inset-px bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <h2 class="text-xl font-bold mb-8 text-white relative z-10">Authentication</h2>

                <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
                    <div class="space-y-1.5">
                        <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Identifier</label>
                        <div class="relative group/input">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-envelope-simple-bold text-zinc-500 group-focus-within/input:text-accent-primary transition-colors"></span>
                            <input v-model="email" type="email" required
                                class="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all placeholder-zinc-700"
                                placeholder="name@company.com" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Security Key</label>
                        <div class="relative group/input">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 i-ph-lock-key-bold text-zinc-500 group-focus-within/input:text-accent-primary transition-colors"></span>
                            <input v-model="password" :type="showPassword ? 'text' : 'password'" required
                                class="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all placeholder-zinc-700"
                                placeholder="••••••••" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                                <span :class="showPassword ? 'i-ph-eye-closed-bold' : 'i-ph-eye-bold'"></span>
                            </button>
                        </div>
                        <div class="flex justify-end mt-2">
                            <button type="button" @click="handleForgotPassword"
                                class="text-[10px] font-bold text-accent-primary hover:text-accent-secondary transition-colors uppercase tracking-widest">
                                Recover Access
                            </button>
                        </div>
                    </div>

                    <div v-if="error"
                        class="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-shake">
                        {{ error }}
                    </div>

                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                    >
                        <span class="relative z-10 flex items-center justify-center gap-2">
                            <span v-if="isLoading" class="i-ph-circle-notch-bold animate-spin text-lg"></span>
                            {{ isLoading ? 'Processing...' : 'Establish Connection' }}
                        </span>
                        <div class="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                    </button>
                </form>
            </div>

            <p class="mt-8 text-center text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                Restricted Terminal • HQ v4.0.0
            </p>
        </div>
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

watch(user, async (currentUser) => {
    if (currentUser) {
        // Ensure state is fully ready
        await nextTick();
        const redirectPath = (route.query.redirect as string) || '/';
        navigateTo(redirectPath, { replace: true });
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
        
        addToast('Welcome back, Operator.', 'success', null, {
            position: 'top-right',
            duration: 3000
        });

        // Delay redirection slightly to allow the toast and auth state to propagate
        setTimeout(() => {
            const redirectPath = (route.query.redirect as string) || '/';
            navigateTo(redirectPath, { replace: true });
        }, 800);
        
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

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out infinite;
  animation-iteration-count: 2;
}
</style>
