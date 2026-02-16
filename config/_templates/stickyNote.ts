export const stickyNote = {
    name: '📝 Sticky Note',
    type: 'sticky_note' as const,
    description: 'A simple sticky note for quick thoughts and tags',
    content: `STICKY NOTE
Date: {{date}}
Importance: {{priority}}

TITLE: {{title}}

--------------------------------------------
{{content}}
--------------------------------------------

TAGS: {{tags}}`
}