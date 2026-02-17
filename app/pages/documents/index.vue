<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header class="flex-none px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
                    Foundry
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Manage documents and files</p>
            </div>
        </header>

        <!-- Tab Navigation -->
        <div class="flex-none border-b border-white/10 bg-zinc-900/30 px-6">
            <nav class="flex gap-1 -mb-px">
                <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                        'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        activeTab === tab.id 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                    ]"
                >
                    {{ tab.label }}
                    <span 
                        v-if="tab.count > 0"
                        class="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-400"
                    >{{ tab.count }}</span>
                </button>
            </nav>
        </div>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div class="max-w-5xl space-y-6">

                <!-- Documents Tab (Firestore) -->
                <div v-if="activeTab === 'documents'">
                    <div class="flex items-center justify-between mb-4 gap-4">
                        <div class="flex items-center gap-4 flex-1">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">Documents</h2>
                            <!-- Search Bar -->
                            <div class="relative flex-1 max-w-md">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 i-ph-magnifying-glass text-zinc-500"></span>
                                <input 
                                    v-model="searchQuery" 
                                    type="text" 
                                    placeholder="Search documents..." 
                                    class="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600"
                                />
                            </div>
                        </div>
                        <button 
                            @click="showDocForm ? resetForm() : openCreateForm()"
                            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        >
                            <span :class="showDocForm ? 'i-ph-x-bold' : 'i-ph-plus-bold'"></span>
                            {{ showDocForm ? 'Cancel' : 'New Document' }}
                        </button>
                    </div>

                    <!-- Document Factory / Edit Form -->
                    <div v-if="showDocForm" @click.self="showDocForm = false" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                        <div class="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                             <div class="flex justify-between items-center p-4 border-b border-white/5 bg-zinc-900">
                                <h3 class="text-lg font-bold text-white">{{ isEditMode ? 'Edit Document' : 'Create New Document' }}</h3>
                                <button @click="showDocForm = false" class="text-zinc-500 hover:text-white">
                                    <span class="i-ph-x-bold text-xl"></span>
                                </button>
                            </div>
                            
                            <div class="flex-1 overflow-hidden p-6">
                                <DocumentCreator 
                                    v-if="!isEditMode"
                                    :initialTemplateId="selectedTemplateId"
                                    :loading="isLoading"
                                    @save="handleFactorySave" 
                                    @cancel="showDocForm = false" 
                                />

                                <!-- Simple Edit Form for existing docs (fallback) -->
                                <form v-else @submit.prevent="handleCreateOrUpdateDocument" class="max-w-xl mx-auto space-y-4">
                                    <input 
                                        v-model="newDocTitle" 
                                        type="text" 
                                        required 
                                        placeholder="Document title..."
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                    <div class="grid grid-cols-2 gap-3">
                                        <select v-model="newDocType" class="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                                            <option :value="DocumentType.NOTE">Note</option>
                                            <option :value="DocumentType.REPORT">Report</option>
                                            <option :value="DocumentType.TEMPLATE">Template</option>
                                            <option :value="DocumentType.PROPOSAL">Proposal</option>
                                            <option :value="DocumentType.OTHER">Other</option>
                                        </select>
                                        <select v-model="newDocStatus" class="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                                            <option :value="DocumentStatus.DRAFT">Draft</option>
                                            <option :value="DocumentStatus.PUBLISHED">Published</option>
                                            <option :value="DocumentStatus.ARCHIVED">Archived</option>
                                        </select>
                                    </div>
                                    <textarea 
                                        v-model="newDocContent" 
                                        rows="10" 
                                        placeholder="Document content..."
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                                    ></textarea>
                                    <div class="flex justify-end gap-2">
                                        <button type="button" @click="showDocForm = false" class="px-3 py-1.5 text-zinc-400 hover:text-white text-xs font-medium">Cancel</button>
                                        <button type="submit" :disabled="isLoading" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                            Update Document
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Loading -->
                    <div v-if="isLoading && documents.length === 0" class="flex justify-center py-8">
                        <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                    <!-- Documents Grid -->
                    <div v-else-if="filteredDocuments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div 
                            v-for="doc in filteredDocuments"  
                            :key="doc.id" 
                            class="group p-5 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all cursor-pointer relative"
                            @click="openDocumentView(doc)"
                        >
                            <div class="flex items-start justify-between mb-3">
                                <span :class="['text-2xl', doc.typeIcon]"></span>
                                    <button 
                                        @click.stop="handlePrintDocument(doc)" 
                                        class="text-zinc-400 hover:text-emerald-400 p-1.5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                                        title="Export/Print"
                                        style="width: 32px; height: 32px;"
                                    >
                                        <span class="i-ph-export"></span>
                                    </button>
                                    <button 
                                        @click.stop="openEditForm(doc)" 
                                        class="text-zinc-400 hover:text-indigo-400 p-1.5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                                        title="Edit"
                                        style="width: 32px; height: 32px;"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152.05a16,16,0,0,0-4.69,11.31v44.69a16,16,0,0,0,16,16H92.69a16,16,0,0,0,11.31-4.69L227.31,96A16,16,0,0,0,227.31,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
                                    </button>
                                    <button 
                                        @click.stop="handleDeleteDocument(doc.id)" 
                                        class="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                                        title="Delete"
                                        style="width: 32px; height: 32px;"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                                    </button>
                            </div>
                            <h3 class="text-white font-medium text-sm mb-1">{{ doc.title }}</h3>
                            <p v-if="doc.content" class="text-xs text-zinc-400 line-clamp-2 mb-2">{{ doc.content }}</p>
                            <div class="flex items-center gap-2">
                                <span :class="['text-[10px] px-1.5 py-0.5 rounded', doc.statusColor]">{{ doc.formattedStatus }}</span>
                                <span class="text-[10px] text-zinc-600">{{ formatDate(doc.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-12 text-zinc-500">
                        <span class="i-ph-file-text text-4xl mb-3 block opacity-50"></span>
                        <p>No documents yet. Create one to get started.</p>
                    </div>
                </div>

                <!-- Files Tab (R2) -->
                <div v-else-if="activeTab === 'files'">
                    <!-- Files Toolbar -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Files (R2 Storage)</h2>
                            <div class="flex items-center bg-zinc-800/50 rounded-lg p-0.5 border border-white/5">
                                <button 
                                    @click="viewMode = 'grid'"
                                    :class="[
                                        'p-1.5 rounded-md transition-all',
                                        viewMode === 'grid' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                    ]"
                                    title="Grid View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path></svg>
                                </button>
                                <button 
                                    @click="viewMode = 'list'"
                                    :class="[
                                        'p-1.5 rounded-md transition-all',
                                        viewMode === 'list' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                    ]"
                                    title="List View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
                                </button>
                            </div>
                        </div>
                        <label 
                            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span class="i-ph-upload-simple-bold"></span>
                            Upload File
                            <input type="file" @change="handleFileUpload" class="hidden" />
                        </label>
                    </div>

                    <!-- Upload Progress -->
                    <div v-if="isLoadingR2 && uploadingFileName" class="mb-4 p-4 bg-zinc-900/60 border border-white/10 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span class="text-sm text-zinc-300">Uploading {{ uploadingFileName }}...</span>
                        </div>
                    </div>

                    <!-- R2 Error -->
                    <div v-if="r2Error" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        {{ r2Error }}
                    </div>

                    <!-- Loading -->
                    <div v-if="isLoadingR2 && r2Files.length === 0 && !uploadingFileName" class="flex justify-center py-8">
                        <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                    <!-- Files List View -->
                    <div v-else-if="r2Files.length > 0 && viewMode === 'list'" class="space-y-2">
                         <div 
                            v-for="file in r2Files" 
                            :key="file.key" 
                            class="group flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-colors"
                        >
                            <!-- Icon -->
                            <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400">
                                 <svg v-if="getFileType(file.key) === 'pdf'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="#f87171"><path d="M224,152a8,8,0,0,1-8,8H196v16h16a8,8,0,0,1,0,16H196v16a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm-96,0a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V176H100v32a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm8,24v-8H100v8Zm-48-24a28,28,0,0,1,28,28v20a8,8,0,0,1-16,0V180a12,12,0,0,0-12-12H84v40a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm0,24a12,12,0,0,0,0-12ZM48,112h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H48a8,8,0,0,0,0,16v48Zm56-72a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H104ZM24,80a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,80Z"></path></svg>
                                 <svg v-else-if="getFileType(file.key) === 'doc'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="#60a5fa"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h96V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path></svg>
                                 <svg v-else-if="getFileType(file.key) === 'image'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="#c084fc"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM76,96A12,12,0,1,1,88,84,12,12,0,0,1,76,96Zm124,88H56a8,8,0,0,1-5.66-13.66l48-48a8,8,0,0,1,11.32,0l40,40,34.34-34.34a8,8,0,0,1,11.32,0l26.34,26.34A8,8,0,0,1,200,184Z"></path></svg>
                                 <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h96V88a8,8,0,0,0,8,8h48V216Z"></path></svg>
                            </div>

                            <div class="flex-1 min-w-0">
                                <h3 class="text-white text-sm font-medium truncate">{{ getFileName(file.key) }}</h3>
                                <p class="text-[10px] text-zinc-500">{{ formatFileSize(file.size) }} · {{ formatDate(file.lastModified) }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button 
                                    @click="handleViewFile(file.key)"
                                    class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                                    title="View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>
                                </button>
                                <button 
                                    @click="handleDownloadFile(file.key)"
                                    class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                                    title="Download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path></svg>
                                </button>
                                <button 
                                    @click="handleDeleteR2File(file.key)" 
                                    class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Files Grid View -->
                    <div v-else-if="r2Files.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div 
                            v-for="file in r2Files" 
                            :key="file.key" 
                            class="group relative aspect-square bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all"
                        >
                            <!-- Preview -->
                            <div class="absolute inset-0 flex items-center justify-center p-4">
                                <img 
                                    v-if="isImage(file.key)" 
                                    :src="`/api/docs?key=${encodeURIComponent(file.key)}`" 
                                    class="w-full h-full object-contain"
                                    loading="lazy"
                                />
                                <div v-else class="text-zinc-500">
                                     <svg v-if="getFileType(file.key) === 'pdf'" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256" fill="#f87171"><path d="M224,152a8,8,0,0,1-8,8H196v16h16a8,8,0,0,1,0,16H196v16a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm-96,0a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V176H100v32a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm8,24v-8H100v8Zm-48-24a28,28,0,0,1,28,28v20a8,8,0,0,1-16,0V180a12,12,0,0,0-12-12H84v40a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8Zm0,24a12,12,0,0,0,0-12ZM48,112h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H48a8,8,0,0,0,0,16v48Zm56-72a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H104ZM24,80a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,80Z"></path></svg>
                                    <svg v-else-if="getFileType(file.key) === 'doc'" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256" fill="#60a5fa"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h96V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path></svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h96V88a8,8,0,0,0,8,8h48V216Z"></path></svg>
                                </div>
                            </div>

                            <!-- Footer Info -->
                            <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 class="text-white text-xs font-medium truncate">{{ getFileName(file.key) }}</h3>
                                <p class="text-[10px] text-zinc-400">{{ formatFileSize(file.size) }}</p>
                            </div>

                            <!-- Hover Overlay -->
                            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <button 
                                    @click="handleViewFile(file.key)"
                                    class="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                                    title="View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>
                                </button>
                                <button 
                                    @click="handleDownloadFile(file.key)"
                                    class="p-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                                    title="Download"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path></svg>
                                </button>
                                <button 
                                    @click="handleDeleteR2File(file.key)" 
                                    class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-12 text-zinc-500">
                        <span class="i-ph-cloud-arrow-up text-4xl mb-3 block opacity-50"></span>
                        <p>No files in R2 storage. Upload one above.</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Document View Modal -->
        <Dialog :open="isViewModalOpen" @close="isViewModalOpen = false" class="relative z-50">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
            <div class="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel v-if="viewingDocument" class="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <DialogTitle class="text-xl font-bold text-white">{{ viewingDocument.title }}</DialogTitle>
                            <div class="flex items-center gap-2 mt-1">
                                <span :class="['text-[10px] px-1.5 py-0.5 rounded', viewingDocument.statusColor]">{{ viewingDocument.formattedStatus }}</span>
                                <span class="text-[10px] text-zinc-500">{{ capitalize(viewingDocument.type) }}</span>
                                <span class="text-[10px] text-zinc-600">{{ formatDate(viewingDocument.createdAt) }}</span>
                            </div>
                        </div>
                        <button @click="isViewModalOpen = false" class="text-zinc-500 hover:text-white transition-colors">
                            <span class="i-ph-x text-xl"></span>
                        </button>
                    </div>
                    <div class="p-4 bg-black/20 border border-white/5 rounded-xl">
                        <p class="text-zinc-300 leading-relaxed whitespace-pre-wrap">{{ viewingDocument.content || 'No content.' }}</p>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Document } from '~/models/Document';
import { DocumentType, DocumentStatus } from '../../../config/document';
import { documentTemplates } from '../../../config/documentTemplates';
import DocumentCreator from '~/components/documents/DocumentCreator.vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

// --- User Auth ---
const { auth } = useFirebase();
const currentUser = computed(() => auth?.currentUser ?? null);

// --- Documents Composable ---
const {
    documents, isLoading, error,
    r2Files, isLoadingR2, r2Error,
    fetchDocuments, createDocument, updateDocument, deleteDocument,
    fetchR2Documents, uploadR2Document, deleteR2Document
} = useDocuments();

// --- UI State ---
const activeTab = ref('documents');
const viewMode = ref<'grid' | 'list'>('grid');
const showDocForm = ref(false);
const isEditMode = ref(false);
const editingDocId = ref<string | null>(null);
const isViewModalOpen = ref(false);
const viewingDocument = ref<Document | null>(null);
const uploadingFileName = ref('');

// Search
const searchQuery = ref('');
const filteredDocuments = computed(() => {
    try {
        const query = (searchQuery.value || '').toLowerCase().trim();
        console.log('[DEBUG] filteredDocuments run. Query:', query);

        // Always include existing docs that match
        const matchingDocs = (documents.value || []).filter(doc => {
            if (!doc) return false;
            const titleMatch = (doc.title || '').toLowerCase().includes(query);
            const contentMatch = (doc.content || '').toLowerCase().includes(query);
            const typeMatch = (doc.type || '').toLowerCase().includes(query);
            return titleMatch || contentMatch || typeMatch;
        });

        // If searching, also include matching templates as "new" options
        if (query) {
            console.log('[DEBUG] Searching templates. available:', documentTemplates.length);

            const matchingTemplates = documentTemplates.filter(t => 
                (t.name || '').toLowerCase().includes(query) ||
                (t.type || '').toLowerCase().includes(query)
            );
            
            console.log('[DEBUG] Matching templates found:', matchingTemplates.length);

            // Map templates to a structure compatible with the view or distinct
            const templateDocs = matchingTemplates.map(t => ({
                id: `template-${t.name}`,
                title: `Create: ${t.name}`,
                content: t.description || '',
                type: t.type,
                status: 'template',
                createdAt: new Date().toISOString(),
                isTemplateRef: true,
                templateId: t.name,
                typeIcon: 'i-ph-plus-circle-bold text-indigo-400',
                statusColor: 'bg-indigo-500/20 text-indigo-300',
                formattedStatus: 'New',
            }));

            return [...templateDocs, ...matchingDocs];
        }
        
        return matchingDocs;
    } catch (err) {
        console.error('[ERROR] filteredDocuments crashed:', err);
        return [];
    }
});

// Form fields
const newDocTitle = ref('');
const newDocType = ref<DocumentType>(DocumentType.NOTE);
const newDocStatus = ref<DocumentStatus>(DocumentStatus.DRAFT);
const newDocContent = ref('');

// Tabs config
const tabs = computed(() => [
    { id: 'documents', label: 'Documents', count: documents.value.length },
    { id: 'files', label: 'Files', count: r2Files.value.length }
]);

// --- Init ---
onMounted(async () => {
    fetchDocuments().catch(e => console.error('Failed to load documents', e));
    fetchR2Documents().catch(e => console.error('Failed to load R2 files', e));
});

// --- Document Actions ---
const resetForm = () => {
    newDocTitle.value = '';
    newDocContent.value = '';
    newDocType.value = DocumentType.NOTE;
    newDocStatus.value = DocumentStatus.DRAFT;
    showDocForm.value = false;
    isEditMode.value = false;
    editingDocId.value = null;
};

const handleCreateOrUpdateDocument = async () => {
    if (!newDocTitle.value.trim()) return;

    try {
        if (isEditMode.value && editingDocId.value) {
            // Update
             await updateDocument(editingDocId.value, {
                title: newDocTitle.value.trim(),
                content: newDocContent.value,
                type: newDocType.value as any,
                status: newDocStatus.value as any
            });
        } else {
            // Create
            await createDocument({
                title: newDocTitle.value.trim(),
                content: newDocContent.value,
                type: newDocType.value,
                status: newDocStatus.value,
                ownerId: currentUser.value?.uid || ''
            });
        }
        resetForm();
    } catch (e) {
        console.error('Failed to save document', e);
    }
};

const selectedTemplateId = ref<string | undefined>(undefined);

const openCreateForm = (templateId?: string) => {
    resetForm();
    selectedTemplateId.value = templateId;
    showDocForm.value = true;
}

const openEditForm = (doc: any) => {
    // For now, editing existing docs just opens the simple form unless we migrate them to templates
    // But let's assume we want to use the simple form for edits for now
    newDocTitle.value = doc.title;
    newDocContent.value = doc.content;
    newDocType.value = doc.type;
    newDocStatus.value = doc.status;
    
    editingDocId.value = doc.id;
    isEditMode.value = true;
    showDocForm.value = true;
};

// --- Factory Actions ---
const handleFactorySave = async (data: any) => {
    try {
        await createDocument({
            title: data.title,
            content: data.content,
            type: data.type || DocumentType.OTHER,
            status: DocumentStatus.DRAFT,
            ownerId: currentUser.value?.uid || ''
        });
        showDocForm.value = false;
    } catch (e) {
        console.error('Failed to create document from factory', e);
    }
};

const handleDeleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
        await deleteDocument(id);
    } catch (e) {
        console.error('Failed to delete document', e);
    }
};

const handlePrintDocument = (doc: any) => {
    DocumentFactory.print(doc.title, doc.content);
};

const openDocumentView = (doc: any) => {
    if (doc.isTemplateRef) {
        openCreateForm(doc.templateId);
        return;
    }
    viewingDocument.value = doc;
    isViewModalOpen.value = true;
};

// --- R2 File Actions ---
const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploadingFileName.value = file.name;
    try {
        await uploadR2Document(file);
    } catch (e) {
        console.error('Failed to upload file', e);
    } finally {
        uploadingFileName.value = '';
        input.value = ''; // Reset file input
    }
};

const handleViewFile = async (key: string) => {
    // Fetch the file content via the API and open in a new window
    window.open(`/api/docs?key=${encodeURIComponent(key)}`, '_blank');
};

const handleDownloadFile = async (key: string) => {
    // Trigger a download by creating a temporary link
    const link = document.createElement('a');
    link.href = `/api/docs?key=${encodeURIComponent(key)}`;
    link.download = getFileName(key);
    link.click();
};

const handleDeleteR2File = async (key: string) => {
    if (!confirm(`Delete file "${getFileName(key)}"?`)) return;
    try {
        await deleteR2Document(key);
    } catch (e) {
        console.error('Failed to delete R2 file', e);
    }
};

// --- Helpers ---
const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileName = (key: string) => key.split('/').pop() || key;



const getFileIcon = (key: string) => {
    const ext = key.split('.').pop()?.toLowerCase();
    switch(ext) {
        case 'pdf': return 'i-ph-file-pdf text-red-400';
        case 'doc': case 'docx': return 'i-ph-file-doc text-blue-400';
        case 'xls': case 'xlsx': return 'i-ph-file-xls text-emerald-400';
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': return 'i-ph-image text-purple-400';
        case 'mp4': case 'mov': case 'avi': return 'i-ph-video-camera text-amber-400';
        default: return 'i-ph-file text-zinc-400';
    }
};

const isImage = (key: string) => {
    const ext = key.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
};

const getFileType = (key: string) => {
    const ext = key.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (['xls', 'xlsx'].includes(ext || '')) return 'xls';
    return 'other';
};
</script>
