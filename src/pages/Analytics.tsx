import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, ScanText, Gauge, Waves, Mic2, TrendingUp, GitCompareArrows, ArrowRight,
  Flame, Timer, ListMusic, Award, Sparkles, PauseCircle, ChevronRight,
} from 'lucide-react';
import { useSessions } from '../lib/session';
import { ScoreRing, AnimatedNumber, GradientAreaChart, DeltaBadge } from '../components/viz';
import { fmtDate } from '../lib/engine';
import type { SessionReport } from '../lib/types';

export default function Analytics() {
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [tab, setTab] = useState<'Technical' | 'HR' | 'All'>('All');

  const filtered = sessions.filter((s) => (tab === 'All' ? true : s.track === tab));
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest: SessionReport | undefined = sorted[sorted.length - 1];
  const prev: SessionReport | undefined = sorted[sorted.length - 2];
  const avg = filtered.length
    ? Math.round(filtered.reduce((s, x) => s + x.overall, 0) / filtered.length)
    : 0;
  const best = filtered.reduce((m, s) => Math.max(m, s.overall), 0);
  const delta = latest && prev ? latest.overall - prev.overall : 0;
  const streak = Math.min(filtered.length, 12);
  const chartData = sorted.map((s) => ({ label: fmtDate(s.date).slice(0, 6), value: s.overall }));

  // gentle pulse for the copilot ribbon
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 2600);
    return () => window.clearInterval(t);
  }, []);

  if (!latest) {
    return (
      <div className="pt-[68px] min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Sparkles size={36} className="text-gold-400 mb-4" />
        <h1 className="font-display text-3xl text-cream">No sessions yet</h1>
        <p className="text-mute mt-2 max-w-xs text-sm">Your dashboard ignites after your first recorded answer.</p>
        <button onClick={() => navigate('/practice')} className="btn-gold px-7 py-4 mt-6">Start your first session <ArrowRight size={16} /></button>
      </div>
    );
  }

  const metrics = [
    { icon: Target, label: 'Answer Relevance', value: latest.relevance, suffix: '%', delta: prev ? latest.relevance - prev.relevance : 0, desc: 'On-topic, correctly framed', good: true },
    { icon: ScanText, label: 'Keyword Coverage', value: latest.keywords, suffix: '%', delta: prev ? latest.keywords - prev.keywords : 0, desc: 'Target terms actually used', good: true },
    { icon: Mic2, label: 'Filler Words', value: latest.fillersPerMin, suffix: ' /min', delta: prev ? latest.fillersPerMin - prev.fillersPerMin : 0, desc: 'um · like · basically · you know', good: false, invert: true, decimals: 1 },
    { icon: Gauge, label: 'Speaking Speed', value: latest.wpm, suffix: ' WPM', delta: prev ? latest.wpm - prev.wpm : 0, desc: 'Golden band: 110–160 WPM', good: true, abs: true },
    { icon: Waves, label: 'Transcript Clarity', value: latest.clarity, suffix: '%', delta: prev ? latest.clarity - prev.clarity : 0, desc: 'Structure · diversity · noise', good: true },
    { icon: PauseCircle, label: 'Confident Pauses', value: latest.pauseCount, suffix: ' total', delta: prev ? latest.pauseCount - prev.pauseCount : 0, desc: 'Deliberate beats, not drifting', good: false, invert: true, abs: true },
  ];

  return (
    <div className="pt-[68px] min-h-screen">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14">
        {/* header row */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="eyebrow mb-3">Performance Dashboard</div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-cream">The state of <span className="gold-text">your voice.</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border hairline overflow-hidden">
              {(['All', 'Technical', 'HR'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-[0.75rem] font-semibold transition-colors ${tab === t ? 'bg-gold-400 text-ink' : 'text-mute hover:text-cream'}`}>{t}</button>
              ))}
            </div>
            <button onClick={() => navigate('/compare')} className="btn-ghost px-4 py-2 text-[0.78rem]"><GitCompareArrows size={15} /> Compare</button>
          </div>
        </div>

        {/* hero score band */}
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 glass rounded-3xl p-7 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full border border-gold-400/10 animate-spin-slow" />
            <div className="absolute w-44 h-44 rounded-full border border-gold-400/15" />
            <ScoreRing score={latest.overall} size={176} stroke={11} label="Overall SpeakScore" sub={`${fmtDate(latest.date)} · ${latest.role}`} />
            <div className="flex items-center gap-2 mt-4">
              <DeltaBadge value={delta} suffix=" pts" />
              <span className="text-[0.7rem] text-mute">vs previous {tab === 'All' ? '' : tab} session</span>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Flame, label: 'Practice Streak', value: streak, suffix: ' sessions', sub: `${avg}% avg score` },
              { icon: Award, label: 'Personal Best', value: best, suffix: '%', sub: 'peak overall score' },
              { icon: Timer, label: 'Speaking Time', value: Math.round(filtered.reduce((s, x) => s + x.durationSec, 0) / 60), suffix: ' min', sub: 'total reps recorded' },
              { icon: ListMusic, label: 'Words Spoken', value: filtered.reduce((s, x) => s + x.wordCount, 0), suffix: '', sub: 'transcribed & scored' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-3xl p-5 flex flex-col justify-between">
                <s.icon size={19} strokeWidth={1.6} className="text-gold-400" />
                <div className="mt-4">
                  <div className="num text-2xl sm:text-3xl font-bold text-champagne"><AnimatedNumber value={s.value} duration={1.3} />{s.suffix && <span className="text-[0.55em] text-gold-500">{s.suffix}</span>}</div>
                  <div className="text-[0.68rem] text-mute mt-1">{s.label}</div>
                  <div className="text-[0.58rem] text-mute/70">{s.sub}</div>
                </div>
              </div>
            ))}
            {/* trend card spanning */}
            <div className="glass rounded-3xl p-5 col-span-2 sm:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.75rem] font-semibold text-champagne flex items-center gap-2"><TrendingUp size={14} /> Overall trajectory</span>
                <span className="num text-[0.62rem] text-mute">{chartData.length} SESSIONS</span>
              </div>
              <GradientAreaChart data={chartData} height={150} />
            </div>
          </div>
        </div>

        {/* five core metrics */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">Six Core Signals — Latest Session</span>
            <span className="num text-[0.6rem] text-mute tracking-widest hidden sm:inline">ILLUSTRATIVE VALUES · REFRESHED LIVE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="glass rounded-3xl p-5 card-lift flex flex-col items-center text-center">
                <m.icon size={20} strokeWidth={1.5} className="text-gold-400 mb-2" />
                <div className="num text-[1.7rem] leading-none font-bold text-cream">
                  {m.decimals ? m.value.toFixed(1) : <AnimatedNumber value={m.value} />}
                  <span className="text-[0.5em] text-gold-500">{m.suffix}</span>
                </div>
                <div className="text-[0.66rem] font-medium text-champagne mt-1.5">{m.label}</div>
                <div className="text-[0.56rem] text-mute mt-0.5 leading-snug">{m.desc}</div>
                <div className="mt-2"><DeltaBadge value={m.invert ? -m.delta : m.delta} suffix={m.abs ? '' : '%'} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom row: heatmap + recent sessions */}
        <div className="grid lg:grid-cols-12 gap-5 mt-6">
          {/* metric heat history */}
          <div className="lg:col-span-5 glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.78rem] font-semibold text-champagne">Session Heat Grid</span>
              <span className="num text-[0.6rem] text-mute">OLDEST → NEWEST</span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[430px]">
                <div className="grid" style={{ gridTemplateColumns: `88px repeat(${sorted.length}, 1fr)` }}>
                  <div />
                  {sorted.map((s) => <div key={s.id} className="num text-[0.55rem] text-mute text-center py-1">{fmtDate(s.date).slice(0, 6)}</div>)}
                  {([
                    ['Relevance', 'relevance'], ['Keywords', 'keywords'], ['Clarity', 'clarity'], ['Pace', 'pace'], ['Filler-Free', 'fillerScore'],
                  ] as [string, keyof SessionReport][]).map(([label, key]) => (
                    <div key={label} className="contents">
                      <div className="text-[0.68rem] text-mute flex items-center pr-2 py-1">{label}</div>
                      {sorted.map((s) => {
                        const v = Number(s[key]);
                        const hue = v >= 80 ? 'rgba(110,220,150,' : v >= 65 ? 'rgba(236,211,148,' : v >= 50 ? 'rgba(221,180,92,' : 'rgba(232,90,70,';
                        return <div key={s.id} className="p-[3px]"><div className="rounded-md h-7 flex items-center justify-center num text-[0.58rem] text-black/70 font-bold" style={{ background: `${hue}${0.25 + (v / 100) * 0.75})` }}>{v}</div></div>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-[0.58rem] text-mute"><span>Weak</span><div className="flex-1 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg,#e85a46,#ddb45c,#ecd394,#6edc96)' }} /><span>Elite</span></div>
          </div>

          {/* recent sessions list */}
          <div className="lg:col-span-7 glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.78rem] font-semibold text-champagne">Session Archive</span>
              <Link to="/compare" className="text-[0.7rem] text-gold-300 hover:text-champagne flex items-center gap-1">Compare any two <ChevronRight size={12} /></Link>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {[...filtered].reverse().slice(0, 5).map((s) => (
                <button key={s.id} onClick={() => navigate(`/report/${s.id}`)} className="flex items-center gap-4 py-3 text-left group">
                  <div className="num w-11 h-11 rounded-2xl border border-gold-400/25 bg-gold-400/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[0.82rem] font-bold text-champagne leading-none">{s.overall}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.8rem] text-cream truncate group-hover:text-champagne">{s.track} · {s.role}</div>
                    <div className="num text-[0.58rem] text-mute mt-0.5">{fmtDate(s.date).toUpperCase()} · {s.difficulty.toUpperCase()} · {s.durationSec}s · {s.wpm} WPM · {s.fillersPerMin} FILLERS/MIN</div>
                  </div>
                  <ArrowRight size={15} className="text-mute group-hover:text-gold-300 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* insight ribbon */}
        <motion.div key={tick} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="mt-6 rounded-2xl border border-gold-400/25 bg-gradient-to-r from-gold-400/10 via-gold-400/[0.04] to-transparent px-5 py-4 flex items-center gap-3 text-[0.8rem]">
          <Sparkles size={17} className="text-gold-300 shrink-0" />
          <span className="text-cream/90"><span className="text-gold-300 font-semibold">Copilot insight:</span> Your pace is elite and fillers are falling — your biggest unlock now is <span className="text-champagne">keyword coverage ({latest.keywords}%)</span>. Anchor every answer to 3 target terms before you speak.</span>
        </motion.div>
      </div>
    </div>
  );
}
