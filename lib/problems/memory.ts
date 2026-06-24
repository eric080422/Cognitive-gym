// lib/problems/memory.ts
import type { Difficulty } from "../difficulty";

export interface SubQuestion {
  id: number;
  question: string;
  choices: string[];
  answer: string;
  logic: string;
}

export interface MemoryProblem {
  type: "memory";
  passage: string[];
  questions: SubQuestion[];
  difficulty: Difficulty;
}

export function generateMemoryProblem(difficulty: Difficulty): MemoryProblem {
  const domains = ["science", "economics", "humanities", "technology", "history", "astronomy"];
  const selectedDomain = pickFrom(domains);

  switch (selectedDomain) {
    case "science": return generateSciencePassage(difficulty);
    case "economics": return generateEconomicsPassage(difficulty);
    case "humanities": return generateHumanitiesPassage(difficulty);
    case "technology": return generateTechnologyPassage(difficulty);
    case "history": return generateHistoryPassage(difficulty);
    case "astronomy": return generateAstronomyPassage(difficulty);
    default: return generateSciencePassage(difficulty);
  }
}

/* =========================================================
 * 🔬 1. 생명과학 (기존 대비 변수/조건 다각화)
 * ========================================================= */
function generateSciencePassage(difficulty: Difficulty): MemoryProblem {
  const glands = ["알파(α)선", "베타(β)선", "감마(γ)선", "델타(δ)선"];
  const hormones = ["에피네프린", "글루카곤", "티록신", "세크레틴"];
  const targets = ["간 세포", "근육 세포", "지방 세포"];
  const substances = ["포도당", "칼슘 이온", "나트륨 이온"];
  
  shuffle(glands); shuffle(hormones); shuffle(targets); shuffle(substances);
  
  const g1 = glands[0]; const g2 = glands[1];
  const h1 = hormones[0]; const h2 = hormones[1];
  const target = targets[0]; const sub = substances[0];

  const h1Action = Math.random() < 0.5 ? "촉진" : "억제";
  const h2Action = h1Action === "촉진" ? "억제" : "촉진";
  const h1Effect = h1Action === "촉진" ? "증가" : "감소";

  const passage = [
    `인체의 항상성 유지를 위해 내분비샘은 호르몬을 분비하여 표적 세포를 조절한다. [${g1}]에서 분비되는 [${h1}]은(는) [${target}]에 작용하여 체내 [${sub}]의 생성을 ${h1Action}한다. 그 결과 혈중 [${sub}] 농도가 ${h1Effect}하게 된다.`,
    `한편, [${g2}]에서 분비되는 [${h2}]은(는) [${h1}]과(와) 반대되는 길항 작용을 한다. 즉, [${h2}]는 [${sub}]의 생성을 ${h2Action}시켜 체내 밸런스를 맞춘다.`,
    `체내 [${sub}]의 농도가 비정상적으로 높아지면 음성 피드백이 작용하여 [${h1}]의 분비는 억제되고, [${h2}]의 분비가 촉진된다.`,
    `최근 개발된 <신약 X>는 [${h2}]의 수용체를 차단하여, [${h2}]가 아예 작용하지 못하게 만드는 효과가 있음이 밝혀졌다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `[${h1}]은(는) [${sub}]을(를) ${h1Action}한다.`,
    `[${h1}]은(는) [${sub}]을(를) ${h2Action}한다.`,
    `[${h2}]은(는) [${sub}]을(를) ${h1Action}한다.`,
    `[${g2}]은(는) [${h1}]을(를) 분비한다.`
  ];
  questions.push({
    id: 1,
    question: `지문에 따를 때, 호르몬과 물질의 관계로 올바른 것은?`,
    choices: shuffleReturn(q1Choices),
    answer: q1Choices[0],
    logic: `1문단에서 [${g1}]에서 분비되는 [${h1}]이 [${sub}]을(를) ${h1Action}한다고 명시되어 있습니다.`
  });

  const q2Choices = [
    `[${h1}] 분비 감소, [${h2}] 분비 증가`,
    `[${h1}] 분비 증가, [${h2}] 분비 감소`,
    `[${h1}], [${h2}] 모두 분비 증가`,
    `[${h1}], [${h2}] 모두 분비 감소`
  ];
  const q2Ans = h1Action === "촉진" ? q2Choices[0] : q2Choices[1];
  questions.push({
    id: 2,
    question: `환자의 체내에 [${sub}](이)가 과도하게 축적되어 높을 때, 항상성 유지를 위해 나타날 변화는?`,
    choices: shuffleReturn(q2Choices),
    answer: q2Ans,
    logic: `[${sub}]이 과다하므로 이를 줄여야 합니다. [${h1}]이 ${h1Action}하므로, ${h1Action === "촉진" ? `[${h1}]은 감소하고 [${h2}]가 증가해야 합니다.` : `[${h1}]이 증가하고 [${h2}]가 감소해야 합니다.`}`
  });

  const q3Choices = [
    `[${sub}]의 생성 억제가 어려워져 농도 조절에 실패할 것이다.`,
    `[${h2}]의 분비량 자체가 0으로 수렴할 것이다.`,
    `[${h1}]의 작용이 억제되어 [${sub}] 농도가 급감할 것이다.`,
    `[${target}]의 세포벽이 파괴되어 항상성이 붕괴될 것이다.`
  ];
  questions.push({
    id: 3,
    question: `정상인에게 <신약 X>를 투여했을 때 발생할 결과로 가장 타당한 것은?`,
    choices: shuffleReturn(q3Choices),
    answer: q3Choices[0],
    logic: `<신약 X>는 [${h2}]의 수용체를 차단합니다. [${h2}]는 길항작용으로 [${sub}]의 생성을 ${h2Action}시켜 밸런스를 맞춰야 하는데, 이 기능이 차단되므로 억제 조절이 어려워집니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* =========================================================
 * 📊 2. 경제 (다변수 연쇄)
 * ========================================================= */
function generateEconomicsPassage(difficulty: Difficulty): MemoryProblem {
  const policyDir = Math.random() < 0.5 ? "인상" : "인하";
  const moneySupply = policyDir === "인상" ? "감소" : "증가";
  const inflation = policyDir === "인상" ? "하락" : "상승";
  const currencyValue = policyDir === "인상" ? "상승" : "하락";
  const exportCompetitiveness = policyDir === "인상" ? "약화" : "강화";

  const passage = [
    `중앙은행은 물가 안정을 위해 기준금리를 조절한다. 기준금리를 ${policyDir}하면 가계와 기업의 대출 수요가 변하여 시중 통화량을 ${moneySupply}시킨다.`,
    `통화량이 ${moneySupply}하면 화폐의 희소성이 변하여 물가는 ${inflation}하게 되며, 이에 따라 자국 화폐의 가치는 ${currencyValue}한다.`,
    `자국 화폐의 가치가 ${currencyValue}하면, 상대적으로 수출품의 가격이 변동되어 국제 시장에서 자국 상품의 수출 가격 경쟁력이 ${exportCompetitiveness}되는 결과를 낳는다.`,
    `최근 A국은 극심한 경기 침체를 극복하고자 기준금리 ${policyDir} 조치를 단행하였다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `통화량 ${moneySupply} → 물가 ${inflation}`,
    `통화량 ${moneySupply === "감소" ? "증가" : "감소"} → 물가 ${inflation}`,
    `통화량 ${moneySupply} → 물가 ${inflation === "하락" ? "상승" : "하락"}`,
    `통화량과 물가는 반비례한다.`
  ];
  questions.push({
    id: 1,
    question: `기준금리 ${policyDir} 조치 직후 발생하는 통화량과 물가의 연쇄 변화로 올바른 것은?`,
    choices: shuffleReturn(q1Choices),
    answer: q1Choices[0],
    logic: `금리 ${policyDir}은 통화량을 ${moneySupply}시키고, 물가를 ${inflation}시킨다고 명시되어 있습니다.`
  });

  const q2Choices = [
    `화폐 가치 ${currencyValue} 및 수출 경쟁력 ${exportCompetitiveness}`,
    `화폐 가치 ${currencyValue} 및 수출 경쟁력 ${exportCompetitiveness === "약화" ? "강화" : "약화"}`,
    `화폐 가치 ${currencyValue === "상승" ? "하락" : "상승"} 및 수출 경쟁력 ${exportCompetitiveness}`,
    `화폐 가치 ${currencyValue === "상승" ? "하락" : "상승"} 및 수출 경쟁력 ${exportCompetitiveness === "약화" ? "강화" : "약화"}`
  ];
  questions.push({
    id: 2,
    question: `해당 정책이 최종적으로 자국 화폐 가치와 수출 시장에 미칠 영향을 바르게 짝지은 것은?`,
    choices: shuffleReturn(q2Choices),
    answer: q2Choices[0],
    logic: `금리 ${policyDir} -> 화폐가치 ${currencyValue} -> 수출 경쟁력 ${exportCompetitiveness}의 연쇄 도미노를 파악해야 합니다.`
  });

  const reverseDir = policyDir === "인상" ? "인하" : "인상";
  const q3Choices = [
    `기준금리를 ${reverseDir}하여 통화량을 역전시킨다.`,
    `기준금리를 계속 ${policyDir}하여 기조를 유지한다.`,
    `물가를 강제로 ${inflation}시키는 법안을 통과시킨다.`,
    `모든 무역을 중단하여 환율 영향을 차단한다.`
  ];
  questions.push({
    id: 3,
    question: `이 조치 이후 수출 기업들이 큰 타격을 입었다면, 이를 구제하기 위한 중앙은행의 후속 정책 방향은?`,
    choices: shuffleReturn(q3Choices),
    answer: q3Choices[0],
    logic: `수출 경쟁력이 ${exportCompetitiveness}되었으므로, 이를 살리려면 정반대의 정책(기준금리 ${reverseDir})을 펴야 합니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* =========================================================
 * 🏛️ 3. 인문/철학
 * ========================================================= */
function generateHumanitiesPassage(difficulty: Difficulty): MemoryProblem {
  const isRationalism = Math.random() < 0.5;
  const philA = isRationalism ? "합리론" : "경험론";
  const philB = isRationalism ? "경험론" : "합리론";
  const valA = isRationalism ? "선험적 이성" : "감각적 경험";
  const valB = isRationalism ? "감각적 경험" : "선험적 이성";

  const passage = [
    `근대 철학의 거두인 [사상가 갑]은 '${philA}'을 주장하며, 오직 '${valA}'만이 인간이 진리에 도달할 수 있는 유일한 도구라고 보았다.`,
    `[갑]은 상대 진영인 '${philB}'의 '${valB}'은 주관적이고 오류가 많아 궁극적 진리가 될 수 없다고 비판했다.`,
    `반면 [사상가 을]은 '${philB}'의 입장에서 모든 지식은 후천적인 '${valB}'으로부터 귀납된다고 반박하며, '${valA}'은 허구일 뿐이라고 일축했다.`,
    `후에 등장한 [사상가 병]은 "내용 없는 사고는 공허하고, 개념 없는 직관은 맹목적이다"라며 두 입장을 비판적으로 종합하였다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `[갑]은 '${valA}'을(를), [을]은 '${valB}'을(를) 중시한다.`,
    `[갑]은 '${valB}'을(를), [을]은 '${valA}'을(를) 중시한다.`,
    `[갑]과 [을] 모두 양쪽의 가치를 절반씩 인정한다.`,
    `[병]은 '${valA}'만을 유일한 진리로 추대하였다.`
  ];
  questions.push({
    id: 1, question: `[사상가 갑]과 [을]이 지향하는 인식론적 도구를 바르게 짝지은 것은?`, choices: shuffleReturn(q1Choices), answer: q1Choices[0], logic: `갑은 ${philA}(${valA}), 을은 ${philB}(${valB})이라는 이항 대립을 매핑해야 합니다.`
  });

  const q2Choices = [
    `[갑]과 [을]의 주장이 모두 일면적 한계를 지니고 있다.`,
    `[갑]의 입장을 전면 부정하고 [을]의 입장을 계승하였다.`,
    `'${valA}'만으로도 세상의 모든 진리를 파악할 수 있다.`,
    `양쪽 모두를 폐기하고 종교적 믿음을 최우선으로 삼았다.`
  ];
  questions.push({
    id: 2, question: `[사상가 병]이 앞선 두 사상가의 논쟁을 바라보는 관점은?`, choices: shuffleReturn(q2Choices), answer: q2Choices[0], logic: `[병]은 두 입장을 '공허하고 맹목적이다'라고 비판하며 한계를 지적하고 종합했습니다.`
  });

  const q3Choices = [
    `진리는 고정된 것이 아니라 실생활의 유용성에 따라 변한다는 실용주의 관점`,
    `[병]의 비판적 종합 관점과 완전히 일치하는 관점`,
    `오직 인간의 이성적 추론만이 진리라는 완벽한 합리주의 관점`,
    `관찰과 실험을 통해서만 지식을 얻을 수 있다는 극단적 경험주의 관점`
  ];
  questions.push({
    id: 3, question: `[사상가 정]은 "진리는 탐구 대상이 아니라 도구에 불과하다"고 주장한다. 이 주장의 성격으로 가장 적절한 것은?`, choices: shuffleReturn(q3Choices), answer: q3Choices[0], logic: `진리를 도구로 보는 것은 앞선 세 사상가의 '진리 탐구' 전제를 벗어난 실용주의적 접근입니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* =========================================================
 * 💻 4. 기술/IT (신규 추가)
 * ========================================================= */
function generateTechnologyPassage(difficulty: Difficulty): MemoryProblem {
  const techs = ["블록체인 네트워크", "분산형 클라우드", "엣지 컴퓨팅 시스템"];
  const goals = ["보안성", "처리 속도", "데이터 무결성"];
  const sideEffects = ["전력 소모 증가", "지연 시간 연장", "저장 공간 부족"];
  shuffle(techs); shuffle(goals); shuffle(sideEffects);

  const passage = [
    `최근 IT 업계에서는 중앙 집중형 서버의 한계를 극복하기 위해 [${techs[0]}] 도입이 가속화되고 있다. 이 시스템의 가장 큰 장점은 네트워크 참여자가 데이터를 분산 저장함으로써 [${goals[0]}]을(를) 극대화한다는 것이다.`,
    `그러나 노드(참여자)가 늘어날수록 데이터를 검증하고 동기화하는 과정에서 필연적으로 [${sideEffects[0]}] 문제가 발생한다. 이는 시스템의 확장을 가로막는 치명적인 '트릴레마(Trilemma)' 중 하나로 꼽힌다.`,
    `이를 해결하기 위해 연구진은 '샤딩(Sharding)' 기법을 제안했다. 샤딩은 전체 데이터를 작은 조각(샤드)으로 나누어 병렬 처리함으로써 [${sideEffects[0]}] 문제를 완화하고 확장성을 높이는 기술이다.`,
    `하지만 샤딩을 과도하게 적용할 경우, 조각난 데이터 간의 통신이 불안정해져 애초에 달성하고자 했던 [${goals[0]}]이(가) 오히려 훼손될 위험이 존재한다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `[${techs[0]}]은(는) [${goals[0]}]을(를) 강화하지만 [${sideEffects[0]}]을(를) 유발한다.`,
    `[${techs[0]}]은(는) [${sideEffects[0]}]을(를) 줄이기 위해 발명되었다.`,
    `중앙 집중형 서버는 [${goals[0]}]이(가) 완벽하지만 확장이 불가능하다.`,
    `샤딩 기법은 [${techs[0]}]의 사용을 완전히 대체하는 기술이다.`
  ];
  questions.push({
    id: 1, question: `지문에 나타난 기술의 장단점으로 올바른 것은?`, choices: shuffleReturn(q1Choices), answer: q1Choices[0], logic: `1~2문단에 따르면 해당 기술은 [${goals[0]}]을 높이지만 [${sideEffects[0]}]이라는 부작용을 동반합니다.`
  });

  const q2Choices = [
    `데이터를 조각내어 병렬 처리하여 [${sideEffects[0]}]을(를) 줄이는 것`,
    `노드 수를 무한정 늘려 [${goals[0]}]을(를) 높이는 것`,
    `네트워크를 중앙 집중형으로 다시 되돌리는 것`,
    `데이터 검증을 생략하여 속도를 비약적으로 높이는 것`
  ];
  questions.push({
    id: 2, question: `연구진이 제안한 '샤딩(Sharding)' 기법의 주된 목적은?`, choices: shuffleReturn(q2Choices), answer: q2Choices[0], logic: `3문단에서 샤딩은 데이터를 나누어 병렬 처리함으로써 부작용인 [${sideEffects[0]}]을 완화한다고 설명했습니다.`
  });

  const q3Choices = [
    `[${sideEffects[0]}]은 완화되지만, [${goals[0]}]이(가) 약화되는 역효과가 난다.`,
    `[${goals[0]}]과(와) [${sideEffects[0]}] 모두 완벽하게 해결된다.`,
    `중앙 집중형 서버의 한계가 더욱 부각되어 시스템이 붕괴한다.`,
    `노드가 스스로 데이터를 삭제하여 저장 공간이 늘어난다.`
  ];
  questions.push({
    id: 3, question: `샤딩 기법을 과도하게 도입했을 때 맞이할 수 있는 딜레마적 상황은?`, choices: shuffleReturn(q3Choices), answer: q3Choices[0], logic: `마지막 문단에 샤딩을 과하게 쓰면 데이터 간 통신 불안정으로 애초의 목표인 [${goals[0]}]이 훼손될 수 있다고 명시되었습니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* =========================================================
 * 📜 5. 역사 (신규 추가)
 * ========================================================= */
function generateHistoryPassage(difficulty: Difficulty): MemoryProblem {
  const empires = ["로마 제국", "한나라", "아바스 왕조"];
  const triggers = ["극심한 가뭄", "이민족의 침입", "전염병 창궐"];
  const taxes = ["토지세", "인두세", "통행세"];
  shuffle(empires); shuffle(triggers); shuffle(taxes);

  const passage = [
    `고대 [${empires[0]}]의 쇠망은 단일한 원인이 아닌 복합적인 요인의 연쇄 작용이었다. 그 시작은 서기 3세기경 발생한 [${triggers[0]}](이)었다.`,
    `[${triggers[0]}](으)로 인해 국가의 생산력이 급감하자, 제국은 부족한 재정을 메우기 위해 평민들에게 부과하던 [${taxes[0]}]을(를) 폭발적으로 인상했다.`,
    `[${taxes[0]}]의 인상은 자영농들의 몰락을 초래했고, 이들은 세금을 피하기 위해 대지주에게 땅을 바치고 농노로 전락했다. 이로 인해 국가가 직접 거둬들이는 세입은 오히려 더 감소하는 악순환에 빠졌다.`,
    `당시 황제였던 율리아누스는 이 악순환을 끊기 위해 부유한 대지주들의 면세 특권을 폐지하려 했으나, 귀족 계층의 강력한 반발에 부딪혀 암살당하고 만다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `[${triggers[0]}] → [${taxes[0]}] 인상 → 자영농 몰락`,
    `[${taxes[0]}] 인상 → [${triggers[0]}] 발생 → 자영농 몰락`,
    `자영농 몰락 → [${triggers[0]}] 발생 → [${taxes[0]}] 인하`,
    `대지주 면세 폐지 → [${taxes[0]}] 인상 → [${triggers[0]}]`
  ];
  questions.push({
    id: 1, question: `지문에 나타난 제국 쇠망의 초기 인과 관계로 바르게 짝지은 것은?`, choices: shuffleReturn(q1Choices), answer: q1Choices[0], logic: `[${triggers[0]}] 발생으로 재정이 부족해져 [${taxes[0]}]을 인상했고, 이로 인해 자영농이 몰락했다고 서술되어 있습니다.`
  });

  const q2Choices = [
    `자영농들이 세금을 피하려고 대지주의 농노로 들어갔기 때문에`,
    `[${triggers[0]}](이)가 해결되어 세금을 거둘 필요가 없어졌기 때문에`,
    `황제가 자영농들의 세금을 전면 면제해 주었기 때문에`,
    `이민족들이 국고를 약탈하여 세입이 남지 않았기 때문에`
  ];
  questions.push({
    id: 2, question: `[${taxes[0]}]을(를) 인상했음에도 불구하고 국가의 총 세입이 오히려 감소한 직접적인 이유는?`, choices: shuffleReturn(q2Choices), answer: q2Choices[0], logic: `세금을 피하려던 자영농들이 대지주의 농노로 편입되면서, 국가가 직접 과세할 대상이 사라졌기 때문입니다.`
  });

  const q3Choices = [
    `국가의 재정을 확충하고 조세 형평성을 맞추기 위함이었다.`,
    `자영농들을 더욱 탄압하여 황제의 권력을 강화하기 위함이었다.`,
    `새로운 [${taxes[0]}]을 창설하여 대지주에게 독점시키기 위함이었다.`,
    `[${triggers[0]}]을(를) 무속 신앙의 힘으로 극복하기 위한 제사 비용 마련이었다.`
  ];
  questions.push({
    id: 3, question: `황제 율리아누스가 대지주의 면세 특권을 폐지하려 했던 궁극적인 정치·경제적 목적은?`, choices: shuffleReturn(q3Choices), answer: q3Choices[0], logic: `자영농 몰락으로 국가 세입이 줄어든 악순환을 끊으려면, 세금을 안내던 대지주들에게 세금을 거둬 국고를 채워야 했기 때문입니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* =========================================================
 * 🌌 6. 천문학/지구과학 (신규 추가)
 * ========================================================= */
function generateAstronomyPassage(difficulty: Difficulty): MemoryProblem {
  const stars = ["적색 거성", "백색 왜성", "중성자별"];
  const forceIn = "중력 수축";
  const forceOut = "내부 핵융합 압력";
  shuffle(stars);

  const passage = [
    `별(항성)의 일생은 중심을 향해 붕괴하려는 '${forceIn}'과, 에너지를 방출하며 팽창하려는 '${forceOut}' 간의 끊임없는 줄다리기이다.`,
    `일반적인 주계열성 단계에서는 두 힘이 완벽한 평형을 이루어 별의 크기가 유지된다. 그러나 중심부의 수소 연료가 고갈되면 '${forceOut}'이(가) 약해지면서 별은 중심부로 수축하기 시작한다.`,
    `수축으로 인해 중심부 온도와 압력이 극도로 높아지면, 헬륨 핵융합이 새롭게 점화된다. 이때 폭발적인 '${forceOut}'이(가) 발생하여 별의 외곽층을 크게 팽창시키고, 별은 거대한 [${stars[0]}] 단계로 진입한다.`,
    `외곽층이 팽창하면서 표면의 에너지가 넓은 면적으로 분산되기 때문에, 역설적이게도 [${stars[0]}]의 표면 온도는 팽창 이전보다 낮아지게 된다.`
  ];

  const questions: SubQuestion[] = [];

  const q1Choices = [
    `'${forceIn}'과 '${forceOut}'의 평형 상태`,
    `'${forceIn}'이 완전히 소멸된 상태`,
    `'${forceOut}'이 통제 불능으로 폭주하는 상태`,
    `외부 우주 물질이 별의 핵으로 끝없이 유입되는 상태`
  ];
  questions.push({
    id: 1, question: `별이 안정적인 크기를 유지하는 '주계열성 단계'를 가장 잘 설명한 것은?`, choices: shuffleReturn(q1Choices), answer: q1Choices[0], logic: `수축하려는 힘(${forceIn})과 팽창하려는 힘(${forceOut})이 완벽한 평형을 이룬다고 2문단에 서술되었습니다.`
  });

  const q2Choices = [
    `'${forceOut}' 약화 → 중심부 수축 → 온도/압력 상승 → 헬륨 핵융합 점화`,
    `'${forceIn}' 약화 → 중심부 팽창 → 온도/압력 하락 → 수소 핵융합 재점화`,
    `헬륨 핵융합 점화 → 중심부 수축 → '${forceOut}' 약화 → 별의 팽창`,
    `표면 온도 하락 → 별의 외곽층 팽창 → 중심부 수축 → '${forceIn}' 증가`
  ];
  questions.push({
    id: 2, question: `별이 [${stars[0]}] 단계로 진입하게 되는 인과 과정을 순서대로 바르게 나열한 것은?`, choices: shuffleReturn(q2Choices), answer: q2Choices[0], logic: `수소 고갈로 팽창 압력이 줄어들어 중심이 수축하고, 이로 인해 온도가 올라 헬륨 핵융합이 시작된다는 흐름입니다.`
  });

  const q3Choices = [
    `팽창으로 인해 내부 에너지가 더 넓은 표면적으로 분산되기 때문에`,
    `헬륨 핵융합이 수소 핵융합보다 본질적으로 차가운 반응이기 때문에`,
    `강력한 '${forceIn}'이(가) 열에너지를 중심부로 흡수해 버리기 때문에`,
    `주변 우주의 차가운 가스 구름과 충돌하여 급격히 식었기 때문에`
  ];
  questions.push({
    id: 3, question: `별이 폭발적으로 팽창하여 [${stars[0]}]이(가) 되었음에도 표면 온도가 오히려 낮아지는 이유는?`, choices: shuffleReturn(q3Choices), answer: q3Choices[0], logic: `마지막 문단에서 외곽층이 팽창함에 따라 표면 에너지가 넓은 면적으로 '분산'되어 온도가 낮아진다고 명확히 밝혔습니다.`
  });

  return { type: "memory", passage, questions, difficulty };
}

/* ------------------ 🔹 공통 유틸 ------------------ */
function pickFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
function shuffleReturn<T>(arr: T[]): T[] {
  const newArr = [...arr];
  shuffle(newArr);
  return newArr;
}