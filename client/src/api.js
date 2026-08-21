const BASE = '/api';

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchSamplePlan() {
  const res = await fetch(`${BASE}/sample`);
  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || 'Failed to load sample puppy plan');
  }
  return res.json();
}

export async function generatePlan(input) {
  const res = await fetch(`${BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || 'Failed to build puppy plan');
  }
  return res.json();
}
