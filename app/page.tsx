// app/page.tsx
"use client";

import { useState } from "react";
import ModuleTabs, { ModuleType } from "./components/ModuleTabs";
import VisualizationPanel from "./components/VisualizationPanel";
import PatternPanel from "./components/PatternPanel";
import MemoryPanel from "./components/MemoryPanel";

export default function HomePage() {
  const [currentModule, setCurrentModule] = useState<ModuleType>("visualization");

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "24px auto",
        padding: 16,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Cognitive Gym MVP</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
          시각화 · 패턴 인식 · 작업기억 훈련 데모
        </p>
      </header>

      <ModuleTabs current={currentModule} onChange={setCurrentModule} />

      <section
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        {currentModule === "visualization" && <VisualizationPanel />}
        {currentModule === "pattern" && <PatternPanel />}
        {currentModule === "memory" && <MemoryPanel />}
      </section>
    </main>
  );
}
