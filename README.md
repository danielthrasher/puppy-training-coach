# Puppy Training Coach

Puppy Training Coach is a lightweight app for new dog owners who want help
building a daily routine, picking the right training priorities, and tracking
early progress with a puppy.

## What it does

- captures a simple puppy profile
- starts with a centered profile builder and then switches into a separate plan/results view
- generates a focused daily training plan
- adjusts coaching language based on the selected breed when a breed-library choice is available
- generates a small **training spec** with goal, acceptance criteria, and definition of done
- suggests short training sessions by time of day
- lets owners mark today’s routine sessions complete
- highlights daily habits to repeat consistently
- shows a small skill library with reward ideas
- lets you log real progress for focus areas, skills, and habits in the browser
- shows recent history and streaks so progress feels cumulative over time
- gives owner reminders
- includes a searchable breed library seeded with 15 popular breeds plus a mixed/custom fallback
- shows richer breed card details like reward style, best fit, watch-outs, and care level
- adds deeper breed notes from the local MCP layer after a plan is generated
- lets you save and reload the latest puppy profile in the browser
- pulls coaching guidance from a **local MCP server**

This project is intentionally simple and demo-friendly: it is a polished starter
app you can build on rather than a full production product.

## Project layout

```text
puppy-training-coach/
├── docs/
│   └── spec-driven/    # spec.md / plan.md / implement.md workflow for features
├── client/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── api.js
├── server/
│   ├── index.js
│   └── src/
│       ├── mcpClient.js
│       ├── trainingAdvisorServer.mjs
│       └── trainingEngine.js
└── package.json
```

## Running it

Requires Node.js 18+.

```bash
npm install
npm run install:all
npm run dev
```

Open **http://localhost:5173** in dev mode.

For a single-process run:

```bash
npm start
```

## API

### `GET /api/sample`
Returns a sample puppy plan for a demo puppy.

### `POST /api/plan`
Accepts a JSON body like:

```json
{
  "puppyName": "Maple",
  "ageMonths": 4,
  "breed": "Mini Goldendoodle",
  "breedSelection": {
    "type": "library",
    "id": "mini-goldendoodle",
    "label": "Mini Goldendoodle"
  },
  "goals": "potty training, crate confidence, sit, leash walking",
  "energyLevel": "high"
}
```

`breedSelection` is optional. If omitted, the backend falls back to the plain `breed` string.

Returns a generated plan with:

- profile
- summary
- trainingSpec
- mcpGuidance
- focusAreas
- todayPlan
- habitChecklist
- skillLibrary
- progress
- reminders

Reference examples:

- [docs/api-responses.md](docs/api-responses.md)

## Demo Structure

### 1. Overview

  - Puppy Training Coach is a puppy-planning app for new dog owners. It helps solve the problem of not knowing what to train next by generating a daily routine, weekly focus areas, breed-aware coaching, and trackable progress.

### 2. AI Usage

  - AI-assisted brainstorming helped shape the project direction
  - spec-driven planning was used to define features before implementation
  - MCP was used through a local coaching server/client flow
  - a second MCP-backed enrichment path now provides deeper breed notes after plan generation
  - AI coding assistance sped up UI, backend, and feature iteration

### 3. Key Learnings

  - keeping the product domain practical made the demo easier to explain
  - spec-driven files helped break work into smaller, clearer features
  - local-first persistence was a good way to add progress tracking without full auth
  - MCP fit best as enrichment, not as a dependency for the main user flow

### 4. Issues Encountered

  - some UI versions became too busy and had to be simplified
  - labeling around skills and progress had to be clarified to make sense
  - browser-served builds occasionally got out of sync with source changes during iteration
  - new progress features introduced a runtime bug that had to be debugged and fixed

### 5. Potential Improvements

  - progress history and streak expansion
  - multiple puppy profiles
  - account-backed sync across devices
  - notes/photo journal entries
  - reminders and notifications
  - export/share features for trainers or family members

### Demo script

- [docs/browser-demo-script.md](docs/browser-demo-script.md)

## Feature planning docs

Traditional spec-driven files for future work live under:

- [docs/spec-driven/README.md](docs/spec-driven/README.md)
- [docs/spec-driven/feature-template.md](docs/spec-driven/feature-template.md)
- Example feature:
  - [spec.md](docs/spec-driven/features/breed-library/spec.md)
  - [plan.md](docs/spec-driven/features/breed-library/plan.md)
  - [implement.md](docs/spec-driven/features/breed-library/implement.md)
