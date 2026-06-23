// app/components/MemoryPanel.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import DifficultyBadge from "./DifficultyBadge";
import DifficultyStats from "./DifficultyStats";
import { getCurrentDifficulty, pushHistory } from "@/lib/difficulty";
import type { Difficulty } from "@/lib/difficulty";
import type { MemoryProblem } from "@/lib/problems/memory";

type Phase = "idle" | "reading" | "questioning" | "result";

export default function MemoryPanel() {
  const [problem, setProblem] = useState<MemoryProblem | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [statsVersion, setStatsVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0); 
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]); 
  
  const [feedback, setFeedback] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadProblem = async () => {
    setLoading(true);
    setPhase("idle");
    setFeedback("");
    setCurrentQIndex(0);
    setUserAnswers([]);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const currentDiff = getCurrentDifficulty("memory");
      setDifficulty(currentDiff);
      const res = await fetch(`/api/problem?type=memory&difficulty=${currentDiff}`);
      const data = await res.json();
      setProblem(data);
      setStatsVersion((v) => v + 1);
    } catch {
      setFeedback("문제를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblem();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startReading = () => {
    if (!problem) return;
    setPhase("reading");
    
    let time = problem.difficulty === "easy" ? 40 : problem.difficulty === "normal" ? 30 : 20;
    setTimeLeft(time);

    timerRef.current = setInterval(() => {
      time -= 1;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timerRef.current!);
        setPhase("questioning"); 
      }
    }, 1000);
  };

  const finishReadingEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("questioning");
  };

  const handleAnswer = (choice: string) => {
    if (!problem) return;
    
    const currentQ = problem.questions[currentQIndex];
    const isCorrect = choice === currentQ.answer;
    const newAnswers = [...userAnswers, isCorrect];
    setUserAnswers(newAnswers);

    if (currentQIndex + 1 < problem.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishProblem(newAnswers);
    }
  };

  const handleGiveUp = () => {
    if (!problem || phase === "result") return;
    const newAnswers = [...userAnswers];
    while(newAnswers.length < problem.questions.length) {
      newAnswers.push(false);
    }
    setUserAnswers(newAnswers);
    finishProblem(newAnswers);
  };

  const finishProblem = (finalAnswers: boolean[]) => {
    setPhase("result");
    
    const isAllCorrect = finalAnswers.every(ans => ans === true);
    pushHistory("memory", isAllCorrect);
    setStatsVersion((v) => v + 1);

    const correctCount = finalAnswers.filter(ans => ans).length;
    if (isAllCorrect) {
      setFeedback("🎉 완벽합니다! 복잡한 지문의 뼈대를 잃지 않고 3문제를 모두 추론해 내셨습니다!");
    } else {
      setFeedback(`아쉽습니다. (정답: ${correctCount}/3) 질문이 넘어가는 과정에서 정보의 간섭(Interference)이 발생하여 구조가 무너진 것 같습니다.`);
    }
  };

  if (!problem) return <div>문제를 불러오는 중...</div>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>수능형 1지문 다문항 추론 (작업기억 한계 훈련)</h2>
      <div style={{ marginBottom: 8 }}><DifficultyBadge difficulty={problem.difficulty ?? difficulty} /></div>
      <DifficultyStats domain="memory" version={statsVersion} />

      <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 16 }}>
        주어진 시간 동안 비문학 지문의 '논리 구조(뼈대)'를 머릿속에 스케치하세요. 지문이 사라진 후, 오직 기억만으로 <strong>연속 3문제</strong>를 돌파해야 합니다.
      </p>

      {phase === "idle" && (
        <div style={{ height: 250, background: "#f3f4f6", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db" }}>
          <p style={{ fontSize: 16, color: "#374151", fontWeight: 600, marginBottom: 20 }}>준비가 완료되면 심호흡을 하고 아래 버튼을 누르세요.</p>
          <button onClick={startReading} style={{ padding: "14px 36px", fontSize: 18, fontWeight: 700, borderRadius: 999, background: "#2563eb", color: "white", border: "none", cursor: "pointer", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.3)" }}>
            📖 지문 독해 시작
          </button>
        </div>
      )}

      {phase === "reading" && (
        <div style={{ minHeight: 250, padding: 24, background: "#f8fafc", borderRadius: 12, display: "flex", flexDirection: "column", border: "2px solid #3b82f6", position: "relative", animation: "fadeIn 0.3s" }}>
          <div style={{ position: "absolute", top: 16, right: 20, fontSize: 24, fontWeight: 800, color: timeLeft <= 10 ? "#ef4444" : "#2563eb" }}>
            ⏳ {timeLeft}초
          </div>
          <h3 style={{ margin: "0 0 16px 0", color: "#1e3a8a", fontSize: 16 }}>단어를 외우지 말고 관계(구조)를 그리세요!</h3>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#111827", lineHeight: 1.8, marginBottom: 24, whiteSpace: "pre-wrap" }}>
            {problem.passage}
          </div>
          <button onClick={finishReadingEarly} style={{ alignSelf: "center", padding: "10px 24px", fontSize: 15, fontWeight: 600, borderRadius: 8, background: "#cbd5e1", color: "#334155", border: "none", cursor: "pointer" }}>
            구조화 완료 (문제 풀기로 넘어가기)
          </button>
        </div>
      )}

      {phase === "questioning" && (
        <div style={{ animation: "fadeIn 0.4s" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map(idx => (
              <div key={idx} style={{ flex: 1, height: 8, borderRadius: 4, background: idx === currentQIndex ? "#3b82f6" : idx < currentQIndex ? "#22c55e" : "#e2e8f0" }} />
            ))}
          </div>

          <div style={{ padding: 24, background: "#eff6ff", borderRadius: 12, border: "2px solid #bfdbfe", marginBottom: 20, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: 18, fontWeight: 800 }}>질문 {currentQIndex + 1} / 3</h3>
            </div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.5 }}>
              {problem.questions[currentQIndex].question}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {problem.questions[currentQIndex].choices.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswer(c)}
                style={{
                  textAlign: "left", padding: "16px 20px", borderRadius: 12, border: "2px solid #e2e8f0", background: "#ffffff",
                  color: "#1e293b", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = "#93c5fd"}
                onMouseOut={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                {idx + 1}. {c}
              </button>
            ))}
          </div>
          
          <div style={{ textAlign: "right" }}>
            <button onClick={handleGiveUp} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer" }}>
              🤔 지문 내용이 붕괴됨 (포기하고 해설 보기)
            </button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div style={{ animation: "fadeInUp 0.4s" }}>
          
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {problem.questions.map((q, idx) => {
              const isCorrect = userAnswers[idx];
              return (
                <div key={idx} style={{ flex: 1, padding: 16, borderRadius: 12, textAlign: "center", background: isCorrect ? "#dcfce7" : "#fee2e2", border: `2px solid ${isCorrect ? "#22c55e" : "#ef4444"}` }}>
                  <div style={{ fontSize: 14, color: isCorrect ? "#166534" : "#991b1b", fontWeight: 700, marginBottom: 4 }}>Q{idx + 1}</div>
                  <div style={{ fontSize: 24 }}>{isCorrect ? "⭕" : "❌"}</div>
                </div>
              );
            })}
          </div>

          <p style={{ minHeight: 24, fontSize: 16, fontWeight: 700, color: userAnswers.every(ans => ans) ? "#16a34a" : "#ea580c", marginBottom: 20, textAlign: "center" }}>
            {feedback}
          </p>

          <div style={{ background: "#f0fdf4", borderLeft: "6px solid #16a34a", padding: "20px", borderRadius: "0 8px 8px 0", marginBottom: 24, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>📝</span><span style={{ fontWeight: 800, color: "#14532d", fontSize: 16 }}>지문 구조화 해설 (어떻게 매핑했어야 하는가?)</span>
            </div>
            <p style={{ margin: 0, color: "#064e3b", lineHeight: 1.7, fontSize: 15, whiteSpace: "pre-wrap", fontWeight: 500 }}>
              {problem.logic}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={loadProblem} disabled={loading} style={{ padding: "14px 36px", borderRadius: 8, border: "none", background: "#2563eb", color: "#ffffff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" }}>
              {loading ? "불러오는 중..." : "다음 지문 훈련 시작 🚀"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}