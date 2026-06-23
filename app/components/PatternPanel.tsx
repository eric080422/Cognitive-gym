// app/components/PatternPanel.tsx
"use client";

import DifficultyStats from "./DifficultyStats";
import { useEffect, useState } from "react";
import DifficultyBadge from "./DifficultyBadge";
import { getCurrentDifficulty, pushHistory } from "@/lib/difficulty";
import type { Difficulty } from "@/lib/difficulty";
import type { PatternProblem as ServerPatternProblem } from "@/lib/problems/pattern";

interface PatternProblem extends ServerPatternProblem {}

export default function PatternPanel() {
  const [problem, setProblem] = useState<PatternProblem | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [statsVersion, setStatsVersion] = useState(0);
  
  // 🔴 [핵심 상태] 로직(해설) 창을 보여줄지 여부
  const [showLogic, setShowLogic] = useState(false);

  const loadProblem = async () => {
    setLoading(true);
    setFeedback("");
    setSelectedIndex(null);
    setShowLogic(false); // 문제 로드 시 해설 숨김

    try {
      const currentDiff = getCurrentDifficulty("pattern");
      setDifficulty(currentDiff);
      const res = await fetch(`/api/problem?type=pattern&difficulty=${currentDiff}`);
      const data = await res.json();
      setProblem(data);
      setStatsVersion((v) => v + 1);
    } catch (e) {
      setFeedback("문제를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblem();
  }, []);

  // 보기를 직접 선택했을 때의 핸들러
  const handleChoice = (idx: number) => {
    if (!problem || showLogic) return; // 이미 해설을 봤다면 선택 막음

    const correct = idx === problem.correctIndex;
    setSelectedIndex(idx);
    setShowLogic(true); // 선택 즉시 로직 공개!
    
    pushHistory("pattern", correct);
    setStatsVersion((v) => v + 1);

    if (correct) {
      setFeedback("정답! 패턴을 완벽하게 파악하셨어요 👌");
    } else {
      setFeedback("아쉽네요. 숨겨진 진짜 규칙을 아래 해설에서 확인해 보세요.");
    }
  };

  // 🔴 [핵심 기능] 포기하고 정답/로직 확인하기
  const handleGiveUp = () => {
    if (!problem || showLogic) return;
    
    setSelectedIndex(-1); // -1은 포기를 의미 (아무 선지도 선택하지 않음)
    setShowLogic(true);   // 로직 공개
    
    pushHistory("pattern", false); // 틀림으로 처리
    setStatsVersion((v) => v + 1);
    setFeedback("도전을 멈추셨군요! 아래 해설을 읽고 다음 문제에서 로직을 응용해 보세요.");
  };

  if (!problem) {
    return <div>문제를 불러오는 중...</div>;
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>패턴 · 구조 인식 훈련</h2>

      <div style={{ marginBottom: 8 }}>
        <DifficultyBadge difficulty={problem.difficulty ?? difficulty} />
      </div>

      <DifficultyStats domain="pattern" version={statsVersion} />

      <div
        style={{
          background: "#111827",
          color: "#e5e7eb",
          padding: "20px",
          borderRadius: 12,
          fontSize: 15,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          marginBottom: 16,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
      >
        {problem.prompt}
      </div>

      {/* 보기 4개 버튼 배열 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {problem.choices.map((value, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = showLogic && idx === problem.correctIndex; // 해설 공개 시 정답은 초록색 표시
          const isWrong = isSelected && idx !== problem.correctIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(idx)}
              disabled={showLogic} // 해설이 나오면 클릭 금지
              style={{
                flex: "1 1 45%",
                minWidth: 120,
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid",
                borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#d1d5db",
                background: isCorrect ? "#dcfce7" : isWrong ? "#fee2e2" : "#ffffff",
                color: "#111827",
                fontSize: 16,
                fontWeight: 600,
                cursor: showLogic ? "default" : "pointer",
                transition: "all 0.2s"
              }}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* 🔴 [핵심 UI] 로직 해설 카드 (showLogic이 true일 때만 나타남) */}
      {showLogic && (
        <div style={{
          background: "#fffbeb",
          borderLeft: "6px solid #f59e0b",
          padding: "16px",
          borderRadius: "0 8px 8px 0",
          marginBottom: 16,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={{ fontWeight: 700, color: "#92400e" }}>숨겨진 알고리즘 로직</span>
          </div>
          <p style={{ margin: 0, color: "#451a03", lineHeight: 1.6, fontSize: 14, whiteSpace: "pre-wrap" }}>
            {problem.logic}
          </p>
        </div>
      )}

      {/* 피드백 메시지 */}
      <p style={{ minHeight: 24, fontSize: 14, fontWeight: 600, color: selectedIndex === null ? "#6b7280" : selectedIndex === problem.correctIndex ? "#16a34a" : "#ea580c", marginBottom: 16 }}>
        {feedback}
      </p>

      {/* 🔴 [핵심 흐름] 버튼 트랜지션 로직 */}
      <div style={{ display: "flex", gap: 12 }}>
        {!showLogic ? (
          // 해설 전: 포기하고 정답 확인 버튼
          <button
            type="button"
            onClick={handleGiveUp}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#f3f4f6", color: "#4b5563", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }}
          >
            🤔 모르겠어요 (정답 및 로직 확인)
          </button>
        ) : (
          // 해설 후: 다음 문제로 넘어가기 버튼
          <button
            type="button"
            onClick={loadProblem}
            disabled={loading}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none", background: "#2563eb", color: "#ffffff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)", transition: "all 0.2s"
            }}
          >
            {loading ? "불러오는 중..." : "다음 문제 도전 🚀"}
          </button>
        )}
      </div>

    </div>
  );
}