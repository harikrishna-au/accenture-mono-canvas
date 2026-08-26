// Every cognitive game and communication round records its outcome here, so the
// cards on the dashboard can show what has already been played. Before this,
// results existed only in component state and were discarded on unmount.
//
// Results are keyed by the route path of the activity (e.g. "/game/matrix"),
// which is the same value the dashboard cards navigate to — so a card can look
// up its own result without a separate mapping table.

export type ActivityResult = {
  attempts: number;
  /** True once the activity has been played through to its natural end. */
  completed: boolean;
  /** Unit for scores that have no denominator, e.g. "pts", "digit span". */
  label: string;
  lastScore: number | null;
  lastTotal: number | null;
  bestScore: number | null;
  bestTotal: number | null;
  lastPlayedAt: string;
};

export type ActivityResults = Record<string, ActivityResult>;

export type ActivityResultInput = {
  /** Higher is always better. Omit when the activity has no meaningful score. */
  score?: number | null;
  /** Denominator, when one exists — enables a percentage. */
  total?: number | null;
  label?: string;
  completed?: boolean;
};

const STORE_PREFIX = "hb_activity_results_v1";
const ANON_KEY = `${STORE_PREFIX}::anon`;

const storeKey = (userId?: string | null) =>
  userId ? `${STORE_PREFIX}::${userId}` : ANON_KEY;

// The three original games write their own keys and CompletionPopup still reads
// them, so those writes stay. Their score units differ from what is recorded now
// (seconds remaining vs levels won), so a migrated entry only carries "played"
// and leaves the score blank rather than mixing two scales into one best-score.
const LEGACY_COMPLETIONS = [
  { id: "/game/matrix", doneKey: "completed_matrix" },
  { id: "/game/balloon", doneKey: "completed_balloon" },
  { id: "/game/hidden-maze", doneKey: "completed_maze" },
];

function read(key: string): ActivityResults {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as ActivityResults) : {};
  } catch {
    return {};
  }
}

function write(key: string, results: ActivityResults) {
  try {
    localStorage.setItem(key, JSON.stringify(results));
  } catch {
    // Storage can be full or blocked; losing a result is preferable to throwing
    // in the middle of a game's end screen.
  }
}

function legacyPlayed(): ActivityResults {
  const migrated: ActivityResults = {};
  for (const { id, doneKey } of LEGACY_COMPLETIONS) {
    try {
      if (localStorage.getItem(doneKey) !== "true") continue;
    } catch {
      continue;
    }
    migrated[id] = {
      attempts: 1,
      completed: true,
      label: "",
      lastScore: null,
      lastTotal: null,
      bestScore: null,
      bestTotal: null,
      lastPlayedAt: "",
    };
  }
  return migrated;
}

/**
 * Reads the results for a user, folding in anything played before they signed in
 * plus the pre-existing per-game completion flags. Existing entries always win,
 * so this is safe to call on every render pass.
 */
export function loadActivityResults(userId?: string | null): ActivityResults {
  const key = storeKey(userId);
  const own = read(key);
  const inherited = userId ? { ...legacyPlayed(), ...read(ANON_KEY) } : legacyPlayed();

  let changed = false;
  const merged = { ...own };
  for (const [id, result] of Object.entries(inherited)) {
    if (merged[id]) continue;
    merged[id] = result;
    changed = true;
  }

  if (changed) write(key, merged);
  if (userId && Object.keys(read(ANON_KEY)).length > 0) {
    try {
      localStorage.removeItem(ANON_KEY);
    } catch {
      // Non-fatal: the merge above already copied the entries across.
    }
  }
  return merged;
}

export function recordActivityResult(
  userId: string | null | undefined,
  activityId: string,
  input: ActivityResultInput
): ActivityResults {
  const key = storeKey(userId);
  const all = loadActivityResults(userId);
  const prev = all[activityId];

  const score = input.score ?? null;
  const total = input.total ?? null;
  const keepsPrevBest =
    prev?.bestScore != null && (score == null || prev.bestScore >= score);

  all[activityId] = {
    attempts: (prev?.attempts ?? 0) + 1,
    completed: prev?.completed || input.completed !== false,
    label: input.label ?? prev?.label ?? "",
    lastScore: score,
    lastTotal: total,
    bestScore: keepsPrevBest ? prev!.bestScore : score,
    bestTotal: keepsPrevBest ? prev!.bestTotal : total,
    lastPlayedAt: new Date().toISOString(),
  };

  write(key, all);
  return all;
}

/** Percentage of the best attempt, when the activity has a denominator. */
export function bestPercent(result?: ActivityResult): number | null {
  if (!result?.bestTotal || result.bestScore == null) return null;
  return Math.round((result.bestScore / result.bestTotal) * 100);
}

/** Short badge text for a card, e.g. "Best 9/12", "Best 480 pts", "Played". */
export function formatBestScore(result?: ActivityResult): string {
  if (!result) return "";
  if (result.bestScore == null) return "Played";
  if (result.bestTotal) return `Best ${result.bestScore}/${result.bestTotal}`;
  return `Best ${result.bestScore}${result.label ? ` ${result.label}` : ""}`;
}

export function formatAttempts(result?: ActivityResult): string {
  if (!result) return "";
  return result.attempts === 1 ? "1 play" : `${result.attempts} plays`;
}
