const BREED_PROFILES = {
  'french-bulldog': {
    summary: 'Keep the tone calm and upbeat so sessions do not tip into stubborn, over-aroused repetitions.',
    coachNote: 'Frenchies often do better with shorter, higher-value repetitions than with lots of drilling.',
    pacing: 'Aim for several tiny wins instead of one longer push.',
    enrichment: 'Use short sniff games, food puzzles, and low-chaos play to keep the brain engaged.',
    reminder: 'If your French Bulldog starts checking out, make the repetition easier instead of repeating the cue louder.',
    reward: 'Soft, high-value treats',
  },
  'labrador-retriever': {
    summary: 'Use food motivation and easy impulse-control games to turn energy into clean repetitions.',
    coachNote: 'Labradors usually learn quickly when rewards are clear, but they benefit from frequent calm resets.',
    pacing: 'Alternate short skill reps with settle breaks so enthusiasm stays useful.',
    enrichment: 'Mix training with retrieve games, sniff walks, and food puzzles.',
    reminder: 'Reward four paws on the floor often so excitement does not become jumping practice.',
    reward: 'Food rewards delivered quickly',
  },
  'golden-retriever': {
    summary: 'Lean into their social nature while still protecting calm behavior and body control.',
    coachNote: 'Golden Retrievers often stay eager through repetition, but they still need structure around greetings and excitement.',
    pacing: 'Keep sessions cheerful and end before the puppy starts getting wild.',
    enrichment: 'Blend training with retrieval, sniffing, and gentle handling practice.',
    reminder: 'Practice calm greetings early so friendliness stays polite as your puppy grows.',
    reward: 'Praise paired with treats',
  },
  'german-shepherd-dog': {
    summary: 'Build clarity and confidence through precise handling, early socialization, and predictable routines.',
    coachNote: 'German Shepherd Dogs usually thrive on structure, but can become intense if sessions are rushed or confusing.',
    pacing: 'Use clear, short reps with fast reinforcement and plenty of decompression between sets.',
    enrichment: 'Add sniffing, pattern games, and controlled exposure to new environments.',
    reminder: 'Protect confidence by keeping new experiences positive and below your puppy’s stress threshold.',
    reward: 'Structured food or toy rewards',
  },
  poodle: {
    summary: 'Take advantage of fast learning while making sure excitement stays regulated.',
    coachNote: 'Poodles often pick up patterns quickly, so vary easy wins with relaxation work.',
    pacing: 'Stop while your puppy still wants more instead of drilling extra repetitions.',
    enrichment: 'Rotate shaping games, sniff work, and low-key play.',
    reminder: 'If your Poodle gets frantic, reward a quiet reset before continuing.',
    reward: 'Rapid-fire tiny treats',
  },
  dachshund: {
    summary: 'Make the reward worth the effort and keep sessions short so independence does not become disengagement.',
    coachNote: 'Dachshunds often respond best when the exercise feels fun and the payoff is immediate.',
    pacing: 'Use very small bursts with obvious rewards at the end of each success.',
    enrichment: 'Try sniff games, short chase play, and easy confidence-building setups.',
    reminder: 'Avoid long strings of repeats; end after a couple of good responses.',
    reward: 'Very high-value food rewards',
  },
  beagle: {
    summary: 'Compete with the nose by making rewards easy to access and the environment less distracting at first.',
    coachNote: 'Beagles can be wonderfully engaged indoors, then lose focus outdoors if scent wins the contest.',
    pacing: 'Start in low-distraction spaces and build up slowly.',
    enrichment: 'Use nose work, food scatters, and sniff-heavy decompression.',
    reminder: 'If your Beagle loses focus outside, lower the difficulty before asking again.',
    reward: 'Food rewards with plenty of scent breaks',
  },
  rottweiler: {
    summary: 'Prioritize calm structure, handling, and confidence so big-dog habits start off clean.',
    coachNote: 'Rottweilers often respond well to steady, predictable handling instead of frantic energy.',
    pacing: 'Use calm repetitions with deliberate resets between them.',
    enrichment: 'Include handling games, controlled tug, and sniff walks.',
    reminder: 'Rehearse polite leash walking now because strength grows faster than habits.',
    reward: 'Calm praise plus food rewards',
  },
  bulldog: {
    summary: 'Keep training light and rewarding so effort stays high without dragging sessions out.',
    coachNote: 'Bulldogs often do best when expectations stay simple and repetition counts stay low.',
    pacing: 'Favor short, successful reps over duration work.',
    enrichment: 'Use easy food puzzles, sniffing, and low-impact play.',
    reminder: 'If pace slows down, take a break instead of pressing for more reps.',
    reward: 'Easy-to-eat treats',
  },
  'german-shorthaired-pointer': {
    summary: 'Channel big energy into sniffing, movement, and short focus games instead of expecting long stillness.',
    coachNote: 'German Shorthaired Pointers usually need an outlet before precision work looks good.',
    pacing: 'Let movement happen between reps so focus stays available.',
    enrichment: 'Use sniff walks, retrieves, and hunting-style search games.',
    reminder: 'Do not save all movement for after training; use it to support success during training too.',
    reward: 'Treats mixed with movement rewards',
  },
  'pembroke-welsh-corgi': {
    summary: 'Use their enthusiasm for training, but reward calm just as intentionally as performance.',
    coachNote: 'Corgis often love to work, which makes settle skills just as important as active ones.',
    pacing: 'Mix energetic reps with mat work or calm pauses.',
    enrichment: 'Try short shaping games, sniffing, and toy rewards.',
    reminder: 'If your Corgi gets barky or pushy, pause and reward a quieter reset.',
    reward: 'Food or toy rewards',
  },
  'australian-shepherd': {
    summary: 'Give the brain a job while guarding against over-arousal and frantic repetition.',
    coachNote: 'Australian Shepherds often excel with structure, but they still need help learning how to turn off.',
    pacing: 'Keep sets short and pair active work with deliberate settle breaks.',
    enrichment: 'Use pattern games, sniffing, and controlled toy play.',
    reminder: 'Reward disengagement and calm breathing, not just flashy performance.',
    reward: 'Treats paired with toy play',
  },
  'yorkshire-terrier': {
    summary: 'Train with the same consistency you would use for a larger dog, just in smaller physical reps.',
    coachNote: 'Yorkies often stay engaged when sessions feel safe, rewarding, and not physically overwhelming.',
    pacing: 'Keep cues simple and reward early before hesitation shows up.',
    enrichment: 'Use tiny food puzzles, confidence games, and short sniff outings.',
    reminder: 'Do not let small size turn into low standards for manners and calmness.',
    reward: 'Tiny, frequent treats',
  },
  'cavalier-king-charles-spaniel': {
    summary: 'Use gentle handling and a soft tone to build confidence without pressure.',
    coachNote: 'Cavaliers are often very people-oriented, so calm connection can be as reinforcing as the food itself.',
    pacing: 'Use relaxed repetitions and quit while the puppy is still bright and engaged.',
    enrichment: 'Pair easy skill work with gentle play and sniff breaks.',
    reminder: 'If your Cavalier looks uncertain, soften the setup before repeating the skill.',
    reward: 'Treats plus warm verbal praise',
  },
  'doberman-pinscher': {
    summary: 'Favor clarity, socialization, and body awareness so intensity grows into control instead of chaos.',
    coachNote: 'Dobermans often succeed with crisp structure and early confidence-building routines.',
    pacing: 'Use precise reps with quick payoffs and decompression between them.',
    enrichment: 'Blend obedience games with sniffing, handling, and controlled play.',
    reminder: 'Practice neutrality around people and movement early so alertness stays manageable.',
    reward: 'Clear food or toy rewards',
  },
};

function normalizeBreedKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getBreedProfile({ breedSelection, breed }) {
  const candidateKeys = [];
  if (breedSelection && typeof breedSelection === 'object' && breedSelection.id) {
    candidateKeys.push(normalizeBreedKey(breedSelection.id));
  }
  if (breedSelection && typeof breedSelection === 'object' && breedSelection.label) {
    candidateKeys.push(normalizeBreedKey(breedSelection.label));
  }
  if (breed) {
    candidateKeys.push(normalizeBreedKey(breed));
  }

  for (const key of candidateKeys) {
    if (BREED_PROFILES[key]) {
      return BREED_PROFILES[key];
    }
  }

  return null;
}

module.exports = { getBreedProfile };
