import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const BREED_ENRICHMENT = {
  'french-bulldog': {
    temperament: 'Affectionate, funny, and usually happiest when close to people.',
    idealActivities: ['short sniff walks', 'easy food puzzles', 'brief focus reps'],
    careNotes: 'Keep exertion and heat in mind, and favor shorter sessions over longer pushes.',
    firstTimeOwnerTip: 'Reward calm before excitement spikes so manners stay easy to manage.',
  },
  'labrador-retriever': {
    temperament: 'Friendly, enthusiastic, and typically very reward-driven.',
    idealActivities: ['retrieve games', 'food-based training', 'settle breaks between reps'],
    careNotes: 'Impulse-control games help turn enthusiasm into cleaner skills.',
    firstTimeOwnerTip: 'Reinforce four paws on the floor early because labs often greet with their whole body.',
  },
  'golden-retriever': {
    temperament: 'Social, gentle, and eager to stay engaged with people.',
    idealActivities: ['cooperative handling', 'retrieving', 'calm greeting practice'],
    careNotes: 'Mix cheerful repetitions with calm body-control work so excitement stays polite.',
    firstTimeOwnerTip: 'Do not wait to train greetings just because the puppy is friendly.',
  },
  'german-shepherd-dog': {
    temperament: 'Bright, observant, and often very tuned in to their environment.',
    idealActivities: ['pattern games', 'confidence-building outings', 'structured obedience'],
    careNotes: 'Protect confidence by introducing novelty in a controlled, positive way.',
    firstTimeOwnerTip: 'Clarity matters more than repetition count with this breed.',
  },
  poodle: {
    temperament: 'Quick-learning, sensitive, and mentally engaged by pattern-based training.',
    idealActivities: ['shaping games', 'sniff work', 'settle and reset practice'],
    careNotes: 'Mental fatigue can show up before physical fatigue, so stop on a win.',
    firstTimeOwnerTip: 'Alternate smart games with calmness training so the puppy does not stay too switched on.',
  },
  dachshund: {
    temperament: 'Bold, curious, and often more independent than they look.',
    idealActivities: ['short food games', 'confidence reps', 'simple recall indoors'],
    careNotes: 'Training gets better when the reward feels worth the effort.',
    firstTimeOwnerTip: 'Keep repetitions short so independence does not turn into disengagement.',
  },
  beagle: {
    temperament: 'Happy, nose-led, and highly influenced by environmental scent.',
    idealActivities: ['food scatters', 'nose work', 'low-distraction focus games'],
    careNotes: 'Outdoor focus usually improves when scenting is treated as a feature, not a problem.',
    firstTimeOwnerTip: 'Start new cues indoors before expecting reliability outside.',
  },
  rottweiler: {
    temperament: 'Steady, powerful, and often responsive to calm, consistent handling.',
    idealActivities: ['handling games', 'loose leash work', 'settle routines'],
    careNotes: 'Strength grows quickly, so polite movement habits matter early.',
    firstTimeOwnerTip: 'Reward calm defaults often so intensity does not become the puppy’s main strategy.',
  },
  bulldog: {
    temperament: 'Laid-back, determined, and best engaged with easy wins.',
    idealActivities: ['tiny food reps', 'short routine drills', 'relaxed enrichment'],
    careNotes: 'Lower-energy puppies still benefit from consistency, just not long drills.',
    firstTimeOwnerTip: 'If attention drops, shorten the session instead of repeating the cue more.',
  },
  'german-shorthaired-pointer': {
    temperament: 'Energetic, athletic, and usually most successful when movement is part of the plan.',
    idealActivities: ['search games', 'retrieve games', 'movement breaks between reps'],
    careNotes: 'Expect better focus after outlets for sniffing and movement.',
    firstTimeOwnerTip: 'Use activity to support training, not only as a reward after training.',
  },
  'pembroke-welsh-corgi': {
    temperament: 'Bright, opinionated, and often eager to work.',
    idealActivities: ['pattern games', 'toy rewards', 'mat work for settling'],
    careNotes: 'Corgis often love action, so calmness needs deliberate reinforcement too.',
    firstTimeOwnerTip: 'Do not overlook barking and pushiness just because the puppy is cute and small.',
  },
  'australian-shepherd': {
    temperament: 'Driven, sharp, and often ready to work before they are ready to relax.',
    idealActivities: ['structured training sets', 'toy play', 'decompression sniffing'],
    careNotes: 'Teach off-switch skills as intentionally as active skills.',
    firstTimeOwnerTip: 'Reward disengagement and recovery, not just flashy performance.',
  },
  'yorkshire-terrier': {
    temperament: 'Alert, bold, and often more capable than people expect.',
    idealActivities: ['confidence-building reps', 'tiny reward training', 'brief outings'],
    careNotes: 'Small dogs still need clear expectations and routine practice.',
    firstTimeOwnerTip: 'Avoid accidentally reinforcing barking or clinginess because the puppy is tiny.',
  },
  'cavalier-king-charles-spaniel': {
    temperament: 'Soft, social, and often very people-focused.',
    idealActivities: ['gentle handling', 'relationship games', 'easy pattern reps'],
    careNotes: 'Sensitive puppies often learn faster when the emotional tone stays calm.',
    firstTimeOwnerTip: 'Soften the setup if the puppy looks uncertain instead of pushing through repetitions.',
  },
  'doberman-pinscher': {
    temperament: 'Intense, intelligent, and responsive to crisp structure.',
    idealActivities: ['body-awareness work', 'structured obedience', 'controlled play'],
    careNotes: 'Early socialization and neutrality work help channel alertness productively.',
    firstTimeOwnerTip: 'Build control and confidence together so energy does not become chaos.',
  },
};

function normalizeBreedKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const server = new McpServer({
  name: 'puppy-training-advisor',
  version: '1.0.0',
});

server.registerTool(
  'recommend-training-adjustments',
  {
    description: 'Suggest training emphasis, pacing, and coach cues for a puppy profile.',
    inputSchema: z.object({
      puppyName: z.string(),
      ageMonths: z.number(),
      breed: z.string(),
      goals: z.array(z.string()),
      energyLevel: z.string(),
    }),
  },
  async ({ puppyName, ageMonths, breed, goals, energyLevel }) => {
    const normalizedGoals = goals.map((goal) => goal.toLowerCase());
    const emphasis = normalizedGoals.includes('potty training')
      ? 'Build potty timing around wake-up, meals, play, and crate transitions.'
      : 'Pick one foundation skill and one life-skill habit to repeat daily.';
    const pacing =
      ageMonths <= 4
        ? 'Keep sessions to 3-5 minutes and prioritize management and naps.'
        : 'Use slightly longer sessions only when focus stays high and frustration stays low.';
    const enrichment =
      energyLevel === 'high'
        ? 'Add sniff-heavy decompression and short tug play after training.'
        : 'Use calm food puzzles and low-pressure repetition to reinforce success.';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            puppyName,
            breed: breed || 'mixed breed puppy',
            emphasis,
            pacing,
            enrichment,
            nextMilestone: normalizedGoals[0] || 'name recognition',
            demoNote:
              'These recommendations adjust to your puppy age, goals, and energy level so you can keep sessions realistic and repeatable.',
          }),
        },
      ],
    };
  }
);

server.registerTool(
  'get-breed-enrichment',
  {
    description: 'Return deeper temperament, activity, and care notes for a known breed.',
    inputSchema: z.object({
      breed: z.string(),
      breedId: z.string().optional(),
    }),
  },
  async ({ breed, breedId }) => {
    const keys = [breedId, breed].map((value) => normalizeBreedKey(value)).filter(Boolean);
    const matchKey = keys.find((key) => BREED_ENRICHMENT[key]);
    const enrichment = matchKey ? BREED_ENRICHMENT[matchKey] : null;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            breed: breed || 'Mixed breed puppy',
            found: Boolean(enrichment),
            enrichment,
          }),
        },
      ],
    };
  }
);

server.registerResource(
  'daily-routine-principles',
  'puppy://daily-routine-principles',
  {
    title: 'Daily routine principles',
    mimeType: 'text/plain',
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: [
          'Train in tiny bursts before your puppy is overexcited.',
          'Use management to prevent mistakes you do not want repeated.',
          'Pair every challenging skill with a simple win immediately after.',
          'Sleep, potty timing, and calm repetitions matter as much as cue training.',
        ].join('\n'),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
