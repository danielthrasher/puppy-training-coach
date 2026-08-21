# API response examples

This file is a lightweight, OpenAPI-style reference for the current backend.
Values like `generatedAt` and some progress numbers will change at runtime.
Long arrays are shortened to representative items for readability.

## `GET /api/health`

```json
{
  "ok": true
}
```

## `GET /api/sample`

Returns a demo plan for Maple.

```json
{
  "generatedAt": "2026-08-20T19:24:05.000Z",
  "profile": {
    "puppyName": "Maple",
    "ageMonths": 4,
    "breed": "Labrador Retriever",
    "energyLevel": "High"
  },
  "summary": "Maple is in a great stage for short, frequent wins. Focus on Potty training, Crate confidence, Sit while protecting naps, potty timing, and calm routines. Use food motivation and easy impulse-control games to turn energy into clean repetitions.",
  "coachNote": "Labradors usually learn quickly when rewards are clear, but they benefit from frequent calm resets. You do not need to train everything every day. Pick one or two priorities, keep sessions tiny, and let repetition do the heavy lifting.",
  "trainingSpec": {
    "productGoal": "Create a repeatable training routine for Maple focused on Potty training, Crate confidence, Sit.",
    "acceptanceCriteria": [
      "The owner can run every formal training block in under 12 minutes.",
      "Each focus area has a clear success definition for the week.",
      "Daily habits reinforce calm behavior and prevent common puppy mistakes.",
      "The plan includes age-appropriate coaching recommendations."
    ],
    "definitionOfDone": [
      "Maple can complete one short training session in each main routine window.",
      "The owner knows what to practice, what to reward, and when to stop.",
      "The next milestone is clear: potty training."
    ]
  },
  "mcpGuidance": {
    "recommendations": {
      "puppyName": "Maple",
      "breed": "Labrador Retriever",
      "emphasis": "Build potty timing around wake-up, meals, play, and crate transitions.",
      "pacing": "Keep sessions to 3-5 minutes and prioritize management and naps.",
      "enrichment": "Add sniff-heavy decompression and short tug play after training.",
      "nextMilestone": "potty training",
      "demoNote": "These recommendations adjust to your puppy age, goals, and energy level so you can keep sessions realistic and repeatable."
    },
    "breedEnrichment": {
      "temperament": "Friendly, enthusiastic, and typically very reward-driven.",
      "idealActivities": ["retrieve games", "food-based training", "settle breaks between reps"],
      "careNotes": "Impulse-control games help turn enthusiasm into cleaner skills.",
      "firstTimeOwnerTip": "Reinforce four paws on the floor early because labs often greet with their whole body."
    },
    "principles": [
      "Train in tiny bursts before your puppy is overexcited.",
      "Use management to prevent mistakes you do not want repeated.",
      "Pair every challenging skill with a simple win immediately after.",
      "Sleep, potty timing, and calm repetitions matter as much as cue training."
    ]
  },
  "focusAreas": [
    "Potty training",
    "Crate confidence",
    "Sit",
    "Leash walking",
    "Bite inhibition"
  ],
  "todayPlan": [
    {
      "timeOfDay": "Morning",
      "title": "Potty + calm start",
      "duration": "8 minutes",
      "goal": "Help Maple start the day with success and lower chaos indoors.",
      "steps": [
        "Go straight outside after waking up.",
        "Reward immediately after potty with praise and a treat.",
        "Practice name recognition and one easy cue indoors."
      ]
    }
  ],
  "habitChecklist": [
    {
      "name": "Potty consistency",
      "priority": "High",
      "why": "Frequent successful potty trips reduce accidents and confusion.",
      "trigger": "After waking, eating, play, and crate time."
    }
  ],
  "skillLibrary": [
    {
      "name": "Potty routine",
      "level": "Beginner",
      "goal": "House training",
      "supports": "Potty training",
      "description": "Reward fast outdoor potty success and keep the timing routine very predictable.",
      "reward": "Food rewards quickly"
    }
  ],
  "progress": [
    {
      "area": "Potty training",
      "score": 44,
      "note": "This is the top priority, so repeat it in tiny reps throughout the day."
    }
  ],
  "reminders": [
    "Maple is still very young, so keep formal training short and upbeat.",
    "Reward calm greetings early so manners stay easy to manage.",
    "Use management like baby gates, leashes, pens, and chews to prevent bad rehearsals.",
    "Prioritize socialization experiences that feel safe and positive rather than overwhelming.",
    "If your puppy seems over-tired, switch from training to rest instead of pushing through."
  ]
}
```

## `POST /api/plan`

Request:

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

Response:

```json
{
  "profile": {
    "puppyName": "Maple",
    "ageMonths": 4,
    "breed": "Mini Goldendoodle",
    "energyLevel": "High"
  },
  "summary": "Maple is in a great stage for short, frequent wins. Focus on Potty training, Crate confidence, Sit while protecting naps, potty timing, and calm routines.",
  "coachNote": "You do not need to train everything every day. Pick one or two priorities, keep sessions tiny, and let repetition do the heavy lifting.",
  "mcpGuidance": {
    "recommendations": {
      "emphasis": "Build potty timing around wake-up, meals, play, and crate transitions.",
      "pacing": "Keep sessions to 3-5 minutes and prioritize management and naps.",
      "enrichment": "Add sniff-heavy decompression and short tug play after training.",
      "nextMilestone": "potty training",
      "demoNote": "These recommendations adjust to your puppy age, goals, and energy level so you can keep sessions realistic and repeatable."
    },
    "breedEnrichment": null,
    "principles": [
      "Train in tiny bursts before your puppy is overexcited.",
      "Use management to prevent mistakes you do not want repeated.",
      "Pair every challenging skill with a simple win immediately after.",
      "Sleep, potty timing, and calm repetitions matter as much as cue training."
    ]
  },
  "focusAreas": ["Potty training", "Crate confidence", "Sit", "Leash walking"],
  "todayPlan": [
    {
      "timeOfDay": "Morning",
      "title": "Potty + calm start",
      "duration": "8 minutes",
      "goal": "Help Maple start the day with success and lower chaos indoors.",
      "steps": [
        "Go straight outside after waking up.",
        "Reward immediately after potty with praise and a treat.",
        "Practice name recognition and one easy cue indoors."
      ]
    }
  ],
  "habitChecklist": [
    {
      "name": "Potty consistency",
      "priority": "High",
      "why": "Frequent successful potty trips reduce accidents and confusion.",
      "trigger": "After waking, eating, play, and crate time."
    }
  ],
  "skillLibrary": [
    {
      "name": "Potty routine",
      "level": "Beginner",
      "goal": "House training",
      "supports": "Potty training",
      "description": "Reward fast outdoor potty success and keep the timing routine very predictable.",
      "reward": "Food rewards quickly"
    }
  ],
  "progress": [
    {
      "area": "Potty training",
      "score": 44,
      "note": "This is the top priority, so repeat it in tiny reps throughout the day."
    }
  ],
  "reminders": [
    "Maple is still very young, so keep formal training short and upbeat.",
    "Reward calm greetings early so manners stay easy to manage.",
    "Use management like baby gates, leashes, pens, and chews to prevent bad rehearsals.",
    "Prioritize socialization experiences that feel safe and positive rather than overwhelming.",
    "If your puppy seems over-tired, switch from training to rest instead of pushing through."
  ]
}
```

## `POST /api/plan` error example

```json
{
  "error": "Please enter your puppy name."
}
```
