// lib/problems/memory.ts
import type { Difficulty } from "../difficulty";

export interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  choices: string[];
}

export interface MemoryProblem {
  type: "memory";
  passage: string;          
  questions: SubQuestion[]; 
  difficulty: Difficulty;
  logic: string;            
}

export function generateMemoryProblem(difficulty: Difficulty): MemoryProblem {
  const templates = ["science", "economics", "humanities"];
  const selectedTemplate = pickFrom(templates);

  if (selectedTemplate === "science") return generateSciencePassage(difficulty);
  if (selectedTemplate === "economics") return generateEconomicsPassage(difficulty);
  return generateHumanitiesPassage(difficulty);
}

/* =========================================================
 * 🔬 1. 생명과학: 연쇄 인과 및 길항(항상성) 모델
 * ========================================================= */
function generateSciencePassage(difficulty: Difficulty): MemoryProblem {
  const enzymes = ["프로테아제-X", "카이네이스-Y", "리파아제-Z"];
  const hormones = ["글루코코르티코이드", "에피네프린", "티록신", "칼시토닌"];
  const substances = ["글리코겐", "아미노산 복합체", "지방산 유도체"];
  
  const E = pickFrom(enzymes);
  const H1 = pickFrom(hormones);
  const H2 = pickFrom(hormones.filter(h => h !== H1));
  const S = pickFrom(substances);
  
  const e_action = Math.random() < 0.5 ? "촉진" : "억제";
  const h1_action = Math.random() < 0.5 ? "증가" : "감소";

  const passage = `[생명과학: 항상성 유지 기작]\n인체의 체내 환경은 복잡한 피드백 작용을 통해 유지된다. 체내 특정 자극이 발생하면 체성 신경계를 통해 효소 '${E}'의 활성이 ${e_action}된다. '${E}'의 활성이 ${e_action}되면 연쇄 작용으로 내분비샘에서 호르몬 '${H1}'의 분비량이 급격히 늘어난다. 호르몬 '${H1}'은 표적 세포에 작용하여 체내의 '${S}' 농도를 ${h1_action}시키는 주된 역할을 한다. 한편, 인체는 과도한 반응을 막기 위해 '${S}'의 농도가 임계치를 초과하여 ${h1_action}하게 되면, 즉각적으로 길항 작용을 하는 호르몬 '${H2}'를 분비하여 효소 '${E}'의 활성을 강제로 차단하는 음성 피드백(Negative Feedback)을 가동한다.`;

  const q1_ans = e_action === "촉진" ? "늘어난다" : "줄어든다";
  const q1_wrong = e_action === "촉진" ? "줄어든다" : "늘어난다";
  
  const q2_ans = h1_action;
  const q2_wrong = h1_action === "증가" ? "감소" : "증가";

  const questions: SubQuestion[] = [
    {
      id: "sci-1",
      question: `지문에 따르면, 효소 '${E}'의 활성이 ${e_action}될 때 호르몬 '${H1}'의 분비량은 어떻게 되는가?`,
      answer: q1_ans,
      choices: shuffleArray([q1_ans, q1_wrong, "변화 없음", "알 수 없음"])
    },
    {
      id: "sci-2",
      question: `호르몬 '${H1}'이 정상적으로 기능할 때, 체내 '${S}'의 농도 변화는 어떠한가?`,
      answer: q2_ans,
      choices: shuffleArray([q2_ans, q2_wrong, "일정하게 유지됨", "분해됨"])
    },
    {
      id: "sci-3",
      question: `만약 환자 A가 유전자 결함으로 인해 호르몬 '${H2}'를 분비하지 못한다면, 효소 '${E}'의 활성 상태는 최종적으로 어떻게 되겠는가?`,
      answer: `지속적으로 ${e_action}된 상태로 남는다`,
      choices: shuffleArray([
        `지속적으로 ${e_action}된 상태로 남는다`, 
        `즉시 차단되어 활성을 멈춘다`, 
        `호르몬 '${H1}'에 의해 직접 분해된다`, 
        `'${S}'의 농도와 무관해진다`
      ])
    }
  ];

  const logic = `[구조화 맵핑 해설]\n1. 자극 → 효소 [${E}] 활성 [${e_action}]\n2. 효소 [${E}] ${e_action} → 호르몬 [${H1}] 분비 증가\n3. 호르몬 [${H1}] 분비 → 물질 [${S}] 농도 [${h1_action}]\n4. 물질 [${S}] 과다 [${h1_action}] → 호르몬 [${H2}] 분비 → 효소 [${E}] 차단 (음성 피드백)\n\n꼬리를 무는 연쇄 작용과 억제 피드백을 구조도로 그렸어야 합니다.`;

  return { type: "memory", passage, questions, difficulty, logic };
}

/* =========================================================
 * 📈 2. 거시경제: 다변수 연쇄 증감 모델
 * ========================================================= */
function generateEconomicsPassage(difficulty: Difficulty): MemoryProblem {
  const nations = ["A국", "B국", "제타 공화국"];
  const rateAction = Math.random() < 0.5 ? "인상" : "인하";
  const nation = pickFrom(nations);
  
  const liquidity = rateAction === "인상" ? "감소" : "증가";
  const value = rateAction === "인상" ? "상승" : "하락";
  const exchange = rateAction === "인상" ? "하락" : "상승"; 
  const exportEffect = exchange === "상승" ? "개선" : "악화";

  const passage = `[거시경제: 통화 정책과 환율의 상관관계]\n최근 ${nation}의 중앙은행은 인플레이션 방어와 경제 안정화를 위해 기준금리를 전격적으로 ${rateAction}하기로 결정했다. 일반적으로 중앙은행이 기준금리를 ${rateAction}하면 시중 은행의 대출 금리도 동반 상승/하락하게 되어, 결과적으로 시중에 풀려있는 통화량(유동성)은 ${liquidity}하게 된다. 시중 통화량이 ${liquidity}하면 해당 국가의 화폐 가치는 상대적으로 ${value}한다. 국제 외환 시장에서 자국 화폐의 가치가 ${value}하면 환율은 반대로 ${exchange}하게 된다. 환율이 ${exchange}할 경우, 해외 시장에서 자국 수출품의 가격 경쟁력이 변동되어 최종적으로 수출 기업의 채산성은 ${exportEffect}되는 결과를 낳는다.`;

  const questions: SubQuestion[] = [
    {
      id: "eco-1",
      question: `${nation}이(가) 기준금리를 ${rateAction}했을 때, 시중 통화량(유동성)은 어떻게 변하는가?`,
      answer: liquidity,
      choices: shuffleArray(["증가", "감소", "변화 없음", "일시적 마비"])
    },
    {
      id: "eco-2",
      question: `지문의 논리 구조에 따르면, 자국 화폐 가치와 환율의 관계는 어떠한가?`,
      answer: "반비례 (역방향) 관계",
      choices: shuffleArray(["비례 (정방향) 관계", "반비례 (역방향) 관계", "상관관계 없음", "완전 동일함"])
    },
    {
      id: "eco-3",
      question: `만약 ${nation}의 정부가 "수출 기업의 채산성 악화를 막기 위한 긴급 대책"을 요구한다면, 지문 논리상 중앙은행이 가장 먼저 취해야 할 후속 조치는?`,
      answer: `기준금리를 ${rateAction === "인상" ? "인하" : "인상"}하는 방향으로 전환한다`,
      choices: shuffleArray([
        `기준금리를 ${rateAction === "인상" ? "인하" : "인상"}하는 방향으로 전환한다`,
        `기준금리를 현재 상태로 계속 동결한다`,
        `시중 유동성을 더욱 강하게 흡수한다`,
        `화폐 가치를 강제로 더 끌어올린다`
      ])
    }
  ];

  const logic = `[구조화 맵핑 해설]\n1. 기준금리 [${rateAction}]\n2. 시중 유동성 [${liquidity}]\n3. 화폐 가치 [${value}]\n4. 환율 [${exchange}] (화폐 가치와 반대)\n5. 수출 채산성 [${exportEffect}]\n\n금리부터 수출까지 이어지는 5단계의 인과(비례/반비례) 사슬을 헷갈리지 않게 유지했어야 합니다.`;

  return { type: "memory", passage, questions, difficulty, logic };
}

/* =========================================================
 * 🏛️ 3. 인문/철학: 다중 관점 대조 및 매핑 모델
 * ========================================================= */
function generateHumanitiesPassage(difficulty: Difficulty): MemoryProblem {
  const ideas1 = ["이성적 연역", "선험적 관념", "절대적 보편성"];
  const ideas2 = ["감각적 경험", "후천적 관찰", "상대적 다원성"];
  
  const i1 = pickFrom(ideas1);
  const i2 = pickFrom(ideas2);
  
  const passage = `[서양 철학: 인식론의 대립]\n인간이 진리에 도달하는 방법에 대해 '알파(Alpha) 학파'와 '베타(Beta) 학파'는 극명한 대립을 보였다. 알파 학파는 인간의 지식은 태어날 때부터 내재되어 있다는 입장을 취하며, 진리에 도달하는 유일한 도구는 '${i1}'이라고 주장했다. 그들은 시각이나 청각 같은 감각은 언제든 우리를 속일 수 있으므로 철저히 배척해야 한다고 보았다. 반면 베타 학파는 인간의 마음은 태어날 때 백지상태(Tabula Rasa)와 같다고 반박하며, 모든 참된 지식은 오직 '${i2}'을(를) 통해서만 쌓인다고 주장했다. 한편, 18세기에 등장한 '감마(Gamma) 학파'는 이 둘을 절충하여, "지식의 재료는 '${i2}'에서 오지만, 그것을 정리하고 진리로 만드는 틀은 '${i1}'이다"라는 종합적 인식론을 완성했다.`;

  const questions: SubQuestion[] = [
    {
      id: "hum-1",
      question: `알파(Alpha) 학파가 진리에 도달하기 위해 철저히 배척해야 한다고 주장한 것은 무엇인가?`,
      answer: "시각이나 청각 같은 감각",
      choices: shuffleArray(["시각이나 청각 같은 감각", i1, "타고난 선험적 지식", "절대적 보편성"])
    },
    {
      id: "hum-2",
      question: `인간의 마음이 태어날 때 '백지상태'와 같다고 주장하며 '${i2}'을(를) 중시한 학파는?`,
      answer: "베타(Beta) 학파",
      choices: shuffleArray(["알파(Alpha) 학파", "베타(Beta) 학파", "감마(Gamma) 학파", "소피스트 학파"])
    },
    {
      id: "hum-3",
      question: `최근 새롭게 등장한 '델타(Delta) 학파'가 "우리가 관찰하고 경험한 것조차 우리 뇌가 만들어낸 허구일 수 있으므로 오직 논리적 사유만이 진리다"라고 주장했다면, 이 학파는 지문에 등장한 누구의 입장에 가장 가까운가?`,
      answer: "알파(Alpha) 학파",
      choices: shuffleArray(["알파(Alpha) 학파", "베타(Beta) 학파", "감마(Gamma) 학파", "알파와 베타의 융합"])
    }
  ];

  const logic = `[구조화 맵핑 해설]\n• 알파 학파: [${i1}] 중시 / 감각 배척\n• 베타 학파: [${i2}] 중시 / 선험성 배척 (백지상태)\n• 감마 학파: 종합 (재료는 [${i2}], 틀은 [${i1}])\n\n각 학파의 핵심 키워드(이성 vs 경험)를 대조표 형태로 머릿속에 매핑하고, 새로운 사상가(델타 학파)를 그 표 안에 적절히 분류해 내야 합니다.`;

  return { type: "memory", passage, questions, difficulty, logic };
}

/* ------------------ 🔹 공통 유틸 ------------------ */
function pickFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}