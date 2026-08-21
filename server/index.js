const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { buildTrainingPlan } = require('./src/trainingEngine');
const { getMcpTrainingGuidance } = require('./src/mcpClient');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/sample', async (_req, res) => {
  try {
    const input = {
      puppyName: 'Maple',
      ageMonths: 4,
      breed: 'Labrador Retriever',
      goals: ['potty training', 'crate confidence', 'sit', 'leash walking', 'bite inhibition'],
      energyLevel: 'high',
    };
    const mcpGuidance = await getMcpTrainingGuidance(input);
    res.json(buildTrainingPlan(input, mcpGuidance));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function normalizeBreedInput(body) {
  const { breedSelection, breed = '' } = body || {};
  if (breedSelection && typeof breedSelection === 'object') {
    if (breedSelection.type === 'library' && breedSelection.label) return String(breedSelection.label).trim();
    if (breedSelection.type === 'manual' && breedSelection.label) return String(breedSelection.label).trim();
  }
  return String(breed).trim();
}

app.post('/api/plan', async (req, res) => {
  const { puppyName = '', ageMonths, goals = '', energyLevel = 'medium', breedSelection = null } = req.body || {};

  if (!String(puppyName).trim()) {
    res.status(400).json({ error: 'Please enter your puppy name.' });
    return;
  }

  try {
    const input = {
      puppyName,
      ageMonths: Number(ageMonths) || 3,
      breed: normalizeBreedInput(req.body),
      breedSelection,
      goals: Array.isArray(goals) ? goals : String(goals).split(','),
      energyLevel,
    };
    const mcpGuidance = await getMcpTrainingGuidance(input);
    const result = buildTrainingPlan(input, mcpGuidance);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`puppy-training-coach server listening on http://localhost:${PORT}`);
});
