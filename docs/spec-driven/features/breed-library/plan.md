# Breed library technical plan

## Summary

Replace the current freeform breed field with a **searchable breed library**
that supports:

1. a fast local dropdown for the main user flow
2. optional breed facts shown after selection
3. a manual fallback for mixed-breed or unknown dogs
4. a future MCP-backed enrichment path without making the UI depend on a 3rd-party service

The goal is to improve consistency and usability first, then layer in richer
breed-specific guidance later.

## Recommended approach

### Phase 1: local-first breed picker

Ship a curated breed list inside the app and keep the initial experience fully
local.

This phase should:

- replace the freeform breed input with a searchable dropdown
- allow a **Mixed breed / Unknown** option
- allow a manual override text field when needed
- pass the selected breed cleanly into the current puppy plan flow
- avoid any external dependency for the first version

### Phase 2: breed facts enrichment

After the dropdown works well, add breed facts and traits through a controlled
backend layer.

This phase should:

- fetch breed details after selection
- expose a small, normalized breed facts response to the client
- keep API-specific formatting out of the frontend
- optionally power the enrichment through our own local MCP server wrapper

## Architecture decision

### Why local-first

The breed field is part of the core intake flow, so it should not fail just
because a remote service is down.

A local-first design gives us:

- fast dropdown search
- predictable demo behavior
- less complexity during implementation
- freedom to swap external data providers later

### Why still keep MCP in the plan

The dropdown itself should not depend on MCP, but breed **enrichment** is a good
fit for it.

That means:

- local data powers the essential breed selection UX
- MCP can enrich the selected breed with facts, tendencies, or care notes
- the app stays usable even if the MCP or external provider is unavailable

## Data model

### Phase 1 local breed entry shape

Recommended local data file:

- [client/src/data/breeds.json](/Users/danielthrasher/projects/puppy-training-coach/client/src/data/breeds.json)

Suggested shape:

```json
[
  {
    "id": "golden-retriever",
    "name": "Golden Retriever",
    "group": "Sporting",
    "size": "Large",
    "energy": "High",
    "trainability": "High"
  }
]
```

Minimum required fields:

- `id`
- `name`

Helpful fields for future use:

- `group`
- `size`
- `energy`
- `trainability`
- `coat`
- `temperament`

### Selected breed payload

The frontend should submit a normalized breed object or a simple selected value.

Recommended request shape:

```json
{
  "breedSelection": {
    "type": "library",
    "id": "golden-retriever",
    "label": "Golden Retriever"
  }
}
```

Manual fallback shape:

```json
{
  "breedSelection": {
    "type": "manual",
    "label": "Shepherd mix"
  }
}
```

## Backend/API changes

### Phase 1 API changes

Keep the backend simple. The current `/api/plan` route can accept either:

- the existing `breed` string, or
- a richer `breedSelection` object

Recommended backend normalization:

- if `breedSelection.type === "library"`, use `breedSelection.label`
- if `breedSelection.type === "manual"`, use the manual label
- if neither exists, fall back to the current `breed` string

### Phase 2 API changes

Add a small read endpoint for breed facts:

- `GET /api/breeds`
- `GET /api/breeds/:id`

Possible server files:

- [server/index.js](/Users/danielthrasher/projects/puppy-training-coach/server/index.js)
- [server/src/breedService.js](/Users/danielthrasher/projects/puppy-training-coach/server/src/breedService.js)
- [server/src/breedFactsMcpClient.js](/Users/danielthrasher/projects/puppy-training-coach/server/src/breedFactsMcpClient.js)

## Frontend/UI changes

### Intake form changes

Replace the breed text box in [App.jsx](/Users/danielthrasher/projects/puppy-training-coach/client/src/App.jsx) with:

1. searchable breed dropdown
2. mixed-breed / unknown option
3. optional manual text entry when "Other" or "Mixed breed" is selected

### Search behavior

The breed picker should:

- filter as the user types
- prioritize prefix matches
- keep keyboard interaction simple
- be usable without requiring a custom heavy combobox library unless needed

### Breed facts display

After selection, show a lightweight card near the form or in the weekly plan:

- breed group
- typical energy level
- trainability
- one short note about how that might affect training

The copy should stay suggestive, not absolute.

## MCP role in this feature

### Recommended MCP use

Use MCP for **enrichment**, not for the primary dropdown list.

Good MCP responsibilities:

- fetch breed details from a wrapped external API
- return normalized breed facts
- optionally return a short training note per breed

Bad MCP responsibilities for phase 1:

- driving every dropdown keystroke
- acting as the only source of breed names
- making the main form depend on network availability

### Best external sources to wrap

Recommended order:

1. `dogapi.dog` for richer breed metadata
2. Dog CEO for breed list + images
3. API Ninjas if we later want deeper trait filtering and can support credentials

## Impacted files

### Existing files likely to change

- [client/src/App.jsx](/Users/danielthrasher/projects/puppy-training-coach/client/src/App.jsx)
- [client/src/App.css](/Users/danielthrasher/projects/puppy-training-coach/client/src/App.css)
- [client/src/api.js](/Users/danielthrasher/projects/puppy-training-coach/client/src/api.js)
- [server/index.js](/Users/danielthrasher/projects/puppy-training-coach/server/index.js)
- [server/src/trainingEngine.js](/Users/danielthrasher/projects/puppy-training-coach/server/src/trainingEngine.js)

### New files likely needed

- [client/src/data/](/Users/danielthrasher/projects/puppy-training-coach/client/src/data)
- [server/src/breedService.js](/Users/danielthrasher/projects/puppy-training-coach/server/src/breedService.js)
- [server/src/breedFactsMcpClient.js](/Users/danielthrasher/projects/puppy-training-coach/server/src/breedFactsMcpClient.js)

## Risks and mitigations

### Risk: breed assumptions feel too deterministic

Mitigation:

- present breed facts as tendencies, not guarantees
- keep mixed-breed and manual paths available

### Risk: dropdown becomes hard to maintain

Mitigation:

- keep the local list minimal and normalized
- document the source of truth for breed entries

### Risk: external breed service becomes unavailable

Mitigation:

- keep the local list fully usable on its own
- treat external enrichment as optional

## Validation plan

### Phase 1 validation

- Build the app successfully.
- Verify the dropdown renders and filters breeds.
- Verify keyboard and mouse selection both work.
- Verify breed selection flows into the generated plan.
- Verify mixed-breed / manual entry still works.

### Phase 2 validation

- Verify breed facts load for supported library breeds.
- Verify the UI still works when the enrichment source fails.
- Verify breed facts are normalized and not leaking provider-specific raw data.

## Rollout recommendation

### Step 1

Implement the local dropdown only.

### Step 2

Stabilize the UX and confirm the breed field feels better than freeform text.

### Step 3

Add optional breed facts through a backend abstraction.

### Step 4

If useful for the capstone story, route that enrichment through our own MCP layer.
