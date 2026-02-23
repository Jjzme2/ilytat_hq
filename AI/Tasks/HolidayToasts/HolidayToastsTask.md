---
model: Gemini 2.5 Pro
task_name: HolidayToasts
---

# Task Interpretation
The user requested a feature to show toast messages corresponding to major world holidays. The solution needs to be configurable, allowing new holidays to be added easily if any were missed.

# Implementation Details
- A static configuration array is constructed containing major holidays (like New Year's Day, Valentine's, Halloween, etc.).
- The system checks the current date on startup and matches it against the configured holiday list.
- A customized toast from `ilytat-notifications` is displayed if a matching holiday exists for today.
- A `localStorage` flag is set so that the message doesn't repetitively show for multiple page loads within the same day/year.
- The entry point hooks into Nuxt's `onMounted` lifecycle in the root default layout to ensure it is triggered client-side on app load. 
