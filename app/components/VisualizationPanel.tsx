// app/components/VisualizationPanel.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import DifficultyBadge from "./DifficultyBadge";
import DifficultyStats from "./DifficultyStats";
import { getCurrentDifficulty, pushHistory } from "@/lib/difficulty";
import type { Difficulty } from "@/lib/difficulty";
import type {
  VisualizationProblem as ServerVisualizationProblem,
  GraphChoice,
} from "@/lib/problems/visualization";

interface VisualizationProblem extends ServerVisualizationProblem {
  difficulty: Difficulty;
}

export default function VisualizationPanel() {
  const [problem, setProblem] = useState<VisualizationProblem | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [statsVersion, setStatsVersion] = useState(0);
  
  // 팝업창(Modal)에 띄울 확대된 그래프 상태 관리
  const [expandedChoice, setExpandedChoice] = useState<GraphChoice | null>(null);

  const loadProblem = async () => {
    setLoading(true);
    setFeedback("");
    setSelectedId(null);

    try {
      const currentDiff = getCurrentDifficulty("visualization");
      setDifficulty(currentDiff);

      const res = await fetch(
        `/api/problem?type=visualization&difficulty=${currentDiff}`
      );
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

  const handleChoice = (choice: GraphChoice) => {
    if (!problem) return;
    if (selectedId !== null) return;

    const correct = choice.id === problem.correctId;

    setSelectedId(choice.id);
    pushHistory("visualization", correct);
    setStatsVersion((v) => v + 1);

    if (correct) {
      setFeedback("정답! 그래프 개형을 잘 떠올리셨어요 👌");
    } else {
      setFeedback(
        problem.choices[0].kind === "derivative_inference"
          ? "아쉽네요. 도함수의 부호가 (+)에서 (-)로, 혹은 (-)에서 (+)로 바뀌는 극점의 위치를 다시 분석해 보세요."
          : "아쉽네요. 극값의 개수와 점근선, x/y 절편을 다시 확인해 보세요."
      );
    }
  };

  if (!problem) {
    return <div>문제를 불러오는 중...</div>;
  }

  const isDerivativeInference = problem.choices.length > 0 && problem.choices[0].kind === "derivative_inference";

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>시각화 훈련</h2>

      <div style={{ marginBottom: 8 }}>
        <DifficultyBadge difficulty={problem.difficulty ?? difficulty} />
      </div>

      <DifficultyStats domain="visualization" version={statsVersion} />

      <p style={{ fontSize: 14, color: "#4b5563" }}>
        {isDerivativeInference 
          ? "주어진 도함수의 조건과 부호 변화를 바탕으로 원함수 f(x)가 가질 극값과 증가·감소 개형 특징을 논리적으로 추론해 가장 알맞은 설명을 고르세요."
          : "주어진 함수식의 그래프 개형을 생각해 보고, 변곡점, 점근선, 극값 위치를 참고하여 가장 알맞은 그래프를 고르세요. (우측 상단 🔍 아이콘을 누르면 직접 마우스 드래그와 휠로 실시간 탐색이 가능합니다.)"
        }
      </p>

      <div
        style={{
          background: "#111827",
          color: "#e5e7eb",
          padding: "16px 20px",
          borderRadius: 8,
          fontSize: 15,
          textAlign: isDerivativeInference ? "left" : "center",
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          marginBottom: 8,
        }}
      >
        {isDerivativeInference ? (
          <div>{problem.expression.replace(/\\n/g, '\n')}</div>
        ) : (
          <BlockMath>{problem.expression}</BlockMath>
        )}
      </div>

      <div
        style={{
          margin: "16px 0",
          display: "grid",
          gridTemplateColumns: isDerivativeInference ? "1fr" : "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {problem.choices.map((choice, idx) => {
          const isSelected = selectedId === choice.id;
          const isCorrect = selectedId !== null && choice.id === problem.correctId;
          const isWrong = selectedId !== null && isSelected && choice.id !== problem.correctId;

          return (
            <div
              key={choice.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleChoice(choice);
                }
              }}
              onClick={() => handleChoice(choice)}
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: isCorrect ? "#22c55e22" : isWrong ? "#ef444422" : "#ffffff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                gap: 6,
                width: "100%",
                transition: "all 0.2s",
                position: "relative"
              }}
            >
              {isDerivativeInference ? (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#e5e7eb", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "#111827", lineHeight: 1.5 }}>
                    {choice.description}
                  </span>
                </div>
              ) : (
                <MiniGraph 
                  choice={choice} 
                  index={idx} 
                  onExpand={() => setExpandedChoice(choice)} 
                />
              )}
            </div>
          );
        })}
      </div>

      <p
        style={{
          minHeight: 24,
          fontSize: 14,
          color: selectedId === null ? "#6b7280" : selectedId === problem.correctId ? "#16a34a" : "#ea580c",
        }}
      >
        {feedback}
      </p>

      <button
        type="button"
        onClick={loadProblem}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: 999,
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {loading ? "불러오는 중..." : "다음 문제"}
      </button>

      {/* 팝업창 모달 컴포넌트 */}
      {expandedChoice && (
        <GraphModal choice={expandedChoice} onClose={() => setExpandedChoice(null)} />
      )}
    </div>
  );
}

/* ==================================================
 * 인터랙티브 조작 기능이 통합된 팝업창(Modal) 컴포넌트
 * ================================================== */
function GraphModal({ choice, onClose }: { choice: GraphChoice; onClose: () => void }) {
  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      style={{ position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.8)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }} 
      onClick={handleBgClick}
    >
      <div style={{ background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 1100, height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        
        {/* 모달 헤더 - 안내문 배치 */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: "#111827", fontWeight: 700 }}>실시간 그래프 동적 탐색 캔버스</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#2563eb", fontWeight: 500 }}>💡 마우스 드래그 : 그래프 평면 이동  |  마우스 휠 스크롤 : 커서 기준 실시간 확대/축소</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "#ef4444", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>탐색 종료</button>
        </div>
        
        {/* 모달 바디 - 꽉 찬 동적 연산 스페이스 */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", background: "#f3f4f6" }}>
          <MiniGraph choice={choice} isExpanded={true} />
        </div>

      </div>
    </div>
  );
}

/* ==================================================
 * 🔍 MiniGraph: 실시간 동적 스케일링 및 드래그 엔진 탑재
 * ================================================== */
type FunctionKind = GraphChoice["kind"];

interface FeaturePoint { x: number; y: number; label: string; }
interface FeatureLine { x1: number; y1: number; x2: number; y2: number; label?: string; }

function MiniGraph({ choice, index, onExpand, isExpanded = false }: { choice: GraphChoice; index?: number; onExpand?: () => void; isExpanded?: boolean; }) {
  const width = isExpanded ? 1000 : 435;
  const height = isExpanded ? 550 : 250;
  const svgRef = useRef<SVGSVGElement>(null);

  const [bounds, setBounds] = useState({ xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const { xMin: initXMin, xMax: initXMax } = getXRange(choice.kind);
    const sampleCount = 100;
    const tempPoints: number[] = [];
    const extraYs: number[] = [];

    for (let i = 0; i < sampleCount; i++) {
      const x = initXMin + ((initXMax - initXMin) * i) / (sampleCount - 1);
      const y = evalFunction(choice, x);
      if (y != null && Number.isFinite(y)) tempPoints.push(y);
    }

    const yIntercept = getYIntercept(choice);
    if (yIntercept) extraYs.push(yIntercept.y);
    const horizAsymY = getHorizontalAsymptote(choice);
    if (horizAsymY != null) extraYs.push(horizAsymY);

    const ysAll = [...tempPoints, ...extraYs].sort((a, b) => a - b);
    let initYMin = ysAll.length > 0 ? ysAll[Math.max(0, Math.floor(ysAll.length * 0.15))] : -3;
    let initYMax = ysAll.length > 0 ? ysAll[Math.min(ysAll.length - 1, Math.ceil(ysAll.length * 0.85))] : 3;

    if (initYMax - initYMin < 3) {
      const mid = (initYMax + initYMin) / 2;
      initYMax = mid + 1.5;
      initYMin = mid - 1.5;
    } else {
      const margin = (initYMax - initYMin) * 0.2;
      initYMin -= margin;
      initYMax += margin;
    }

    setBounds({ xMin: initXMin, xMax: initXMax, yMin: initYMin, yMax: initYMax });
  }, [choice]);

  const sampleCount = isExpanded ? 450 : 160;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const x = bounds.xMin + ((bounds.xMax - bounds.xMin) * i) / (sampleCount - 1);
    const y = evalFunction(choice, x);
    if (y == null || !Number.isFinite(y)) continue;
    points.push({ x, y });
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isExpanded) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isExpanded || !isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const mathDeltaX = (deltaX * (bounds.xMax - bounds.xMin)) / width;
    const mathDeltaY = (deltaY * (bounds.yMax - bounds.yMin)) / height;

    setBounds((prev) => ({
      xMin: prev.xMin - mathDeltaX,
      xMax: prev.xMax - mathDeltaX,
      yMin: prev.yMin + mathDeltaY,
      yMax: prev.yMax + mathDeltaY,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isExpanded || !svgRef.current) return;
    e.preventDefault();

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const fracX = mouseX / width;
    const fracY = (height - mouseY) / height;

    const currentAnchorX = bounds.xMin + fracX * (bounds.xMax - bounds.xMin);
    const currentAnchorY = bounds.yMin + fracY * (bounds.yMax - bounds.yMin);

    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;

    const newXSpan = (bounds.xMax - bounds.xMin) * zoomFactor;
    const newYSpan = (bounds.yMax - bounds.yMin) * zoomFactor;

    setBounds({
      xMin: currentAnchorX - fracX * newXSpan,
      xMax: currentAnchorX + (1 - fracX) * newXSpan,
      yMin: currentAnchorY - fracY * newYSpan,
      yMax: currentAnchorY + (1 - fracY) * newYSpan,
    });
  };

  if (points.length < 2) {
    return <div style={{ width, height, borderRadius: 8, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af" }}>계산 중...</div>;
  }

  const toCX = (x: number) => ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * width;
  const toCY = (y: number) => height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * height;

  const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${toCX(p.x)} ${toCY(p.y)}`).join(" ");

  const hasXAxis = bounds.yMin <= 0 && bounds.yMax >= 0;
  const xAxisY = toCY(0);
  const hasYAxis = bounds.xMin <= 0 && bounds.xMax >= 0;
  const yAxisX = toCX(0);

  const featurePoints: FeaturePoint[] = [];
  const extrema: {x: number, y: number, type: string}[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1]; const p1 = points[i]; const p2 = points[i + 1];
    const slope1 = (p1.y - p0.y) / (p1.x - p0.x); const slope2 = (p2.y - p1.y) / (p2.x - p1.x);
    if (Math.abs(slope1) < 1e-3 && Math.abs(slope2) < 1e-3) continue;
    
    if ((slope1 > 0 && slope2 < 0) || (slope1 < 0 && slope2 > 0)) {
      // 🔴 수정 1: 샘플링 포인트 대신 국소 정밀 탐색(Local Search)을 통해 수학적으로 정확한 극값을 찾습니다.
      let bestX = p1.x;
      let bestY = p1.y;
      const isMax = slope1 > 0;
      const step = (p2.x - p0.x) / 100; // 극값 발견 구간을 100등분하여 정밀 탐색

      for (let tx = p0.x; tx <= p2.x + step / 2; tx += step) {
        const ty = evalFunction(choice, tx);
        if (ty != null && Number.isFinite(ty)) {
          if (isMax ? ty > bestY : ty < bestY) {
            bestY = ty;
            bestX = tx;
          }
        }
      }
      extrema.push({ x: bestX, y: bestY, type: isMax ? "극대" : "극소" });
    }
  }

  extrema.slice(0, 4).forEach(ext => {
    if (ext.x >= bounds.xMin && ext.x <= bounds.xMax && ext.y >= bounds.yMin && ext.y <= bounds.yMax) {
      featurePoints.push({ x: ext.x, y: ext.y, label: `${ext.type} (${formatNumberLabel(ext.x)}, ${formatNumberLabel(ext.y)})` });
    }
  });

  const yIntercept = getYIntercept(choice);
  if (yIntercept && yIntercept.y >= bounds.yMin && yIntercept.y <= bounds.yMax && bounds.xMin <= 0 && bounds.xMax >= 0) {
    featurePoints.push({ x: 0, y: yIntercept.y, label: `(0, ${formatNumberLabel(yIntercept.y)})` });
  }

  const featureLines: FeatureLine[] = [];
  const verticalAsymXs = getVerticalAsymptotes(choice.kind, bounds.xMin, bounds.xMax);
  for (const vx of verticalAsymXs) {
    featureLines.push({ x1: toCX(vx), y1: 0, x2: toCX(vx), y2: height, label: `x = ${formatNumberLabel(vx)}` });
  }
  const horizAsymY = getHorizontalAsymptote(choice);
  if (horizAsymY != null && horizAsymY >= bounds.yMin && horizAsymY <= bounds.yMax) {
    featureLines.push({ x1: 0, y1: toCY(horizAsymY), x2: width, y2: toCY(horizAsymY), label: `y = ${formatNumberLabel(horizAsymY)}` });
  }

  const placedLabels: { x: number; y: number }[] = [];
  const adjustLabelPos = (cx: number, cy: number) => {
    let lx = cx + 8; let ly = cy - 8;
    for (const p of placedLabels) {
      if (Math.sqrt((lx - p.x)**2 + (ly - p.y)**2) < 20) ly -= 16; 
    }
    placedLabels.push({ x: lx, y: ly });
    return { lx, ly };
  };

  return (
    <div 
      style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%", height: "100%", userSelect: "none" }}
      onWheel={handleWheel}
    >
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ 
          borderRadius: 8, 
          border: "1px solid #e5e7eb", 
          background: "#f9fafb", 
          overflow: "hidden",
          cursor: isExpanded ? (isDragging ? "grabbing" : "grab") : "default"
        }}
      >
        {/* 모눈종이 배경 눈금선 */}
        <g stroke="#e5e7eb" strokeWidth={1}>
          {[0.25, 0.5, 0.75].map((r) => <line key={`hx-${r}`} x1={0} y1={height * r} x2={width} y2={height * r} />)}
          {[0.25, 0.5, 0.75].map((r) => <line key={`vx-${r}`} x1={width * r} y1={0} x2={width * r} y2={height} />)}
        </g>

        {!isExpanded && index !== undefined && (
          <g transform="translate(18, 18)">
            <circle cx={0} cy={0} r={14} fill="#ffffff" stroke="#d1d5db" strokeWidth={1} />
            <text x={0} y={4} textAnchor="middle" fontSize={14} fill="#111827" fontWeight={600}>{index + 1}</text>
          </g>
        )}

        {hasXAxis && <line x1={0} y1={xAxisY} x2={width} y2={xAxisY} stroke="#4b5563" strokeWidth={isExpanded ? 2 : 1.5} />}
        {hasYAxis && <line x1={yAxisX} y1={0} x2={yAxisX} y2={height} stroke="#4b5563" strokeWidth={isExpanded ? 2 : 1.5} />}

        {featureLines.map((l, idx) => (
          <g key={idx}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={l.x1 + 6} y={Math.min(l.y1, l.y2) + 16} fontSize={isExpanded ? 13 : 11} fill="#111827" fontWeight="bold" stroke="#ffffff" strokeWidth={4} paintOrder="stroke">{l.label}</text>
          </g>
        ))}

        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={isExpanded ? 3.5 : 2.5} />

        {featurePoints.map((p, idx) => {
          const { lx, ly } = adjustLabelPos(toCX(p.x), toCY(p.y));
          return (
            <g key={idx}>
              <circle cx={toCX(p.x)} cy={toCY(p.y)} r={isExpanded ? 5 : 4} fill="#dc2626" />
              <text x={lx} y={ly} fontSize={isExpanded ? 13 : 11} fill="#991b1b" fontWeight="bold" stroke="#ffffff" strokeWidth={4} paintOrder="stroke" style={{ pointerEvents: "none" }}>{p.label}</text>
            </g>
          );
        })}
      </svg>

      {onExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onExpand();
          }}
          style={{
            position: "absolute", top: 8, right: 8, background: "rgba(255, 255, 255, 0.95)", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px",
            cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontSize: 13, fontWeight: 600, color: "#374151", zIndex: 10, display: "flex", alignItems: "center", gap: 4
          }}
        >
          🔍 크게보기
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 수학 유틸리티 영역
// ----------------------------------------------------
function getXRange(kind: FunctionKind): { xMin: number; xMax: number } {
  if (kind === "log10" || kind === "ln" || kind === "reciprocal") return { xMin: -4, xMax: 4 };
  if (kind === "sqrt") return { xMin: -4, xMax: 4 };
  if (kind === "tan") return { xMin: -4, xMax: 4 };
  if (["exp2", "expE", "x_expE", "expE_sin", "expE_sin_prod", "ln_x2plus1_expE", "sin_expE"].includes(kind)) return { xMin: -2.5, xMax: 2.5 };
  return { xMin: -3, xMax: 3 };
}

function getYIntercept(choice: GraphChoice): { y: number } | null {
  if (choice.kind === "log10" || choice.kind === "ln" || choice.kind === "derivative_inference") return null;
  const y0 = evalFunction(choice, 0);
  if (y0 == null || !Number.isFinite(y0)) return null;
  return { y: y0 };
}

function getHorizontalAsymptote(choice: GraphChoice): number | null {
  return ["exp2", "expE", "reciprocal"].includes(choice.kind) ? choice.c : null;
}

function getVerticalAsymptotes(kind: FunctionKind, xMin: number, xMax: number): number[] {
  const xs: number[] = [];
  if (["log10", "ln", "reciprocal"].includes(kind) && xMin < 0 && xMax > 0) xs.push(0);
  if (kind === "tan") {
    for (let k = -3; k <= 3; k++) {
      const vx = (k + 0.5) * Math.PI;
      if (vx > xMin && vx < xMax) xs.push(vx);
    }
  }
  return xs;
}

export function evalFunction(choice: GraphChoice, x: number): number | null {
  const { kind, a, b, c } = choice;
  const log10 = (v: number) => Math.log(v) / Math.LN10;
  const bVal = b || 1;

  switch (kind) {
    case "linear": return a * x + c;
    case "quadratic": return a * x * x + c;
    case "cubic": return a * Math.pow(x, 3) + bVal * x + c;
    case "quartic": return a * Math.pow(x, 4) + bVal * x * x + c;
    case "log10": return x <= 0 ? null : a * log10(bVal * x) + c;
    case "ln": return x <= 0 ? null : a * Math.log(bVal * x) + c;
    case "exp2": return a * Math.pow(2, bVal * x) + c;
    case "expE": return a * Math.exp(bVal * x) + c;
    case "sin": return a * Math.sin(bVal * x) + c;
    case "cos": return a * Math.cos(bVal * x) + c;
    case "tan": return Math.abs(Math.cos(bVal * x)) < 1e-3 ? null : a * Math.tan(bVal * x) + c;
    case "reciprocal": return Math.abs(x) < 1e-6 ? null : a / (bVal * x) + c;
    case "sqrt": return (bVal * x) < 0 ? null : a * Math.sqrt(bVal * x) + c;
    case "x_sin": return a * x * Math.sin(bVal * x) + c;
    case "x_cos": return a * x * Math.cos(bVal * x) + c;
    case "x_expE": return a * x * Math.exp(bVal * x) + c;
    case "x2_sin": return a * x * x * Math.sin(bVal * x) + c;
    case "sin_x2": return a * Math.sin(bVal * x * x) + c;
    case "expE_sin": return a * Math.exp(Math.sin(bVal * x)) + c;
    case "ln_x2plus1": return a * Math.log(bVal * x * x + 1) + c;
    case "x2_sin2x": return a * x * x * Math.sin((b ? b * 2 : 2) * x) + c;
    case "expE_sin_prod": return a * Math.exp(x) * Math.sin(bVal * x) + c;
    case "ln_x2plus1_expE": return a * Math.log(bVal * x * x + 1) * Math.exp(x) + c;
    case "sin_expE": return a * Math.sin(Math.exp(bVal * x)) + c;
    default: return null;
  }
}

function formatNumberLabel(v: number): string {
  // 🔴 수정 2: 오차 허용 범위를 0.05에서 0.002로 엄격하게 줄여서 무리한 분수 변환을 방지합니다.
  const EPS = 0.002; 
  if (Math.abs(v) < EPS) return "0";

  const bases = [
    { val: Math.E, str: "e" },
    { val: 1 / Math.E, str: "1/e" },
    { val: -1 / Math.E, str: "-1/e" },
    { val: Math.E * Math.E, str: "e²" },
    { val: Math.PI, str: "π" },
    { val: -Math.PI, str: "-π" },
    { val: Math.PI / 2, str: "π/2" },
    { val: -Math.PI / 2, str: "-π/2" },
    { val: Math.PI * 2, str: "2π" },
    { val: -Math.PI * 2, str: "-2π" },
    
    // 🔴 수정 3: sin(e^x) 그래프를 위해 딕셔너리에 로그/삼각함수 특수값(ln(π/2), sin(1) 등)을 추가했습니다.
    { val: Math.log(Math.PI / 2), str: "ln(π/2)" },
    { val: Math.log(3 * Math.PI / 2), str: "ln(3π/2)" },
    { val: Math.log(5 * Math.PI / 2), str: "ln(5π/2)" },
    { val: Math.log(7 * Math.PI / 2), str: "ln(7π/2)" },
    { val: Math.sin(1), str: "sin(1)" },
    { val: Math.cos(1), str: "cos(1)" }
  ];

  for (let offset = -3; offset <= 3; offset++) {
    for (const base of bases) {
      if (Math.abs(v - (offset + base.val)) < EPS) {
        if (offset === 0) return base.str;
        const sign = base.val > 0 && !base.str.startsWith("-") ? "+" : "";
        return offset > 0
          ? `${offset}${sign}${base.str}`
          : `${offset}${sign}${base.str}`.replace("-+", "-").replace("--", "+");
      }
    }
  }

  // 분모를 6까지 확인하여 분수를 좀 더 안정적으로 잡아냅니다.
  for (let den = 1; den <= 6; den++) {
    const num = Math.round(v * den);
    if (Math.abs(v - num / den) < EPS) {
      if (den === 1) return String(num);
      return `${num}/${den}`;
    }
  }

  return (Math.round(v * 100) / 100).toString();
}