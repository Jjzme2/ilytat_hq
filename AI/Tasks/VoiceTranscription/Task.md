# Task: Voice Transcription for NLP Event Creation
**Model:** Gemini 2.5 Flash

## Objective
Implement voice dictation capabilities in the Schedule module, allowing users to speak their event details via a microphone rather than just typing them in the "Smart Input" box.

## Requirements
- Add a conditionally rendering microphone button in `schedule.vue`.
- Utilize `@vueuse/core` Web Speech API (`useSpeechRecognition`) for parsing voice.
- Feed transcribed text seamlessly into the existing NLP integration.
