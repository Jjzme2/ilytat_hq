<template>
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div class="text-center">
            <div class="text-6xl mb-4">🚫</div>
            <h1 class="text-2xl font-black text-amber-500 uppercase tracking-tighter mb-2">Access Denied</h1>
            <p class="text-slate-500 font-mono text-xs uppercase tracking-widest">Unauthorized Access Detected / Class 5
                Security Violation</p>
            <button @click="$router.push('/')"
                class="mt-8 text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest text-xs">
                Return to Headquarters
            </button>
        </div>
    </div>
</template>
