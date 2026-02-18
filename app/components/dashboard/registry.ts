import type { Component } from 'vue';
import PulseWidget from './widgets/PulseWidget.vue';
import InboxWidget from './widgets/InboxWidget.vue';
import ProjectsWidget from './widgets/ProjectsWidget.vue';
import TasksWidget from './widgets/TasksWidget.vue';
import GoalsWidget from './widgets/GoalsWidget.vue';
import ScheduleWidget from './widgets/ScheduleWidget.vue';
import FinanceWidget from './widgets/FinanceWidget.vue';
import ThemeWidget from './widgets/ThemeWidget.vue';

export const WIDGET_REGISTRY: Record<string, Component> = {
    pulse: PulseWidget,
    inbox: InboxWidget,
    projects: ProjectsWidget,
    tasks: TasksWidget,
    goals: GoalsWidget,
    schedule: ScheduleWidget,
    finance: FinanceWidget,
    theme: ThemeWidget
};
