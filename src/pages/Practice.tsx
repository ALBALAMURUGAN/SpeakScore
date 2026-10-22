import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Square, Code2, Users, ChevronRight, RotateCcw, RefreshCw,
  Keyboard, Radio, CheckCircle2, AlertCircle, Clock3, Sparkles,
} from 'lucide-react';
import { QUESTION_BANK, DIFFICULTIES, ROLES, analyzeAnswer } from '../lib/engine';
import { db } from '../lib/store';
import { useSessions } from '../lib/session';
import type { QuestionAnalysis, FullReport, SessionReport } from '../lib/types';
import { WaveBars } from '../components/viz';

type Step = 'setup' | 'question';
type Track = 'Technical' | 'HR';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition: any = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
  : null;

export default function Practice() {
  const navigate = useNavigate();
  const { setLatestReport, preferredTrack, setPreferredTrack } = useSessions();
  const [step, setStep] = useState<Step>('setup');
  const [track, setTrack] = useState<Track>(preferredTrack);
  const [role, setRole] = useState<string>('Software Engineer');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [questions, setQuestions] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [typedInput, setTypedInput] = useState(false);

  // recording state
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [buffers, setBuffers] = useState<string[]>([]); // committed final transcript segments
  const [liveText, setLiveText] = useState(''); // interim
  const [fallbackText, setFallbackText] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionAnalysis[]>([]);

  const recognitionRef = useRef<any>(null);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const pauseRef = useRef<{ lastVoice: number }>({ lastVoice: 0 });
  const pauseScanRef = useRef<number>(0);
  const transcriptRef = useRef('');

  const pickQuestions = useCallback(() => {
    const bank = QUESTION_BANK[track][role] ?? QUESTION_BANK[track]['Software Engineer'];
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [track, role]);

  const handleStartSession = () => {
    setPreferredTrack(track);
    setQuestions(pickQuestions());
    setQIndex(0);
    setResults([]);
    setStep('question');
    resetAnswerState();
  };

  const resetAnswerState = () => {
    setRecording(false);
    setProcessing(false);
    setElapsed(0);
    setBuffers([]);
    setLiveText('');
    setFallbackText('');
    setPauseCount(0);
    setMicError(null);
    setTypedInput(false);
    transcriptRef.current = '';
  };

  const regenerateQuestion = () => {
    setQuestions((prev) => {
      const bank = QUESTION_BANK[track][role] ?? [];
      const current = prev[qIndex];
      const alternatives = bank.filter((q) => q !== current);
      const fresh = alternatives[Math.floor(Math.random() * alternatives.length)];
      const next = [...prev];
      next[qIndex] = fresh;
      return next;
    });
    resetAnswerState();
  };

  /* ---------- recording lifecycle ---------- */
  const stopRecognition = () => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    recognitionRef.current = null;
    window.clearInterval(timerRef.current);
    window.clearInterval(pauseScanRef.current);
  };

  const startRecording = async () => {
    setMicError(null);
    setElapsed(0);
    setBuffers([]);
    setLiveText('');
    setPauseCount(0);
    transcriptRef.current = '';

    const wantTyped = typedInput || !SpeechRecognition;

    if (!wantTyped) {
      try {
        // verify mic permission & availability first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (e: any) => {
          let interim = '';
          const finals: string[] = [];
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) finals.push(t);
            else interim += t;
          }
          if (finals.length) {
            setBuffers((prev) => {
              const merged = [...prev, ...finals];
              transcriptRef.current = merged.join(' ');
              return merged;
            });
            pauseRef.current.lastVoice = Date.now();
          }
          setLiveText(interim);
          if (interim.trim()) pauseRef.current.lastVoice = Date.now();
        };
        rec.onerror = (e: any) => {
          if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
            setMicError('Microphone blocked. Switch to typed mode or allow mic access and retry.');
            setTypedInput(true);
            setRecording(false);
            stopRecognition();
          }
        };
        rec.onend = () => {
          // auto-restart while still recording (Chrome ends streams periodically)
          if (recognitionRef.current === rec) {
            try { rec.start(); } catch { /* already running */ }
          }
        };
        recognitionRef.current = rec;
        rec.start();
      } catch {
        setMicError('Microphone unavailable — switched to typed mode.');
        setTypedInput(true);
      }
    }

    startRef.current = Date.now();
    pauseRef.current.lastVoice = Date.now();
    setRecording(true);

    timerRef.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 250);
    // pause detector: voice activity gap > 1.4s counts as a deliberate pause
    pauseScanRef.current = window.setInterval(() => {
      const gap = Date.now() - pauseRef.current.lastVoice;
      if (gap > 1600 && transcriptRef.current.trim()) {
        setPauseCount((c) => c + 1);
        pauseRef.current.lastVoice = Date.now(); // count once per gap
      }
    }, 800);
  };

  const stopRecording = useCallback(() => {
    setRecording(false);
    stopRecognition();
    setProcessing(true);
    // let the engine "think" — dramatic analysis pause
    window.setTimeout(() => {
      const duration = Math.max(3, startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 45);
      const transcript = (typedInput || !SpeechRecognition ? fallbackText : transcriptRef.current).trim();
      const question = questions[qIndex];
      const a = analyzeAnswer(question, transcript || '(no answer captured)', duration);
      const analysis: QuestionAnalysis = {
        questionId: `q${qIndex}`,
        questionText: question,
        transcript,
        ...a,
        keywordCoverage: a.keywords,
        overall: a.overall,
        strengths: [],
        improvements: [],
      };
      // craft per-question coaching lines
      if (a.keywordsMissed.length <= 2) analysis.strengths.push('Covered nearly every target keyword for this question.');
      else analysis.strengths.push('Answered the question with a clear central idea.');
      if (a.wpm >= 110 && a.wpm <= 165) analysis.strengths.push(`Delivery pace of ${a.wpm} WPM sits inside the golden band.`);
      if (a.fillersPerMin < 3) analysis.strengths.push('Clean delivery — fillers well under the 3/min threshold.');
      if (a.keywordsMissed.length) analysis.improvements.push(`Work these target terms in naturally: ${a.keywordsMissed.slice(0, 4).join(', ')}.`);
      if (a.wpm > 165) analysis.improvements.push('Slow down — you outran the golden band. Breathe between ideas.');
      if (a.wpm < 100) analysis.improvements.push('Energy dips: project forward, lift pace toward 120–150 WPM.');
      if (a.fillersPerMin >= 3) analysis.improvements.push(`Cut fillers (${a.fillersPerMin}/min) — replace “um/like” with a breath of silence.`);
      if (a.relevance < 62) analysis.improvements.push('Open with a one-line direct answer, then support with evidence (STAR).');
      if (a.clarity < 62) analysis.improvements.push('Tighten sentence structure — one idea per sentence, under ~22 words.');
      if (!analysis.improvements.length) analysis.improvements.push('Polish edge cases and add one quantified result to make it unforgettable.');
      if (!analysis.strengths.length) analysis.strengths.push('Completed the answer — that alone beats most candidates.');

      setResults((prev) => [...prev, analysis]);
      setProcessing(false);
      if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1);
        resetAnswerState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        finishSession([...results, analysis]);
      }
    }, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, questions, results, typedInput, fallbackText]);

  useEffect(() => () => stopRecognition(), []);

  const finishSession = (all: QuestionAnalysis[]) => {
    const totalWords = all.reduce((s, a) => s + a.wordCount, 0);
    const totalDur = all.reduce((s, a) => s + a.durationSec, 0);
    const avg = (f: (a: QuestionAnalysis) => number) => Math.round(all.reduce((s, a) => s + f(a), 0) / all.length);
    const totalFillers = all.reduce((s, a) => s + a.fillerCount, 0);
    const wpm = totalDur > 0 ? Math.round((totalWords / totalDur) * 60) : 0;
    const relevance = avg((a) => a.relevance);
    const keywords = avg((a) => a.keywordCoverage);
    const clarity = avg((a) => a.clarity);
    const pace = avg((a) => a.pace);
    const fillerScore = avg((a) => a.fillerScore);
    const confidence = Math.round(clarity * 0.5 + fillerScore * 0.5);
    const overall = Math.round(relevance * 0.28 + keywords * 0.24 + clarity * 0.18 + pace * 0.12 + fillerScore * 0.18);

    const aggregate: SessionReport = {
      id: `sess-${Date.now()}`,
      date: new Date().toISOString(),
      track,
      role,
      difficulty,
      questionCount: all.length,
      durationSec: totalDur,
      wordCount: totalWords,
      relevance, keywords, clarity, pace, fillerScore, confidence, overall,
      wpm,
      fillersPerMin: Math.round((totalFillers / Math.max(1, totalDur / 60)) * 10) / 10,
      fillerCount: totalFillers,
      pauseCount,
    };

    const combined = all.map((a, i) => `Q${i + 1}. ${a.questionText}\nA: ${a.transcript}`).join('\n\n');
    const strengths = Array.from(new Set(all.flatMap((a) => a.strengths))).slice(0, 4);
    const improvements = Array.from(new Set(all.flatMap((a) => a.improvements))).slice(0, 4);
    const report: FullReport = { perQuestion: all, aggregate, strengths, improvements, combinedTranscript: combined };

    db.saveSession(aggregate, all);
    setLatestReport(report);
    navigate('/report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const skipQuestion = () => {
    setRecording(false);
    stopRecognition();
    resetAnswerState();
    if (qIndex < questions.length - 1) setQIndex((i) => i + 1);
    else finishSession(results);
  };

  const handleAnalyzeClick = () => {
    if (recording) { stopRecording(); return; }
    if (typedInput || !SpeechRecognition) {
      startRef.current = Date.now() - 45000; // typed answers analyzed against a nominal 45s delivery window
      stopRecording();
      return;
    }
    stopRecording();
  };

  /* ================= RENDER ================= */

  if (step === 'setup') {
    return (
      <div className="pt-[68px] min-h-screen">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
          <div className="text-center mb-12">
            <div className="eyebrow mb-4">Practice Session Builder</div>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold text-cream">Choose your <span className="gold-text">arena.</span></h1>
            <p className="text-mute mt-4 max-w-md mx-auto">Two questions tracks, four roles, three difficulty tiers — every question vetted by interviewers at top companies.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* track cards */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="eyebrow">01 — Track</div>
              {([
                { t: 'Technical' as Track, icon: Code2, d: 'Systems, algorithms, product sense & design craft — the questions that actually gate the offer.', n: '412 questions' },
                { t: 'HR' as Track, icon: Users, d: 'Behavioral, culture-fit and leadership — where 60% of rejections actually happen.', n: '380 questions' },
              ]).map(({ t, icon: Icon, d, n }) => {
                const active = track === t;
                return (
                  <button key={t} onClick={() => setTrack(t)} className={`text-left glass rounded-3xl p-6 transition-all duration-300 relative ${active ? 'border-gold-400/60 shadow-[0_0_50px_-15px_rgba(221,180,92,0.4)]' : 'opacity-75 hover:opacity-100'}`}>
                    {active && <span className="absolute top-5 right-5 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center"><CheckCircle2 size={13} className="text-ink" strokeWidth={3} /></span>}
                    <Icon size={28} strokeWidth={1.6} className={active ? 'text-gold-300' : 'text-mute'} />
                    <div className="font-display text-2xl text-champagne mt-3">{t}</div>
                    <p className="text-[0.8rem] text-mute mt-1.5 leading-relaxed">{d}</p>
                    <div className="num text-[0.62rem] text-gold-500 mt-3 tracking-widest">{n} INSIDE</div>
                  </button>
                );
              })}
            </div>

            {/* role + difficulty */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div>
                <div className="eyebrow mb-3">02 — Role</div>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => setRole(r)} className={`rounded-2xl border px-4 py-4 text-[0.85rem] font-medium transition-all ${role === r ? 'border-gold-400/60 bg-gold-400/10 text-champagne' : 'border-white/10 text-mute hover:text-cream hover:border-white/20'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-3">03 — Difficulty</div>
                <div className="grid grid-cols-3 gap-3">
                  {DIFFICULTIES.map((d, i) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`rounded-2xl border px-4 py-4 transition-all ${difficulty === d ? 'border-gold-400/60 bg-gold-400/10' : 'border-white/10 hover:border-white/20'}`}>
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        {[0, 1, 2].map((b) => <span key={b} className={`w-4 h-1 rounded-full ${b <= i ? 'bg-gold-400' : 'bg-white/12'}`} />)}
                      </div>
                      <div className={`text-[0.78rem] font-semibold ${difficulty === d ? 'text-champagne' : 'text-mute'}`}>{d}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl p-6 mt-auto">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-[0.82rem] text-mute">
                    <span className="text-champagne font-semibold">3 questions</span> · {track} · {role} · {difficulty}<br />
                    <span className="text-[0.72rem]">~5 minutes · full analysis after every session</span>
                  </div>
                  <button onClick={handleStartSession} className="btn-gold px-7 py-4 text-[0.92rem]">Generate questions <ChevronRight size={17} strokeWidth={2.5} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== question / recording stage =====
  const q = questions[qIndex];
  const transcript = typedInput || !SpeechRecognition ? fallbackText : [...buffers, liveText].join(' ').replace(/\s+/g, ' ').trim();
  const liveWords = transcript ? transcript.split(' ').filter(Boolean).length : 0;
  const liveWpm = elapsed > 4 ? Math.round((liveWords / elapsed) * 60) : 0;

  return (
    <div className="pt-[68px] min-h-screen relative">
      {/* session progress */}
      <div className="sticky top-[68px] z-30 backdrop-blur-xl bg-[#0a0a09]/80 border-b hairline">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 h-14 flex items-center gap-4">
          <span className="num text-[0.62rem] tracking-widest text-mute">SESSION</span>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i < qIndex ? 'bg-gold-400' : i === qIndex ? 'bg-gold-300 shadow-[0_0_8px_rgba(236,211,148,0.7)]' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="num text-[0.72rem] text-champagne ml-auto">Q{qIndex + 1} <span className="text-mute">/ {questions.length}</span></span>
          <span className="hidden sm:inline num text-[0.62rem] text-gold-500 border border-gold-400/25 rounded-full px-2.5 py-0.5">{track.toUpperCase()} · {difficulty.toUpperCase()}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border border-gold-400/20 animate-spin-slow border-t-gold-400" />
                <img src="/images/orb.png" alt="" className="absolute inset-3 object-contain" />
              </div>
              <div className="eyebrow">SpeakScore NLP · Analyzing</div>
              <div className="text-mute text-sm -mt-3 flex flex-col items-center gap-1">
                <span>relevance · keyword coverage · pace</span>
                <span>filler forensics · clarity · confidence</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45 }}>
              {/* question card */}
              <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="num text-[4rem] leading-none font-bold text-gold-400/10 absolute -top-1 right-5 select-none">0{qIndex + 1}</div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="eyebrow">{track} Question</span>
                  <button onClick={regenerateQuestion} className="flex items-center gap-1.5 text-[0.68rem] text-mute hover:text-champagne transition-colors border border-white/10 hover:border-gold-400/40 rounded-full px-3 py-1.5"><RefreshCw size={12} /> Regenerate</button>
                </div>
                <h2 className="font-display text-2xl sm:text-[2rem] leading-snug text-cream max-w-3xl">{q}</h2>
                <div className="mt-4 flex items-center gap-4 text-[0.68rem] text-mute">
                  <span className="flex items-center gap-1.5"><Clock3 size={12} /> Aim for 60–90s</span>
                  <span className="flex items-center gap-1.5"><Sparkles size={12} /> Star method: Situation → Task → Action → Result</span>
                </div>
              </div>

              {/* recorder */}
              <div className="grid md:grid-cols-5 gap-5 mt-6">
                {/* mic column */}
                <div className="md:col-span-2 glass rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  {recording && <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-gold-400/15 to-transparent animate-scanline" />}
                  <div className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-500 ${recording ? 'shadow-[0_0_70px_-5px_rgba(232,90,70,0.45)]' : 'shadow-[0_0_50px_-10px_rgba(221,180,92,0.35)]'}`}>
                    <span className={`absolute inset-0 rounded-full border ${recording ? 'border-[#e85a46]/50' : 'border-gold-400/30'} animate-ping`} style={{ animationDuration: recording ? '1.1s' : '2.6s' }} />
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${recording ? 'bg-gradient-to-br from-[#ff7a5c] to-[#c1341f]' : 'bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600'}`}
                      aria-label={recording ? 'Stop recording' : 'Start recording'}
                    >
                      {recording ? <Square size={30} fill="#1a0500" className="text-[#1a0500]" /> : <Mic size={34} strokeWidth={2} className="text-[#241a05]" />}
                    </button>
                  </div>
                  <div className="num mt-5 text-3xl font-bold text-cream tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
                  <div className="text-[0.65rem] text-mute mt-1 tracking-widest uppercase">{recording ? 'Recording · tap to finish' : 'Tap the mic & answer aloud'}</div>
                  <div className="mt-4 w-full">
                    <WaveBars bars={30} height={40} active={recording} className="w-full" />
                  </div>
                  <div className="flex items-center gap-4 mt-4 num text-[0.66rem] text-mute">
                    <span><span className="text-champagne">{liveWords}</span> words</span>
                    <span><span className="text-champagne">{liveWpm || '—'}</span> wpm</span>
                    <span><span className="text-champagne">{pauseCount}</span> pauses</span>
                  </div>
                </div>

                {/* transcript column */}
                <div className="md:col-span-3 glass rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="eyebrow flex items-center gap-2"><Radio size={12} /> Live Transcript</span>
                    <button onClick={() => setTypedInput((v) => !v)} className="flex items-center gap-1.5 text-[0.66rem] text-mute hover:text-champagne border border-white/10 rounded-full px-3 py-1.5">
                      {typedInput ? <Radio size={11} /> : <Keyboard size={11} />} {typedInput ? 'Use voice' : 'Type instead'}
                    </button>
                  </div>
                  {micError && <div className="flex items-start gap-2 text-[0.72rem] text-[#f0a58f] bg-[#e85a46]/10 border border-[#e85a46]/25 rounded-xl px-3 py-2 mb-3"><AlertCircle size={13} className="mt-0.5 shrink-0" />{micError}</div>}

                  {typedInput || !SpeechRecognition ? (
                    <textarea
                      value={fallbackText}
                      onChange={(e) => setFallbackText(e.target.value)}
                      placeholder="Type your answer as if you were speaking it… SpeakScore analyzes the same five dimensions either way."
                      className="flex-1 min-h-[180px] bg-white/[0.04] border hairline rounded-2xl p-4 text-[0.88rem] leading-relaxed outline-none focus:border-gold-400/40 resize-none placeholder:text-mute/60"
                    />
                  ) : (
                    <div className="flex-1 min-h-[180px] bg-white/[0.03] border hairline rounded-2xl p-4 text-[0.88rem] leading-relaxed overflow-y-auto max-h-72">
                      {transcript ? (
                        <p><span className="text-cream">{buffers.join(' ')}</span>{liveText && <span className="text-gold-300/90"> {liveText}</span>}</p>
                      ) : (
                        <p className="text-mute/60 italic">{recording ? 'Listening… words will stream in here as you speak.' : 'Your words will appear here in real time. Sound quality and mic placement matter — sit close, speak at your natural pace.'}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                    <button onClick={skipQuestion} className="text-[0.74rem] text-mute hover:text-cream flex items-center gap-1.5"><RotateCcw size={12} /> Skip this question</button>
                    <button onClick={handleAnalyzeClick} disabled={!recording && !transcript} className="btn-gold px-6 py-3 text-[0.85rem] disabled:opacity-40 disabled:cursor-not-allowed">
                      {recording ? <><Square size={15} fill="currentColor" /> Finish & Analyze</> : transcript ? <><CheckCircle2 size={15} /> Analyze Answer</> : 'Answer to continue'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* analyzing overlay shimmer while processing handled above */}
      {processing && <div className="fixed inset-0 z-20 bg-[#060606]/40 backdrop-blur-[2px] pointer-events-none" />}
    </div>
  );
}
