/**
 * SF-36 Health Survey - Dados e Lógica de Cálculo
 * Versão Brasileira - Baseada em RAND 36-Item Health Survey 1.0
 * 
 * Referência: https://www.rand.org/health-care/surveys_tools/mos/36-item-short-form/scoring.html
 */

export interface SF36Question {
  id: number;
  section: number;
  text: string;
  subtext?: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export interface SF36Response {
  [questionId: number]: number;
}

export interface SF36Scores {
  physicalFunctioning: number;
  rolePhysical: number;
  roleEmotional: number;
  energyFatigue: number;
  emotionalWellbeing: number;
  socialFunctioning: number;
  pain: number;
  generalHealth: number;
  healthChange: number;
}

export interface SF36Results {
  scores: SF36Scores;
  pcs: number; // Physical Component Summary
  mcs: number; // Mental Component Summary
}

// Recoding table for SF-36 items
const RECODING_TABLE: { [key: string]: { [key: number]: number } } = {
  // Items 1, 2, 20, 22, 34, 36
  "1,2,20,22,34,36": { 1: 100, 2: 75, 3: 50, 4: 25, 5: 0 },
  // Items 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  "3,4,5,6,7,8,9,10,11,12": { 1: 0, 2: 50, 3: 100 },
  // Items 13, 14, 15, 16, 17, 18, 19
  "13,14,15,16,17,18,19": { 1: 0, 2: 100 },
  // Items 21, 23, 26, 27, 30
  "21,23,26,27,30": { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 0 },
  // Items 24, 25, 28, 29, 31
  "24,25,28,29,31": { 1: 0, 2: 20, 3: 40, 4: 60, 5: 80, 6: 100 },
  // Items 32, 33, 35
  "32,33,35": { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 },
};

// Scale definitions (items to average)
const SCALES = {
  physicalFunctioning: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  rolePhysical: [13, 14, 15, 16],
  roleEmotional: [17, 18, 19],
  energyFatigue: [23, 27, 29, 31],
  emotionalWellbeing: [24, 25, 26, 28, 30],
  socialFunctioning: [20, 32],
  pain: [21, 22],
  generalHealth: [1, 33, 34, 35, 36],
  healthChange: [2],
};

export const SF36_QUESTIONS: SF36Question[] = [
  // Section 1: General Health
  {
    id: 1,
    section: 1,
    text: "Em geral, você diria que sua saúde é:",
    options: [
      { value: 1, label: "Excelente" },
      { value: 2, label: "Muito boa" },
      { value: 3, label: "Boa" },
      { value: 4, label: "Ruim" },
      { value: 5, label: "Muito ruim" },
    ],
  },
  // Section 2: Health Change
  {
    id: 2,
    section: 2,
    text: "Comparada com um ano atrás, como você avalia sua saúde agora?",
    options: [
      { value: 1, label: "Muito melhor agora do que há um ano atrás" },
      { value: 2, label: "Um pouco melhor agora do que há um ano atrás" },
      { value: 3, label: "Mais ou menos igual à de um ano atrás" },
      { value: 4, label: "Um pouco pior agora do que há um ano atrás" },
      { value: 5, label: "Muito pior agora do que há um ano atrás" },
    ],
  },
  // Section 3: Physical Activities
  {
    id: 3,
    section: 3,
    text: "a) Atividades vigorosas, como correr, levantar peso pesado, participar de esportes extenuantes",
    subtext: "Sua saúde atual limita você a fazer essas atividades? Se sim, quanto?",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 4,
    section: 3,
    text: "b) Atividades moderadas, como mover uma mesa, usar aspirador de pó, jogar boliche ou jogar golfe",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 5,
    section: 3,
    text: "c) Levantar ou carregar sacolas de compras",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 6,
    section: 3,
    text: "d) Subir vários lances de escada",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 7,
    section: 3,
    text: "e) Subir um lance de escada",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 8,
    section: 3,
    text: "f) Curvar-se, ajoelhar-se ou abaixar-se",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 9,
    section: 3,
    text: "g) Andar mais de 1 km",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 10,
    section: 3,
    text: "h) Andar 500 metros",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 11,
    section: 3,
    text: "i) Andar 100 metros",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  {
    id: 12,
    section: 3,
    text: "j) Tomar banho ou vestir-se sozinho",
    options: [
      { value: 1, label: "Sim, limita muito" },
      { value: 2, label: "Sim, limita um pouco" },
      { value: 3, label: "Não, não limita de forma alguma" },
    ],
  },
  // Section 4: Role Limitations - Physical
  {
    id: 13,
    section: 4,
    text: "a) Reduziu o tempo que dedicou ao trabalho ou outras atividades",
    subtext: "Durante as últimas 4 semanas, você teve algum dos seguintes problemas no seu trabalho ou nas suas atividades habituais como consequência de algum problema físico de saúde?",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  {
    id: 14,
    section: 4,
    text: "b) Realizou menos do que gostaria",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  {
    id: 15,
    section: 4,
    text: "c) Teve limitações no tipo de trabalho ou outras atividades",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  {
    id: 16,
    section: 4,
    text: "d) Teve dificuldade para realizar o trabalho ou outras atividades (por exemplo, precisou de mais esforço)",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  // Section 5: Role Limitations - Emotional
  {
    id: 17,
    section: 5,
    text: "a) Reduziu o tempo que dedicou ao trabalho ou outras atividades",
    subtext: "Durante as últimas 4 semanas, você teve algum dos seguintes problemas no seu trabalho ou nas suas atividades habituais como consequência de algum problema emocional?",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  {
    id: 18,
    section: 5,
    text: "b) Realizou menos do que gostaria",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  {
    id: 19,
    section: 5,
    text: "c) Não realizou o trabalho ou outras atividades com tanto cuidado como de costume",
    options: [
      { value: 1, label: "Sim" },
      { value: 2, label: "Não" },
    ],
  },
  // Section 6: Social Functioning
  {
    id: 20,
    section: 6,
    text: "Durante as últimas 4 semanas, até que ponto sua saúde física ou problemas emocionais interferiram nas suas atividades sociais normais com a família, amigos, vizinhos ou grupos?",
    options: [
      { value: 1, label: "De forma nenhuma" },
      { value: 2, label: "Um pouco" },
      { value: 3, label: "Moderadamente" },
      { value: 4, label: "Bastante" },
      { value: 5, label: "Extremamente" },
    ],
  },
  // Section 7: Pain
  {
    id: 21,
    section: 7,
    text: "Quanto de dor no corpo você sentiu durante as últimas 4 semanas?",
    options: [
      { value: 1, label: "Nenhuma" },
      { value: 2, label: "Muito leve" },
      { value: 3, label: "Leve" },
      { value: 4, label: "Moderada" },
      { value: 5, label: "Forte" },
      { value: 6, label: "Muito forte" },
    ],
  },
  {
    id: 22,
    section: 7,
    text: "Durante as últimas 4 semanas, quanto a dor interferiu no seu trabalho normal (incluindo trabalho fora de casa e tarefas domésticas)?",
    options: [
      { value: 1, label: "De forma nenhuma" },
      { value: 2, label: "Um pouco" },
      { value: 3, label: "Moderadamente" },
      { value: 4, label: "Bastante" },
      { value: 5, label: "Extremamente" },
    ],
  },
  // Section 8: Energy/Fatigue
  {
    id: 23,
    section: 8,
    text: "a) Você se sentiu cheio de energia?",
    subtext: "As perguntas a seguir são sobre como você se sentiu e como as coisas aconteceram com você durante as últimas 4 semanas.",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 24,
    section: 8,
    text: "b) Você se sentiu muito nervoso?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 25,
    section: 8,
    text: "c) Você se sentiu desanimado(a), de modo que nada parecia animá-lo(a)?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do time" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 26,
    section: 8,
    text: "d) Você se sentiu calmo(a) e tranquilo(a)?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 27,
    section: 8,
    text: "e) Você teve muita energia?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 28,
    section: 8,
    text: "f) Você se sentiu esgotado(a)?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 29,
    section: 8,
    text: "g) Você se sentiu triste?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  {
    id: 30,
    section: 8,
    text: "h) Você se sentiu feliz?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Uma boa parte do tempo" },
      { value: 4, label: "Uma parte do tempo" },
      { value: 5, label: "Pouco tempo" },
      { value: 6, label: "Nenhum tempo" },
    ],
  },
  // Section 9: Social Functioning (continued)
  {
    id: 31,
    section: 9,
    text: "Durante as últimas 4 semanas, quanto do seu tempo a sua saúde física ou problemas emocionais interferiram nas suas atividades sociais (como visitar amigos, parentes etc.)?",
    options: [
      { value: 1, label: "Todo o tempo" },
      { value: 2, label: "A maior parte do tempo" },
      { value: 3, label: "Alguma parte do tempo" },
      { value: 4, label: "Pouco tempo" },
      { value: 5, label: "Nenhum tempo" },
    ],
  },
  // Section 10: Health Perceptions
  {
    id: 32,
    section: 10,
    text: "a) Parece que eu fico doente com mais facilidade do que as outras pessoas",
    subtext: "Quanto você concorda ou discorda com as seguintes afirmações?",
    options: [
      { value: 1, label: "Definitivamente verdadeiro" },
      { value: 2, label: "Na maior parte verdadeiro" },
      { value: 3, label: "Não sei" },
      { value: 4, label: "Na maior parte falso" },
      { value: 5, label: "Definitivamente falso" },
    ],
  },
  {
    id: 33,
    section: 10,
    text: "b) Eu sou tão saudável quanto qualquer outra pessoa",
    options: [
      { value: 1, label: "Definitivamente verdadeiro" },
      { value: 2, label: "Na maior parte verdadeiro" },
      { value: 3, label: "Não sei" },
      { value: 4, label: "Na maior parte falso" },
      { value: 5, label: "Definitivamente falso" },
    ],
  },
  {
    id: 34,
    section: 10,
    text: "c) Eu espero que minha saúde piore",
    options: [
      { value: 1, label: "Definitivamente verdadeiro" },
      { value: 2, label: "Na maior parte verdadeiro" },
      { value: 3, label: "Não sei" },
      { value: 4, label: "Na maior parte falso" },
      { value: 5, label: "Definitivamente falso" },
    ],
  },
  {
    id: 35,
    section: 10,
    text: "d) Minha saúde é excelente",
    options: [
      { value: 1, label: "Definitivamente verdadeiro" },
      { value: 2, label: "Na maior parte verdadeiro" },
      { value: 3, label: "Não sei" },
      { value: 4, label: "Na maior parte falso" },
      { value: 5, label: "Definitivamente falso" },
    ],
  },
];

function getRecodedValue(questionId: number, originalValue: number): number {
  for (const [itemsStr, recoding] of Object.entries(RECODING_TABLE)) {
    const items = itemsStr.split(",").map(Number);
    if (items.includes(questionId)) {
      return recoding[originalValue] ?? originalValue;
    }
  }
  return originalValue;
}

export function calculateScores(responses: SF36Response): SF36Results {
  const scores: SF36Scores = {
    physicalFunctioning: 0,
    rolePhysical: 0,
    roleEmotional: 0,
    energyFatigue: 0,
    emotionalWellbeing: 0,
    socialFunctioning: 0,
    pain: 0,
    generalHealth: 0,
    healthChange: 0,
  };

  // Recode all responses
  const recodedResponses: { [key: number]: number } = {};
  for (const [questionId, value] of Object.entries(responses)) {
    const id = Number(questionId);
    recodedResponses[id] = getRecodedValue(id, value);
  }

  // Calculate each scale by averaging its items
  const calculateScale = (items: number[]): number => {
    const validValues = items
      .map((id) => recodedResponses[id])
      .filter((val) => val !== undefined);

    if (validValues.length === 0) return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  };

  scores.physicalFunctioning = calculateScale(SCALES.physicalFunctioning);
  scores.rolePhysical = calculateScale(SCALES.rolePhysical);
  scores.roleEmotional = calculateScale(SCALES.roleEmotional);
  scores.energyFatigue = calculateScale(SCALES.energyFatigue);
  scores.emotionalWellbeing = calculateScale(SCALES.emotionalWellbeing);
  scores.socialFunctioning = calculateScale(SCALES.socialFunctioning);
  scores.pain = calculateScale(SCALES.pain);
  scores.generalHealth = calculateScale(SCALES.generalHealth);
  scores.healthChange = calculateScale(SCALES.healthChange);

  // Calculate PCS (Physical Component Summary) and MCS (Mental Component Summary)
  // Simplified calculation - in practice, these use standardized weights
  const pcs =
    (scores.physicalFunctioning +
      scores.rolePhysical +
      scores.pain +
      scores.generalHealth) /
    4;

  const mcs =
    (scores.roleEmotional +
      scores.emotionalWellbeing +
      scores.energyFatigue +
      scores.socialFunctioning) /
    4;

  return {
    scores,
    pcs: Math.round(pcs * 10) / 10,
    mcs: Math.round(mcs * 10) / 10,
  };
}

export const SCALE_NAMES: { [key in keyof SF36Scores]: string } = {
  physicalFunctioning: "Funcionamento Físico",
  rolePhysical: "Limitações por Problemas Físicos",
  roleEmotional: "Limitações por Problemas Emocionais",
  energyFatigue: "Energia/Fadiga",
  emotionalWellbeing: "Bem-estar Emocional",
  socialFunctioning: "Funcionamento Social",
  pain: "Dor Corporal",
  generalHealth: "Saúde Geral",
  healthChange: "Mudança de Saúde",
};
