// lib/difficulty.ts

export type Difficulty = "easy" | "normal" | "hard";
export type TrainingDomain = "visualization" | "pattern" | "memory";

interface HistoryEntry {
  correct: boolean;
  timestamp: number;
}

const BASE_KEY = "cg_difficulty_history_v1";
const MAX_HISTORY = 50;

export const MIN_TOTAL_FOR_NORMAL = 5;
export const MIN_TOTAL_FOR_HARD = 12;
const RECENT_WINDOW = 8;

const NORMAL_ACC = 0.75;
const NORMAL_RECENT_ACC = 0.7;

const HARD_ACC = 0.8;
const HARD_RECENT_ACC = 0.75;

function isBrowser() {
  return typeof window !== "undefined";
}

function storageKey(domain: TrainingDomain) {
  return `${BASE_KEY}_${domain}`;
}

function loadHistory(domain: TrainingDomain): HistoryEntry[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(domain));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        correct: !!item.correct,
        timestamp:
          typeof item.timestamp === "number"
            ? item.timestamp
            : Date.now(),
      }))
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(domain: TrainingDomain, history: HistoryEntry[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      storageKey(domain),
      JSON.stringify(history.slice(-MAX_HISTORY))
    );
  } catch {
    // ignore
  }
}

export function pushHistory(domain: TrainingDomain, correct: boolean) {
  if (!isBrowser()) return;
  const history = loadHistory(domain);
  const entry = { correct, timestamp: Date.now() };
  const newHistory = [...history, entry];
  saveHistory(domain, newHistory);

  // 🔍 디버그 로그 추가 (정답/오답 기록 확인)
  console.log("[pushHistory]", {
    domain,
    correct,
    totalAfter: newHistory.length,
  });
}

/** 특정 모듈(domain)의 현재 난이도 계산 */
export function getCurrentDifficulty(domain: TrainingDomain): Difficulty {
  const history = loadHistory(domain);

  if (history.length === 0) {
    return "easy";
  }

  const total = history.length;
  const correctCount = history.filter((h) => h.correct).length;
  const accuracy = correctCount / total;

  const recent = history.slice(-RECENT_WINDOW);
  const recentAccuracy =
    recent.length === 0
      ? accuracy
      : recent.filter((h) => h.correct).length / recent.length;

  let level: Difficulty = "easy";

  if (total < MIN_TOTAL_FOR_NORMAL) {
    level = "easy";
  } else if (total < MIN_TOTAL_FOR_HARD) {
    if (accuracy >= NORMAL_ACC && recentAccuracy >= NORMAL_RECENT_ACC) {
      level = "normal";
    } else {
      level = "easy";
    }
  } else {
    if (accuracy >= HARD_ACC && recentAccuracy >= HARD_RECENT_ACC) {
      level = "hard";
    } else if (accuracy >= 0.6) {
      level = "normal";
    } else {
      level = "easy";
    }
  }

  if (recent.length >= 5 && recentAccuracy <= 0.4) {
    if (level === "hard") level = "normal";
    else if (level === "normal") level = "easy";
  }

  return level;
}

/** 특정 모듈(domain)의 통계 + 다음 난이도 조건 */
export function getDifficultyStats(domain: TrainingDomain) {
  const history = loadHistory(domain);
  const total = history.length;
  const correctCount = history.filter((h) => h.correct).length;
  const wrongCount = total - correctCount;
  const accuracy = total === 0 ? 0 : correctCount / total;

  const recent = history.slice(-RECENT_WINDOW);
  const recentTotal = recent.length;
  const recentCorrect = recent.filter((h) => h.correct).length;
  const recentAccuracy =
    recentTotal === 0 ? accuracy : recentCorrect / recentTotal;

  const currentDifficulty = getCurrentDifficulty(domain);

  let next: {
    target: Difficulty | null;
    requiredTotal?: number;
    requiredAcc?: number;
    requiredRecentAcc?: number;
    lackTotal?: number;
    minCorrectForAcc?: number;
  } = { target: null };

  if (currentDifficulty === "easy") {
    const requiredTotal = MIN_TOTAL_FOR_NORMAL;
    const requiredAcc = NORMAL_ACC;
    const requiredRecentAcc = NORMAL_RECENT_ACC;

    const lackTotal = Math.max(0, requiredTotal - total);
    const neededCorrect = Math.ceil(requiredAcc * Math.max(total, requiredTotal));

    next = {
      target: "normal",
      requiredTotal,
      requiredAcc,
      requiredRecentAcc,
      lackTotal,
      minCorrectForAcc: neededCorrect,
    };
  } else if (currentDifficulty === "normal") {
    const requiredTotal = MIN_TOTAL_FOR_HARD;
    const requiredAcc = HARD_ACC;
    const requiredRecentAcc = HARD_RECENT_ACC;

    const lackTotal = Math.max(0, requiredTotal - total);
    const neededCorrect = Math.ceil(requiredAcc * Math.max(total, requiredTotal));

    next = {
      target: "hard",
      requiredTotal,
      requiredAcc,
      requiredRecentAcc,
      lackTotal,
      minCorrectForAcc: neededCorrect,
    };
  } else {
    next = { target: null };
  }

  return {
    total,
    correctCount,
    wrongCount,
    accuracy,
    recentTotal,
    recentCorrect,
    recentAccuracy,
    currentDifficulty,
    next,
  };
}
