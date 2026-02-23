<template>
  <div class="space-y-6">
    <!-- Header Area -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span class="i-ph-flask-duotone text-indigo-400"></span>
          Simulation Lab
        </h2>
        <p class="text-slate-400 text-sm mt-1">Execute automated system diagnostics and stress tests.</p>
      </div>
      
      <button 
        @click="runTests" 
        :disabled="isRunning || !isDevEnvironment"
        class="relative px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-2"
        :class="[
          !isDevEnvironment 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
             : isRunning 
               ? 'bg-indigo-600/50 text-indigo-200 cursor-wait border border-indigo-500/30 overflow-hidden' 
               : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-400 hover:shadow-indigo-500/25 active:scale-95'
        ]"
      >
        <div v-if="isRunning" class="absolute inset-0 bg-indigo-500/20 animate-pulse"></div>
        <span v-if="isRunning" class="i-ph-spinner-gap-duotone animate-spin text-lg relative z-10"></span>
        <span v-else class="i-ph-play-fill text-lg relative z-10"></span>
        <span class="relative z-10">{{ isRunning ? 'Running Protocol...' : 'Initialize Tests' }}</span>
      </button>
    </div>

    <!-- Warning / Status Flags -->
    <div v-if="!isDevEnvironment" class="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
      <span class="i-ph-warning-duotone text-orange-400 text-xl shrink-0 mt-0.5"></span>
      <div>
        <h4 class="text-orange-300 font-medium">Production Environment Detected</h4>
        <p class="text-orange-400/80 text-sm mt-1">
          Automated tests are disabled in production to preserve system resources and prevent unintended side effects. Switch to a local development environment to run diagnostics.
        </p>
      </div>
    </div>

    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
       <span class="i-ph-warning-circle-duotone text-xl"></span>
       {{ error }}
    </div>

    <!-- Results Overview -->
    <div v-if="results" class="grid grid-cols-1 md:grid-cols-4 gap-4">
       <!-- Scorecard -->
       <div class="md:col-span-4 grid grid-cols-3 gap-4 mb-2">
           <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
               <span class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Tests</span>
               <span class="text-3xl font-bold text-white">{{ results.numTotalTests }}</span>
           </div>
           <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent"></div>
               <span class="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-1 relative z-10">Passed</span>
               <span class="text-3xl font-bold text-emerald-400 relative z-10">{{ results.numPassedTests }}</span>
           </div>
           <div class="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent"></div>
               <span class="text-rose-400 text-sm font-medium uppercase tracking-wider mb-1 relative z-10">Failed</span>
               <span class="text-3xl font-bold text-rose-400 relative z-10">{{ results.numFailedTests }}</span>
           </div>
       </div>

       <!-- Diagnostics Breakdown -->
       <div class="md:col-span-4 space-y-3 mt-4">
           <h3 class="text-lg font-medium text-white flex items-center gap-2 mb-4">
               <span class="i-ph-tree-structure-duotone text-slate-400"></span>
               File Analysis
           </h3>

           <div v-for="(suite, idx) in results.testResults" :key="idx" 
                class="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600/50">
               <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                    @click="toggleSuite(idx)">
                   <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            :class="suite.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
                           <span :class="suite.status === 'passed' ? 'i-ph-check-bold' : 'i-ph-x-bold'"></span>
                       </div>
                       <div>
                           <div class="text-sm font-code text-slate-300 break-all">{{ getRelativePath(suite.name) }}</div>
                           <div class="text-xs text-slate-500 mt-0.5">
                               {{ suite.assertionResults?.length || 0 }} assertions • {{ suite.endTime - suite.startTime }}ms
                           </div>
                       </div>
                   </div>
                   <div class="flex items-center gap-2 text-slate-400">
                       <span class="text-xs uppercase font-medium bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                           {{ suite.status }}
                       </span>
                       <span class="i-ph-caret-down-bold transition-transform duration-300 text-sm"
                             :class="{ 'rotate-180': expandedSuites.includes(idx) }"></span>
                   </div>
               </div>

               <!-- Detailed Assertions (Expands) -->
               <div v-if="expandedSuites.includes(idx)" 
                    class="border-t border-slate-700/50 bg-slate-900/30 p-4 space-y-2">
                   <div v-for="(assertion, aIdx) in suite.assertionResults" :key="aIdx"
                        class="flex flex-col gap-1 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                       <div class="flex items-center justify-between">
                           <div class="flex items-start gap-2">
                               <span class="mt-0.5 shrink-0 text-sm"
                                     :class="assertion.status === 'passed' ? 'i-ph-check-circle-duotone text-emerald-400' : 'i-ph-warning-circle-duotone text-rose-400'"></span>
                               <span class="text-sm text-slate-300">{{ assertion.title }}</span>
                           </div>
                           <span class="text-xs text-slate-500 font-code font-medium">{{ assertion.status }}</span>
                       </div>
                       <div v-if="assertion.failureMessages?.length" class="mt-2 text-xs font-code text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 overflow-x-auto whitespace-pre">
                           {{ assertion.failureMessages.join('\n') }}
                       </div>
                   </div>
                   
                   <div v-if="suite.message" class="mt-2 text-xs font-code text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 overflow-x-auto whitespace-pre">
                       {{ suite.message }}
                   </div>
               </div>
           </div>
       </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isRunning && !results && !error && isDevEnvironment" 
         class="flex flex-col items-center justify-center py-24 bg-slate-800/20 border border-slate-700/50 rounded-2xl border-dashed">
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
            <div class="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center relative z-10 shadow-xl">
                <span class="i-ph-flask-duotone text-3xl text-indigo-400"></span>
            </div>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Systems Nominal</h3>
        <p class="text-slate-500 text-sm max-w-sm text-center">
            The simulation lab is ready. Run the test suite to verify the integrity of all core models and configurations.
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'

// Ensure we know if we're in dev mode
const isDevEnvironment = computed(() => {
    // Nuxt specific flag available on client
    return import.meta.dev === true
})

const isRunning = ref(false)
const results = ref<any>(null)
const error = ref<string | null>(null)
const expandedSuites = ref<(number | string)[]>([])

const toggleSuite = (idx: number | string) => {
    if (expandedSuites.value.includes(idx)) {
        expandedSuites.value = expandedSuites.value.filter(i => i !== idx)
    } else {
        expandedSuites.value.push(idx)
    }
}

const getRelativePath = (fullPath: string) => {
    // Attempt to truncate the absolute path to just from the project root
    if (!fullPath) return 'Unknown File'
    const parts = fullPath.split('/')
    const appIndex = parts.indexOf('app')
    const configIndex = parts.indexOf('config')
    const ilytatIndex = parts.indexOf('ilytat_common_packages')
    
    if (appIndex !== -1) return parts.slice(appIndex).join('/')
    if (configIndex !== -1) return parts.slice(configIndex).join('/')
    if (ilytatIndex !== -1) return parts.slice(ilytatIndex).join('/')
    
    // Fallback: just return the last 3 path segments
    return parts.slice(-3).join('/')
}

const runTests = async () => {
    if (!isDevEnvironment.value) return

    isRunning.value = true
    results.value = null
    error.value = null
    expandedSuites.value = []

    try {
        const response: any = await $fetch('/api/admin/tests/run', {
            method: 'POST'
        })
        
        // Structure is standard vitest json reporter output embedded in response.results
        if (response && response.results) {
            results.value = response.results
            
            // Auto expand failed suites
            if (results.value.testResults) {
                results.value.testResults.forEach((suite: any, idx: number) => {
                    if (suite.status !== 'passed') {
                        expandedSuites.value.push(idx)
                    }
                })
            }

            // Celebrate perfection
            if (response.success && results.value.numFailedTests === 0 && results.value.numTotalTests > 0) {
                fireConfetti()
            }
        } else if (response && response.error) {
             error.value = `Test runner failed: ${response.error}`
        }
    } catch (err: any) {
        console.error("Test execution failed:", err)
        error.value = err.data?.statusMessage || err.message || 'An unknown error occurred during test execution.'
        if (err.data && err.data.results) {
             results.value = err.data.results
        }
    } finally {
        isRunning.value = false
    }
}

const fireConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#34d399', '#10b981', '#059669'] // Emerald greens
        })
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#34d399', '#10b981', '#059669']
        })

        if (Date.now() < end) {
            requestAnimationFrame(frame)
        }
    }
    frame()
}
</script>
