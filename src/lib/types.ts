export interface SessionReport {
  id: string;
  date: string; // ISO
  track: 'Technical' | 'HR';
  role: string;
  difficulty: string;
  questionCount: number;
  durationSec: number;
  wordCount: number;
  relevance: number;
  keywords: number;
  clarity: number;
  pace: number;
  fillerScore: number;
  confidence: number;
  overall: number;
  wpm: number;
  fillersPerMin: number;
  fillerCount: number;
  pauseCount: number;
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  transcript: string;
  wordCount: number;
  durationSec: number;
  wpm: number;
  relevance: number;
  keywordCoverage: number;
  fillerCount: number;
  fillersPerMin: number;
  clarity: number;
  pace: number;
  fillerScore: number;
  overall: number;
  keywordsHit: string[];
  keywordsMissed: string[];
  fillerBreakdown: { label: string; count: number }[];
  strengths: string[];
  improvements: string[];
}

export interface FullReport {
  perQuestion: QuestionAnalysis[];
  aggregate: SessionReport;
  strengths: string[];
  improvements: string[];
  combinedTranscript: string;
}
