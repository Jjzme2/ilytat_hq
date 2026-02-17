<template>
    <div class="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20">
        <!-- Top Navigation (The "Skeleton" Header) -->
        <!-- Top Navigation -->
        <header class="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50 transition-all duration-300">
            <!-- Left: Brand -->
            <div class="flex items-center gap-4 mr-8 group cursor-default">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-300">
                    <span class="text-white font-bold text-lg leading-none mt-0.5">I</span>
                </div>
                <div class="flex flex-col">
                    <h1 class="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter uppercase leading-none">
                        HQ.ILYTAT
                    </h1>
                    <p class="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">Command Layer</p>
                </div>
            </div>

            <!-- Tabs -->
            <nav class="flex items-center gap-1 relative z-50">
                <button v-for="tab in tabs" :key="tab.id"
                    @click="setActiveTab(tab.id)"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 relative group overflow-hidden"
                    :class="activeTabId === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'">
                    
                    <span class="relative z-10 flex items-center gap-2">
                        <span>{{ tab.icon }}</span>
                        {{ tab.label }}
                    </span>

                    <!-- Active Glow Effect -->
                    <div v-if="activeTabId === tab.id" class="absolute inset-0 bg-white/5 border border-white/10 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.05)]"></div>
                    <div v-if="activeTabId === tab.id" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                </button>
            </nav>

            <div class="flex-1"></div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-4">
                 <button @click="router.push('/')" 
                    class="text-xs font-medium text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
                    <span>Exit</span>
                    <span class="text-[10px]">↗</span>
                </button>
                <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-300 font-bold ring-2 ring-transparent hover:ring-white/10 transition-all">
                   {{ currentUser?.email?.[0]?.toUpperCase() }}
                </div>
            </div>
        </header>

        <!-- Main Content (The "Viewport") -->
        <main class="flex-1 overflow-y-auto bg-zinc-950">
            <div class="max-w-[1400px] mx-auto p-8">
                <div class="animate-fade-in" v-if="activeTab">
                    <!-- Dynamic Component Loader -->
                    <component :is="activeTab.component" v-if="activeTab.component" />
                    <!-- Fallback if using string ID that resolved to component, works via :is too -->
                </div>
                <div v-else class="text-zinc-500 text-center mt-10">Select a tab</div>
            </div>
        </main>
        
        <!-- Mobile Nav (Bottom Bar) -->
        <div class="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-md pb-safe">
            <div class="flex justify-around p-2">
                 <button v-for="tab in mobileTabs" :key="tab.id"
                    @click="setActiveTab(tab.id)"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg"
                    :class="activeTabId === tab.id ? 'text-white' : 'text-slate-600'">
                    <span class="text-lg">{{ tab.icon }}</span>
                    <span class="text-[10px] font-medium">{{ tab.label }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, resolveComponent } from 'vue';
import { useCurrentUser } from 'vuefire';
import { useAdminPanel } from '../composables/useAdminPanel';

const currentUser = useCurrentUser();
const router = useRouter();
const route = useRoute();
const { tabs, activeTabId, activeTab, registerTab, setActiveTab } = useAdminPanel();

// Register Default Tabs
// We use resolveComponent to ensure they are available if not auto-imported in this context
// Or we can pass strings if Global Components.
// For now, providing strings and hoping Nuxt resolves global components associated with the layer.
onMounted(() => {
    registerTab({ id: 'dashboard', label: 'Overview', icon: '📊', component: resolveComponent('AdminDashboard'), order: 0 });
    registerTab({ id: 'users', label: 'Users', icon: '👥', component: resolveComponent('AdminUsers'), order: 10 });
    registerTab({ id: 'projects', label: 'Projects', icon: '📁', component: resolveComponent('AdminProjects'), order: 20 });
    registerTab({ id: 'tenant', label: 'Tenants', icon: '🏢', component: resolveComponent('AdminTenant'), order: 30 });
    registerTab({ id: 'permissions', label: 'Access', icon: '🔐', component: resolveComponent('AdminPermissions'), order: 40 });
    registerTab({ id: 'modules', label: 'Modules', icon: '🧩', component: resolveComponent('ModuleConfig'), order: 50 });
    registerTab({ id: 'system', label: 'System', icon: '⚙️', component: resolveComponent('AdminSystem'), order: 60 });
    
    // Initialize User Profile
    const { initializeUserProfile: initialize } = useUserProfile();
    initialize();
});

// Mobile shows fewer tabs
const mobileTabs = computed(() => tabs.value.slice(0, 5));

// Sync tab with URL
watch(() => route.query.tab, (newTab) => {
    if (newTab && typeof newTab === 'string') {
        setActiveTab(newTab);
    }
}, { immediate: true });

watch(activeTabId, (newId) => {
    if (newId) {
        router.replace({ query: { ...route.query, tab: newId } });
    }
});

useHead({
    title: 'Admin Console | ILYTAT HQ',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});

definePageMeta({
    middleware: 'admin',
    layout: false,
    pageTransition: false,
    layoutTransition: false
});

import { useUserProfile } from '../composables/useUserProfile';
</script>

<style>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
