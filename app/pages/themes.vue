<template>
  <div class="min-h-screen p-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
          Theme Gallery
        </h1>
        <p class="text-text-secondary mt-2">Explore, generate, and customize the interface.</p>
      </div>
      <div class="flex gap-4">
        <button
          @click="resetToDefault"
          class="px-4 py-2 rounded-lg border border-border-color hover:bg-bg-secondary transition-colors"
        >
          Reset Default
        </button>
      </div>
    </div>

    <!-- Builder Section -->
    <section class="bg-glass-bg border border-glass-border shadow-glass-shadow rounded-2xl p-4 md:p-6 backdrop-blur-md">
      <h2 class="text-2xl font-bold mb-4">Theme Builder</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Controls -->
        <div class="md:col-span-4 space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Seed</label>
            <div class="flex gap-2">
              <input 
                v-model="seedInput" 
                type="text" 
                placeholder="Enter seed..."
                class="flex-1 bg-bg-secondary border border-border-color rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent-primary outline-none"
                @keyup.enter="generateFromSeed"
              />
              <button 
                @click="randomizeSeed"
                class="p-2 rounded-lg bg-bg-tertiary hover:bg-bg-secondary transition-colors"
                title="Random Seed"
              >
                🎲
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Category Override (Optional)</label>
            <div class="flex flex-wrap gap-2">
                <button
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = selectedCategory === cat ? undefined : cat"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm',
                  selectedCategory === cat 
                    ? 'bg-accent-primary text-bg-primary border-accent-primary scale-105 ring-2 ring-accent-primary/20' 
                    : 'bg-bg-tertiary text-text-secondary border-transparent hover:bg-bg-secondary hover:border-border-color'
                ]"
              >
                <span v-if="selectedCategory === cat" class="text-[10px]">✓</span>
                {{ capitalize(cat) }}
              </button>
            </div>
          </div>

           <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Mode</label>
             <div class="flex gap-2 bg-bg-tertiary p-1 rounded-lg inline-flex">
                <button 
                    @click="forceDark = false"
                    :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', !forceDark ? 'bg-bg-primary shadow-sm text-text-primary ring-1 ring-accent-primary/50' : 'text-text-secondary hover:text-text-primary']"
                >
                  <span v-if="!forceDark" class="text-[10px]">☀️</span> Light
                </button>
                <button 
                     @click="forceDark = true"
                    :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', forceDark ? 'bg-bg-primary shadow-sm text-text-primary ring-1 ring-accent-primary/50' : 'text-text-secondary hover:text-text-primary']"
                >
                   <span v-if="forceDark" class="text-[10px]">🌙</span> Dark
                </button>
                <button 
                     @click="forceDark = undefined"
                    :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', forceDark === undefined ? 'bg-bg-primary shadow-sm text-text-primary ring-1 ring-accent-primary/50' : 'text-text-secondary hover:text-text-primary']"
                >
                  <span v-if="forceDark === undefined" class="text-[10px]">🌓</span> Auto
                </button>
            </div>
          </div>

          <!-- Texture Control -->
           <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Texture & Density</label>
            <div class="flex flex-col gap-2">
                 <div class="flex flex-wrap gap-2">
                        <button
                        v-for="tex in textures"
                        :key="tex"
                        @click="selectedTexture = selectedTexture === tex ? undefined : tex"
                        :class="[
                        'px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize flex items-center gap-1.5 border shadow-sm',
                        selectedTexture === tex 
                            ? 'bg-accent-primary text-bg-primary border-accent-primary scale-105 ring-2 ring-accent-primary/20' 
                            : 'bg-bg-tertiary text-text-secondary border-transparent hover:bg-bg-secondary hover:border-border-color'
                        ]"
                    >
                        <span v-if="selectedTexture === tex" class="text-[10px]">✓</span>
                        {{ tex }}
                    </button>
                 </div>
                 <div class="flex flex-wrap gap-2">
                        <button
                        v-for="den in densities"
                        :key="den"
                        @click="selectedDensity = selectedDensity === den ? undefined : den"
                         :class="[
                        'px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize flex items-center gap-1.5 border shadow-sm',
                        selectedDensity === den 
                            ? 'bg-accent-secondary text-bg-primary border-accent-secondary scale-105 ring-2 ring-accent-secondary/20' 
                            : 'bg-bg-tertiary text-text-secondary border-transparent hover:bg-bg-secondary hover:border-border-color'
                        ]"
                    >
                        <span v-if="selectedDensity === den" class="text-[10px]">✓</span>
                        {{ den }}
                    </button>
                 </div>
            </div>
          </div>
          <!-- Advanced Options (Collapsible) -->
          <div class="space-y-4 pt-4 border-t border-border-color">
            <button 
                @click="showAdvanced = !showAdvanced"
                class="flex items-center justify-between w-full text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
                <span>Advanced Controls</span>
                <span :class="['transition-transform duration-300', showAdvanced ? 'rotate-180' : '']">▼</span>
            </button>

            <div v-if="showAdvanced" class="space-y-6 pt-2">
                <!-- Color Controls -->
                <div class="space-y-4">
                    <p class="text-xs font-bold text-text-tertiary uppercase tracking-wider">Color Dynamics</p>
                    
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] font-bold">
                            <label>Base Hue</label>
                            <span>{{ advanced.baseHue }}°</span>
                        </div>
                        <input v-model.number="advanced.baseHue" type="range" min="0" max="360" class="w-full accent-accent-primary" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-bold">
                                <label>Saturation</label>
                                <span>{{ advanced.saturationScale }}x</span>
                            </div>
                            <input v-model.number="advanced.saturationScale" type="range" min="0" max="2" step="0.1" class="w-full accent-accent-primary" />
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-bold">
                                <label>Brightness</label>
                                <span>{{ advanced.brightnessScale }}x</span>
                            </div>
                            <input v-model.number="advanced.brightnessScale" type="range" min="0.5" max="1.5" step="0.1" class="w-full accent-accent-primary" />
                        </div>
                    </div>
                </div>

                <!-- Shape & Effects -->
                <div class="space-y-4">
                    <p class="text-xs font-bold text-text-tertiary uppercase tracking-wider">Aesthetics</p>
                    
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] font-bold">
                            <label>Border Radius</label>
                            <span>{{ advanced.borderRadius }}px</span>
                        </div>
                        <input v-model.number="advanced.borderRadius" type="range" min="0" max="32" class="w-full accent-accent-secondary" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-bold">
                                <label>Glass Blur</label>
                                <span>{{ advanced.glassBlur }}px</span>
                            </div>
                            <input v-model.number="advanced.glassBlur" type="range" min="0" max="40" class="w-full accent-accent-secondary" />
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-bold">
                                <label>Opacity</label>
                                <span>{{ Math.round(advanced.glassOpacity * 100) }}%</span>
                            </div>
                            <input v-model.number="advanced.glassOpacity" type="range" min="0" max="1" step="0.05" class="w-full accent-accent-secondary" />
                        </div>
                    </div>
                </div>

                <button 
                    @click="resetAdvanced"
                    class="text-[10px] text-rose-400 hover:text-rose-500 font-bold uppercase tracking-widest"
                >Reset Advanced</button>
            </div>
          </div>

          <button
            @click="generateFromSeed"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Generate Theme
          </button>
        </div>

        <!-- Preview -->
        <div class="md:col-span-8">
            <div v-if="generatedTheme" class="space-y-4">
                <div class="flex justify-between items-center">
                     <h3 class="text-xl font-semibold">{{ generatedTheme.name }} <span class="text-sm font-normal text-text-tertiary">({{ generatedTheme.category }})</span></h3>
                     <div class="flex gap-2">
                         <button @click="applyGenerated" class="px-4 py-2 text-sm rounded-lg bg-bg-secondary hover:bg-bg-tertiary">Apply Preview</button>
                         <button @click="saveGenerated" class="px-4 py-2 text-sm rounded-lg bg-accent-primary text-bg-primary font-bold">Save to Library</button>
                     </div>
                </div>

                <!-- Theme Preview Card -->
                <div 
                    class="h-64 relative overflow-hidden transition-all duration-500 shadow-lg border"
                    :style="{ 
                        ...previewStyles, 
                        borderRadius: generatedTheme.colors['--border-radius'] 
                    }"
                >
                    <!-- Mock UI inside preview -->
                    <div 
                        class="absolute inset-4 p-4 flex flex-col gap-4 border transition-all duration-500"
                        :style="{
                            backgroundColor: generatedTheme.colors['--glass-bg'],
                            borderColor: generatedTheme.colors['--glass-border'],
                            boxShadow: generatedTheme.colors['--glass-shadow'],
                            borderRadius: `calc(${generatedTheme.colors['--border-radius']} * 0.8)`,
                            backdropFilter: `blur(${generatedTheme.colors['--glass-blur']})`,
                            opacity: 1
                        }"
                    >
                         <!-- Name Editor Overlay -->
                         <div class="absolute top-2 right-2 flex gap-1 z-10">
                            <input 
                                v-if="isEditingName"
                                v-model="customName"
                                @blur="isEditingName = false"
                                @keyup.enter="isEditingName = false"
                                ref="nameInputRef"
                                class="text-xs px-2 py-1 rounded bg-bg-primary text-text-primary border border-accent-primary outline-none"
                                placeholder="Name your theme"
                                autoFocus
                            />
                            <button 
                                v-else
                                @click="startEditingName"
                                class="text-xs px-2 py-1 rounded bg-bg-secondary/80 hover:bg-bg-primary text-text-secondary hover:text-accent-primary backdrop-blur-sm transition-all"
                                title="Rename Theme"
                            >
                                ✏️ Rename
                            </button>
                         </div>

                         <div class="h-4 w-1/3 rounded-full bg-[var(--text-primary)] opacity-20"></div>
                         <div class="space-y-2">
                             <div class="h-2 w-3/4 rounded-full bg-[var(--text-secondary)] opacity-20"></div>
                             <div class="h-2 w-1/2 rounded-full bg-[var(--text-secondary)] opacity-20"></div>
                         </div>
                         <div class="mt-auto flex gap-2">
                             <div class="h-8 w-20 rounded-lg bg-[var(--accent-primary)]"></div>
                             <div class="h-8 w-20 rounded-lg bg-[var(--accent-secondary)]"></div>
                         </div>
                    </div>
                </div>
            </div>
            <div v-else class="h-full flex items-center justify-center text-text-tertiary bg-bg-secondary/30 rounded-2xl border border-dashed border-border-color">
                Generate a theme to see preview
            </div>
        </div>
      </div>
      
       <!-- History -->
      <div v-if="history.length > 0" class="mt-6 pt-6 border-t border-border-color">
          <p class="text-sm font-medium text-text-secondary mb-2">Recent Seeds</p>
          <div class="flex flex-wrap gap-2">
              <button 
                v-for="s in history" 
                :key="s"
                @click="loadSeed(s)"
                class="px-2 py-1 text-xs rounded border border-border-color hover:border-accent-primary transition-colors text-text-tertiary hover:text-text-primary"
              >
                {{ s }}
              </button>
          </div>
      </div>

    </section>

    <!-- Library Section -->
    <section class="space-y-6">
      <div class="flex justify-between items-end">
        <h2 class="text-2xl font-bold">Your Library</h2>
        <div class="flex flex-col md:flex-row gap-4">
             <div class="flex flex-wrap gap-2 items-center">
                <button 
                  v-for="color in filterColors" 
                  :key="color.name"
                  @click="selectedColorFilter = selectedColorFilter === color.value ? '' : color.value"
                  :class="[
                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                    selectedColorFilter === color.value ? 'ring-2 ring-accent-primary ring-offset-2' : 'border-transparent'
                  ]"
                  :style="{ backgroundColor: color.hex }"
                  :title="color.name"
                ></button>
                <button 
                  v-if="selectedColorFilter" 
                  @click="selectedColorFilter = ''"
                  class="text-xs text-text-tertiary hover:text-text-primary ml-2 underline"
                >Clear</button>
             </div>
             <div class="flex gap-2">
                  <input v-model="search" type="text" placeholder="Search themes..." class="bg-glass-bg border border-glass-border rounded-lg px-3 py-1 text-sm outline-none focus:border-accent-primary" />
                  <select v-model="filterCategory" class="bg-glass-bg border border-glass-border rounded-lg px-3 py-1 text-sm outline-none focus:border-accent-primary">
                      <option value="">All Categories</option>
                      <option v-for="cat in categories" :key="cat" :value="cat">{{ capitalize(cat) }}</option>
                  </select>
             </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="group relative rounded-xl overflow-hidden border border-border-color bg-bg-secondary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          @click="applyTheme(theme.id)"
        >
          <!-- Preview Swing -->
          <div 
            class="h-32 w-full relative group-hover:h-36 transition-all duration-300 overflow-hidden" 
            :style="{ 
                ...getThemePreviewStyle(theme), 
                borderRadius: theme.colors['--border-radius'] || '0px' 
            }"
          >
             <!-- Skeleton UI Preview -->
             <div 
                class="absolute inset-2 border transition-all duration-300 backdrop-blur-[2px]"
                :style="{
                    borderRadius: `calc(${theme.colors['--border-radius'] || '8px'} * 0.5)`,
                    backgroundColor: theme.colors['--glass-bg'],
                    borderColor: theme.colors['--glass-border'],
                    boxShadow: theme.colors['--glass-shadow'],
                    backdropFilter: `blur(${theme.colors['--glass-blur'] || '10px'})`
                }"
             >
                 <div class="p-2 flex flex-col gap-1.5 overflow-hidden">
                    <div class="h-1.5 w-1/3 rounded-full bg-[var(--text-primary)] opacity-20"></div>
                    <div class="space-y-1">
                        <div class="h-1 w-3/4 rounded-full bg-[var(--text-secondary)] opacity-15"></div>
                        <div class="h-1 w-1/2 rounded-full bg-[var(--text-secondary)] opacity-15"></div>
                    </div>
                    <div class="mt-auto flex gap-1 pt-2">
                        <div class="h-3 w-8 rounded bg-[var(--accent-primary)] opacity-80"></div>
                        <div class="h-3 w-8 rounded bg-[var(--accent-secondary)] opacity-80"></div>
                    </div>
                 </div>
             </div>
             
             <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                 <span class="text-white font-bold text-sm tracking-wider uppercase">Apply Theme</span>
             </div>
          </div>
          
          <div class="p-4 bg-bg-primary border-t border-border-color">
            <div class="flex justify-between items-start">
              <div class="min-w-0">
                <h3 class="font-bold truncate" :title="theme.name">{{ theme.name }}</h3>
                <p class="text-xs text-text-tertiary capitalize">{{ theme.category }}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                   <button 
                        @click.stop="setFavorite(theme.id)" 
                        class="p-1 hover:scale-110 transition-transform" 
                        :class="favoriteThemeId === theme.id ? 'text-rose-500' : 'text-text-tertiary hover:text-rose-400'"
                        title="Set as Favorite"
                   >
                        <span v-if="favoriteThemeId === theme.id">❤︎</span>
                        <span v-else>♡</span>
                   </button>
                   <button v-if="isCustom(theme)" @click.stop="deleteCustomTheme(theme.id)" class="text-xs text-red-400 hover:text-red-500 p-1">Delete</button>
              </div>
            </div>
            <div class="mt-3 flex gap-2">
                 <div class="w-4 h-4 rounded-full" :style="{ background: theme.colors['--accent-primary'] }"></div>
                 <div class="w-4 h-4 rounded-full" :style="{ background: theme.colors['--accent-secondary'] }"></div>
                 <div class="w-4 h-4 rounded-full" :style="{ background: theme.colors['--bg-primary'] }"></div>
            </div>
          </div>
          
           <!-- Active Indicator -->
           <div v-if="currentTheme.id === theme.id" class="absolute top-2 right-2 bg-accent-primary text-bg-primary text-xs font-bold px-2 py-1 rounded-full shadow-lg">
               Active
           </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { colord } from 'colord'
import { ThemeGenerator } from '@theme/utils'
import type { IlytatTheme, ThemeCategory } from '@theme/types'
import { useIlytatTheme } from '#imports'
import { useStorage } from '@vueuse/core'

useHead({
  title: 'Theme Gallery - Ilytat HQ'
})

const { allThemes, applyTheme, currentTheme, saveTheme, deleteTheme, customThemes, setFavorite, favoriteThemeId } = useIlytatTheme()

// Constants
const categories: ThemeCategory[] = ['cyberpunk', 'nature', 'luxury', 'glass', 'minimal', 'solid', 'gradient', 'abstract', 'harmony', 'mosaic', 'neon', 'vintage']
const textures: import('@theme/types').ThemeTexture[] = ['noise', 'dots', 'lines', 'none']
const densities: import('@theme/types').ThemeDensity[] = ['low', 'medium', 'high']

// Builder State
const seedInput = ref('')
const selectedCategory = ref<ThemeCategory | undefined>(undefined)
const forceDark = ref<boolean | undefined>(undefined)
const selectedTexture = ref<import('@theme/types').ThemeTexture | undefined>(undefined)
const selectedDensity = ref<import('@theme/types').ThemeDensity | undefined>(undefined)
const showAdvanced = ref(false)

const advanced = ref({
    baseHue: 180,
    saturationScale: 1,
    brightnessScale: 1,
    borderRadius: 12,
    glassBlur: 16,
    glassOpacity: 0.7
})

function resetAdvanced() {
    advanced.value = {
        baseHue: 180,
        saturationScale: 1,
        brightnessScale: 1,
        borderRadius: 12,
        glassBlur: 16,
        glassOpacity: 0.7
    }
}
const generatedTheme = ref<IlytatTheme | null>(null)
const history = useStorage<string[]>('theme-seed-history', [])

// Personalization State
const isEditingName = ref(false)
const customName = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

// Library State
const search = ref('')
const filterCategory = ref('')
const selectedColorFilter = ref('')

const filterColors = [
    { name: 'Red', hex: '#ef4444', value: 'red' },
    { name: 'Orange', hex: '#f97316', value: 'orange' },
    { name: 'Yellow', hex: '#eab308', value: 'yellow' },
    { name: 'Green', hex: '#22c55e', value: 'green' },
    { name: 'Teal', hex: '#14b8a6', value: 'teal' },
    { name: 'Blue', hex: '#3b82f6', value: 'blue' },
    { name: 'Indigo', hex: '#6366f1', value: 'indigo' },
    { name: 'Purple', hex: '#a855f7', value: 'purple' },
    { name: 'Pink', hex: '#ec4899', value: 'pink' },
    { name: 'Neutral', hex: '#71717a', value: 'neutral' }
]

// Initialize
onMounted(() => {
    randomizeSeed()
    generateFromSeed()
})

// Methods
function randomizeSeed() {
    seedInput.value = Math.floor(Math.random() * 1000000).toString()
}

function loadSeed(seed: string) {
    seedInput.value = seed
    // Ensure reactivity update before generation if needed, but v-model syncs nicely
    generateFromSeed()
}

function startEditingName() {
    isEditingName.value = true
    customName.value = generatedTheme.value?.name || ''
    nextTick(() => {
        nameInputRef.value?.focus()
    })
}

function generateFromSeed() {
    if (!seedInput.value) return

    let seedVal: string | number = seedInput.value
    const parsed = parseInt(seedInput.value)
    if (!isNaN(parsed) && parsed.toString() === seedInput.value) {
        seedVal = parsed
    }

    const generator = new ThemeGenerator(seedVal)
    const newTheme = generator.generate({
        category: selectedCategory.value,
        forceDark: forceDark.value,
        texture: selectedTexture.value,
        density: selectedDensity.value,
        ...advanced.value
    })
    
    generatedTheme.value = newTheme
    customName.value = newTheme.name // Reset custom name on new generation
    isEditingName.value = false

    // Add to history if unique
    if (!history.value.includes(seedInput.value)) {
        history.value.unshift(seedInput.value)
        if (history.value.length > 10) history.value.pop()
    }
}

function applyGenerated() {
    if (!generatedTheme.value) return
    
    const themeToSave = { ...generatedTheme.value }
    if (customName.value && customName.value !== themeToSave.name) {
        themeToSave.name = customName.value
    }
    
    saveTheme(themeToSave)
    applyTheme(themeToSave.id)
}

function saveGenerated() {
    if (generatedTheme.value) {
        const themeToSave = { ...generatedTheme.value }
        if (customName.value && customName.value !== themeToSave.name) {
             themeToSave.name = customName.value
        }
        saveTheme(themeToSave)
    }
}

function deleteCustomTheme(id: string) {
    if (confirm('Are you sure you want to delete this theme?')) {
        deleteTheme(id)
    }
}

function resetToDefault() {
    applyTheme('minimal-light')
}

// Helpers
function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function isCustom(theme: IlytatTheme) {
    return theme.id.startsWith('gen-')
}

// Computed
const filteredThemes = computed(() => {
    return allThemes.value.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.value.toLowerCase())
        const matchesCat = filterCategory.value ? t.category === filterCategory.value : true
        
        let matchesColor = true
        if (selectedColorFilter.value) {
            matchesColor = doesThemeMatchColor(t, selectedColorFilter.value)
        }
        
        return matchesSearch && matchesCat && matchesColor
    })
})

function getColorHue(hex: string): number {
    const c = colord(hex).toHsl()
    return c.h
}

function doesThemeMatchColor(theme: IlytatTheme, color: string): boolean {
    const accent = colord(theme.colors['--accent-primary'])
    const hsl = accent.toHsl()
    const { h, s, l } = hsl

    // Low saturation/extreme brightness -> Neutral
    if (s < 15 || l < 15 || l > 90) return color === 'neutral'

    if (h >= 345 || h < 10) return color === 'red'
    if (h >= 10 && h < 45) return color === 'orange'
    if (h >= 45 && h < 65) return color === 'yellow'
    if (h >= 65 && h < 150) return color === 'green'
    if (h >= 150 && h < 190) return color === 'teal'
    if (h >= 190 && h < 250) return color === 'blue'
    if (h >= 250 && h < 280) return color === 'indigo'
    if (h >= 280 && h < 315) return color === 'purple'
    if (h >= 315 && h < 345) return color === 'pink'

    return false
}

const previewStyles = computed(() => {
    if (!generatedTheme.value) return {}
    return generatedTheme.value.colors as any
})

function getThemePreviewStyle(theme: IlytatTheme) {
    return {
        background: theme.colors['--app-bg'],
        '--text-primary': theme.colors['--text-primary'],
        '--text-secondary': theme.colors['--text-secondary'],
        '--accent-primary': theme.colors['--accent-primary'],
        '--accent-secondary': theme.colors['--accent-secondary'],
        '--glass-bg': theme.colors['--glass-bg'],
        '--glass-border': theme.colors['--glass-border'],
        '--glass-shadow': theme.colors['--glass-shadow'],
        '--border-radius': theme.colors['--border-radius'],
        '--glass-blur': theme.colors['--glass-blur'],
        '--glass-opacity': theme.colors['--glass-opacity']
    }
}
</script>

<style scoped>
/* Optional specific overrides */
</style>
