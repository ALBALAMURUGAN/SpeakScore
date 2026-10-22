import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Printer, Mic, Sparkles, CheckCircle2, AlertTriangle, Target, ScanText, Gauge,
  Waves, Mic2, ArrowRight, FileText, GitCompareArrows,
} from 'lucide-react';
import { useSessions } from '../lib/session';
import { ScoreRing, AnimatedNumber } from '../components/viz';
import { fmtDate, fmtTime, countFillers } from '../lib/engine';
import type { FullReport } from '../lib/types';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { latestReport, sessions } = useSessions();

  // Resolve data source: fresh in-memory report, or a stored session rendered as a report shell.
  const stored = id ? sessions.find((s) => s.id === id) : undefined;
  const report: FullReport | null = latestReport && !id ? latestReport : null;

  if (!report && !stored) {
    return (
      <div className="pt-[68px] min-h-screen flex flex-col items-center justify-center text-center px-6">
        <FileText size={38} className="text-gold-400 mb-4" />
        <h1 className="font-display text-3xl text-cream">No report yet</h1>
        <p className="text-mute mt-2 text-sm max-w-xs">Complete a practice session and your personal improvement report lands here.</p>
        <button onClick={() => navigate('/practice')} className="btn-gold px-7 py-4 mt-6"><Mic size={17} /> Record your first answer</button>
      </div>
    );
  }

  const agg = report?.aggregate ?? stored!;
  const perQ = report?.perQuestion ?? [];
  const strengths = report?.strengths ?? [
    `Overall score of ${agg.overall}% with an average pace of ${agg.wpm} WPM.`,
    `Filler rate of ${agg.fillersPerMin} per minute across ${agg.questionCount} questions.`,
  ];
  const improvements = report?.improvements ?? [
    `Push keyword coverage beyond ${agg.keywords}% by anchoring each answer to 3 target terms.`,
    'Replace fillers with deliberate 1-beat pauses — they score confidence, fillers don’t.',
  ];

  return (
    <div className="pt-[68px] min-h-screen">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 print-area">
        {/* report header */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b hairline">
          <div>
            <div className="eyebrow mb-3 flex items-center gap-2"><Sparkles size={12} /> Personal Improvement Report</div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-cream">Session <span className="gold-text">Diagnosis</span></h1>
            <div className="num text-[0.68rem] text-mute mt-3 tracking-widest">
              {agg.track.toUpperCase()} · {agg.role.toUpperCase()} · {agg.difficulty.toUpperCase()} · {fmtDate(agg.date).toUpperCase()} AT {fmtTime(agg.date).toUpperCase()} · {agg.questionCount} QUESTIONS · {Math.floor(agg.durationSec / 60)}:{String(agg.durationSec % 60).padStart(2, '0')} MIN
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="btn-ghost px-4 py-2.5 text-[0.78rem]"><Printer size={14} /> Print / PDF</button>
            <button onClick={() => navigate('/compare')} className="btn-ghost px-4 py-2.5 text-[0.78rem]"><GitCompareArrows size={14} /> Compare</button>
          </div>
        </div>

        {/* composite + six signals */}
        <div className="grid lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-4 glass rounded-3xl p-7 flex flex-col items-center text-center">
            <ScoreRing score={agg.overall} size={168} stroke={11} label="Composite SpeakScore" sub="Weighted across 5 signals" />
            <div className="grid grid-cols-2 gap-3 w-full mt-6 text-center">
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 py-3"><div className="num text-xl font-bold text-champagne"><AnimatedNumber value={agg.wpm} /></div><div className="text-[0.58rem] text-mute tracking-widest mt-0.5">WPM AVG</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 py-3"><div className="num text-xl font-bold text-champagne"><AnimatedNumber value={agg.wordCount} /></div><div className="text-[0.58rem] text-mute tracking-widest mt-0.5">WORDS SPOKEN</div></div>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: Target, l: 'Relevance', v: agg.relevance, s: '%' },
              { icon: ScanText, l: 'Keywords', v: agg.keywords, s: '%' },
              { icon: Waves, l: 'Clarity', v: agg.clarity, s: '%' },
              { icon: Gauge, l: 'Pace', v: agg.pace, s: '%' },
              { icon: Mic2, l: 'Filler-Free', v: agg.fillerScore, s: '%' },
              { icon: Sparkles, l: 'Confidence', v: agg.confidence, s: '%' },
            ].map((m, i) => (
              <div key={i} className="glass rounded-3xl p-5 card-lift">
                <m.icon size={18} strokeWidth={1.6} className="text-gold-400" />
                <div className="num text-3xl font-bold text-cream mt-2"><AnimatedNumber value={m.v} /><span className="text-[0.5em] text-gold-500">{m.s}</span></div>
                <div className="text-[0.68rem] text-champagne mt-1">{m.l}</div>
                <div className="progress-track h-1.5 mt-2"><div className="progress-fill h-full" style={{ width: `${m.v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* strengths / improvements */}
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
            <div className="flex items-center gap-2 mb-4"><CheckCircle2 size={17} className="text-emerald-400" /><span className="text-[0.82rem] font-semibold text-emerald-300 tracking-wide">What you did brilliantly</span></div>
            <ul className="space-y-2.5">
              {strengths.map((s, i) => <li key={i} className="flex items-start gap-2.5 text-[0.83rem] text-cream/90 leading-snug"><span className="num text-gold-400 mt-0.5">0{i + 1}</span>{s}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-gold-400/25 bg-gold-400/[0.05] p-6">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle size={17} className="text-gold-300" /><span className="text-[0.82rem] font-semibold text-gold-300 tracking-wide">Your prescription for next session</span></div>
            <ul className="space-y-2.5">
              {improvements.map((s, i) => <li key={i} className="flex items-start gap-2.5 text-[0.83rem] text-cream/90 leading-snug"><span className="num text-gold-400 mt-0.5">0{i + 1}</span>{s}</li>)}
            </ul>
          </div>
        </div>

        {/* per-question deep dive */}
        {perQ.length > 0 && (
          <div className="mt-8">
            <div className="eyebrow mb-4">Question-by-Question Forensics</div>
            <div className="flex flex-col gap-5">
              {perQ.map((a, i) => {
                const fillerInfo = countFillers(a.transcript || '');
                return (
                  <div key={i} className="glass rounded-3xl p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b hairline">
                      <div className="max-w-2xl">
                        <span className="num text-[0.6rem] tracking-[0.25em] text-gold-500">QUESTION 0{i + 1}</span>
                        <h3 className="font-display text-xl text-cream mt-1.5 leading-snug">{a.questionText}</h3>
                      </div>
                      <div className="num text-center">
                        <div className="text-4xl font-bold gold-text">{a.overall}</div>
                        <div className="text-[0.55rem] text-mute tracking-widest">ANSWER SCORE</div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-4 my-5 text-center">
                      {[
                        ['Relevance', `${a.relevance}%`], ['Keywords', `${a.keywordCoverage}%`], ['Pace', `${a.wpm} wpm`], ['Fillers', `${a.fillerCount}`],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-2xl bg-white/[0.04] border border-white/5 py-3">
                          <div className="num text-lg font-bold text-champagne">{v}</div>
                          <div className="text-[0.58rem] text-mute tracking-widest uppercase">{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* keyword chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {a.keywordsHit.map((k) => <span key={k} className="num text-[0.62rem] px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300">✓ {k}</span>)}
                      {a.keywordsMissed.map((k) => <span key={k} className="num text-[0.62rem] px-2 py-1 rounded-full bg-white/[0.04] border border-white/10 text-mute">○ {k}</span>)}
                    </div>
                    {/* transcript with filler highlighting */}
                    <div className="rounded-2xl bg-[#0a0a09] border hairline p-4 text-[0.85rem] leading-relaxed text-cream/85 max-h-44 overflow-y-auto">
                      <HighlightedTranscript text={a.transcript} />
                    </div>
                    {fillerInfo.breakdown.length > 0 && (
                      <div className="num text-[0.62rem] text-mute mt-2">Filler forensics: {fillerInfo.breakdown.map((b) => `${b.label} ×${b.count}`).join(' · ')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border hairline bg-gradient-to-r from-gold-400/[0.09] to-transparent px-7 py-6">
          <div>
            <div className="font-display text-2xl text-cream">Scores compound.</div>
            <p className="text-[0.8rem] text-mute mt-1">Session {sessions.length > 0 ? sessions.length + 1 : 2} is where the curve bends upward.</p>
          </div>
          <Link to="/practice" className="btn-gold px-7 py-4 shrink-0">Practice again now <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}

function HighlightedTranscript({ text }: { text: string }) {
  if (!text) return <span className="italic text-mute">No transcript captured — answer louder next time.</span>;
  const re = /\b(um+|uh+|erm+|er|basically|actually|literally|honestly|obviously|essentially|like|maybe|perhaps|sort of|kind of|i guess|you know|stuff|things)\b/gi;
  const parts = text.split(re);
  const matches = text.match(re) ?? [];
  let mi = 0;
  return (
    <p>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const m = matches[mi++];
          return <mark key={i} className="mark-filler" title="Filler word">{m}</mark>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
