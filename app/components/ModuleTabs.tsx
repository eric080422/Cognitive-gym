// app/components/ModuleTabs.tsx
"use client";

import React from "react";

export type ModuleType = "visualization" | "pattern" | "memory";

interface Props {
  current: ModuleType;
  onChange: (m: ModuleType) => void;
}

const labels: Record<ModuleType, string> = {
  visualization: "1. 시각화 훈련",
  pattern: "2. 패턴 인식",
  memory: "3. 작업기억",
};

export default function ModuleTabs({ current, onChange }: Props) {
  const modules: ModuleType[] = ["visualization", "pattern", "memory"];

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 8,
      }}
    >
      {modules.map((m) => {
        const active = current === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: active ? "#2563eb" : "#f9fafb",
              color: active ? "#ffffff" : "#111827",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {labels[m]}
          </button>
        );
      })}
    </nav>
  );
}
