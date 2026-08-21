const { getBreedProfile } = require('./breedProfiles');

function normalizeGoals(goals) {
  return goals
    .map((goal) => String(goal).trim())
    .filter(Boolean)
    .map((goal) => goal.toLowerCase());
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inferFocusAreas(goals) {
  const seen = new Set();
  const ordered = [];
  for (const goal of goals) {
    if (!seen.has(goal)) {
      seen.add(goal);
      ordered.push(sentenceCase(goal));
    }
  }
  if (!ordered.length) {
    return ['Potty training', 'Name recognition', 'Crate confidence', 'Calm leash walking'];
  }
  return ordered.slice(0, 5);
}

function buildTodayPlan({ puppyName, ageMonths, focusAreas, energyLevel, breedProfile }) {
  const isYoung = ageMonths <= 4;
  const energyCue =
    energyLevel === 'high'
      ? 'Add a sniff walk or tug break after training so energy stays productive.'
      : energyLevel === 'low'
        ? 'Keep sessions extra short and upbeat.'
        : 'Use play breaks to keep focus high.';
  const breedCue = breedProfile?.enrichment || energyCue;
  const breedReset = breedProfile?.pacing || 'Reset with play between repetitions.';

  return [
    {
      timeOfDay: 'Morning',
      title: 'Potty + calm start',
      duration: isYoung ? '8 minutes' : '10 minutes',
      goal: `Help ${puppyName} start the day with success and lower chaos indoors.`,
      steps: [
        'Go straight outside after waking up.',
        'Reward immediately after potty with praise and a treat.',
        'Practice name recognition and one easy cue indoors.',
      ],
    },
    {
      timeOfDay: 'Midday',
      title: `${focusAreas[0] || 'Foundation skills'} session`,
      duration: '5 minutes',
      goal: `Focus on one main skill without overstaying ${puppyName}'s attention span.`,
      steps: [
        `Practice ${focusAreas[0] || 'sit'} in 3-5 short reps.`,
        breedReset,
        breedCue,
      ],
    },
    {
      timeOfDay: 'Afternoon',
      title: 'Leash and handling practice',
      duration: '10 minutes',
      goal: 'Build comfort with movement, touch, and settling near people.',
      steps: [
        'Reward loose leash steps inside or in the yard first.',
        'Touch paws, ears, and collar gently with treats.',
        'Finish with a calm settle on a mat or bed.',
      ],
    },
    {
      timeOfDay: 'Evening',
      title: 'Wind-down routine',
      duration: '12 minutes',
      goal: 'Prevent zoomies and make bedtime easier.',
      steps: [
        'Use a lick mat, chew, or sniff game.',
        'Do one easy success cue before crate or bedtime.',
        'Keep lights, voices, and activity calm.',
      ],
    },
  ];
}

function buildHabitChecklist(focusAreas) {
  return [
    {
      name: 'Potty consistency',
      priority: 'High',
      why: 'Frequent successful potty trips reduce accidents and confusion.',
      trigger: 'After waking, eating, play, and crate time.',
    },
    {
      name: 'Reward calm moments',
      priority: 'High',
      why: 'Catching calm behavior teaches your puppy what you want more of.',
      trigger: 'Any time your puppy settles on their own.',
    },
    {
      name: `${focusAreas[1] || 'Crate confidence'} reps`,
      priority: 'Medium',
      why: 'Small positive repetitions build independence without stress.',
      trigger: '1-2 times during the day when your puppy is already relaxed.',
    },
    {
      name: 'Bite redirection',
      priority: 'Medium',
      why: 'Redirecting to toys keeps play appropriate and predictable.',
      trigger: 'As soon as teeth touch hands, clothes, or furniture.',
    },
  ];
}

function findSupportingArea(focusAreas, patterns, fallback) {
  const match = focusAreas.find((area) => patterns.some((pattern) => pattern.test(area)));
  return match || fallback;
}

function buildSkillLibrary(focusAreas, breedProfile) {
  const skills = [];
  const rewardStyle = breedProfile?.reward;

  if (focusAreas.some((area) => /potty/i.test(area))) {
    skills.push({
      name: 'Potty routine',
      level: 'Beginner',
      goal: 'House training',
      supports: 'Potty training',
      description: 'Reward fast outdoor potty success and keep the timing routine very predictable.',
      reward: rewardStyle || 'High-value treats right after success',
    });
  }

  skills.push(
    {
      name: 'Sit',
      level: 'Beginner',
      goal: 'Polite focus',
      supports: findSupportingArea(
        focusAreas,
        [/sit/i, /down/i, /stay/i, /focus/i, /leave it/i, /impulse/i],
        'Foundations'
      ),
      description: 'Use a lure over the nose and reward the moment the bottom hits the floor.',
      reward: rewardStyle || 'Soft treats',
    },
    {
      name: 'Name game',
      level: 'Beginner',
      goal: 'Attention',
      supports: findSupportingArea(focusAreas, [/name/i, /recall/i, /\bcome\b/i, /engagement/i], 'Engagement'),
      description: 'Say your puppy name once, mark eye contact, and reward fast.',
      reward: rewardStyle || 'Tiny treats or toy toss',
    },
    {
      name: 'Crate entry',
      level: 'Beginner',
      goal: 'Independence',
      supports: findSupportingArea(focusAreas, [/crate/i, /settle/i, /independence/i], 'Crate confidence'),
      description: 'Toss a treat into the crate and let your puppy choose to go in and out.',
      reward: rewardStyle || 'Treat scatter or chew',
    },
    {
      name: 'Loose leash steps',
      level: 'Beginner',
      goal: 'Walking skills',
      supports: findSupportingArea(focusAreas, [/leash/i, /walk/i, /heel/i], 'Leash walking'),
      description: 'Reward one or two steps next to you before increasing distance.',
      reward: rewardStyle || 'Treats delivered near your leg',
    }
  );

  return skills;
}

function buildProgress(focusAreas, ageMonths) {
  return focusAreas.slice(0, 4).map((area, index) => ({
    area,
    score: Math.max(35, Math.min(82, 40 + index * 12 + ageMonths)),
    note:
      index === 0
        ? 'This is the top priority, so repeat it in tiny reps throughout the day.'
        : 'Stay consistent for several days before making the exercise harder.',
  }));
}

function buildReminders({ puppyName, ageMonths, breedProfile }) {
  const reminders = [
    `${puppyName} is still very young, so keep formal training short and upbeat.`,
    'Use management like baby gates, leashes, pens, and chews to prevent bad rehearsals.',
    ageMonths <= 4
      ? 'Prioritize socialization experiences that feel safe and positive rather than overwhelming.'
      : 'Start adding a little more duration only after your puppy is succeeding easily.',
    'If your puppy seems over-tired, switch from training to rest instead of pushing through.',
  ];

  if (breedProfile?.reminder) {
    reminders.splice(1, 0, breedProfile.reminder);
  }

  return reminders;
}

function buildTrainingSpec({ puppyName, focusAreas, mcpGuidance }) {
  return {
    productGoal: `Create a repeatable training routine for ${puppyName} focused on ${focusAreas
      .slice(0, 3)
      .join(', ')}.`,
    acceptanceCriteria: [
      'The owner can run every formal training block in under 12 minutes.',
      'Each focus area has a clear success definition for the week.',
      'Daily habits reinforce calm behavior and prevent common puppy mistakes.',
      'The plan includes age-appropriate coaching recommendations.',
    ],
    definitionOfDone: [
      `${puppyName} can complete one short training session in each main routine window.`,
      'The owner knows what to practice, what to reward, and when to stop.',
      `The next milestone is clear: ${mcpGuidance.recommendations.nextMilestone}.`,
    ],
  };
}

function buildTrainingPlan({ puppyName, ageMonths, breed, breedSelection, goals, energyLevel }, mcpGuidance) {
  const focusAreas = inferFocusAreas(normalizeGoals(goals));
  const breedProfile = getBreedProfile({ breedSelection, breed });
  const breedSummary = breedProfile?.summary ? ` ${breedProfile.summary}` : '';
  const coachNote = breedProfile?.coachNote
    ? `${breedProfile.coachNote} You do not need to train everything every day. Pick one or two priorities, keep sessions tiny, and let repetition do the heavy lifting.`
    : 'You do not need to train everything every day. Pick one or two priorities, keep sessions tiny, and let repetition do the heavy lifting.';

  return {
    generatedAt: new Date().toISOString(),
    profile: {
      puppyName,
      ageMonths,
      breed: breed || 'Mixed breed puppy',
      energyLevel: sentenceCase(energyLevel),
    },
    summary: `${puppyName} is in a great stage for short, frequent wins. Focus on ${focusAreas
      .slice(0, 3)
      .join(', ')} while protecting naps, potty timing, and calm routines.${breedSummary}`,
    coachNote,
    trainingSpec: buildTrainingSpec({ puppyName, focusAreas, mcpGuidance }),
    mcpGuidance,
    focusAreas,
    todayPlan: buildTodayPlan({ puppyName, ageMonths, focusAreas, energyLevel, breedProfile }),
    habitChecklist: buildHabitChecklist(focusAreas),
    skillLibrary: buildSkillLibrary(focusAreas, breedProfile),
    progress: buildProgress(focusAreas, ageMonths),
    reminders: buildReminders({ puppyName, ageMonths, breedProfile }),
  };
}

module.exports = { buildTrainingPlan };
