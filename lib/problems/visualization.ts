// lib/problems/visualization.ts
import type { Difficulty } from "../difficulty";

export type FunctionKind =
  | "linear" | "quadratic" | "cubic" | "quartic"
  | "log10" | "ln" | "exp2" | "expE"
  | "sin" | "cos" | "tan"
  | "reciprocal" | "sqrt"
  | "x_sin" | "x_cos" | "x_expE" | "x2_sin" | "sin_x2" | "expE_sin" | "ln_x2plus1"
  | "x2_sin2x" | "expE_sin_prod" | "ln_x2plus1_expE" | "sin_expE"
  | "derivative_inference";

export interface GraphChoice {
  id: number;
  kind: FunctionKind;
  a: number;         
  b: number;         // 🔴 주기, 변곡점, x축 수축/팽창을 관장하는 핵심 파라미터 
  c: number;         
  description: string; 
}

export interface VisualizationProblem {
  type: "visualization";
  expression: string;     
  choices: GraphChoice[]; 
  correctId: number;      
}

const DERIVATIVE_SCENARIOS = [
  {
    isPositive: true,
    correct: "오른쪽 위로 향하는 모양으로, x = α에서 극댓값을 갖고 x = β에서 극솟값을 갖는 개형이다.",
    wrongs: [
      "오른쪽 아래로 향하는 모양으로, x = α에서 극솟값을 갖고 x = β에서 극댓값을 갖는 개형이다.",
      "극값 없이 오른쪽 위로 끊임없이 부드럽게 증가하기만 하는 단조 증가 개형이다.",
      "x = α와 x = β에서 모두 극댓값을 가지는 M자 모양의 사차함수 개형이다."
    ]
  },
  {
    isPositive: false,
    correct: "오른쪽 아래로 향하는 모양으로, x = α에서 극솟값을 갖고 x = β에서 극댓값을 갖는 개형이다.",
    wrongs: [
      "오른쪽 위로 향하는 모양으로, x = α에서 극댓값을 갖고 x = β에서 극솟값을 갖는 개형이다.",
      "모든 실수 x에 대해 항상 감소하는 우하향 직선 개형이다.",
      "x = α와 x = β에서 모두 극솟값을 가지는 W자 모양의 사차함수 개형이다."
    ]
  }
];

export function generateVisualizationProblem(difficulty: Difficulty): VisualizationProblem {
  const easyKinds: FunctionKind[] = ["linear", "quadratic", "cubic", "reciprocal", "sqrt"];
  const normalKinds: FunctionKind[] = ["quartic", "sin", "cos", "x_expE", "ln_x2plus1", "expE_sin"];
  const hardKinds: FunctionKind[] = ["x_sin", "x2_sin", "sin_x2", "expE_sin_prod", "sin_expE", "derivative_inference"];

  const pool = difficulty === "easy" ? easyKinds : difficulty === "normal" ? normalKinds : hardKinds;
  const kind = pool[Math.floor(Math.random() * pool.length)];

  const choices: GraphChoice[] = [];
  const targetYInt = pickFrom([-2, -1, 0, 1, 2]);

  if (kind === "derivative_inference") {
    const scenario = pickFrom(DERIVATIVE_SCENARIOS);
    const a = scenario.isPositive ? 1 : -1;
    choices.push({ id: 0, kind: "derivative_inference", a, b: 0, c: 0, description: scenario.correct });
    scenario.wrongs.forEach((wrongDesc, idx) => {
      choices.push({ id: idx + 1, kind: "derivative_inference", a: -a, b: 0, c: 0, description: wrongDesc });
    });
  } else {
    const correct = createAdvancedChoice(kind, difficulty, true, 0, targetYInt);
    choices.push({ ...correct, id: 0 });

    let currentId = 1;
    let attempts = 0;
    
    const similarPool = pool.filter(k => k !== kind && k !== "derivative_inference");

    // 🔴 [해결] 중복 검사 로직 최적화 및 100번 시도 허용
    while (choices.length < 4 && attempts < 100) {
      attempts++;
      // 무한루프(조합 고갈)를 막기 위해 시도 횟수가 길어지면 강제로 다른 종류의 함수로 비틀어버림
      const forceDifferent = attempts > 20; 
      const useDifferentKind = Math.random() < 0.6 || forceDifferent;
      const variantKind = useDifferentKind && similarPool.length > 0 ? pickFrom(similarPool) : kind;

      const variant = createAdvancedChoice(variantKind, difficulty, false, currentId, targetYInt);

      // 최후의 수단: 40번 이상 실패하면 강제로 b 파라미터를 유니크하게 주입하여 쌍둥이 방지
      if (attempts > 40) {
        variant.b = choices.length + 5;
      }

      const duplicated = choices.some(
        (c) => c.kind === variant.kind && c.a === variant.a && c.b === variant.b && c.c === variant.c
      );
      
      if (!duplicated) {
        choices.push(variant);
        currentId++;
      }
    }
  }

  const correctTargetDesc = choices[0].description;
  const correctTargetKind = choices[0].kind;
  
  shuffle(choices);
  
  const correctChoice = choices.find((c) => c.description === correctTargetDesc && c.kind === correctTargetKind)!;
  choices.forEach((c, idx) => { c.id = idx; });

  return {
    type: "visualization",
    expression: expressionFromChoice(correctChoice, choices),
    choices,
    correctId: correctChoice.id,
  };
}

function createAdvancedChoice(kind: FunctionKind, difficulty: Difficulty, isCorrect: boolean, targetId: number, targetYInt: number): GraphChoice {
  let a = pickFrom([1, -1]); 
  
  // 🔴 [해결] 모든 함수에 대해 내부 굴곡(b)을 활성화하여 시각적 차이를 극대화!
  let b = isCorrect ? 1 : pickFrom([1, 2, 3]); 
  let c = 0;
  let description = "";

  if (kind === "derivative_inference") {
    return { id: targetId, kind, a, b: 0, c: 0, description: "" };
  }

  const isPoly = ["linear", "quadratic", "cubic", "quartic"].includes(kind);
  const finalTargetYInt = isPoly ? targetYInt : pickFrom([-1, 0, 1]);

  if (kind === "cubic") {
    b = isCorrect ? -3 * Math.sign(a) : pickFrom([0, 3 * Math.sign(a)]);
    const hasExtrema = a * b < 0;
    description = a > 0 
      ? (hasExtrema ? "오른쪽 위로 향하며, 극댓값과 극솟값을 모두 가지는 물결 개형이다." : "극값 없이 단조롭게 오른쪽 위로 증가하는 개형이다.")
      : (hasExtrema ? "오른쪽 아래로 향하며, 극솟값과 극댓값을 모두 가지는 물결 개형이다." : "극값 없이 단조롭게 오른쪽 아래로 감소하는 개형이다.");
  } else if (kind === "quartic") {
    b = isCorrect ? -4 * Math.sign(a) : pickFrom([0, 4 * Math.sign(a)]);
    const isW = a > 0 && b < 0;
    const isM = a < 0 && b > 0;
    const isU = a > 0 && b >= 0;
    description = isW ? "극소, 극대, 극소를 가지는 W자 형태의 개형이다." : isM ? "극대, 극소, 극대를 가지는 M자 형태의 개형이다." : isU ? "극값을 하나만 가지는 아래로 볼록한 U자 형태이다." : "극값을 하나만 가지는 위로 볼록한 포물선 형태이다.";
  } else if (kind === "sin" || kind === "cos" || kind === "tan") {
    description = `주기가 ${Math.abs(b)}배로 변하여 진동하는 삼각함수 개형이다.`;
  } else if (kind === "x_expE" || kind === "expE_sin") {
    b = isCorrect ? 1 : pickFrom([-1, 2]);
    description = "극값과 점근선의 위치가 변화된 초월함수 개형이다.";
  }

  let tempChoice = { kind, a, b, c: 0 } as GraphChoice;
  let y0 = evalFunction(tempChoice, 0);
  
  if (y0 === null) y0 = evalFunction(tempChoice, 1) || 0;
  
  c = Math.round(finalTargetYInt - y0);

  return { id: targetId, kind, a, b, c, description };
}

// ----------------------------------------------------
// 텍스트 수식 변환부
// ----------------------------------------------------
function expressionFromChoice(correctChoice: GraphChoice, allChoices: GraphChoice[]): string {
  const hasInference = allChoices.some(c => c.kind === "derivative_inference");
  
  if (hasInference || correctChoice.kind === "derivative_inference") {
    if (correctChoice.a > 0) {
      return `[조건] 어떤 다항함수 f(x)의 도함수 f'(x)가 다음 조건을 만족할 때, 원함수 f(x)의 개형을 추론하시오.\n\n• f'(x) = 0 은 서로 다른 두 실근 α, β (α < β) 를 갖는다.\n• x < α 이면 f'(x) > 0, α < x < β 이면 f'(x) < 0, x > β 이면 f'(x) > 0 이다.`;
    } else {
      return `[조건] 어떤 다항함수 f(x)의 도함수 f'(x)가 다음 조건을 만족할 때, 원함수 f(x)의 개형을 추론하시오.\n\n• f'(x) = 0 은 서로 다른 두 실근 α, β (α < β) 를 갖는다.\n• x < α 이면 f'(x) < 0, α < x < β 이면 f'(x) > 0, x > β 이면 f'(x) < 0 이다.`;
    }
  }

  const { kind, a, b, c } = correctChoice;
  const cStr = c === 0 ? "" : c > 0 ? ` + ${Math.abs(c)}` : ` - ${Math.abs(c)}`;
  const aStr = a === 1 ? "" : a === -1 ? "-" : `${a}`;
  const aStrSpace = a === 1 ? "" : a === -1 ? "-" : `${a} `;
  
  const bPolyStr = b === 0 ? "" : b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
  
  // 🔴 [해결] b 파라미터가 1일 때는 수식에 안 보이게, 그 외엔 숫자가 표시되도록 처리
  const bMultStr = b === 1 || b === 0 ? "" : b === -1 ? "-" : `${b}`;

  if (kind === "linear") return `y = ${aStr}x${cStr}`;
  if (kind === "quadratic") return `y = ${aStr}x^{2}${cStr}`;
  if (kind === "cubic") return `y = ${aStr}x^{3}${bPolyStr}x${cStr}`;
  if (kind === "quartic") return `y = ${aStr}x^{4}${bPolyStr}x^{2}${cStr}`;

  if (kind === "log10") return `y = ${aStr}\\log_{10}(${bMultStr || 1}x)${cStr}`;
  if (kind === "ln") return `y = ${aStr}\\ln(${bMultStr || 1}x)${cStr}`;
  if (kind === "exp2") return `y = ${aStrSpace}(2^{${bMultStr}x})${cStr}`;
  if (kind === "expE") return `y = ${aStrSpace}(e^{${bMultStr}x})${cStr}`;

  if (kind === "sin") return `y = ${aStr}\\sin(${bMultStr}x)${cStr}`;
  if (kind === "cos") return `y = ${aStr}\\cos(${bMultStr}x)${cStr}`;
  if (kind === "tan") return `y = ${aStr}\\tan(${bMultStr}x)${cStr}`;

  if (kind === "reciprocal") {
    let main = a === 1 ? `\\frac{1}{${bMultStr || 1}x}` : a === -1 ? `-\\frac{1}{${bMultStr || 1}x}` : `\\frac{${a}}{${bMultStr || 1}x}`;
    return `y = ${main}${cStr}`;
  }
  if (kind === "sqrt") return `y = ${aStr}\\sqrt{${bMultStr || 1}x}${cStr}`;

  if (kind === "x_sin") return `y = ${aStr}x\\cdot\\sin(${bMultStr}x)${cStr}`;
  if (kind === "x_cos") return `y = ${aStr}x\\cdot\\cos(${bMultStr}x)${cStr}`;
  if (kind === "x_expE") return `y = ${aStr}x e^{${bMultStr}x}${cStr}`;
  if (kind === "x2_sin") return `y = ${aStr}x^{2}\\cdot\\sin(${bMultStr}x)${cStr}`;
  if (kind === "sin_x2") return `y = ${aStr}\\sin\\left(${bMultStr}x^{2}\\right)${cStr}`;
  if (kind === "expE_sin") return `y = ${aStr}e^{\\sin(${bMultStr}x)}${cStr}`;
  if (kind === "ln_x2plus1") return `y = ${aStr}\\ln\\left(${bMultStr}x^{2} + 1\\right)${cStr}`;

  const bDoubleStr = b ? b * 2 : 2;
  if (kind === "x2_sin2x") return `y = ${aStr}x^{2}\\cdot\\sin(${bDoubleStr}x)${cStr}`;
  if (kind === "expE_sin_prod") return `y = ${aStr}e^{x}\\cdot\\sin(${bMultStr}x)${cStr}`;
  if (kind === "ln_x2plus1_expE") return `y = ${aStr}\\ln\\left(${bMultStr}x^{2} + 1\\right)\\cdot e^{x}${cStr}`;
  if (kind === "sin_expE") return `y = ${aStr}\\sin\\left(e^{${bMultStr}x}\\right)${cStr}`;

  return `y = ${aStr}f(x)${cStr}`;
}

// ----------------------------------------------------
// evalFunction (프론트엔드로 넘어가는 수학 연산부)
// ----------------------------------------------------
export function evalFunction(choice: GraphChoice, x: number): number | null {
  const { kind, a, b, c } = choice;
  const log10 = (v: number) => Math.log(v) / Math.LN10;
  
  // 🔴 [해결] b 파라미터를 실제 연산에 모두 반영
  const bVal = b || 1;

  switch (kind) {
    case "linear": return a * x + c;
    case "quadratic": return a * x * x + c;
    case "cubic": return a * Math.pow(x, 3) + b * x + c;
    case "quartic": return a * Math.pow(x, 4) + b * x * x + c;
    
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

function pickFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}