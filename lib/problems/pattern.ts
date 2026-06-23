// lib/problems/pattern.ts
import type { Difficulty } from "../difficulty";

export interface PatternProblem {
  type: "pattern";
  prompt: string;       
  choices: number[];    
  correctIndex: number; 
  difficulty: Difficulty;
  logic: string;        // 🔴 [핵심 추가] 사용자에게 보여줄 명확한 규칙 해설 텍스트
}

export function generatePatternProblem(difficulty: Difficulty): PatternProblem {
  // 난이도에 따라 문제 유형 무작위 선택
  const modes = difficulty === "easy" 
    ? ["sequence", "operator"] 
    : difficulty === "normal"
    ? ["operator", "sequence", "collatz"]
    : ["operator", "sequence", "collatz"];

  const selectedMode = pickFrom(modes);
  const isHard = difficulty === "hard";

  if (selectedMode === "operator") return generateDynamicOperator(difficulty, isHard);
  if (selectedMode === "sequence") return generateDynamicSequence(difficulty, isHard);
  return generateDynamicCollatz(difficulty, isHard);
}

/* =========================================================
 * 🧩 1. 무한 랜덤 연산자 생성기
 * ========================================================= */
function generateDynamicOperator(difficulty: Difficulty, isHard: boolean): PatternProblem {
  const symbols = ["⊕", "⊗", "⊙", "⊛", "◈", "★", "♣"];
  const sym = pickFrom(symbols);

  // 계수 무작위 픽 (0은 제외)
  const c1 = pickFrom([-3, -2, -1, 1, 2, 3]);
  const c2 = pickFrom([-3, -2, -1, 1, 2, 3]);
  const c3 = pickFrom([-5, -3, -1, 1, 3, 5]);

  // 로직 템플릿 무작위 선택
  const templates = isHard ? ["quadratic", "multiply_add", "linear"] : ["linear", "multiply"];
  const type = pickFrom(templates);

  let calc: (a: number, b: number) => number;
  let logicDesc = "";

  if (type === "linear") {
    // c1*a + c2*b + c3
    calc = (a, b) => c1 * a + c2 * b + c3;
    logicDesc = `앞의 수(A)에 ${c1}을 곱하고, 뒤의 수(B)에 ${c2}를 곱하여 더한 뒤, 마지막에 ${c3}을 더하는 규칙입니다. (식: ${c1}A + ${c2}B + ${c3})`;
  } else if (type === "quadratic") {
    // a^2 + c2*b
    calc = (a, b) => a * a + c2 * b;
    logicDesc = `앞의 수(A)를 제곱한 값에, 뒤의 수(B)의 ${c2}배를 더하는 규칙입니다. (식: A² + ${c2}B)`;
  } else if (type === "multiply") {
    // a*b + c3
    calc = (a, b) => a * b + c3;
    logicDesc = `두 수를 곱한 뒤, ${c3}을 더하는 규칙입니다. (식: A × B + ${c3})`;
  } else {
    // multiply_add: a*b + c1*a
    calc = (a, b) => a * b + c1 * a;
    logicDesc = `두 수를 곱한 값에, 앞의 수(A)의 ${c1}배를 더하는 규칙입니다. (식: A × B + ${c1}A)`;
  }

  // 예시 생성
  const examples: string[] = [];
  while (examples.length < 3) {
    const a = randInt(2, 8);
    const b = randInt(1, 6);
    const text = `${a} ${sym} ${b} = ${calc(a, b)}`;
    if (!examples.includes(text)) examples.push(text);
  }

  // 실전 문제
  const qA = randInt(4, 9);
  const qB = randInt(3, 7);
  const correctValue = calc(qA, qB);

  const prompt = `다음은 특정한 규칙을 가진 새로운 연산자 '${sym}'의 예시입니다. 규칙을 추론하여 빈칸에 알맞은 값을 구하시오.\n\n[예시]\n• ${examples[0]}\n• ${examples[1]}\n• ${examples[2]}\n\n[문제]\n▶ ${qA} ${sym} ${qB} = [ ? ]`;
  
  const finalLogic = `[해설] 이 연산자 ${sym}는 ${logicDesc.replace(/\+-/g, "-")}\n따라서 정답은 ${qA} ${sym} ${qB} = ${correctValue} 입니다.`;

  return buildFinalProblem(prompt, correctValue, difficulty, finalLogic);
}

/* =========================================================
 * 📈 2. 무한 랜덤 수열 생성기
 * ========================================================= */
function generateDynamicSequence(difficulty: Difficulty, isHard: boolean): PatternProblem {
  const seq: number[] = [];
  let start = randInt(2, 7);
  seq.push(start);

  const types = isHard ? ["alternating", "fibonacci_mod", "arithmetic_progression"] : ["alternating_add", "multiply_add"];
  const type = pickFrom(types);

  let logicDesc = "";

  if (type === "alternating_add") {
    const a1 = pickFrom([2, 3, 4, 5]);
    const a2 = pickFrom([-3, -2, -1, 1]);
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 !== 0 ? a1 : a2));
    logicDesc = `홀수 번째 이동 시에는 ${a1}을 더하고, 짝수 번째 이동 시에는 ${a2}를 더하는 두 가지 규칙이 번갈아 적용되는 수열입니다.`;
  } else if (type === "multiply_add") {
    const m = pickFrom([2, 3]);
    const a = pickFrom([-3, -2, 2, 3]);
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] * m + a);
    logicDesc = `이전 숫자에 ${m}을 곱한 뒤, ${a}를 더하여 다음 숫자를 만드는 규칙(×${m} ${a > 0 ? '+'+a : a})입니다.`;
  } else if (type === "alternating") {
    const a1 = pickFrom([3, 4, 5]);
    const m1 = pickFrom([2, -2]);
    for (let i = 1; i < 6; i++) seq.push(i % 2 !== 0 ? seq[i - 1] + a1 : seq[i - 1] * m1);
    logicDesc = `첫 번째 단계에서는 ${a1}을 더하고, 두 번째 단계에서는 ${m1}을 곱하는 두 연산이 교대로 나타나는 복합 수열입니다.`;
  } else if (type === "fibonacci_mod") {
    const offset = pickFrom([-2, -1, 1, 2]);
    seq.push(randInt(2, 5));
    for (let i = 2; i < 6; i++) seq.push(seq[i - 2] + seq[i - 1] + offset);
    logicDesc = `바로 앞의 두 숫자를 더한 값에 ${offset}을 추가로 더하여 다음 숫자를 만드는 피보나치 변형 수열입니다.`;
  } else {
    // 계차수열 (더해지는 값이 점점 증가)
    const diffStart = randInt(1, 3);
    const diffStep = pickFrom([1, 2]);
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (diffStart + (i - 1) * diffStep));
    logicDesc = `숫자가 넘어갈 때마다 더해지는 값(차이)이 ${diffStart}부터 시작하여 ${diffStep}씩 일정하게 증가하는 계차수열입니다.`;
  }

  const correctValue = seq.pop()!;
  const prompt = `다음 수열은 특정한 복합 규칙에 의해 나열되어 있습니다. 패턴을 분석하여 빈칸 [ ? ]에 들어갈 알맞은 숫자를 고르시오.\n\n${seq.join(", ")}, [ ? ]`;
  const finalLogic = `[해설] ${logicDesc}\n규칙에 따라 마지막 숫자에 연산을 적용하면 정답은 ${correctValue} 가 됩니다.`;

  return buildFinalProblem(prompt, correctValue, difficulty, finalLogic);
}

/* =========================================================
 * 🔄 3. 무한 랜덤 분기 (알고리즘) 생성기
 * ========================================================= */
function generateDynamicCollatz(difficulty: Difficulty, isHard: boolean): PatternProblem {
  const steps = isHard ? 4 : 3;
  const modBase = pickFrom([2, 3]); // 2로 나눈 나머지(짝/홀) 또는 3으로 나눈 나머지

  const rules: { text: string, fn: (n: number) => number }[] = [];
  
  // 나머지 조건별로 동적 함수 생성
  for (let i = 0; i < modBase; i++) {
    const mult = pickFrom([1, 2, 3]);
    const add = pickFrom([-3, -2, -1, 1, 2, 3]);
    
    // 너무 숫자가 폭발하지 않게 특정 조건에서는 나누기 적용
    if (modBase === 2 && i === 0) {
      rules.push({ text: "2로 나눈다", fn: (n) => Math.floor(n / 2) });
    } else {
      rules.push({ text: `${mult}배 한 후 ${add > 0 ? add+'을 더한다' : Math.abs(add)+'을 뺀다'}`, fn: (n) => n * mult + add });
    }
  }

  const startValue = randInt(10, 25);
  let current = startValue;
  let traceText = `시작값 ${startValue} → `;

  for (let step = 0; step < steps; step++) {
    const r = ((current % modBase) + modBase) % modBase; // 안전한 모듈로 연산
    current = rules[r].fn(current);
    traceText += `${current}${step === steps - 1 ? "" : " → "}`;
  }

  let prompt = `어떤 정수 N에 대하여 다음의 [변환 규칙]을 적용합니다.\n\n[변환 규칙]\n`;
  if (modBase === 2) {
    prompt += `• 짝수이면: ${rules[0].text}\n• 홀수이면: ${rules[1].text}\n\n`;
  } else {
    prompt += `• 3으로 나눈 나머지가 0이면: ${rules[0].text}\n• 3으로 나눈 나머지가 1이면: ${rules[1].text}\n• 3으로 나눈 나머지가 2이면: ${rules[2].text}\n\n`;
  }
  prompt += `초기값 N = ${startValue} 에 대하여 이 규칙을 연속으로 ${steps}번 적용했을 때, 최종 결과를 고르시오.`;

  const finalLogic = `[해설] 이 문제는 조건 분기 알고리즘입니다.\n제시된 규칙에 따라 계산 과정을 추적하면 다음과 같습니다.\n경과: ${traceText}\n따라서 최종 정답은 ${current} 입니다.`;

  return buildFinalProblem(prompt, current, difficulty, finalLogic);
}

/* ------------------ 🔹 공통 선지 조립 및 유틸리티 ------------------ */

function buildFinalProblem(prompt: string, correctValue: number, difficulty: Difficulty, logic: string): PatternProblem {
  const choicesSet = new Set<number>();
  choicesSet.add(correctValue);

  let failSafe = 0;
  while (choicesSet.size < 4 && failSafe < 100) {
    failSafe++;
    const offset = pickFrom([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const multiplier = Math.random() < 0.2 ? pickFrom([0.5, 2]) : 1; 
    let wrong = Math.floor(correctValue * multiplier + offset);
    
    if (wrong !== correctValue && wrong > -100) {
      choicesSet.add(wrong);
    }
  }

  const rawChoices = Array.from(choicesSet);
  const shuffled = shuffleWithIndex(rawChoices);
  const correctIndex = shuffled.indexMap[rawChoices.indexOf(correctValue)];

  return { type: "pattern", prompt, choices: shuffled.values, correctIndex, difficulty, logic };
}

function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffleWithIndex(arr: number[]): { values: number[]; indexMap: Record<number, number>; } {
  const values = [...arr];
  const indexMap: Record<number, number> = {};
  values.forEach((_, i) => { indexMap[i] = i; });

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
    const tempIndex = indexMap[i];
    indexMap[i] = indexMap[j];
    indexMap[j] = tempIndex;
  }

  const reverseMap: Record<number, number> = {};
  for (const [newIdx, origIdx] of Object.entries(indexMap)) { reverseMap[origIdx] = parseInt(newIdx, 10); }
  return { values, indexMap: reverseMap };
}