
import { ref } from 'vue'

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    type: string; // The type of data (key in contextActions)
    data: any;    // The actual data object
}

const contextMenu = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: '',
    data: null
})

export const useContextMenu = () => {

    const show = (e: MouseEvent | TouchEvent, type: string, data: any) => {
        e.preventDefault();
        e.stopPropagation();

        let clientX = 0;
        let clientY = 0;

        if (e instanceof TouchEvent && e.touches.length > 0) {
            // @ts-ignore
            clientX = e.touches[0].clientX;
            // @ts-ignore
            clientY = e.touches[0].clientY;
        } else if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        contextMenu.value = {
            visible: true,
            x: clientX,
            y: clientY,
            type,
            data
        };
    };

    const hide = () => {
        contextMenu.value.visible = false;
    };

    // Helper to attach to elements
    // Usage: v-on="useContextMenuTrigger('project-row', project)"
    // But Vue directives doesn't work like spread. 
    // Recommended usage: @contextmenu.prevent="show($event, 'project-row', project)"

    return {
        contextMenu,
        show,
        hide
    };
}
