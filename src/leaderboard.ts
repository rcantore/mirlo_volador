import { LeaderboardEntry } from './types';

const STORAGE_KEY = 'mirlo_volador_leaderboard';
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addEntry(name: string, email: string, score: number): LeaderboardEntry[] {
  const entries = getLeaderboard();
  entries.push({ name, email, score, date: new Date().toISOString() });
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage might be unavailable
  }
  return trimmed;
}

export function promptScoreEntry(score: number): Promise<{ name: string; email: string } | null> {
  return new Promise((resolve) => {
    const overlay = document.getElementById('score-form')!;
    const scoreDisplay = overlay.querySelector('.score-value') as HTMLElement;
    const formEl = overlay.querySelector('form') as HTMLFormElement;
    const skipBtn = overlay.querySelector('.skip-btn') as HTMLButtonElement;
    const nameInput = overlay.querySelector('input[name="name"]') as HTMLInputElement;

    scoreDisplay.textContent = String(score);
    formEl.reset();
    overlay.classList.remove('hidden');
    nameInput.focus();

    const cleanup = () => {
      overlay.classList.add('hidden');
      formEl.removeEventListener('submit', handleSubmit);
      skipBtn.removeEventListener('click', handleSkip);
    };

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const data = new FormData(formEl);
      cleanup();
      resolve({ name: (data.get('name') as string).trim(), email: (data.get('email') as string).trim() });
    };

    const handleSkip = () => {
      cleanup();
      resolve(null);
    };

    formEl.addEventListener('submit', handleSubmit);
    skipBtn.addEventListener('click', handleSkip);
  });
}
