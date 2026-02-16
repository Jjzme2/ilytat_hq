export const meetingNotes = {
    name: '📝 Meeting Notes',
    type: 'other:meeting_notes' as const,
    description: 'Structured meeting notes template',
    content: `MEETING NOTES

Date: {{date}}
Attendees: {{attendees}}
Subject: {{subject}}

AGENDA
{{agenda}}

DISCUSSION POINTS
{{discussionPoints}}

ACTION ITEMS
{{actionItems}}

NEXT MEETING
Date: {{nextMeetingDate}}
Topics: {{nextTopics}}`
}