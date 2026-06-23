// app/components/DifficultyBadge.tsx
"use client";

type Difficulty = "easy" | "normal" | "hard";

interface Props {
  difficulty: Difficulty;
}

const LABEL_MAP: Record<Difficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

const COLOR_MAP: Record<Difficulty, { bg: string; text: string }> = {
  easy:   { bg: "#dcfce7", text: "#166534" }, // 초록
  normal: { bg: "#fef9c3", text: "#854d0e" }, // 노랑
  hard:   { bg: "#fee2e2", text: "#b91c1c" }, // 빨강
};

export default function DifficultyBadge({ difficulty }: Props) {
  const label = LABEL_MAP[difficulty];
  const { bg, text } = COLOR_MAP[difficulty];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: bg,
        color: text,
      }}
    >
      {/* 난이도에 따라 아이콘 살짝 바꾸고 싶으면 여기 */}
      <span aria-hidden="true">
        {difficulty === "easy" && "🟢"}
        {difficulty === "normal" && "🟡"}
        {difficulty === "hard" && "🔴"}
      </span>
      <span>난이도: {label}</span>
    </span>
  );
}
