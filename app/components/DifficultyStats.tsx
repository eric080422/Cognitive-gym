// app/components/DifficultyStats.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getDifficultyStats,
  type TrainingDomain,
  type Difficulty,
} from "@/lib/difficulty";

interface DifficultyStatsProps {
  domain: TrainingDomain;
  /** 문제를 풀 때마다 패널에서 +1 해주는 값 */
  version: number;
}

interface StatsState {
  loaded: boolean;
  total: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  recentTotal: number;
  recentCorrect: number;
  recentAccuracy: number;
  currentDifficulty: Difficulty;
  next: {
    target: Difficulty | null;
    requiredTotal?: number;
    requiredAcc?: number;
    requiredRecentAcc?: number;
    lackTotal?: number;
    minCorrectForAcc?: number;
  };
}

export default function DifficultyStats({
  domain,
  version,
}: DifficultyStatsProps) {
  const [stats, setStats] = useState<StatsState | null>(null);

  useEffect(() => {
    // 브라우저에서만 실행
    try {
      const s = getDifficultyStats(domain);
      setStats({
        loaded: true,
        ...s,
      });
    } catch {
      // SSR 등에서 에러 나면 그냥 무시
      setStats((prev) =>
        prev ?? {
          loaded: false,
          total: 0,
          correctCount: 0,
          wrongCount: 0,
          accuracy: 0,
          recentTotal: 0,
          recentCorrect: 0,
          recentAccuracy: 0,
          currentDifficulty: "easy",
          next: { target: null },
        }
      );
    }
  }, [domain, version]);

  if (!stats || !stats.loaded) {
    return (
      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 8,
        }}
      >
        난이도/통계 계산 중...
      </div>
    );
  }

  const {
    total,
    correctCount,
    wrongCount,
    accuracy,
    recentTotal,
    recentCorrect,
    recentAccuracy,
    currentDifficulty,
    next,
  } = stats;

  const accPercent = Math.round(accuracy * 100);
  const recentAccPercent = Math.round(recentAccuracy * 100);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        background: "#f9fafb",
        fontSize: 12,
        color: "#374151",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280" }}>
          현재 난이도
        </div>
        <div>{currentDifficulty}</div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280" }}>
          누적
        </div>
        <div>
          시도 {total} / 정답 {correctCount} / 오답 {wrongCount}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280" }}>
          정답률
        </div>
        <div>{accPercent}%</div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 11, color: "#6b7280" }}>
          최근 {recentTotal || 8}문제 기준
        </div>
        <div>
          정답 {recentCorrect} / 정답률 {recentAccPercent}%
        </div>
      </div>

      {next.target && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: 6,
            marginTop: 4,
            width: "100%",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 11,
              color: "#6b7280",
              marginBottom: 2,
            }}
          >
            다음 난이도 ({next.target}) 조건
          </div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>
            · 최소 시도 수: {next.requiredTotal ?? "-"}회{" "}
            {typeof next.lackTotal === "number" && next.lackTotal > 0
              ? `(추가 ${next.lackTotal}문제 필요)`
              : null}
            <br />
            · 전체 정답률: {(next.requiredAcc ?? 0) * 100}% 이상
            <br />
            · 최근 정답률: {(next.requiredRecentAcc ?? 0) * 100}% 이상
          </div>
        </div>
      )}
    </div>
  );
}
