<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUser } from 'vuefire'
import type { TaskCategory } from '../../types/admin'

const {
    categories,
    loading: prefsLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults
} = useTaskPreferences()

const editingCategory = ref<TaskCategory | null>(null)
const categoryForm = ref({
    label: '',
    emoji: '',
    color: 'bg-emerald-900/50 text-emerald-300'
})

const editCategory = (cat: TaskCategory) => {
    editingCategory.value = cat
    categoryForm.value = {
        label: cat.label,
        emoji: cat.emoji,
        color: cat.color
    }
}

const cancelEdit = () => {
    editingCategory.value = null
    categoryForm.value = { label: '', emoji: '', color: 'bg-emerald-900/50 text-emerald-300' }
}

const saveCategory = async () => {
    try {
        if (editingCategory.value) {
            await updateCategory(editingCategory.value.id, {
                label: categoryForm.value.label,
                emoji: categoryForm.value.emoji,
                color: categoryForm.value.color
            })
        } else {
            await addCategory({
                label: categoryForm.value.label,
                emoji: categoryForm.value.emoji,
                color: categoryForm.value.color
            })
        }
        cancelEdit()
    } catch (e: any) {
        console.error(e.message)
    }
}

const removeCategory = async (id: string) => {
    if (confirm('Remove this category?')) {
        await deleteCategory(id)
    }
}

const resetCategories = async () => {
    if (confirm('Reset to defaults?')) {
        await resetToDefaults()
    }
}
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 class="text-xl font-bold text-amber-500 mb-4">Task Framework</h2>
            <p class="text-slate-400 text-sm mb-6 uppercase tracking-wider text-[10px]">
                Define global standardized classifications for operational tasks.
            </p>

            <!-- Category List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div v-for="cat in categories" :key="cat.id"
                    class="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl group">
                    <span class="text-2xl">{{ cat.emoji }}</span>
                    <div class="flex-1">
                        <span class="font-medium text-white">{{ cat.label }}</span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="px-2 py-0.5 rounded text-[8px] border border-slate-700" :class="cat.color">{{
                                cat.id }}</span>
                        </div>
                    </div>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="editCategory(cat)" class="p-2 text-slate-400 hover:text-amber-500">✏️</button>
                        <button @click="removeCategory(cat.id)"
                            class="p-2 text-slate-400 hover:text-rose-500">🗑️</button>
                    </div>
                </div>
            </div>

            <!-- Add/Edit form -->
            <div class="border-t border-slate-700/50 pt-6">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    {{ editingCategory ? 'Modify Prototype' : 'Deploy New Category' }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input v-model="categoryForm.label" type="text" placeholder="Label..."
                        class="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-amber-500 outline-none" />
                    <input v-model="categoryForm.emoji" type="text" placeholder="Emoji..."
                        class="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-amber-500 outline-none" />
                    <select v-model="categoryForm.color"
                        class="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 outline-none">
                        <option value="bg-emerald-900/10 text-emerald-400 border-emerald-500/20">Emerald</option>
                        <option value="bg-blue-900/10 text-blue-400 border-blue-500/20">Azure</option>
                        <option value="bg-amber-900/10 text-amber-500 border-amber-500/20">Amber</option>
                        <option value="bg-rose-900/10 text-rose-400 border-rose-500/20">Rose</option>
                    </select>
                    <div class="flex gap-2">
                        <button @click="saveCategory"
                            :disabled="!categoryForm.label || !categoryForm.emoji || prefsLoading"
                            class="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
                            {{ editingCategory ? 'Save' : 'Deploy' }}
                        </button>
                        <button v-if="editingCategory" @click="cancelEdit"
                            class="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl">
                            X
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex justify-end">
                <button @click="resetCategories"
                    class="text-[10px] text-slate-600 hover:text-rose-500 uppercase tracking-widest transition-colors">
                    Revert to Factory Defaults
                </button>
            </div>
        </div>
    </div>
</template>
