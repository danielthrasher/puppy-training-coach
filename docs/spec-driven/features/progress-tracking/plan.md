# Progress tracking technical plan

## Summary

Implement a browser-persistent progress system that sits on top of generated plans. The initial version should avoid backend complexity by storing progress in local storage and keying it to the active puppy profile.

## Impacted files

- [client/src/App.jsx](/Users/danielthrasher/projects/puppy-training-coach/client/src/App.jsx)
- [client/src/App.css](/Users/danielthrasher/projects/puppy-training-coach/client/src/App.css)
- [README.md](/Users/danielthrasher/projects/puppy-training-coach/README.md)
- [docs/spec-driven/features/progress-tracking/spec.md](/Users/danielthrasher/projects/puppy-training-coach/docs/spec-driven/features/progress-tracking/spec.md)
- [docs/spec-driven/features/progress-tracking/implement.md](/Users/danielthrasher/projects/puppy-training-coach/docs/spec-driven/features/progress-tracking/implement.md)

## Data/API changes

Phase 1 does not require backend changes.

Client-side storage model:

```json
{
  "<profile-key>": {
    "focusAreas": {
      "Potty training": { "dates": ["2026-08-20"] }
    },
    "skills": {
      "Sit": { "count": 3, "lastPracticedOn": "2026-08-20" }
    },
    "habits": {
      "Potty consistency": { "dates": ["2026-08-20"] }
    }
  }
}
```

`<profile-key>` should be derived from stable parts of the generated plan profile, such as puppy name, breed, and age.

## UI changes

- add **Log practice** actions to skill cards
- add **Done today / Undo today** actions to habit cards
- add **Worked on this today / Undo today** actions to focus-area progress cards
- replace the purely static progress explanation with wording that describes logged activity
- show small counters so users can see that their actions persist

## Validation plan

- build the client successfully
- verify the UI strings for tracking actions appear in the built bundle
- verify the app still serves and the profile/progress flows coexist
- manually verify that logging persists across refresh in the browser

## Future phases

### Phase 2

- move progress storage to the backend
- add account-backed persistence
- support cross-device sync

### Phase 3

- add dates, trends, streaks, and milestone summaries
- tie logged progress to recommendation changes in the coaching engine

## Future feature roadmap

These are the most useful follow-on features to implement after the current local progress system.

### 1. Progress history and streaks

- show the last 7 days of logged activity
- add weekly streaks for habits, skills, and focus areas
- surface recent wins so the progress page feels more motivating
- build on the current browser-stored progress model before moving to backend sync

### 2. Multiple puppy profiles

- support saving more than one puppy
- add an active puppy selector in the profile area
- keep saved profile data and progress data separated per puppy
- make the app feel more complete for households with more than one dog

### 3. Account system

- add sign-in only when the product needs shared access or multi-device sync
- move saved profiles and progress from browser storage to backend persistence
- support family or roommate access to the same puppy profile later
- keep this as a later-phase feature rather than a prerequisite for progress tracking

### 4. Photo and notes journal

- let owners save short daily notes such as accidents, wins, triggers, or breakthroughs
- optionally add photo attachments in a later pass
- create a lightweight training timeline that makes progress easier to explain and review

### 5. Reminders and notifications

- add potty, crate, or training-session reminders
- start with simple in-app reminders before adding device notifications
- use reminders to reinforce consistency, especially for very young puppies

### 6. Export and share plan

- create a print-friendly routine view
- export a weekly puppy summary or progress snapshot
- support sharing with trainers, family members, or instructors during demos
