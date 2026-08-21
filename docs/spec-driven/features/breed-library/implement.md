# Breed library implementation checklist

- [x] Add a curated breed list data source
- [x] Replace freeform breed input with dropdown + manual fallback
- [x] Add a breed-library dropdown for quick selection
- [x] Return selected breed cleanly to the backend
- [x] Show breed facts or temperament hints in the UI
- [x] Add documentation for the breed data source
- [x] Run build and verify acceptance criteria

## Notes

### Phase 1 completed

- Local curated breed data now lives in [breeds.js](/Users/danielthrasher/projects/puppy-training-coach/client/src/data/breeds.js).
- The current seed set is a curated list of 15 popular breeds, with mixed/custom breeds handled by manual entry.
- The puppy profile now supports:
  - breed library mode
  - mixed/custom manual entry
  - dropdown selection
  - richer breed facts in the form, including reward style, best fit, watch-outs, and care level
- The profile form can now save and reload the latest puppy profile from browser storage for faster repeat use.
- The backend accepts normalized `breedSelection` payloads and still falls back to a plain `breed` string.
- The generated plan now subtly adjusts summary, coach notes, rewards, and reminders when the selected breed matches a known library breed.
- The local MCP layer now also returns deeper breed notes for known breeds, which are shown in the breed card after plan generation.
- The skills and progress view now supports browser-persistent progress logging for focus areas, skill practice, and daily habits without requiring user accounts yet.
