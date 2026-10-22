import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, Trash2, Mic, ArrowRight, GitCompareArrows } from 'lucide-react';
import { useSessions } from '../lib/session';
import { db } from '../lib/store';
import { AnimatedNumber } from '../components/viz';
import { fmtDate, fmtTime } from '../lib/engine';
import type { SessionReport } from '../lib/types';

const METRICS: { key: keyof SessionReport; label: string; invert?: boolean; unit: string }[] = [
  { key: 'relevance', label: 'Answer Relevance', unit: '%' },
  { key: 'keywords', label: 'Keyword Coverage', unit: '%' },
  { key: 'clarity', label: 'Transcript Clarity', unit: '%' },
  { key: 'pace', label: 'Speaking Speed (score)', unit: '%' },
  { key: 'fillerScore', label: 'Filler-Free Delivery', unit: '%' },
  { key: 'confidence', label: 'Confidence Signal', unit: '%' },
];

export default function Compare() {
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [aId, setAId] = useState<string>('');
  const [bId, setBId] = useState<string>('');

  const sorted = useMemo(
    () => [...sessions].sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()),
    [sessions]
  );
  const a = sessions.find((s) => s.id === aId) ?? sorted[sorted.length - 2];
  const b = sessions.find((s) => s.id === bId) ?? sorted[sorted.length - 1];

  const same = a && b && a.id === b.id;

  const radarData = a && b
    ? METRICS.map((m) => ({ metric: m.label.replace(' (score)', ''), A: a[m.key] as number, B: b[m.key] as number, fullMark: 100 }))
    : [];

  const swap = () => { setAId(b?.id ?? ''); setBId(a?.id ?? ''); };

  if (sessions.length < 2) {
    return (
      <div className="pt-[68px] min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <GitCompareArrows size={38} className="text-gold-400 mb-4" />
        <h1 className="font-display text-3xl text-cream">Two sessions unlock comparison</h1>
        <p className="text-mute mt-2 text-sm max-w-xs">Record at least two practice sessions and this page becomes your progress engine.</p>
        <button onClick={() => navigate('/practice')} className="btn-gold px-7 py-4 mt-6"><Mic size={17} /> Record a session <ArrowRight size={15} /></button>
      </div>
    );
  }

  const deltaOverall = a && b ? b.overall - a.overall : 0;

  return (
    <div className="pt-[68px] min-h-screen">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="eyebrow mb-3">Cross-Session Intelligence</div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-cream">Compare.<br /><span className="gold-text">Then conquer.</span></h1>
          </div>
          <button onClick={swap} className="btn-ghost px-5 py-3 text-[0.82rem]"><ArrowLeftRight size={15} /> Swap A / B</button>
        </div>

        {/* selectors */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          {([['A', a, aId, setAId], ['B', b, bId, setBId]] as const).map(([tag, session, id, setId]) => (
            <div key={tag} className="glass rounded-3xl p-6 relative overflow-hidden">
              <div className="num text-[3.6rem] leading-none font-bold text-gold-400/10 absolute top-2 right-5 select-none">{tag}</div>
              <label className="eyebrow block mb-3">Session {tag}</label>
              <select
                value={id || (session?.id ?? '')}
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-white/[0.05] border hairline rounded-xl px-4 py-3 text-[0.85rem] text-cream outline-none focus:border-gold-400/50 appearance-none cursor-pointer"
              >
                {sorted.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#141412]">{fmtDate(s.date)} · {s.track} · {s.role} · {s.difficulty} · {s.overall}%</option>
                ))}
              </select>
              {session && (
                <div className="mt-5 flex items-center gap-6">
                  <div className="num text-6xl font-bold gold-text">{session.overall}</div>
                  <div className="text-[0.7rem] text-mute leading-relaxed">
                    <div><span className="text-champagne">{session.track}</span> · {session.role}</div>
                    <div>{fmtDate(session.date)} at {fmtTime(session.date)} · {session.difficulty}</div>
                    <div>{session.wpm} WPM · {session.fillersPerMin} fillers/min · {session.pauseCount} pauses · {session.wordCount} words · {session.durationSec}s</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex md:flex-col items-center justify-center gap-2 px-2">
            <div className="w-14 h-14 rounded-full border border-gold-400/40 bg-gold-400/10 flex items-center justify-center">
              <ArrowLeftRight size={20} className="text-gold-300" />
            </div>
          </div>
        </div>
        {same && <p className="text-center text-[0.75rem] text-[#f0a58f] mt-3">Sessions A and B are the same — pick a different pair for a meaningful delta.</p>}

        {a && b && !same && (
          <>
            {/* verdict banner */}
            <div className="mt-6 rounded-3xl border border-gold-400/30 bg-gradient-to-r from-gold-400/12 via-gold-400/5 to-transparent px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {deltaOverall >= 0 ? <TrendingUp size={26} className="text-emerald-400" /> : <TrendingDown size={26} className="text-[#f0957f]" />}
                <div>
                  <div className="num text-2xl font-bold text-champagne">{deltaOverall >= 0 ? '+' : ''}{deltaOverall} pts overall</div>
                  <div className="text-[0.7rem] text-mute">Session {tagName(a)} → Session {tagName(b)} · {fmtDate(a.date)} → {fmtDate(b.date)}</div>
                </div>
              </div>
              <button onClick={() => navigate('/practice')} className="btn-gold px-5 py-3 text-[0.8rem]"><Mic size={14} /> Record the next rep</button>
            </div>

            <div className="grid lg:grid-cols-12 gap-5 mt-6">
              {/* radar */}
              <div className="lg:col-span-5 glass rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.78rem] font-semibold text-champagne">Dimension Radar</span>
                  <span className="num text-[0.6rem] text-mute">A = bronze · B = gold</span>
                </div>
                <div className="flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="rgba(232,213,163,0.15)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#c9c2b2', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Session A" dataKey="A" stroke="#a87b2f" fill="#a87b2f" fillOpacity={0.35} strokeWidth={2} />
                      <Radar name="Session B" dataKey="B" stroke="#ecd394" fill="#ddb45c" fillOpacity={0.4} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#141412', border: '1px solid rgba(232,213,163,0.3)', borderRadius: 12, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* metric delta table */}
              <div className="lg:col-span-7 glass rounded-3xl p-6">
                <span className="text-[0.78rem] font-semibold text-champagne">Metric-by-Metric Verdict</span>
                <div className="mt-4 flex flex-col gap-2.5">
                  {METRICS.map((m) => {
                    const av = a[m.key] as number, bv = b[m.key] as number;
                    const d = bv - av;
                    const improved = d >= 0;
                    const Icon = d === 0 ? Minus : improved ? TrendingUp : TrendingDown;
                    return (
                      <div key={m.label} className="grid grid-cols-[1.35fr_auto_auto_auto] sm:grid-cols-[1.35fr_repeat(3,auto)] items-center gap-2 sm:gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                        <div className="text-[0.74rem] text-cream/90">{m.label}</div>
                        <div className="num text-[0.85rem] text-mute text-right w-9">{av}<span className="text-[0.6em]">{m.unit}</span></div>
                        <div className="num text-[0.95rem] font-bold text-champagne text-right w-9">{bv}<span className="text-[0.6em]">{m.unit}</span></div>
                        <div className={`num text-[0.72rem] font-semibold flex items-center gap-1 w-16 justify-end ${d === 0 ? 'text-mute' : improved ? 'text-emerald-400' : 'text-[#f0957f]'}`}>
                          <Icon size={12} />{d >= 0 ? '+' : ''}{d}
                        </div>
                      </div>
                    );
                  })}
                  {/* raw delivery rows */}
                  {[
                    { l: 'Words per minute', av: a.wpm, bv: b.wpm, unit: '', invert: false },
                    { l: 'Fillers / min', av: a.fillersPerMin, bv: b.fillersPerMin, unit: '', invert: true, dec: 1 },
                    { l: 'Pauses', av: a.pauseCount, bv: b.pauseCount, unit: '', invert: true },
                  ].map((row) => {
                    const d = Math.round((row.bv - row.av) * 10) / 10;
                    const improved = row.invert ? d <= 0 : d >= 0;
                    return (
                      <div key={row.l} className="grid grid-cols-[1.35fr_auto_auto_auto] sm:grid-cols-[1.35fr_repeat(3,auto)] items-center gap-2 sm:gap-4 rounded-2xl border border-gold-400/10 bg-gold-400/[0.04] px-4 py-3">
                        <div className="text-[0.74rem] text-cream/90">{row.l}</div>
                        <div className="num text-[0.85rem] text-mute text-right w-9">{row.dec ? row.av.toFixed(1) : row.av}</div>
                        <div className="num text-[0.95rem] font-bold text-champagne text-right w-9">{row.dec ? row.bv.toFixed(1) : row.bv}</div>
                        <div className={`num text-[0.72rem] font-semibold flex items-center gap-1 w-16 justify-end ${d === 0 ? 'text-mute' : improved ? 'text-emerald-400' : 'text-[#f0957f]'}`}>
                          {d === 0 ? <Minus size={12} /> : improved ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{d >= 0 ? '+' : ''}{d}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* archive with delete */}
            <div className="mt-6 glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.78rem] font-semibold text-champagne">Full Archive — {sorted.length} sessions</span>
                <span className="num text-[0.6rem] text-mute tracking-widest">STORED LOCALLY · ALWAYS YOURS</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sorted.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 group hover:border-gold-400/35 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="num text-3xl font-bold text-champagne"><AnimatedNumber value={s.overall} /></div>
                      <button onClick={() => db.deleteSession(s.id)} title="Delete session" className="p-1.5 text-mute/60 hover:text-[#f0957f] transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="text-[0.66rem] text-cream/85 mt-2 truncate">{s.track} · {s.role}</div>
                    <div className="num text-[0.55rem] text-mute mt-0.5">{fmtDate(s.date).toUpperCase()} · {s.difficulty.toUpperCase()}</div>
                    <div className="progress-track h-1 mt-2"><div className="progress-fill h-full" style={{ width: `${s.overall}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function tagName(s: SessionReport) {
  return `${fmtDate(s.date).slice(0, 6)} ${s.track === 'Technical' ? 'TECH' : 'HR'}`;
}
