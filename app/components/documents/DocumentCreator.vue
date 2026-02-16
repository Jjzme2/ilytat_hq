<template>
    <div class="flex h-[calc(100vh-100px)] gap-6">
        <!-- Configuration Panel -->
        <div class="w-1/3 flex flex-col gap-6 bg-zinc-900/40 p-6 rounded-2xl border border-white/5 overflow-y-auto">
            <div>
                <h3 class="text-lg font-semibold text-white mb-2">Configure Document</h3>
                <p class="text-sm text-zinc-400">Fill in the details below to generate your document.</p>
            </div>

            <!-- Template Selection -->
            <div class="space-y-2">
                <label class="text-xs font-bold text-zinc-500 uppercase tracking-wider">Template</label>
                <select 
                    v-model="selectedTemplateId" 
                    @change="handleTemplateChange"
                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                    <option v-for="t in templates" :key="t.name" :value="t.name">
                        {{ t.name }}
                    </option>
                </select>
            </div>

            <!-- Dynamic Fields -->
            <div v-if="variables.length > 0" class="space-y-4">
                <div v-for="variable in variables" :key="variable" class="space-y-1">
                    <label class="text-xs font-medium text-zinc-400 capitalize">{{ formatLabel(variable) }}</label>
                    <template v-if="isLongText(variable)">
                        <textarea 
                            v-model="formData[variable]"
                            rows="3"
                            class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            :placeholder="`Enter ${formatLabel(variable)}...`"
                        ></textarea>
                    </template>
                    <template v-else>
                         <input 
                            v-model="formData[variable]"
                            type="text"
                            class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            :placeholder="`Enter ${formatLabel(variable)}...`"
                        />
                    </template>
                </div>
            </div>
            
             <div v-else class="text-sm text-zinc-500 italic">
                No variables detected in this template.
            </div>

            <div class="mt-auto flex gap-3 pt-6 border-t border-white/5">
                <button 
                    @click="$emit('cancel')"
                    class="flex-1 px-4 py-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button 
                    @click="handleSave"
                    class="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors text-sm font-medium"
                >
                    Save Document
                </button>
            </div>
        </div>

        <!-- Preview Panel -->
        <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Toolbar -->
            <div class="h-12 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between px-4">
                 <span class="text-xs font-bold text-zinc-500 uppercase tracking-wider">Preview</span>
                 <div class="flex gap-2">
                    <button 
                        @click="handlePrint"
                        class="px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Export to PDF"
                    >
                        <span class="i-ph-export-bold text-indigo-500"></span>
                        Export PDF
                    </button>
                    <button 
                        @click="handlePrint"
                        class="p-1.5 rounded hover:bg-zinc-200 text-zinc-600 transition-colors"
                        title="Print"
                    >
                        <span class="i-ph-printer w-4 h-4"></span>
                    </button>
                 </div>
            </div>
            
            <!-- Document Paper -->
            <div class="flex-1 overflow-y-auto bg-zinc-500/20 p-8">
                <div class="max-w-[210mm] mx-auto min-h-[297mm] bg-white shadow-lg p-[20mm] text-black">
                     <div class="whitespace-pre-wrap font-serif text-sm leading-relaxed" v-html="previewContent"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { documentTemplates, DocumentTemplateModel } from '../../../config/documentTemplates';


const props = defineProps<{
    initialTemplateId?: string;
}>();

const emit = defineEmits(['save', 'cancel']);

// State
const templates = documentTemplates;
const selectedTemplateId = ref(props.initialTemplateId || templates[0]?.name);
const formData = ref<Record<string, string>>({});
const variables = ref<string[]>([]);

// Computed
const selectedTemplate = computed(() => 
    templates.find(t => t.name === selectedTemplateId.value)
);

const previewContent = computed(() => {
    if (!selectedTemplate.value) return '';
    const content = typeof selectedTemplate.value.content === 'string' 
        ? selectedTemplate.value.content 
        : JSON.stringify(selectedTemplate.value.content, null, 2);
        
    return DocumentFactory.compile(content, formData.value);
});

// Methods
const handleTemplateChange = () => {
    if (!selectedTemplate.value) return;

    // Reset form
    formData.value = {};
    
    // Extract variables
    const content = typeof selectedTemplate.value.content === 'string' 
        ? selectedTemplate.value.content 
        : '';
        
    if (content) {
        variables.value = DocumentFactory.extractVariables(content);
        // Initialize empty values
        variables.value.forEach(v => formData.value[v] = '');
    } else {
        variables.value = [];
    }
};

const formatLabel = (key: string) => {
    // camelCase to Normal Case
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const isLongText = (key: string) => {
    const lower = key.toLowerCase();
    return lower.includes('description') || 
           lower.includes('content') || 
           lower.includes('scope') || 
           lower.includes('notes');
};

const handleSave = () => {
    emit('save', {
        title: selectedTemplate.value?.name,
        content: previewContent.value,
        type: selectedTemplate.value?.type
    });
};

const handlePrint = () => {
    if (selectedTemplate.value) {
        DocumentFactory.print(selectedTemplate.value.name, previewContent.value);
    }
};

// Lifecycle
onMounted(() => {
    handleTemplateChange();
});
</script>
