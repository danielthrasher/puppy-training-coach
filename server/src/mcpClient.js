const path = require('path');

async function getMcpTrainingGuidance({ puppyName, ageMonths, breed, breedSelection, goals, energyLevel }) {
  const [{ Client }, { StdioClientTransport }] = await Promise.all([
    import('@modelcontextprotocol/client'),
    import('@modelcontextprotocol/client/stdio'),
  ]);

  const client = new Client({
    name: 'puppy-training-coach',
    version: '1.0.0',
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(__dirname, 'trainingAdvisorServer.mjs')],
  });

  try {
    await client.connect(transport);

    const [toolResult, breedEnrichmentResult, resourceResult] = await Promise.all([
      client.callTool({
        name: 'recommend-training-adjustments',
        arguments: {
          puppyName,
          ageMonths,
          breed,
          goals,
          energyLevel,
        },
      }),
      client.callTool({
        name: 'get-breed-enrichment',
        arguments: {
          breed,
          breedId: breedSelection?.id,
        },
      }),
      client.readResource({
        uri: 'puppy://daily-routine-principles',
      }),
    ]);

    const toolText = toolResult.content.find((item) => item.type === 'text')?.text || '{}';
    const breedEnrichmentText = breedEnrichmentResult.content.find((item) => item.type === 'text')?.text || '{}';
    const principlesText = resourceResult.contents.find((item) => 'text' in item)?.text || '';
    const parsedBreedEnrichment = JSON.parse(breedEnrichmentText);

    return {
      recommendations: JSON.parse(toolText),
      breedEnrichment: parsedBreedEnrichment.found ? parsedBreedEnrichment.enrichment : null,
      principles: principlesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };
  } finally {
    await client.close();
  }
}

module.exports = { getMcpTrainingGuidance };
