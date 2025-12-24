import { useEffect, useMemo, useState } from "react";

export type BoostTimerConfig = {
  /**
   * When the boost ends (epoch ms). If null/undefined => boost not running.
   * Future-ready: wire this directly to `userData.<boostEndAtKey>` once available.
   */
  boostEndAtMs?: number | null;
  /** Default 30 minutes */
  durationMs?: number;
  /** Tick interval for UI updates (ms). */
  tickMs?: number;
};

export type BoostTimerState = {
  isRunning: boolean;
  remainingMs: number;
  remainingMinutes: number;
  remainingLabel: string;
  /** 1.0 -> full time remaining, 0.0 -> finished */
  remainingFraction: number;
};

const DEFAULT_DURATION_MS = 30 * 60 * 1000;

export function useBoostTimer({
  boostEndAtMs,
  durationMs = DEFAULT_DURATION_MS,
  tickMs = 1000,
}: BoostTimerConfig): BoostTimerState {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!boostEndAtMs) return;
    const id = setInterval(() => setNowMs(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [boostEndAtMs, tickMs]);

  return useMemo(() => {
    const isRunning = !!boostEndAtMs && boostEndAtMs > nowMs;
    const remainingMs = isRunning ? Math.max(0, boostEndAtMs! - nowMs) : 0;
    const remainingFraction =
      boostEndAtMs && durationMs > 0
        ? Math.max(0, Math.min(1, remainingMs / durationMs))
        : 0;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const mm = Math.floor(remainingMs / 60000);
    const ss = Math.floor((remainingMs % 60000) / 1000);
    const remainingLabel = isRunning ? `${mm}:${String(ss).padStart(2, "0")}` : "0:00";

    return {
      isRunning,
      remainingMs,
      remainingMinutes,
      remainingLabel,
      remainingFraction,
    };
  }, [boostEndAtMs, durationMs, nowMs]);
}


