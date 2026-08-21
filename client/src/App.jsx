import { useEffect, useMemo, useState } from 'react';
import { fetchSamplePlan, generatePlan } from './api.js';
import { BREEDS } from './data/breeds.js';
import './App.css';

const PROFILE_STORAGE_KEY = 'puppy-training-coach:last-profile';
const PROGRESS_STORAGE_KEY = 'puppy-training-coach:progress-v1';

function Tag({ children, tone = 'default' }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

function Panel({ eyebrow, title, children, actions }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function findBreedByName(name) {
  return BREEDS.find((breed) => breed.name.toLowerCase() === String(name).trim().toLowerCase()) || null;
}

function normalizeStorageKeyPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDateKeyForOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(dateKey) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
}

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function buildPlanProgressKey(plan) {
  if (!plan?.profile) return '';
  return [
    normalizeStorageKeyPart(plan.profile.puppyName),
    normalizeStorageKeyPart(plan.profile.breed),
    normalizeStorageKeyPart(plan.profile.ageMonths),
  ]
    .filter(Boolean)
    .join('__');
}

function uniqueDateList(values) {
  return [...new Set((values || []).filter(Boolean))].sort();
}

function normalizeProgressState(state) {
  const focusAreas = Object.fromEntries(
    Object.entries(state?.focusAreas || {}).map(([area, value]) => [area, { dates: uniqueDateList(value?.dates) }])
  );
  const habits = Object.fromEntries(
    Object.entries(state?.habits || {}).map(([habit, value]) => [habit, { dates: uniqueDateList(value?.dates) }])
  );
  const skills = Object.fromEntries(
    Object.entries(state?.skills || {}).map(([skill, value]) => {
      const sessionsByDate = { ...(value?.sessionsByDate || {}) };
      if (!Object.keys(sessionsByDate).length && value?.lastPracticedOn && value?.count) {
        sessionsByDate[value.lastPracticedOn] = value.count;
      }
      const normalizedSessions = Object.fromEntries(
        Object.entries(sessionsByDate)
          .filter(([dateKey, count]) => dateKey && Number(count) > 0)
          .map(([dateKey, count]) => [dateKey, Number(count)])
      );
      const totalCount =
        Object.values(normalizedSessions).reduce((sum, count) => sum + Number(count || 0), 0) || Number(value?.count) || 0;

      return [
        skill,
        {
          count: totalCount,
          lastPracticedOn: value?.lastPracticedOn || '',
          sessionsByDate: normalizedSessions,
        },
      ];
    })
  );
  const sessions = Object.fromEntries(
    Object.entries(state?.sessions || {}).map(([session, value]) => [session, { dates: uniqueDateList(value?.dates) }])
  );

  return { focusAreas, skills, habits, sessions };
}

function collectActivityDates(progressState) {
  const dates = new Set();

  Object.values(progressState.focusAreas || {}).forEach((entry) => {
    (entry?.dates || []).forEach((dateKey) => dates.add(dateKey));
  });
  Object.values(progressState.habits || {}).forEach((entry) => {
    (entry?.dates || []).forEach((dateKey) => dates.add(dateKey));
  });
  Object.values(progressState.skills || {}).forEach((entry) => {
    Object.keys(entry?.sessionsByDate || {}).forEach((dateKey) => dates.add(dateKey));
  });
  Object.values(progressState.sessions || {}).forEach((entry) => {
    (entry?.dates || []).forEach((dateKey) => dates.add(dateKey));
  });

  return [...dates].sort();
}

function computeCurrentStreak(activeDates) {
  const activeSet = new Set(activeDates);
  let streak = 0;

  for (let offset = 0; ; offset += 1) {
    const dateKey = getDateKeyForOffset(-offset);
    if (!activeSet.has(dateKey)) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function buildRecentHistory(progressState, days = 7) {
  return Array.from({ length: days }, (_value, index) => {
    const dateKey = getDateKeyForOffset(index - (days - 1));
    const focusCount = Object.values(progressState.focusAreas || {}).filter((entry) => (entry?.dates || []).includes(dateKey)).length;
    const habitCount = Object.values(progressState.habits || {}).filter((entry) => (entry?.dates || []).includes(dateKey)).length;
    const skillCount = Object.values(progressState.skills || {}).reduce(
      (sum, entry) => sum + Number(entry?.sessionsByDate?.[dateKey] || 0),
      0
    );
    const sessionCount = Object.values(progressState.sessions || {}).filter((entry) => (entry?.dates || []).includes(dateKey)).length;
    return {
      dateKey,
      label: formatShortDate(dateKey),
      focusCount,
      habitCount,
      skillCount,
      sessionCount,
      totalCount: focusCount + habitCount + skillCount + sessionCount,
    };
  });
}

function matchesProgressArea(label, area) {
  const normalizedLabel = String(label || '').toLowerCase();
  const normalizedArea = String(area || '').toLowerCase();
  if (!normalizedLabel || !normalizedArea) return false;
  if (normalizedLabel.includes(normalizedArea) || normalizedArea.includes(normalizedLabel)) return true;

  const areaTokens = normalizedArea.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
  return areaTokens.some((token) => normalizedLabel.includes(token));
}

function getAreaProgressScore(area, progressState, plan) {
  const focusDays = progressState.focusAreas?.[area]?.dates?.length || 0;
  const skillSessions = plan.skillLibrary.reduce((total, skill) => {
    if (!matchesProgressArea(skill.supports || skill.goal, area)) return total;
    return total + (progressState.skills?.[skill.name]?.count || 0);
  }, 0);
  const habitDays = plan.habitChecklist.reduce((total, habit) => {
    if (!matchesProgressArea(habit.name, area) && !matchesProgressArea(habit.why, area)) return total;
    return total + (progressState.habits?.[habit.name]?.dates?.length || 0);
  }, 0);
  const score = Math.min(100, 18 + focusDays * 20 + skillSessions * 8 + habitDays * 6);

  return {
    score,
    note: `${focusDays} focus day${focusDays === 1 ? '' : 's'}, ${skillSessions} skill rep${
      skillSessions === 1 ? '' : 's'
    }, ${habitDays} habit win${habitDays === 1 ? '' : 's'} logged.`,
    focusDays,
  };
}

function applyProfileDraft(profile, setters) {
  const {
    setPuppyName,
    setAgeMonths,
    setBreedMode,
    setSelectedBreedId,
    setManualBreed,
    setGoals,
    setEnergyLevel,
  } = setters;

  setPuppyName(String(profile.puppyName || ''));
  setAgeMonths(Number(profile.ageMonths) || 4);
  setGoals(String(profile.goals || ''));
  setEnergyLevel(['low', 'medium', 'high'].includes(profile.energyLevel) ? profile.energyLevel : 'medium');

  if (profile.breedMode === 'manual') {
    setBreedMode('manual');
    setManualBreed(String(profile.manualBreed || ''));
    setSelectedBreedId('');
    return;
  }

  const matchedBreed = BREEDS.find((breed) => breed.id === profile.selectedBreedId);
  if (matchedBreed) {
    setBreedMode('library');
    setSelectedBreedId(matchedBreed.id);
    setManualBreed('');
    return;
  }

  setBreedMode('manual');
  setManualBreed(String(profile.manualBreed || ''));
  setSelectedBreedId('');
}

function App() {
  const [puppyName, setPuppyName] = useState('Maple');
  const [ageMonths, setAgeMonths] = useState(4);
  const [breedMode, setBreedMode] = useState('library');
  const [selectedBreedId, setSelectedBreedId] = useState('labrador-retriever');
  const [manualBreed, setManualBreed] = useState('');
  const [goals, setGoals] = useState('potty training, crate confidence, sit, leash walking, bite inhibition');
  const [energyLevel, setEnergyLevel] = useState('high');
  const [activeView, setActiveView] = useState('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [plan, setPlan] = useState(null);
  const [progressState, setProgressState] = useState({ focusAreas: {}, skills: {}, habits: {}, sessions: {} });
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        setHasSavedProfile(true);
        applyProfileDraft(JSON.parse(savedProfile), {
          setPuppyName,
          setAgeMonths,
          setBreedMode,
          setSelectedBreedId,
          setManualBreed,
          setGoals,
          setEnergyLevel,
        });
        setProfileMessage('Loaded your last saved profile.');
      }
    } catch (err) {
      setError('Could not read the saved puppy profile in this browser.');
    }
  }, []);

  const loadSample = async () => {
    setLoading(true);
    setError('');
    setProfileMessage('');
    try {
      const samplePlan = await fetchSamplePlan();
      setPlan(samplePlan);
      const matchedBreed = findBreedByName(samplePlan.profile.breed);
      applyProfileDraft(
        {
          puppyName: samplePlan.profile.puppyName,
          ageMonths: samplePlan.profile.ageMonths,
          energyLevel: samplePlan.profile.energyLevel.toLowerCase(),
          goals: samplePlan.focusAreas.join(', '),
          breedMode: matchedBreed ? 'library' : 'manual',
          selectedBreedId: matchedBreed?.id || '',
          manualBreed: matchedBreed ? '' : samplePlan.profile.breed,
        },
        {
          setPuppyName,
          setAgeMonths,
          setBreedMode,
          setSelectedBreedId,
          setManualBreed,
          setGoals,
          setEnergyLevel,
        }
      );
      setProfileMessage('Loaded the sample puppy profile.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBreed = useMemo(
    () => BREEDS.find((breed) => breed.id === selectedBreedId) || null,
    [selectedBreedId]
  );
  const activeBreedEnrichment =
    plan?.mcpGuidance?.breedEnrichment && plan?.profile?.breed === selectedBreed?.name
      ? plan.mcpGuidance.breedEnrichment
      : null;

  const currentProfile = useMemo(
    () => ({
      puppyName,
      ageMonths: Number(ageMonths) || 4,
      breedMode,
      selectedBreedId,
      manualBreed,
      goals,
      energyLevel,
    }),
    [puppyName, ageMonths, breedMode, selectedBreedId, manualBreed, goals, energyLevel]
  );

  const saveProfile = () => {
    setError('');
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
      setHasSavedProfile(true);
      setProfileMessage('Saved this puppy profile on this browser.');
    } catch (err) {
      setError('Could not save the puppy profile in this browser.');
    }
  };

  const loadSavedProfile = () => {
    setError('');
    try {
      const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!savedProfile) {
        setHasSavedProfile(false);
        setProfileMessage('');
        setError('No saved puppy profile was found yet.');
        return;
      }
      setHasSavedProfile(true);
      applyProfileDraft(JSON.parse(savedProfile), {
        setPuppyName,
        setAgeMonths,
        setBreedMode,
        setSelectedBreedId,
        setManualBreed,
        setGoals,
        setEnergyLevel,
      });
      setProfileMessage('Loaded your saved puppy profile.');
    } catch (err) {
      setError('Could not load the saved puppy profile in this browser.');
    }
  };

  const returnToBuilder = () => {
    setPlan(null);
    setActiveView('today');
    setError('');
    setProfileMessage('Profile ready to edit. Build a new plan when you are ready.');
  };

  const onBuildPlan = async () => {
    if (breedMode === 'library' && !selectedBreed) {
      setError('Please pick a breed from the library, or switch to mixed / custom.');
      return;
    }
    if (breedMode === 'manual' && !manualBreed.trim()) {
      setError('Please enter your puppy breed or mix.');
      return;
    }

    setLoading(true);
    setError('');
    setProfileMessage('');
    try {
      const breedSelection =
        breedMode === 'library' && selectedBreed
          ? { type: 'library', id: selectedBreed.id, label: selectedBreed.name }
          : { type: 'manual', label: manualBreed.trim() };
      setPlan(
        await generatePlan({
          puppyName,
          ageMonths,
          breed: breedSelection.label,
          breedSelection,
          goals,
          energyLevel,
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!plan) return null;
    return {
      goals: plan.focusAreas.length,
      sessions: plan.todayPlan.length,
      habits: plan.habitChecklist.length,
      skills: plan.skillLibrary.length,
    };
  }, [plan]);

  const planProgressKey = useMemo(() => buildPlanProgressKey(plan), [plan]);

  useEffect(() => {
    if (!planProgressKey) {
      setProgressState({ focusAreas: {}, skills: {}, habits: {}, sessions: {} });
      setProgressReady(false);
      return;
    }

    const progressMap = readJsonStorage(PROGRESS_STORAGE_KEY, {});
    setProgressState(
      normalizeProgressState(progressMap[planProgressKey] || { focusAreas: {}, skills: {}, habits: {}, sessions: {} })
    );
    setProgressReady(true);
  }, [planProgressKey]);

  useEffect(() => {
    if (!planProgressKey || !progressReady) return;
    const progressMap = readJsonStorage(PROGRESS_STORAGE_KEY, {});
    progressMap[planProgressKey] = normalizeProgressState(progressState);
    writeJsonStorage(PROGRESS_STORAGE_KEY, progressMap);
  }, [planProgressKey, progressReady, progressState]);

  const toggleFocusDay = (area) => {
    const today = getTodayKey();
    setProgressState((current) => {
      const dates = current.focusAreas?.[area]?.dates || [];
      const nextDates = dates.includes(today) ? dates.filter((date) => date !== today) : [...dates, today];
      return {
        ...current,
        focusAreas: {
          ...current.focusAreas,
          [area]: { dates: nextDates },
        },
      };
    });
  };

  const incrementSkillPractice = (skillName) => {
    const today = getTodayKey();
    setProgressState((current) => {
      const existing = current.skills?.[skillName] || { count: 0, lastPracticedOn: '', sessionsByDate: {} };
      const todayCount = Number(existing.sessionsByDate?.[today] || 0) + 1;
      return {
        ...current,
        skills: {
          ...current.skills,
          [skillName]: {
            count: existing.count + 1,
            lastPracticedOn: today,
            sessionsByDate: {
              ...(existing.sessionsByDate || {}),
              [today]: todayCount,
            },
          },
        },
      };
    });
  };

  const toggleHabitDone = (habitName) => {
    const today = getTodayKey();
    setProgressState((current) => {
      const dates = current.habits?.[habitName]?.dates || [];
      const nextDates = dates.includes(today) ? dates.filter((date) => date !== today) : [...dates, today];
      return {
        ...current,
        habits: {
          ...current.habits,
          [habitName]: { dates: nextDates },
        },
      };

      const toggleSessionComplete = (sessionTitle) => {
        const today = getTodayKey();
        setProgressState((current) => {
          const dates = current.sessions?.[sessionTitle]?.dates || [];
          const nextDates = dates.includes(today) ? dates.filter((date) => date !== today) : [...dates, today];
          return {
            ...current,
            sessions: {
              ...current.sessions,
              [sessionTitle]: { dates: nextDates },
            },
          };
        });
      };
    });
  };

  const recentHistory = useMemo(() => buildRecentHistory(progressState), [progressState]);
  const activeDates = useMemo(() => collectActivityDates(progressState), [progressState]);
  const currentStreak = useMemo(() => computeCurrentStreak(activeDates), [activeDates]);
  const bestStreak = useMemo(() => {
    if (!activeDates.length) return 0;
    let best = 0;
    let current = 0;
    let previousDate = '';
    for (const dateKey of activeDates) {
      if (!previousDate) {
        current = 1;
      } else {
        const previous = new Date(`${previousDate}T12:00:00`);
        previous.setDate(previous.getDate() + 1);
        current = previous.toISOString().slice(0, 10) === dateKey ? current + 1 : 1;
      }
      best = Math.max(best, current);
      previousDate = dateKey;
    }
    return best;
  }, [activeDates]);
  const activeDaysThisWeek = useMemo(
    () => recentHistory.filter((day) => day.totalCount > 0).length,
    [recentHistory]
  );
  const totalSkillLogs = useMemo(
    () => Object.values(progressState.skills || {}).reduce((sum, entry) => sum + Number(entry?.count || 0), 0),
    [progressState]
  );
  const completedSessionsToday = useMemo(
    () =>
      plan
        ? plan.todayPlan.filter((session) => (progressState.sessions?.[session.title]?.dates || []).includes(getTodayKey())).length
        : 0,
    [plan, progressState]
  );

  const renderBreedCard = (breed, enrichment) => {
    if (!breed) {
      return <p className="field__hint">Choose a breed from the dropdown, or switch to mixed / custom.</p>;
    }

    return (
      <div className="breed-card">
        <div className="breed-card__header">
          <h3>{breed.name}</h3>
          <Tag tone="soft">{breed.group}</Tag>
        </div>
        <div className="tag-row">
          <Tag tone="accent">Size: {breed.size}</Tag>
          <Tag tone="soft">Energy: {breed.energy}</Tag>
          <Tag tone="soft">Trainability: {breed.trainability}</Tag>
        </div>
        <p>{breed.note}</p>
        <div className="breed-details">
          <div className="breed-detail">
            <strong>Best fit</strong>
            <span>{breed.bestFor}</span>
          </div>
          <div className="breed-detail">
            <strong>Best reward</strong>
            <span>{breed.rewardStyle}</span>
          </div>
          <div className="breed-detail">
            <strong>Watch for</strong>
            <span>{breed.watchFor}</span>
          </div>
          <div className="breed-detail">
            <strong>Care level</strong>
            <span>
              {breed.grooming} · {breed.firstTimeFit}
            </span>
          </div>
        </div>
        {enrichment ? (
          <div className="breed-enrichment">
            <h4>Deeper breed notes</h4>
            <p>{enrichment.temperament}</p>
            <div className="breed-details">
              <div className="breed-detail">
                <strong>Great activities</strong>
                <span>{enrichment.idealActivities.join(', ')}</span>
              </div>
              <div className="breed-detail">
                <strong>Care notes</strong>
                <span>{enrichment.careNotes}</span>
              </div>
              <div className="breed-detail breed-detail--wide">
                <strong>Good starter tip</strong>
                <span>{enrichment.firstTimeOwnerTip}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const profileFormPanel = (
    <Panel eyebrow="Puppy profile" title="Create today's training plan">
      <label className="field">
        <span>Puppy name</span>
        <input value={puppyName} onChange={(event) => setPuppyName(event.target.value)} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Age (months)</span>
          <input type="number" min="2" max="24" value={ageMonths} onChange={(event) => setAgeMonths(event.target.value)} />
        </label>
        <label className="field">
          <span>Energy level</span>
          <select value={energyLevel} onChange={(event) => setEnergyLevel(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Breed or mix</span>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-chip${breedMode === 'library' ? ' toggle-chip--active' : ''}`}
            onClick={() => setBreedMode('library')}
          >
            Breed library
          </button>
          <button
            type="button"
            className={`toggle-chip${breedMode === 'manual' ? ' toggle-chip--active' : ''}`}
            onClick={() => setBreedMode('manual')}
          >
            Mixed / custom
          </button>
        </div>
        {breedMode === 'library' ? (
          <div className="breed-picker">
            <select value={selectedBreedId} onChange={(event) => setSelectedBreedId(event.target.value)}>
              <option value="">Select a breed</option>
              {BREEDS.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
            {renderBreedCard(selectedBreed, activeBreedEnrichment)}
          </div>
        ) : (
          <>
            <input value={manualBreed} placeholder="e.g. Shepherd mix" onChange={(event) => setManualBreed(event.target.value)} />
            <p className="field__hint">Use this if your puppy is mixed breed, unknown, or not in the library.</p>
          </>
        )}
      </label>
      <label className="field">
        <span>Training goals</span>
        <textarea rows={4} value={goals} onChange={(event) => setGoals(event.target.value)} />
      </label>

      <div className="actions">
        <button className="button button--primary" disabled={loading} onClick={onBuildPlan}>
          {loading ? 'Building…' : 'Build plan'}
        </button>
        <button className="button" type="button" disabled={loading} onClick={saveProfile}>
          Save profile
        </button>
        <button className="button" type="button" disabled={loading || !hasSavedProfile} onClick={loadSavedProfile}>
          Load saved
        </button>
        <button className="button" disabled={loading} onClick={loadSample}>
          Load sample
        </button>
      </div>

      {profileMessage ? <p className="status-message">{profileMessage}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </Panel>
  );

  return (
    <div className={`app${plan ? '' : ' app--builder'}`}>
      {plan ? (
        <aside className="sidebar">
          <div className="hero">
            <div className="hero__icon">🐶</div>
            <div>
              <p className="eyebrow">Daily puppy routine</p>
              <h1>Puppy Training Coach</h1>
              <p className="hero__text">
                Build a calmer daily routine, track the basics, and know exactly what to train next with your puppy.
              </p>
            </div>
          </div>

          <Panel
            eyebrow="Puppy profile"
            title={`${plan.profile.puppyName}'s setup`}
            actions={
              <button className="button button--small" type="button" onClick={returnToBuilder}>
                Edit profile
              </button>
            }
          >
            <div className="tag-row">
              <Tag tone="accent">{plan.profile.ageMonths} months</Tag>
              <Tag tone="soft">{plan.profile.energyLevel}</Tag>
            </div>
            <p className="panel__intro">
              {plan.profile.breed} · {plan.focusAreas.length} focus areas · {plan.todayPlan.length} routine sessions
            </p>
            {renderBreedCard(findBreedByName(plan.profile.breed), plan.mcpGuidance?.breedEnrichment || null)}
          </Panel>

          <Panel eyebrow="Daily philosophy" title="Keep it simple">
            <ul className="list">
              <li>Short sessions beat long sessions.</li>
              <li>Reward calm behavior before your puppy gets wild.</li>
              <li>Rotate between skill work, play, rest, and potty breaks.</li>
              <li>End each session on a success, even a tiny one.</li>
            </ul>
          </Panel>
        </aside>
      ) : null}

      <main className={`workspace${plan ? '' : ' workspace--builder'}`}>
        {!plan ? (
          <div className="builder-shell">
            <section className="builder-hero">
              <div className="hero__icon">🐶</div>
              <p className="eyebrow">Daily puppy routine</p>
              <h1>Puppy Training Coach</h1>
              <p className="workspace__intro">
                Start with your puppy profile in the center, choose the breed that feels closest, and then generate a separate
                plan view with routines, skills, reminders, and progress.
              </p>
            </section>

            <div className="builder-grid">
              {profileFormPanel}
              <div className="stack">
                <Panel eyebrow="What you will get" title="A calmer day with clearer next steps">
                  <div className="history-summary history-summary--builder">
                    <article className="history-card">
                      <strong>Routine</strong>
                      <span>Short daily sessions your puppy can actually succeed with</span>
                    </article>
                    <article className="history-card">
                      <strong>Guidance</strong>
                      <span>Breed-aware coaching plus deeper notes after the plan is generated</span>
                    </article>
                    <article className="history-card">
                      <strong>Progress</strong>
                      <span>Track habits, skills, streaks, and completed routine blocks</span>
                    </article>
                  </div>
                </Panel>

                <Panel eyebrow="Daily philosophy" title="Keep it simple">
                  <ul className="list">
                    <li>Short sessions beat long sessions.</li>
                    <li>Reward calm behavior before your puppy gets wild.</li>
                    <li>Rotate between skill work, play, rest, and potty breaks.</li>
                    <li>End each session on a success, even a tiny one.</li>
                  </ul>
                </Panel>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="workspace__header">
              <div>
                <p className="eyebrow">Today's snapshot</p>
                <h2>{`${plan.profile.puppyName}'s routine`}</h2>
                <p className="workspace__intro">{plan.summary}</p>
              </div>
              {stats ? (
                <div className="metrics">
                  <div className="metric">
                    <strong>{stats.goals}</strong>
                    <span>priorities</span>
                  </div>
                  <div className="metric">
                    <strong>{stats.sessions}</strong>
                    <span>today's sessions</span>
                  </div>
                  <div className="metric">
                    <strong>{stats.habits}</strong>
                    <span>daily habits</span>
                  </div>
                  <div className="metric">
                    <strong>{stats.skills}</strong>
                    <span>skills to practice</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="view-tabs">
              <button
                className={`view-tab${activeView === 'today' ? ' view-tab--active' : ''}`}
                onClick={() => setActiveView('today')}
              >
                Today
              </button>
              <button
                className={`view-tab${activeView === 'plan' ? ' view-tab--active' : ''}`}
                onClick={() => setActiveView('plan')}
              >
                Weekly plan
              </button>
              <button
                className={`view-tab${activeView === 'skills' ? ' view-tab--active' : ''}`}
                onClick={() => setActiveView('skills')}
              >
                Skills & progress
              </button>
            </div>

            {activeView === 'today' ? (
              <div className="stack">
                <Panel eyebrow="Focus areas" title="What to prioritize this week">
                  <div className="tag-row">
                    {plan.focusAreas.map((goal) => (
                      <Tag key={goal} tone="accent">
                        {goal}
                      </Tag>
                    ))}
                  </div>
                  <div className="coach-note">
                    <h3>Coach note</h3>
                    <p>{plan.coachNote}</p>
                  </div>
                </Panel>

                <Panel eyebrow="Coach guidance" title="Advice tailored to your puppy profile">
                  <div className="split">
                    <div className="mcp-box">
                      <h3>Training emphasis</h3>
                      <p>{plan.mcpGuidance.recommendations.emphasis}</p>
                    </div>
                    <div className="mini-card">
                      <h3>Why this matters</h3>
                      <p>{plan.mcpGuidance.recommendations.demoNote}</p>
                    </div>
                  </div>
                  <div className="split">
                    <div className="mini-card">
                      <h3>Pacing</h3>
                      <p>{plan.mcpGuidance.recommendations.pacing}</p>
                    </div>
                    <div className="mini-card">
                      <h3>Enrichment</h3>
                      <p>{plan.mcpGuidance.recommendations.enrichment}</p>
                    </div>
                  </div>
                </Panel>

                <Panel eyebrow="Today's routine" title="Short sessions, lots of wins">
                  <p className="panel__intro">
                    {completedSessionsToday} of {plan.todayPlan.length} routine sessions completed today.
                  </p>
                  <div className="session-list">
                    {plan.todayPlan.map((session) => (
                      <article
                        key={session.title}
                        className={`session-card${
                          (progressState.sessions?.[session.title]?.dates || []).includes(getTodayKey()) ? ' session-card--done' : ''
                        }`}
                      >
                        <div className="session-card__top">
                          <div>
                            <p className="session-card__time">{session.timeOfDay}</p>
                            <h3>{session.title}</h3>
                          </div>
                          <div className="tracking-actions">
                            <Tag tone="soft">{session.duration}</Tag>
                            <button
                              type="button"
                              className={`button button--small ${
                                (progressState.sessions?.[session.title]?.dates || []).includes(getTodayKey())
                                  ? 'button--success'
                                  : 'button--ghost'
                              }`}
                              aria-pressed={(progressState.sessions?.[session.title]?.dates || []).includes(getTodayKey())}
                              onClick={() => toggleSessionComplete(session.title)}
                            >
                              {(progressState.sessions?.[session.title]?.dates || []).includes(getTodayKey())
                                ? 'Completed today'
                                : 'Mark complete'}
                            </button>
                          </div>
                        </div>
                        <p>{session.goal}</p>
                        <ul className="list">
                          {session.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </Panel>
              </div>
            ) : null}

            {activeView === 'plan' ? (
              <div className="stack">
                <Panel eyebrow="Success plan" title="Goal, weekly checks, and success markers">
                  <div className="coach-note">
                    <h3>Goal</h3>
                    <p>{plan.trainingSpec.productGoal}</p>
                  </div>
                  <div className="split">
                    <div>
                      <h3>Weekly checks</h3>
                      <ul className="list">
                        {plan.trainingSpec.acceptanceCriteria.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>Success markers</h3>
                      <ul className="list">
                        {plan.trainingSpec.definitionOfDone.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Panel>

                <Panel eyebrow="Habit checklist" title="Repeat these every day">
                  <div className="habit-list">
                    {plan.habitChecklist.map((habit) => (
                      <article key={habit.name} className="habit-card">
                        <div className="habit-card__row">
                          <div>
                            <h3>{habit.name}</h3>
                            <p className="tracking-caption">
                              {progressState.habits?.[habit.name]?.dates?.length || 0} day
                              {(progressState.habits?.[habit.name]?.dates?.length || 0) === 1 ? '' : 's'} logged
                            </p>
                          </div>
                          <div className="tracking-actions">
                            <Tag tone={habit.priority === 'High' ? 'warm' : habit.priority === 'Medium' ? 'accent' : 'soft'}>
                              {habit.priority}
                            </Tag>
                            <button className="button button--small" type="button" onClick={() => toggleHabitDone(habit.name)}>
                              {(progressState.habits?.[habit.name]?.dates || []).includes(getTodayKey())
                                ? 'Undo today'
                                : 'Done today'}
                            </button>
                          </div>
                        </div>
                        <p>{habit.why}</p>
                        <small>{habit.trigger}</small>
                      </article>
                    ))}
                  </div>
                </Panel>

                <Panel eyebrow="Owner reminders" title="What to remember today">
                  <ul className="list">
                    {plan.reminders.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Panel>
              </div>
            ) : null}

            {activeView === 'skills' ? (
              <div className="stack">
                <Panel eyebrow="Skill library" title="What to teach next">
                  <div className="skill-list">
                    {plan.skillLibrary.map((skill) => (
                      <article key={skill.name} className="skill-card">
                        <div className="skill-card__header">
                          <div>
                            <h3>{skill.name}</h3>
                            <p className="tracking-caption">
                              {progressState.skills?.[skill.name]?.count || 0} practice rep
                              {(progressState.skills?.[skill.name]?.count || 0) === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="tracking-actions">
                            <Tag tone="soft">{skill.level}</Tag>
                            <button className="button button--small" type="button" onClick={() => incrementSkillPractice(skill.name)}>
                              Log practice
                            </button>
                          </div>
                        </div>
                        <p>{skill.description}</p>
                        <div className="tag-row">
                          <Tag tone="accent">Builds: {skill.goal}</Tag>
                          <Tag tone="soft">Reward: {skill.reward}</Tag>
                        </div>
                        {skill.supports ? <p className="skill-card__support">Best for: {skill.supports}</p> : null}
                      </article>
                    ))}
                  </div>
                </Panel>

                <Panel eyebrow="Progress tracker" title="This week's focus areas">
                  <p className="panel__intro">
                    These bars now use your logged focus days, skill practice, and habit check-ins for this puppy profile in this browser.
                  </p>
                  <div className="progress-grid">
                    {plan.progress.map((item) => {
                      const areaProgress = getAreaProgressScore(item.area, progressState, plan);
                      const isDoneToday = (progressState.focusAreas?.[item.area]?.dates || []).includes(getTodayKey());

                      return (
                        <article key={item.area} className="progress-card">
                        <div className="progress-card__header">
                          <div>
                            <h3>{item.area}</h3>
                            <p className="tracking-caption">
                              {areaProgress.focusDays} focused day{areaProgress.focusDays === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="tracking-actions">
                            <strong>{areaProgress.score}% ready</strong>
                            <button className="button button--small" type="button" onClick={() => toggleFocusDay(item.area)}>
                              {isDoneToday ? 'Undo today' : 'Worked on this today'}
                            </button>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <span style={{ width: `${areaProgress.score}%` }} />
                        </div>
                        <p>{areaProgress.note}</p>
                      </article>
                      );
                    })}
                  </div>
                </Panel>

                <Panel eyebrow="History & streaks" title="How consistent this week has been">
                  <div className="history-summary">
                    <article className="history-card">
                      <strong>{currentStreak}</strong>
                      <span>day current streak</span>
                    </article>
                    <article className="history-card">
                      <strong>{bestStreak}</strong>
                      <span>day best streak</span>
                    </article>
                    <article className="history-card">
                      <strong>{activeDaysThisWeek}</strong>
                      <span>active days this week</span>
                    </article>
                    <article className="history-card">
                      <strong>{totalSkillLogs}</strong>
                      <span>skill reps logged</span>
                    </article>
                  </div>
                  <div className="history-list">
                    {recentHistory.map((day) => (
                      <article key={day.dateKey} className="history-row">
                        <div>
                          <h3>{day.label}</h3>
                          <p className="tracking-caption">{day.dateKey}</p>
                        </div>
                        <div className="history-row__stats">
                          <span>{day.focusCount} focus</span>
                          <span>{day.sessionCount} sessions</span>
                          <span>{day.skillCount} skills</span>
                          <span>{day.habitCount} habits</span>
                        </div>
                        <div className="history-row__bar">
                          <span style={{ width: `${Math.min(100, day.totalCount * 18)}%` }} />
                        </div>
                      </article>
                    ))}
                  </div>
                </Panel>

                <Panel eyebrow="Routine principles" title="A few rules to keep sessions productive">
                  <ul className="list">
                    {plan.mcpGuidance.principles.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Panel>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
