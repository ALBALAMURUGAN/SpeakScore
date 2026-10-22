import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Mic, ScanText, Target, Gauge, Waves, FileText, GitCompareArrows,
  Sparkles, Play, Check, Building2, ChevronRight, Radio, Quote,
} from 'lucide-react';
import { ScoreRing, WaveBars, GradientAreaChart, AnimatedNumber } from '../components/viz';
import { useSessions } from '../lib/session';
import { fmtDate } from '../lib/engine';

const COMPANIES = ['GOOGLE', 'AMAZON', 'MICROSOFT', 'META', 'NETFLIX', 'APPLE', 'STRIPE', 'AIRBNB', 'OPENAI', 'DELOITTE', 'ACCENTURE', 'TCS'];

export default function Home() {
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setCycle((c) => (c + 1) % 3), 2600);
    return () => window.clearInterval(t);
  }, []);

  const recent = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = recent.map((s) => ({ label: fmtDate(s.date).slice(0, 6), value: s.overall }));
  const best = sessions.reduce((m, s) => Math.max(m, s.overall), 0);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex flex-col pt-[68px]">
        {/* hero image backdrop */}
        <div className="absolute inset-0">
          <img src="/images/hero-orb.png" alt="" className="w-full h-full object-cover object-[78%_center] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/72 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-[#060606]/60" />
        </div>

        <div className="relative flex-1 flex items-center">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full grid lg:grid-cols-12 gap-10 items-center py-16">
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-gold-400/70" />
                <span className="eyebrow">SpeakScore AI · Interview Intelligence</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1 }} className="font-display font-semibold text-[2.65rem] leading-[1.02] sm:text-6xl xl:text-[4.35rem] text-cream">
                Speak once.<br />
                <span className="gold-text animate-shimmer italic">Know exactly</span><br />
                how you answered.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28 }} className="mt-6 text-mute text-base sm:text-lg max-w-md leading-relaxed">
                Record your answer aloud. Our AI dissects relevance, keyword coverage, pace, pauses and filler words — then tells you precisely what to fix next.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.42 }} className="mt-9 flex flex-wrap items-center gap-4">
                <button onClick={() => navigate('/practice')} className="btn-gold px-7 py-4 text-[0.95rem]">
                  <Mic size={18} strokeWidth={2.4} /> Start Free Practice
                </button>
                <Link to="/report" className="btn-ghost px-6 py-4 text-[0.9rem]">
                  See sample report <ArrowRight size={16} />
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.6 }} className="mt-9 flex items-center gap-5 text-[0.72rem] text-mute">
                <span className="flex items-center gap-1.5"><Check size={13} className="text-gold-400" /> No card required</span>
                <span className="flex items-center gap-1.5"><Check size={13} className="text-gold-400" /> 48,000+ answers analyzed</span>
                <span className="flex items-center gap-1.5"><Check size={13} className="text-gold-400" /> Used by 1,900 hiring teams</span>
              </motion.div>
            </div>

            {/* floating HUD card */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} className="lg:col-span-5 hidden md:block">
              <div className="animate-floaty glass rounded-3xl p-5 max-w-sm ml-auto shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rec-dot w-2.5 h-2.5 rounded-full bg-[#e85a46] inline-block" />
                    <span className="num text-[0.62rem] tracking-[0.22em] text-cream/80">LIVE ANALYSIS</span>
                  </div>
                  <span className="num text-[0.62rem] text-gold-300 border border-gold-400/30 rounded-full px-2.5 py-0.5">TECHNICAL · L4</span>
                </div>
                <div className="flex items-center gap-5">
                  <ScoreRing score={87} size={112} stroke={8} delay={500} />
                  <div className="flex-1 space-y-2.5">
                    {[
                      { l: 'Relevance', v: 92 },
                      { l: 'Keywords', v: 84 },
                      { l: 'Clarity', v: 89 },
                    ].map((row) => (
                      <div key={row.l}>
                        <div className="flex justify-between text-[0.66rem] mb-1"><span className="text-mute">{row.l}</span><span className="num text-champagne">{row.v}%</span></div>
                        <div className="progress-track h-1.5"><div className="progress-fill h-full" style={{ width: `${row.v}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t hairline flex items-center justify-between">
                  <WaveBars bars={26} height={30} className="flex-1" />
                  <span className="num text-[0.66rem] text-gold-300 ml-3">132<br /><span className="text-[0.52rem] text-mute">WPM</span></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* company marquee */}
        <div className="relative border-t hairline bg-[#080807]/70 backdrop-blur-sm py-3.5">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex whitespace-nowrap w-max">
              {[...COMPANIES, ...COMPANIES].map((c, i) => (
                <span key={i} className="mx-9 text-[0.72rem] tracking-[0.3em] text-mute/70 font-semibold flex items-center gap-2"><Building2 size={11} className="text-gold-600" />{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STAT STRIP ============ */}
      <section className="relative border-b hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {[
            { n: 48214, s: '', l: 'spoken answers analyzed', d: 0 },
            { n: 94, s: '%', l: 'say it exposed blind spots', d: 0 },
            { n: 18, s: ' pts', l: 'average score lift by session 6', d: 0 },
            { n: 1200000, s: '+', l: 'filler words flagged', d: 0 },
          ].map((s, i) => (
            <div key={i} className="border-l border-gold-400/15 pl-5">
              <div className="num text-3xl sm:text-4xl font-bold text-gold-300"><AnimatedNumber value={s.n} suffix={s.s} duration={1.6} /></div>
              <div className="text-[0.72rem] text-mute mt-1.5 leading-snug max-w-[10rem]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS / 3 STEPS over waves ============ */}
      <section className="relative py-24 sm:py-32">
        <img src="/images/waves.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060606] via-[#060606]/35 to-[#060606]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="eyebrow mb-4">The SpeakScore Method</div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream">Three minutes of honesty<br /><span className="gold-text">beats three hours of guessing.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: Mic, t: 'Get your question', d: 'Pick Technical or HR, a role and a difficulty. Our generator serves expert-curated, interview-grade questions — never generic fluff.' },
              { n: '02', icon: Radio, t: 'Answer out loud', d: 'Press record and speak naturally into your microphone. Speech-to-text transcribes every word, live, as you think aloud under pressure.' },
              { n: '03', icon: ScanText, t: 'Get the diagnosis', d: 'SpeakScore dissects relevance, keywords, pace, pauses, fillers and clarity — then builds your personal improvement report in seconds.' },
            ].map((s) => (
              <div key={s.n} className="glass rounded-3xl p-7 card-lift relative overflow-hidden">
                <div className="num text-[4.5rem] leading-none font-bold text-gold-400/10 absolute -top-2 right-4 select-none">{s.n}</div>
                <s.icon size={30} strokeWidth={1.6} className="text-gold-300 mb-5" />
                <h3 className="font-display text-2xl text-champagne mb-2">{s.t}</h3>
                <p className="text-mute text-[0.88rem] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SCORING ENGINE / FIVE METRICS ============ */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="eyebrow mb-4">The Scoring Engine</div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream leading-[1.08]">Five signals.<br />One <span className="gold-text">SpeakScore.</span></h2>
            <p className="text-mute mt-5 leading-relaxed max-w-md">Every answer you record is decomposed into five scientifically-grounded dimensions — weighted, calibrated, and trended across your entire practice history.</p>
            <div className="mt-8 flex items-center gap-6">
              <img src="/images/orb.png" alt="Golden analyzer" className="w-36 h-36 object-contain animate-floaty2 drop-shadow-[0_20px_40px_rgba(221,180,92,0.35)]" />
              <div className="num text-[0.7rem] text-mute leading-loose">
                <div><span className="text-gold-300">MODEL</span> — speakscore-nlp-v4.2</div>
                <div><span className="text-gold-300">LATENCY</span> — 640 ms median</div>
                <div><span className="text-gold-300">CORPUS</span> — 1.2M graded answers</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-[2rem] p-7 sm:p-9">
            <div className="flex items-baseline justify-between mb-6">
              <span className="text-[0.8rem] font-semibold text-champagne">Live sample breakdown</span>
              <span className="num text-[0.62rem] text-mute tracking-widest">Q: “CAP THEOREM” · 84 WPM AUDIO</span>
            </div>
            {[
              { icon: Target, l: 'Answer Relevance', v: 91, d: 'On-topic, correct framing' },
              { icon: ScanText, l: 'Keyword Coverage', v: 84, d: '6 of 8 target terms used' },
              { icon: Waves, l: 'Transcript Clarity', v: 89, d: 'Clean structure, low noise' },
              { icon: Gauge, l: 'Speaking Pace', v: 94, d: '132 WPM · in the golden band' },
              { icon: Mic, l: 'Filler-Free Delivery', v: 78, d: '2.4 fillers / min' },
            ].map((m) => (
              <div key={m.l} className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
                <m.icon size={18} strokeWidth={1.7} className="text-gold-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.83rem] text-cream">{m.l}</span>
                    <span className="num text-[0.85rem] text-gold-300 font-semibold">{m.v}%</span>
                  </div>
                  <div className="progress-track h-1.5 mt-1.5"><div className="progress-fill h-full transition-all duration-1000" style={{ width: `${m.v}%` }} /></div>
                  <div className="text-[0.62rem] text-mute mt-1">{m.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARE TEASER ============ */}
      <section className="relative py-24 border-t hairline bg-[#090908]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 glass rounded-3xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="eyebrow">Signature Feature</span>
              <GitCompareArrows size={17} className="text-gold-400" />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center text-center">
              {[
                { label: 'SESSION 1', score: 58, d: 'Sep 6' },
                { label: 'SESSION 4', score: 81, d: 'Oct 19' },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl border ${i === 1 ? 'border-gold-400/45 bg-gold-400/[0.07]' : 'border-white/8 bg-white/[0.02]'} p-5`}>
                  <div className="num text-[0.6rem] tracking-[0.25em] text-mute">{s.label}</div>
                  <div className="num text-5xl font-bold mt-2 text-cream">{s.score}</div>
                  <div className="text-[0.65rem] text-mute mt-1">overall · {s.d}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="num text-[0.68rem] text-emerald-400">▲ +23 PTS</span>
              <span className="text-mute text-[0.68rem]">in 6 weeks of practice</span>
            </div>
            <div className="mt-5">
              <GradientAreaChart data={chartData.length >= 2 ? chartData : [{ label: 'S1', value: 58 }, { label: 'S2', value: 66 }, { label: 'S3', value: 74 }, { label: 'S4', value: 81 }]} height={130} />
            </div>
            <Link to="/compare" className="mt-4 flex items-center justify-center gap-2 text-[0.8rem] text-gold-300 hover:text-champagne transition-colors py-2">Open the comparison engine <ChevronRight size={14} /></Link>
          </div>
          <div className="order-1 lg:order-2">
            <div className="eyebrow mb-4">Compare Across Sessions</div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream leading-[1.08]">Watch yourself<br /><span className="gold-text">become undeniable.</span></h2>
            <p className="text-mute mt-5 leading-relaxed max-w-md">Every session is stored as a first-class record. Pick any two and SpeakScore renders the delta — metric by metric, filler by filler — so improvement is never a feeling, always a fact.</p>
            <ul className="mt-6 space-y-2.5 text-[0.85rem] text-cream/85">
              {['Side-by-side radar of all five dimensions', 'Per-metric deltas with direction-aware scoring', 'Full session archive with delete & re-analyze'].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check size={15} className="text-gold-400 mt-0.5 shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ DASHBOARD PREVIEW with illustrative metrics ============ */}
      <section className="relative py-24 border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="eyebrow mb-3">Your Command Center</div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream">The dashboard that<br /><span className="gold-text">knows your voice.</span></h2>
            </div>
            <Link to="/analytics" className="btn-ghost px-5 py-3 text-[0.82rem]">Open full dashboard <ArrowRight size={15} /></Link>
          </div>
          <div className="glass rounded-[2rem] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b hairline bg-white/[0.03]">
              <span className="w-3 h-3 rounded-full bg-[#e85a46]/80" /><span className="w-3 h-3 rounded-full bg-gold-400/80" /><span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="num text-[0.62rem] text-mute ml-3 tracking-widest">SPEAKSCORE.AI/ANALYTICS — ILLUSTRATIVE SESSION PREVIEW</span>
            </div>
            <div className="p-6 sm:p-8 grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex flex-col items-center gap-3 border-b md:border-b-0 md:border-r hairline pb-6 md:pb-0 md:pr-6">
                <ScoreRing score={84} size={132} label="Overall SpeakScore" sub="+9 vs last session" />
                <div className="num text-[0.62rem] text-mute">AVG OF 4 SESSIONS · BEST {best}%</div>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { l: 'Answer Relevance', v: 88, s: '%' },
                  { l: 'Filler Words', v: 2.4, s: '/min' },
                  { l: 'Speaking Speed', v: 132, s: ' WPM' },
                  { l: 'Keyword Coverage', v: 76, s: '%' },
                  { l: 'Transcript Clarity', v: 91, s: '%' },
                ].map((m, i) => (
                  <div key={i} className="rounded-2xl border border-gold-400/15 bg-gradient-to-b from-gold-400/[0.07] to-transparent p-4 text-center">
                    <div className="num text-2xl xl:text-3xl font-bold text-champagne"><AnimatedNumber value={m.v} duration={1.4} /><span className="text-[0.62em] text-gold-400">{m.s}</span></div>
                    <div className="text-[0.62rem] text-mute mt-1.5 leading-tight">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative py-24 border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="eyebrow mb-4">Voices that landed the offer</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream mb-12 max-w-2xl">Hired, <span className="gold-text">measurably.</span></h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { q: 'SpeakScore caught that I said “basically” 40 times in 6 minutes. Two weeks later I sounded like a staff engineer. Google, loop 1, hire.', n: 'Priya Ramanathan', r: 'SWE II → Google L5', s: 58, e: 82 },
              { q: 'The relevance scoring is brutal and brilliant. It told me I was answering the question I wished they asked. I stopped doing that. Offer from Stripe in week three.', n: 'Marcus Whitfield', r: 'PM → Stripe', s: 61, e: 84 },
              { q: 'Filler rate went 7.8 → 1.9 per minute across nine sessions. The compare view is the single most motivating thing I’ve ever seen in a prep tool.', n: 'Elena Vasquez', r: 'Data Scientist → Netflix', s: 55, e: 88 },
            ].map((t, i) => (
              <figure key={i} className="glass rounded-3xl p-6 card-lift flex flex-col">
                <Quote size={22} className="text-gold-500/70 mb-4" />
                <blockquote className="text-[0.88rem] text-cream/90 leading-relaxed flex-1">“{t.q}”</blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t hairline pt-4">
                  <div>
                    <div className="text-[0.85rem] font-semibold text-champagne">{t.n}</div>
                    <div className="text-[0.65rem] text-mute mt-0.5">{t.r}</div>
                  </div>
                  <div className="num text-[0.66rem] text-emerald-400 text-right">{t.s} → {t.e}<br /><span className="text-mute">SCORE LIFT</span></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative py-24 border-t hairline">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <div className="eyebrow mb-4">Pricing</div>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-cream">Cheaper than one<br /><span className="gold-text">bad interview loop.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch max-w-5xl mx-auto">
            {[
              { name: 'Aspirant', price: '0', per: 'forever', feats: ['5 analyzed answers / month', 'Technical + HR question banks', 'Overall SpeakScore only', 'Session history (7 days)'], cta: 'Start free', gold: false },
              { name: 'Candidate Pro', price: '29', per: 'per month', feats: ['Unlimited analyzed answers', 'All 5 dimensions + keyword heatmaps', 'Compare across sessions', 'Personal improvement reports', 'Priority speech-to-text engine'], cta: 'Go Pro', gold: true },
              { name: 'Cohort', price: 'Custom', per: 'for bootcamps & universities', feats: ['Everything in Pro', 'Cohort dashboards & benchmarks', 'Rubric-aligned scoring', 'SSO + LMS integrations', 'Dedicated success engineer'], cta: 'Talk to us', gold: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-3xl p-7 flex flex-col relative ${p.gold ? 'border border-gold-400/50 bg-gradient-to-b from-gold-400/[0.12] via-[#141310] to-[#0d0d0c] shadow-[0_30px_70px_-25px_rgba(221,180,92,0.3)]' : 'glass'}`}>
                {p.gold && <span className="num absolute -top-3 left-1/2 -translate-x-1/2 text-[0.58rem] tracking-[0.25em] bg-gold-400 text-ink font-bold rounded-full px-4 py-1">MOST CHOSEN</span>}
                <div className="eyebrow">{p.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="num text-5xl font-bold text-cream">{p.price === 'Custom' ? '' : '$'}{p.price}</span>
                  <span className="text-[0.72rem] text-mute mb-2 max-w-[6rem] leading-tight">{p.per}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-[0.82rem] text-cream/85 flex-1">
                  {p.feats.map((f) => <li key={f} className="flex items-start gap-2"><Check size={14} className="text-gold-400 mt-0.5 shrink-0" />{f}</li>)}
                </ul>
                <button onClick={() => navigate('/practice')} className={`mt-7 py-3.5 rounded-full text-[0.85rem] font-bold transition-all ${p.gold ? 'btn-gold justify-center' : 'btn-ghost justify-center'}`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative border-t hairline overflow-hidden">
        <img src="/images/waves.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606]/90 via-[#060606]/60 to-[#060606]/30" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-24 flex flex-col sm:flex-row items-center justify-between gap-10">
          <h2 className="font-display text-4xl sm:text-6xl font-semibold text-cream leading-[1.05] max-w-xl">Your next offer<br />starts with <span className="gold-text">one honest answer.</span></h2>
          <button onClick={() => navigate('/practice')} className="btn-gold px-9 py-5 text-base shrink-0"><Mic size={19} /> Press record <ArrowUpRight size={17} /></button>
        </div>
      </section>
    </div>
  );
}
