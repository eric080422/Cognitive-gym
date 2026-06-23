// app/api/problem/route.ts
import { NextResponse } from "next/server";
import { generateVisualizationProblem } from "@/lib/problems/visualization";
import { generatePatternProblem } from "@/lib/problems/pattern";
import { generateMemoryProblem } from "@/lib/problems/memory";
import type { Difficulty } from "@/lib/difficulty"; // ✅ 여기 추가

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const diffParam = searchParams.get("difficulty") as Difficulty | null;

  const difficulty: Difficulty =
    diffParam === "easy" || diffParam === "normal" || diffParam === "hard"
      ? diffParam
      : "easy";

  if (!type) {
    return NextResponse.json(
      { error: "No problem type provided." },
      { status: 400 }
    );
  }

  let problem: any = null;

  switch (type) {
    case "visualization":
      problem = generateVisualizationProblem(difficulty);
      break;
    case "pattern":
      problem = generatePatternProblem(difficulty);
      break;
    case "memory":
      problem = generateMemoryProblem(difficulty);
      break;
    default:
      return NextResponse.json(
        { error: "Unknown problem type." },
        { status: 400 }
      );
  }

  return NextResponse.json({
    ...problem,
    difficulty,
  });
}
