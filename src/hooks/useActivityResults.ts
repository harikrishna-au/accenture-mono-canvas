import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  loadActivityResults,
  recordActivityResult,
  type ActivityResultInput,
  type ActivityResults,
} from "@/lib/activityResults";

/** Saved results for the signed-in user, keyed by activity route path. */
export function useActivityResults(): ActivityResults {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<ActivityResults>({});

  useEffect(() => {
    if (!isLoaded) return;
    setResults(loadActivityResults(user?.id));
  }, [isLoaded, user?.id]);

  return results;
}

export function useRecordActivityResult() {
  const { user } = useUser();
  const userId = user?.id;

  return useCallback(
    (activityId: string, input: ActivityResultInput) => {
      recordActivityResult(userId, activityId, input);
    },
    [userId]
  );
}

/**
 * Saves a result the moment a game reports it has finished.
 *
 * Games end from several places (a timer expiring, the last question being
 * answered, running out of lives), but they all funnel into one piece of state.
 * Watching that state means one call site per game instead of one per exit, and
 * the values read here are the settled ones rather than whatever a mid-update
 * closure captured.
 */
export function useRecordOnFinish(
  activityId: string,
  finished: boolean,
  buildResult: () => ActivityResultInput
) {
  const record = useRecordActivityResult();
  const build = useRef(buildResult);
  const saved = useRef(false);
  build.current = buildResult;

  useEffect(() => {
    if (!finished) {
      saved.current = false;
      return;
    }
    if (saved.current) return;
    saved.current = true;
    record(activityId, build.current());
  }, [finished, activityId, record]);
}
