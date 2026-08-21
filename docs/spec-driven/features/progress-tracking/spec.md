# Progress tracking spec

## Problem

The app originally showed a coaching-style progress snapshot, but it did not let owners record what they actually practiced. That made the "Skills & progress" page feel informative, but not truly interactive or personal.

## Users

- new puppy owners using the planner every day
- demo viewers who need to see that the app can persist and evolve state over time

## Goals

- let owners log real progress for focus areas, skills, and daily habits
- make progress feel tied to the specific puppy profile being viewed
- keep the first version simple enough to use without sign-in friction
- preserve a path to future account-based sync

## Non-goals

- multi-user collaboration
- cloud sync across devices
- historical charts or advanced analytics
- streak gamification beyond basic logging

## Acceptance criteria

- users can log skill practice from the skills view
- users can mark habits complete for the current day
- users can mark focus areas as worked on for the current day
- logged progress persists in the browser after refresh
- progress bars reflect logged activity instead of only static generated values
- progress remains separated by puppy profile key

## Notes / open questions

- local browser persistence is acceptable for Phase 1
- a later phase can move this to account-backed storage if the product needs sync or shared access
