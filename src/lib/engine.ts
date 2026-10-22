import type { SessionReport } from './types';

export const QUESTION_BANK: Record<'Technical' | 'HR', Record<string, string[]>> = {
  Technical: {
    'Software Engineer': [
      'Explain the difference between a process and a thread. When would you choose one over the other?',
      'How does a hash map handle collisions, and what trade-offs exist between open addressing and chaining?',
      'Walk me through what happens when you type a URL into a browser and press Enter.',
      'What is time complexity? Describe how you would analyze the efficiency of a nested loop.',
      'Explain the CAP theorem and how it shapes real distributed database design.',
      'How would you design a rate limiter for a public API serving millions of requests?',
    ],
    'Product Manager': [
      'How would you decide what to build next in a product backlog with limited engineering capacity?',
      'Explain how you would measure the success of a new feature after launch.',
      'A key metric dropped 20% overnight. Walk me through your debugging approach.',
      'How do you balance technical debt against shipping new features?',
      'Describe how you would prioritize between three competing customer requests.',
      'What makes a great product requirement document, and what are common pitfalls?',
    ],
    'Data Scientist': [
      'Explain the bias–variance trade-off and how you would handle an overfitting model.',
      'When would you choose a random forest over gradient boosting, and vice versa?',
      'How do you detect data drift in a production machine learning pipeline?',
      'Walk me through how you would design an A/B test from hypothesis to readout.',
      'Explain what p-values actually tell us — and what they do not.',
      'How would you handle a highly imbalanced dataset for a fraud detection model?',
    ],
    'Designer': [
      'Walk me through your design process from problem brief to shipped product.',
      'How do you defend a design decision that stakeholders disagree with?',
      'Explain the difference between heuristic evaluation and usability testing.',
      'How would you design an onboarding flow that minimizes drop-off?',
      'Describe how you balance aesthetic ambition with engineering constraints.',
      'What accessibility guidelines do you consider non-negotiable, and why?',
    ],
  },
  HR: {
    'Software Engineer': [
      'Tell me about yourself and what draws you to this role.',
      'Describe a time you disagreed with a teammate. How did you resolve it?',
      'Tell me about a project you are most proud of and your specific contribution.',
      'How do you handle tight deadlines without sacrificing code quality?',
      'Describe a failure you experienced. What did you learn from it?',
      'Where do you want to grow technically in the next two years?',
    ],
    'Product Manager': [
      'Tell me about a product you love. What would you improve and why?',
      'Describe a time you influenced without authority across teams.',
      'Tell me about a difficult trade-off you made between user needs and business goals.',
      'How do you communicate bad news to stakeholders or executives?',
      'Describe a time you received critical feedback. How did you respond?',
      'What does a healthy engineering partnership look like for a PM?',
    ],
    'Data Scientist': [
      'Tell me about yourself and your journey into data science.',
      'Describe a time your analysis changed a business decision.',
      'How do you explain a complex model to a non-technical stakeholder?',
      'Tell me about a time you were wrong about a data-driven conclusion.',
      'How do you handle ambiguity when the problem is not clearly defined?',
      'Describe how you collaborate with engineers to ship a model to production.',
    ],
    'Designer': [
      'Tell me about yourself and your design philosophy.',
      'Describe a time your first design solution failed user testing.',
      'How do you handle creative disagreements within a design team?',
      'Tell me about a time constraints forced the best design decision.',
      'How do you present your work to executives who are not designers?',
      'What kind of team culture brings out your best creative work?',
    ],
  },
};

export const DIFFICULTIES = ['Foundational', 'Intermediate', 'Advanced'] as const;
export const ROLES = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer'] as const;

export const FILLER_LIST = [
  'basically', 'actually', 'literally', 'honestly', 'obviously', 'essentially',
  'stuff', 'things', 'like', 'maybe', 'perhaps', 'sort of', 'kind of', 'i guess', 'you know',
];

const STOPWORDS = new Set(
  ('the a an and or of to in for on with at by from as is are was were be been it this that these those you your i me my we our they their them he she his her what which who how why when where into over under about between through during if its can could should would will shall may might must do does did done have has had not no so than then there here such other each any all both few more most some only own same too very just').split(' ')
);

export const KEYWORDERS: Record<string, string[]> = {
  // Technical
  'process thread scheduling concurrency parallel execution memory stack heap': ['process', 'thread', 'concurrency', 'parallel', 'context switch', 'scheduling', 'memory', 'isolation'],
  'hash map collisions open addressing chaining bucket load factor rehashing': ['collision', 'chaining', 'open addressing', 'load factor', 'bucket', 'hash function', 'rehash', 'probing'],
  'url browser dns http tcp request server response render html': ['dns', 'tcp', 'http', 'request', 'server', 'response', 'render', 'browser', 'ip', 'tls'],
  'time complexity big o nested loop algorithm linear quadratic efficiency': ['big o', 'complexity', 'linear', 'quadratic', 'algorithm', 'worst case', 'notation', 'loop'],
  'cap theorem consistency availability partition tolerance distributed database': ['consistency', 'availability', 'partition', 'tolerance', 'distributed', 'trade-off', 'network', 'database'],
  'rate limiter api requests throttle token bucket sliding window redis': ['rate limit', 'throttle', 'token bucket', 'sliding window', 'api', 'redis', 'requests', 'window'],
  'backlog prioritization shipping roadmap impact effort stakeholder sprint': ['priority', 'impact', 'effort', 'stakeholder', 'roadmap', 'sprint', 'user value', 'trade-off'],
  'feature success metric launch activation retention engagement experiment': ['metric', 'activation', 'retention', 'engagement', 'experiment', 'success criteria', 'baseline', 'launch'],
  'metric dropped overnight debugging funnel cohort regression hypothesis data': ['hypothesis', 'funnel', 'cohort', 'regression', 'metric', 'data', 'segment', 'investigate'],
  'technical debt refactor shipping balance velocity maintainability quality': ['technical debt', 'refactor', 'velocity', 'quality', 'maintainability', 'trade-off', 'balance'],
  'competing customer requests prioritize frameworks scoring value': ['prioritize', 'framework', 'value', 'customer', 'scoring', 'impact', 'effort', 'criteria'],
  'requirement document prd pitfalls ambiguity success criteria acceptance': ['requirements', 'criteria', 'ambiguity', 'acceptance', 'scope', 'user story', 'edge cases', 'document'],
  'bias variance overfitting regularization complexity cross validation': ['bias', 'variance', 'overfitting', 'regularization', 'cross validation', 'complexity', 'generalize'],
  'random forest gradient boosting ensemble trees bagging boosting comparison': ['random forest', 'gradient boosting', 'ensemble', 'boosting', 'bagging', 'trees', 'overfit'],
  'data drift production pipeline monitoring detection features distribution': ['drift', 'monitoring', 'pipeline', 'distribution', 'production', 'features', 'detection', 'retrain'],
  'a b test hypothesis experiment sample size significance readout': ['hypothesis', 'experiment', 'sample size', 'significance', 'control', 'variant', 'metric', 'readout'],
  'p values hypothesis significance limitation evidence statistical test': ['p-value', 'significance', 'hypothesis', 'evidence', 'statistical', 'limitation', 'null', 'correlation'],
  'imbalanced dataset fraud detection precision recall sampling class weights': ['precision', 'recall', 'imbalance', 'sampling', 'class weight', 'f1', 'fraud', 'threshold'],
  'design process brief research wireframe prototype ship iteration': ['research', 'wireframe', 'prototype', 'iterate', 'user needs', 'test', 'ship', 'feedback'],
  'defend design decision rationale critique stakeholder evidence': ['rationale', 'evidence', 'user data', 'trade-off', 'feedback', 'decision', 'testing', 'defend'],
  'heuristic evaluation usability testing inspection findings severity': ['heuristic', 'usability', 'testing', 'inspection', 'findings', 'severity', 'users', 'Nielsen'],
  'onboarding flow drop-off activation friction steps conversion': ['onboarding', 'drop-off', 'activation', 'friction', 'conversion', 'steps', 'first value', 'flow'],
  'aesthetic ambition engineering constraints feasibility scope collaboration': ['constraints', 'feasibility', 'collaboration', 'scope', 'trade-off', 'iterate', 'feasible', 'balance'],
  'accessibility guidelines contrast keyboard screen reader wcag inclusive': ['accessibility', 'contrast', 'keyboard', 'screen reader', 'wcag', 'aria', 'inclusive', 'focus'],
  // HR
  'tell me about yourself journey background strengths role motivation energy': ['background', 'journey', 'strengths', 'passion', 'experience', 'motivation', 'impact', 'role'],
  'disagreed teammate conflict resolution compromise listened perspective outcome': ['listened', 'perspective', 'compromise', 'disagree', 'outcome', 'respect', 'collaborated', 'resolution'],
  'proud project contribution impact team ownership delivered result': ['project', 'contribution', 'impact', 'team', 'ownership', 'delivered', 'challenge', 'result'],
  'tight deadlines quality pressure prioritize scope communicate crunch': ['deadline', 'prioritize', 'quality', 'scope', 'communicate', 'trade-off', 'pressure', 'deliver'],
  'failure learned mistake ownership reflection growth lesson': ['failure', 'learned', 'mistake', 'ownership', 'reflected', 'lesson', 'improved', 'growth'],
  'grow technically two years learning goals ambition direction': ['grow', 'learning', 'goals', 'skills', 'depth', 'mentorship', 'direction', 'improve'],
  'product you love improve critique user experience thoughtful': ['love', 'improve', 'user experience', 'product', 'critique', 'detail', 'thoughtful', 'design'],
  'influence without authority cross functional alignment stakeholder buy-in': ['influence', 'alignment', 'stakeholder', 'cross-functional', 'buy-in', 'trust', 'align', 'outcome'],
  'difficult trade-off user needs business goals balance communicated': ['trade-off', 'balance', 'user needs', 'business', 'communicated', 'decision', 'data', 'aligned'],
  'communicate bad news stakeholders executives transparent framing options': ['communicate', 'transparent', 'bad news', 'options', 'framing', 'proactive', 'stakeholder', 'solution'],
  'critical feedback response growth coachable example specific': ['feedback', 'coachable', 'response', 'growth', 'specific', 'changed', 'improved', 'action'],
  'healthy engineering partnership pm collaboration trust respect disagree agreeably': ['collaboration', 'trust', 'respect', 'partnership', 'disagree', 'alignment', 'shared goals', 'communication'],
  'journey into data science background motivation learning impact': ['journey', 'background', 'motivation', 'learning', 'impact', 'experience', 'curiosity', 'data'],
  'analysis changed business decision stakeholder insight impact': ['analysis', 'decision', 'insight', 'stakeholder', 'impact', 'evidence', 'recommendation', 'outcome'],
  'explain complex model non technical simple clarity storytelling': ['simple', 'clarity', 'explain', 'analogy', 'non-technical', 'storytelling', 'intuition', 'communicate'],
  'wrong about data conclusion checked corrected humility verified': ['wrong', 'verified', 'corrected', 'humility', 'double-check', 'validated', 'assumption', 'learned'],
  'ambiguity problem not clearly defined clarified structured approach': ['ambiguity', 'defined', 'clarified', 'structured', 'questions', 'scope', 'iterate', 'assumptions'],
  'collaborate engineers ship model production communication monitoring': ['collaborate', 'engineers', 'production', 'communication', 'monitoring', 'handoff', 'quality', 'deploy'],
  'design philosophy principles craft empathy users': ['philosophy', 'principles', 'craft', 'empathy', 'users', 'simplicity', 'intentional', 'quality'],
  'first design solution failed user testing iterate learned': ['failed', 'user testing', 'iterate', 'learned', 'assumptions', 'feedback', 'redesign', 'insight'],
  'creative disagreements design team critique constructive feedback': ['disagreement', 'critique', 'constructive', 'team', 'feedback', 'listen', 'align', 'goal'],
  'constraints forced best design decision limitation creativity': ['constraints', 'limitation', 'creative', 'decision', 'scope', 'simple', 'focus', 'trade-off'],
  'present work executives storytelling impact business clarity': ['present', 'executives', 'storytelling', 'impact', 'business', 'clarity', 'narrative', 'outcome'],
  'team culture brings out best creative work environment safety collaboration': ['culture', 'safety', 'collaboration', 'feedback', 'creative', 'environment', 'trust', 'candor'],
};

export function keywordsFor(question: string): string[] {
  const norm = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  let best = '';
  let bestScore = 0;
  for (const key of Object.keys(KEYWORDERS)) {
    const kws = key.split(' ');
    const score = kws.filter((k) => norm.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  if (bestScore >= 2) return KEYWORDERS[best];
  // derive from question itself: longest meaningful tokens
  const tokens = norm.split(/\s+/).filter((t) => t.length > 4 && !STOPWORDS.has(t));
  return Array.from(new Set(tokens)).slice(0, 8);
}

const clamp = (v: number, lo = 2, hi = 99) => Math.max(lo, Math.min(hi, Math.round(v)));

export function countFillers(text: string): { total: number; breakdown: { label: string; count: number }[] } {
  const t = ' ' + text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const breakdown: { label: string; count: number }[] = [];
  const patterns: { label: string; re: RegExp }[] = [
    { label: 'um / uh', re: /\b(um+|uh+|erm+|er)\b/g },
    ...FILLER_LIST.map((f) => ({ label: f, re: new RegExp(`\\b${f.replace(/ /g, '\\s+')}\\b`, 'g') })),
  ];
  for (const { label, re } of patterns) {
    const m = t.match(re);
    if (m && m.length) breakdown.push({ label, count: m.length });
  }
  const total = breakdown.reduce((s, b) => s + b.count, 0);
  return { total, breakdown: breakdown.sort((a, b) => b.count - a.count) };
}

export function analyzeAnswer(question: string, transcript: string, durationSec: number) {
  const text = transcript.trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const dur = Math.max(3, durationSec || wordCount / 2.3 || 3);
  const wpm = Math.round((wordCount / dur) * 60);

  // --- delivery score: ideal band 110–160 wpm
  const ideal = 135;
  const dist = Math.abs(wpm - ideal);
  const pace = clamp(100 - Math.max(0, dist - 25) * 0.9 - (wpm < 70 ? 12 : 0));

  // --- filler score
  const { total: fillerCount, breakdown } = countFillers(text);
  const fillersPerMin = Math.round((fillerCount / dur) * 60 * 10) / 10;
  const fillerScore = clamp(100 - fillersPerMin * 9 - (fillersPerMin > 6 ? 8 : 0));

  // --- keyword coverage
  const kws = keywordsFor(question);
  const norm = ' ' + text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const hits = kws.filter((k) => norm.includes(' ' + k.toLowerCase() + ' ') || norm.includes(k.toLowerCase()));
  const coverage = kws.length ? hits.length / kws.length : 0;
  const keywords = clamp(12 + coverage * 88);

  // --- relevance: blended keyword coverage + lexical overlap of content words
  const qNorm = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const qTokens = Array.from(new Set(qNorm.split(/\s+/).filter((t) => t.length > 3 && !STOPWORDS.has(t))));
  const overlap = qTokens.length ? qTokens.filter((t) => norm.includes(t)).length / qTokens.length : 0;
  const depth = wordCount >= 90 ? 1 : wordCount >= 60 ? 0.88 : wordCount >= 35 ? 0.7 : wordCount >= 18 ? 0.5 : 0.3;
  const relevance = clamp((coverage * 0.45 + overlap * 0.3 + depth * 0.25) * 100 + 6);

  // --- clarity: average sentence length in sweet spot + lexical diversity
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgLen = sentences.length ? wordCount / sentences.length : wordCount;
  const lenScore = avgLen < 8 ? 68 : avgLen <= 24 ? 96 : avgLen <= 32 ? 82 : avgLen <= 42 ? 62 : 38;
  const uniq = new Set(words.map((w) => w.toLowerCase())).size;
  const diversity = wordCount ? uniq / wordCount : 0;
  const clarity = clamp(lenScore * 0.65 + Math.min(1, diversity * 1.35) * 35);

  const overall = clamp(relevance * 0.28 + keywords * 0.24 + clarity * 0.18 + pace * 0.12 + fillerScore * 0.18);

  return {
    wordCount, durationSec: Math.round(dur), wpm,
    relevance, keywords, clarity, pace, fillerScore, fillerCount, fillersPerMin,
    overall,
    keywordsHit: hits,
    keywordsMissed: kws.filter((k) => !hits.includes(k)),
    fillerBreakdown: breakdown,
  };
}

export function buildSeedSessions(): SessionReport[] {
  const now = new Date('2026-10-22T09:00:00Z').getTime();
  const day = 86400000;
  const mk = (daysAgo: number, track: 'Technical' | 'HR', role: string, overall: number, wpm: number, fillersPerMin: number, pauseCount: number): SessionReport => {
    const d = new Date(now - daysAgo * day);
    const j = (base: number, spread: number, i: number) => clamp(base + Math.sin(i * 12.9898 + overall) * spread);
    return {
      id: `seed-${daysAgo}-${track.toLowerCase()}`,
      date: d.toISOString(),
      track,
      role,
      difficulty: daysAgo > 40 ? 'Foundational' : daysAgo > 12 ? 'Intermediate' : 'Advanced',
      questionCount: track === 'Technical' ? 4 : 5,
      durationSec: 240 + Math.round(Math.sin(overall * 3.3) * 90),
      wordCount: Math.round((240 + Math.sin(overall * 3.3) * 90) * (wpm / 60)),
      relevance: j(overall + 4, 8, 1),
      keywords: j(overall - 2, 9, 2),
      clarity: j(overall + 2, 7, 3),
      pace: j(92 - Math.abs(wpm - 135) * 0.4, 6, 4),
      fillerScore: j(100 - fillersPerMin * 9, 7, 5),
      confidence: j(overall + 6, 9, 6),
      overall,
      wpm,
      fillersPerMin,
      fillerCount: Math.max(1, Math.round((fillersPerMin * 5.2))),
      pauseCount,
    };
  };
  return [
    mk(46, 'Technical', 'Software Engineer', 58, 118, 6.1, 14),
    mk(22, 'Technical', 'Software Engineer', 66, 124, 5.2, 11),
    mk(9, 'HR', 'Software Engineer', 74, 131, 3.8, 8),
    mk(3, 'Technical', 'Software Engineer', 81, 138, 2.6, 5),
  ];
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
