<template>
    <div class="h-full flex flex-col">
        <!-- Loading -->
        <div v-if="projectLoading" class="flex-1 flex items-center justify-center">
             <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Error -->
        <div v-else-if="projectError" class="p-6">
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                {{ projectError }}
                <button @click="router.push('/projects')" class="block mt-2 text-sm text-red-300 hover:text-red-200 underline">
                    Return to Command Center
                </button>
            </div>
        </div>

        <!-- Content -->
        <template v-else-if="currentProject">
            <!-- Header -->
            <header class="flex-none px-4 md:px-6 py-4 md:py-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                             <button @click="router.push('/projects')" class="text-zinc-500 hover:text-white transition-colors">
                                <span class="i-ph-arrow-left text-xl"></span>
                            </button>
                            <span class="text-xs font-mono text-zinc-500 uppercase tracking-widest">Project</span>
                        </div>
                        <h1 class="text-2xl md:text-3xl font-bold text-white">{{ currentProject.name }}</h1>
                    </div>
                    
                    <div class="flex items-center gap-2 md:gap-3">
                        <button 
                            @click="openEditModal"
                            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                        >
                            Edit
                        </button>
                        <button 
                            @click="handleDelete"
                            class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/10"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <!-- Status bar -->
                 <div class="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
                    <div class="flex items-center gap-2">
                         <span :class="['text-xs px-2 py-1 rounded-full border', currentProject.statusColor]">
                             {{ currentProject.formattedStatus }}
                         </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="i-ph-flag text-zinc-500"></span>
                        <span :class="currentProject.priorityColor">{{ capitalize(currentProject.priority) }} Priority</span>
                    </div>
                    <div class="flex items-center gap-2" v-if="currentProject.deadline">
                        <span class="i-ph-calendar text-zinc-500"></span>
                        <span class="text-sm text-zinc-300">Due {{ formatDate(currentProject.deadline) }}</span>
                    </div>
                 </div>
            </header>

            <!-- Tab Navigation -->
            <div class="flex-none border-b border-white/10 bg-zinc-900/30 px-3 md:px-6 overflow-x-auto scrollbar-none">
                <nav class="flex gap-1 -mb-px min-w-max">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="[
                            'px-3 md:px-4 py-2.5 md:py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                            activeTab === tab.id 
                                ? 'border-blue-500 text-blue-400' 
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

            <!-- Main -->
            <main class="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin">
                <div class="max-w-4xl space-y-6 md:space-y-8">
                    
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'">
                        <!-- Description -->
                        <section>
                             <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Overview</h2>
                             <div class="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl">
                                 <p class="text-zinc-300 leading-relaxed whitespace-pre-wrap">{{ currentProject.description || 'No description provided.' }}</p>
                             </div>
                        </section>

                        <!-- Progress -->
                        <section>
                             <div class="flex items-center justify-between mb-3">
                                 <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Progress</h2>
                                 <span class="text-sm font-mono text-blue-400">{{ currentProject.progress }}%</span>
                             </div>
                             <div class="h-4 bg-zinc-900 rounded-full border border-white/5 overflow-hidden">
                                 <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500" :style="{ width: `${currentProject.progress}%` }"></div>
                             </div>
                        </section>

                        <!-- Stats -->
                        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-5 bg-zinc-900/40 border border-white/5 rounded-xl">
                                <h3 class="text-zinc-400 text-xs uppercase tracking-wide mb-1">Start Date</h3>
                                <p class="text-lg font-medium text-white">{{ currentProject.startDate ? formatDate(currentProject.startDate) : 'Not set' }}</p>
                            </div>
                            <div class="p-5 bg-zinc-900/40 border border-white/5 rounded-xl">
                                <h3 class="text-zinc-400 text-xs uppercase tracking-wide mb-1">Owner</h3>
                                <p class="text-lg font-medium text-white">{{ currentProject.tenantId ? 'Assigned' : 'Unassigned' }}</p>
                            </div>
                        </section>
                    </div>

                    <!-- Goals Tab -->
                    <div v-else-if="activeTab === 'goals'">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Goals</h2>
                            <button 
                                @click="showGoalForm = !showGoalForm"
                                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                                <span class="i-ph-plus-bold"></span>
                                {{ showGoalForm ? 'Cancel' : 'New Goal' }}
                            </button>
                        </div>

                        <!-- Inline Add Goal Form -->
                        <form v-if="showGoalForm" @submit.prevent="handleCreateGoal" class="mb-6 p-4 bg-zinc-900/60 border border-white/10 rounded-xl space-y-3">
                            <input 
                                v-model="newGoalTitle" 
                                type="text" 
                                required 
                                placeholder="Goal title..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <textarea 
                                v-model="newGoalDesc" 
                                rows="2" 
                                placeholder="Description (optional)..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            ></textarea>
                            <div class="flex justify-end">
                                <button type="submit" :disabled="goalsLoading" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                    {{ goalsLoading ? 'Creating...' : 'Create Goal' }}
                                </button>
                            </div>
                        </form>

                        <!-- Loading -->
                        <div v-if="goalsLoading && goals.length === 0" class="flex justify-center py-8">
                            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>

                        <!-- Goals List -->
                        <div v-else-if="goals.length > 0" class="space-y-3">
                            <div 
                                v-for="goal in goals" 
                                :key="goal.id" 
                                class="group p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-blue-500/20 transition-colors"
                            >
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <h3 class="text-white font-medium">{{ goal.title }}</h3>
                                        <p v-if="goal.description" class="text-sm text-zinc-400 mt-1 line-clamp-2">{{ goal.description }}</p>
                                    </div>
                                    <div class="flex items-center gap-2 ml-4">
                                        <select 
                                            :value="goal.status"
                                            @change="handleUpdateGoalStatus(goal.id, ($event.target as HTMLSelectElement).value)"
                                            class="text-xs bg-zinc-800 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-blue-500"
                                        >
                                            <option :value="GoalStatus.NOT_STARTED">Not Started</option>
                                            <option :value="GoalStatus.IN_PROGRESS">In Progress</option>
                                            <option :value="GoalStatus.ACHIEVED">Achieved</option>
                                            <option :value="GoalStatus.MISSED">Missed</option>
                                        </select>
                                        <button 
                                            @click="handleDeleteGoal(goal.id)" 
                                            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                            title="Delete goal"
                                        >
                                            <span class="i-ph-trash text-sm"></span>
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <span :class="['text-xs px-2 py-0.5 rounded-full', goal.statusColor]">
                                        {{ goal.formattedStatus }}
                                    </span>
                                    
                                    <!-- Time Tracking -->
                                    <div class="flex items-center gap-2 ml-4">
                                        <button 
                                            v-if="activeLog && activeLog.goalId === goal.id"
                                            @click="stopTracking"
                                            class="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors border border-red-500/10"
                                        >
                                            <span class="i-ph-stop-circle-fill animate-pulse"></span>
                                            Stop Timer
                                        </button>
                                        <button 
                                            v-else
                                            @click="startTracking({ id: goal.id, type: 'goal', projectId: goal.projectId, title: goal.title })"
                                            class="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded text-xs transition-colors border border-white/5"
                                        >
                                            <span class="i-ph-play-circle"></span>
                                            Time
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="text-center py-12 text-zinc-500">
                            <span class="i-ph-target text-4xl mb-3 block opacity-50"></span>
                            <p>No goals yet. Create one to get started.</p>
                        </div>
                    </div>

                    <!-- Tasks Tab -->
                    <div v-else-if="activeTab === 'tasks'">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Tasks</h2>
                            <button 
                                @click="showTaskForm = !showTaskForm"
                                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                                <span class="i-ph-plus-bold"></span>
                                {{ showTaskForm ? 'Cancel' : 'New Task' }}
                            </button>
                        </div>

                        <!-- Inline Add Task Form -->
                        <form v-if="showTaskForm" @submit.prevent="handleCreateTask()" class="mb-6 p-4 bg-zinc-900/60 border border-white/10 rounded-xl space-y-3">
                            <input 
                                v-model="newTaskTitle" 
                                type="text" 
                                required 
                                placeholder="Task title..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <div class="grid grid-cols-2 gap-3">
                                <select v-model="newTaskPriority" class="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                                    <option :value="Priority.LOW">Low</option>
                                    <option :value="Priority.MEDIUM">Medium</option>
                                    <option :value="Priority.HIGH">High</option>
                                    <option :value="Priority.CRITICAL">Critical</option>
                                </select>
                                <select v-model="newTaskGoalId" class="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                                    <option value="">No Goal</option>
                                    <option v-for="g in goals" :key="g.id" :value="g.id">{{ g.title }}</option>
                                </select>
                            </div>
                            <div class="flex justify-end">
                                <button type="submit" :disabled="tasksLoading" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                    {{ tasksLoading ? 'Creating...' : 'Create Task' }}
                                </button>
                            </div>
                        </form>

                        <!-- Loading -->
                        <div v-if="tasksLoading && tasks.length === 0" class="flex justify-center py-8">
                            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>

                        <!-- Tasks List -->
                        <div v-else-if="topLevelTasks.length > 0" class="space-y-3">
                            <div v-for="task in topLevelTasks" :key="task.id">
                                <!-- Parent Task -->
                                <div class="group p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-blue-500/20 transition-colors">
                                    <div class="flex items-start justify-between">
                                        <div class="flex items-start gap-3 flex-1">
                                            <button 
                                                @click="handleToggleTask(task)"
                                                :class="[
                                                    'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                                                    task.isCompleted 
                                                        ? 'bg-blue-500 border-blue-500 text-white' 
                                                        : 'border-zinc-600 hover:border-blue-400'
                                                ]"
                                            >
                                                <span v-if="task.isCompleted" class="i-ph-check text-xs"></span>
                                            </button>
                                            <div class="flex-1">
                                                <h3 :class="['font-medium', task.isCompleted ? 'text-zinc-500 line-through' : 'text-white']">{{ task.title }}</h3>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <span :class="['text-[10px] px-1.5 py-0.5 rounded border', task.priorityColor]">{{ capitalize(task.priority) }}</span>
                                                    <span :class="['text-[10px] px-1.5 py-0.5 rounded border', task.statusColor]">{{ task.formattedStatus }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2 ml-4">
                                            <button
                                                @click="toggleSubtaskForm(task.id)"
                                                class="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-400 transition-all p-1"
                                                title="Add subtask"
                                            >
                                                <span class="i-ph-plus text-sm"></span>
                                            </button>
                                            <button 
                                                @click="handleDeleteTask(task.id)" 
                                                class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                                title="Delete task"
                                            >
                                                <span class="i-ph-trash text-sm"></span>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Subtask inline form -->
                                    <form v-if="subtaskFormParentId === task.id" @submit.prevent="handleCreateSubtask(task.id)" class="mt-3 flex gap-2">
                                        <input 
                                            v-model="newSubtaskTitle" 
                                            type="text" 
                                            required 
                                            placeholder="Subtask title..."
                                            class="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button type="submit" :disabled="tasksLoading" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium disabled:opacity-50">
                                            Add
                                        </button>
                                    </form>

                                    <!-- Subtasks -->
                                    <div v-if="getSubtasks(task.id).length > 0" class="mt-3 ml-8 space-y-2 border-l-2 border-zinc-800 pl-3">
                                        <div 
                                            v-for="sub in getSubtasks(task.id)" 
                                            :key="sub.id" 
                                            class="group/sub flex items-center gap-2"
                                        >
                                            <button 
                                                @click="handleToggleTask(sub)"
                                                :class="[
                                                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                                                    sub.isCompleted 
                                                        ? 'bg-blue-500 border-blue-500 text-white' 
                                                        : 'border-zinc-600 hover:border-blue-400'
                                                ]"
                                            >
                                                <span v-if="sub.isCompleted" class="i-ph-check text-[10px]"></span>
                                            </button>
                                            <span :class="['text-sm flex-1', sub.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300']">{{ sub.title }}</span>
                                            <button 
                                                @click="handleDeleteTask(sub.id)" 
                                                class="opacity-0 group-hover/sub:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                            >
                                                <span class="i-ph-trash text-[10px]"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="text-center py-12 text-zinc-500">
                            <span class="i-ph-check-square text-4xl mb-3 block opacity-50"></span>
                            <p>No tasks yet. Create one to get started.</p>
                        </div>
                    </div>

                    <!-- Notes Tab -->
                    <div v-else-if="activeTab === 'notes'">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Notes</h2>
                            <button 
                                @click="showNoteForm = !showNoteForm"
                                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                                <span class="i-ph-plus-bold"></span>
                                {{ showNoteForm ? 'Cancel' : 'New Note' }}
                            </button>
                        </div>

                        <!-- Inline Add Note Form -->
                        <form v-if="showNoteForm" @submit.prevent="handleCreateNote" class="mb-6 p-4 bg-zinc-900/60 border border-white/10 rounded-xl space-y-3">
                            <input 
                                v-model="newNoteTitle" 
                                type="text" 
                                required 
                                placeholder="Note title..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <textarea 
                                v-model="newNoteContent" 
                                rows="4" 
                                placeholder="Write your note..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            ></textarea>
                            <div class="flex justify-end">
                                <button type="submit" :disabled="notesLoading" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                    {{ notesLoading ? 'Creating...' : 'Create Note' }}
                                </button>
                            </div>
                        </form>

                        <!-- Loading -->
                        <div v-if="notesLoading && notes.length === 0" class="flex justify-center py-8">
                            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>

                        <!-- Notes List -->
                        <div v-else-if="notes.length > 0" class="space-y-3">
                            <div 
                                v-for="note in notes" 
                                :key="note.id" 
                                class="group p-5 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-blue-500/20 transition-colors"
                            >
                                <div class="flex items-start justify-between">
                                    <h3 class="text-white font-medium">{{ note.title }}</h3>
                                    <button 
                                        @click="handleDeleteNote(note.id)" 
                                        class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                        title="Delete note"
                                    >
                                        <span class="i-ph-trash text-sm"></span>
                                    </button>
                                </div>
                                <p class="text-sm text-zinc-400 mt-2 whitespace-pre-wrap leading-relaxed">{{ note.content || 'No content.' }}</p>
                                <span class="text-[10px] text-zinc-600 mt-3 block">{{ formatDate(note.createdAt) }}</span>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="text-center py-12 text-zinc-500">
                            <span class="i-ph-note-pencil text-4xl mb-3 block opacity-50"></span>
                            <p>No notes yet. Create one to capture your thoughts.</p>
                        </div>
                    </div>

                    <!-- Links Tab -->
                    <div v-else-if="activeTab === 'links'">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Quick Launch Links</h2>
                            <button 
                                @click="showLinkForm = !showLinkForm"
                                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                                <span class="i-ph-plus-bold"></span>
                                {{ showLinkForm ? 'Cancel' : 'New Link' }}
                            </button>
                        </div>

                        <!-- Inline Add Link Form -->
                        <form v-if="showLinkForm" @submit.prevent="handleCreateLink" class="mb-6 p-4 bg-zinc-900/60 border border-white/10 rounded-xl space-y-3">
                            <input 
                                v-model="newLinkLabel" 
                                type="text" 
                                required 
                                placeholder="Link label (e.g. Firebase Console)..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <input 
                                v-model="newLinkUrl" 
                                type="url" 
                                required 
                                placeholder="https://..."
                                class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <div class="flex justify-end">
                                <button type="submit" :disabled="quickLinksLoading" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                    {{ quickLinksLoading ? 'Adding...' : 'Add Link' }}
                                </button>
                            </div>
                        </form>

                        <!-- Loading -->
                        <div v-if="quickLinksLoading && quickLinks.length === 0" class="flex justify-center py-8">
                            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>

                        <!-- Links List -->
                        <div v-else-if="quickLinks.length > 0" class="space-y-2">
                            <div 
                                v-for="link in quickLinks" 
                                :key="link.id" 
                                class="group flex items-center gap-3 p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-blue-500/20 transition-colors"
                            >
                                <span class="i-ph-link text-zinc-400 text-lg shrink-0"></span>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-white text-sm font-medium">{{ link.label }}</h3>
                                    <a :href="link.url" target="_blank" rel="noopener" class="text-xs text-blue-400 hover:text-blue-300 truncate block">{{ link.url }}</a>
                                </div>
                                <div class="flex items-center gap-2">
                                    <a 
                                        :href="link.url" 
                                        target="_blank" 
                                        rel="noopener"
                                        class="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded transition-all"
                                    >
                                        Open
                                    </a>
                                    <button 
                                        @click="handleDeleteLink(link.id)" 
                                        class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                                        title="Delete link"
                                    >
                                        <span class="i-ph-trash text-sm"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="text-center py-12 text-zinc-500">
                            <span class="i-ph-link text-4xl mb-3 block opacity-50"></span>
                            <p>No quick launch links yet. Add one to get started.</p>
                        </div>
                    </div>
                </div>
            </main>
        </template>
        
        <!-- Edit Modal -->
        <ClientOnly>
            <Dialog :open="isEditModalOpen" @close="isEditModalOpen = false" class="relative z-50">
                 <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                 <div class="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel v-if="currentProject" class="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
                        <DialogTitle class="text-xl font-bold text-white mb-4">Edit Project</DialogTitle>
                        
                        <form @submit.prevent="handleUpdate" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Project Name</label>
                                <input 
                                    v-model="editForm.name" 
                                    type="text" 
                                    required
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                                <textarea 
                                    v-model="editForm.description" 
                                    rows="3"
                                    class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                 <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Status</label>
                                    <select 
                                        v-model="editForm.status"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option :value="ProjectStatus.ACTIVE">Active</option>
                                        <option :value="ProjectStatus.PENDING">Pending</option>
                                        <option :value="ProjectStatus.HOLD">On Hold</option>
                                        <option :value="ProjectStatus.COMPLETED">Completed</option>
                                        <option :value="ProjectStatus.ARCHIVED">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                                    <select 
                                        v-model="editForm.priority"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option :value="Priority.LOW">Low</option>
                                        <option :value="Priority.MEDIUM">Medium</option>
                                        <option :value="Priority.HIGH">High</option>
                                        <option :value="Priority.CRITICAL">Critical</option>
                                    </select>
                                </div>
                            </div>
                             <div class="grid grid-cols-2 gap-4">
                                 <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Start Date</label>
                                    <input 
                                        v-model="editForm.startDate" 
                                        type="date"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                 <div>
                                    <label class="block text-xs font-medium text-zinc-400 mb-1">Deadline</label>
                                    <input 
                                        v-model="editForm.deadline" 
                                        type="date"
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                 <label class="block text-xs font-medium text-zinc-400 mb-1">Progress ({{ editForm.progress }}%)</label>
                                 <input 
                                    v-model.number="editForm.progress" 
                                    type="range" 
                                    min="0" 
                                    max="100"
                                    class="w-full accent-blue-500"
                                 />
                            </div>

                            <div class="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    @click="isEditModalOpen = false"
                                    class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    :disabled="isUpdating"
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                 </div>
            </Dialog>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Goal } from '~/models/Goal';
import { Task } from '~/models/Task';
import { Note } from '~/models/Note';
import { ProjectStatus, TaskStatus, GoalStatus } from '../../../config/status';
import { Priority } from '../../../config/priority';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.id as string);

// --- Toast ---
const { success: toastSuccess, error: toastError } = useToast();

// --- Project ---
const { fetchProjectById, currentProject, updateProject, deleteProject, isLoading: projectLoading, error: projectError } = useProjects();

// --- Goals ---
const { goals, isLoading: goalsLoading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoals();

// --- Tasks ---
const { tasks, isLoading: tasksLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

// --- Notes ---
const { notes, isLoading: notesLoading, fetchNotes, createNote, deleteNote } = useNotes();

// --- Quick Launch Links ---
// --- Quick Launch Links ---
const { links: quickLinks, isLoading: quickLinksLoading, fetchLinks: fetchQuickLinks, createLink: createQuickLink, deleteLink: deleteQuickLink } = useQuickLaunchLinks();

// --- Time Tracking ---
const { activeLog, startTracking, stopTracking, init: initTimeTracking } = useTimeTracking();

// --- UI State ---
const activeTab = ref('overview');
const isEditModalOpen = ref(false);
const isUpdating = ref(false);

// Goal form
const showGoalForm = ref(false);
const newGoalTitle = ref('');
const newGoalDesc = ref('');

// Task form
const showTaskForm = ref(false);
const newTaskTitle = ref('');
const newTaskPriority = ref<Priority>(Priority.MEDIUM);
const newTaskGoalId = ref('');

// Subtask form
const subtaskFormParentId = ref<string | null>(null);
const newSubtaskTitle = ref('');

// Note form
const showNoteForm = ref(false);
const newNoteTitle = ref('');
const newNoteContent = ref('');

// Quick launch link form
const showLinkForm = ref(false);
const newLinkLabel = ref('');
const newLinkUrl = ref('');

// Edit form
const editForm = ref({
    name: '',
    description: '',
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    startDate: '',
    deadline: '',
    progress: 0
});

// --- Tab Config ---
const tabs = computed(() => [
    { id: 'overview', label: 'Overview', count: 0 },
    { id: 'goals', label: 'Goals', count: goals.value.length },
    { id: 'tasks', label: 'Tasks', count: tasks.value.length },
    { id: 'notes', label: 'Notes', count: notes.value.length },
    { id: 'links', label: 'Links', count: quickLinks.value.length }
]);

// --- Computed ---
const topLevelTasks = computed(() => tasks.value.filter(t => !t.parentTaskId));
const getSubtasks = (parentId: string) => tasks.value.filter(t => t.parentTaskId === parentId);

// --- Init ---
onMounted(async () => {
    const id = projectId.value;
    if (id) {
        await fetchProjectById(id);
        if (currentProject.value) {
            initEditForm();
            // Load subcollection data in parallel
            fetchGoals(id).catch(e => console.error('Failed to load goals', e));
            fetchTasks(id).catch(e => console.error('Failed to load tasks', e));
            fetchNotes(id).catch(e => console.error('Failed to load notes', e));
            fetchQuickLinks(id).catch(e => console.error('Failed to load quick links', e));
            initTimeTracking();
        }
    }
});

watch(currentProject, () => {
    if (currentProject.value) {
        initEditForm();
    }
});

// --- Project Actions ---
const initEditForm = () => {
    if (!currentProject.value) return;
    editForm.value = {
        name: currentProject.value.name,
        description: currentProject.value.description,
        status: currentProject.value.status,
        priority: currentProject.value.priority,
        startDate: currentProject.value.startDate ? (new Date(currentProject.value.startDate).toISOString().split('T')[0] as string) : '',
        deadline: currentProject.value.deadline ? (new Date(currentProject.value.deadline).toISOString().split('T')[0] as string) : '',
        progress: currentProject.value.progress
    };
};

const openEditModal = () => {
    initEditForm();
    isEditModalOpen.value = true;
};

const handleUpdate = async () => {
    if (!currentProject.value) return;
    isUpdating.value = true;
    try {
        await updateProject(currentProject.value.id, {
            name: editForm.value.name,
            description: editForm.value.description,
            status: editForm.value.status as any,
            priority: editForm.value.priority as any,
            startDate: editForm.value.startDate ? new Date(editForm.value.startDate) : null,
            deadline: editForm.value.deadline ? new Date(editForm.value.deadline) : null,
            progress: editForm.value.progress
        });
        isEditModalOpen.value = false;
        toastSuccess('Project updated');
    } catch (e) {
        console.error("Failed to update", e);
        toastError('Failed to update project');
    } finally {
        isUpdating.value = false;
    }
};

const handleDelete = async () => {
    if (!currentProject.value) return;
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    try {
        await deleteProject(currentProject.value.id);
        toastSuccess('Project deleted');
        router.push('/projects');
    } catch (e) {
        console.error("Failed to delete", e);
        toastError('Failed to delete project');
    }
};

// --- Goal Actions ---
const handleCreateGoal = async () => {
    if (!projectId.value || !newGoalTitle.value.trim()) return;
    try {
        await createGoal(projectId.value, { title: newGoalTitle.value.trim(), description: newGoalDesc.value.trim() });
        newGoalTitle.value = '';
        newGoalDesc.value = '';
        showGoalForm.value = false;
        toastSuccess('Goal created');
    } catch (e) {
        console.error('Failed to create goal', e);
        toastError('Failed to create goal');
    }
};

const handleUpdateGoalStatus = async (goalId: string, newStatus: string) => {
    if (!projectId.value) return;
    try {
        await updateGoal(projectId.value, goalId, { status: newStatus as GoalStatus });
        toastSuccess('Goal status updated');
    } catch (e) {
        console.error('Failed to update goal', e);
        toastError('Failed to update goal');
    }
};

const handleDeleteGoal = async (goalId: string) => {
    if (!projectId.value) return;
    if (!confirm('Delete this goal?')) return;
    try {
        await deleteGoal(projectId.value, goalId);
        toastSuccess('Goal deleted');
    } catch (e) {
        console.error('Failed to delete goal', e);
        toastError('Failed to delete goal');
    }
};

// --- Task Actions ---
const handleCreateTask = async (parentId?: string) => {
    if (!projectId.value || !newTaskTitle.value.trim()) return;
    try {
        await createTask(projectId.value, {
            title: newTaskTitle.value.trim(),
            priority: newTaskPriority.value,
            goalId: newTaskGoalId.value || null,
            parentTaskId: parentId || null
        });
        newTaskTitle.value = '';
        newTaskPriority.value = Priority.MEDIUM;
        newTaskGoalId.value = '';
        showTaskForm.value = false;
        toastSuccess('Task created');
    } catch (e) {
        console.error('Failed to create task', e);
        toastError('Failed to create task');
    }
};

const handleCreateSubtask = async (parentId: string) => {
    if (!projectId.value || !newSubtaskTitle.value.trim()) return;
    try {
        await createTask(projectId.value, {
            title: newSubtaskTitle.value.trim(),
            parentTaskId: parentId
        });
        newSubtaskTitle.value = '';
        subtaskFormParentId.value = null;
        toastSuccess('Subtask added');
    } catch (e) {
        console.error('Failed to create subtask', e);
        toastError('Failed to create subtask');
    }
};

const toggleSubtaskForm = (taskId: string) => {
    subtaskFormParentId.value = subtaskFormParentId.value === taskId ? null : taskId;
    newSubtaskTitle.value = '';
};

const handleToggleTask = async (task: any) => {
    if (!projectId.value) return;
    try {
        const newCompleted = !task.isCompleted;
        await updateTask(projectId.value, task.id, {
            isCompleted: newCompleted,
            status: newCompleted ? TaskStatus.DONE : TaskStatus.TODO
        });
    } catch (e) {
        console.error('Failed to toggle task', e);
        toastError('Failed to update task');
    }
};

const handleDeleteTask = async (taskId: string) => {
    if (!projectId.value) return;
    if (!confirm('Delete this task?')) return;
    try {
        await deleteTask(projectId.value, taskId);
        toastSuccess('Task deleted');
    } catch (e) {
        console.error('Failed to delete task', e);
        toastError('Failed to delete task');
    }
};

// --- Note Actions ---
const handleCreateNote = async () => {
    if (!projectId.value || !newNoteTitle.value.trim()) return;
    try {
        await createNote(projectId.value, { title: newNoteTitle.value.trim(), content: newNoteContent.value });
        newNoteTitle.value = '';
        newNoteContent.value = '';
        showNoteForm.value = false;
        toastSuccess('Note created');
    } catch (e) {
        console.error('Failed to create note', e);
        toastError('Failed to create note');
    }
};

const handleDeleteNote = async (noteId: string) => {
    if (!projectId.value) return;
    if (!confirm('Delete this note?')) return;
    try {
        await deleteNote(projectId.value, noteId);
        toastSuccess('Note deleted');
    } catch (e) {
        console.error('Failed to delete note', e);
        toastError('Failed to delete note');
    }
};

// --- Quick Launch Link Actions ---
const handleCreateLink = async () => {
    if (!projectId.value || !newLinkLabel.value.trim() || !newLinkUrl.value.trim()) return;
    try {
        await createQuickLink(projectId.value, { label: newLinkLabel.value.trim(), url: newLinkUrl.value.trim() });
        newLinkLabel.value = '';
        newLinkUrl.value = '';
        showLinkForm.value = false;
        toastSuccess('Link added');
    } catch (e) {
        console.error('Failed to create link', e);
        toastError('Failed to add link');
    }
};

const handleDeleteLink = async (linkId: string) => {
    if (!projectId.value) return;
    if (!confirm('Delete this link?')) return;
    try {
        await deleteQuickLink(projectId.value, linkId);
        toastSuccess('Link deleted');
    } catch (e) {
        console.error('Failed to delete link', e);
        toastError('Failed to delete link');
    }
};

const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

</script>

<script lang="ts">

</script>

