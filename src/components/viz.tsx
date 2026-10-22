import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ---------------- Count-up hook ---------------- */
export function useCountUp(target: number, duration = 1.15, decimals = 0) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(2, -9 * t);
      const v = from + (target - from) * (t === 1 ? 1 : eased);
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return decimals ? value.toFixed(decimals) : Math.round(value).toString();
}

export function AnimatedNumber({ value, suffix = '', duration = 1.15, className = '' }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const v = useCountUp(value, duration);
  return <span className={`num ${className}`}>{v}{suffix}</span>;
}

/* ---------------- Score ring (gold gradient arc) ---------------- */
export function ScoreRing({
  score,
  size = 148,
  stroke = 9,
  label,
  sub,
  delay = 0,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  delay?: number;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setProgress(score), 90 + delay);
    return () => window.clearTimeout(t);
  }, [score, delay]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  const gid = useRef(`g${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f9ecc0" />
              <stop offset="38%" stopColor="#ddb45c" />
              <stop offset="78%" stopColor="#8f6b28" />
              <stop offset="100%" stopColor="#e8d5a3" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(232,213,163,0.10)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: `stroke-dashoffset 1.35s cubic-bezier(.22,1,.36,1)`, filter: 'drop-shadow(0 0 12px rgba(221,180,92,0.35))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={score} className="text-3xl font-bold text-gold-200 leading-none" duration={1.3} />
          <span className="num text-[0.55rem] tracking-[0.25em] text-mute mt-1">/ 100</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <div className="text-[0.82rem] font-medium text-cream">{label}</div>
          {sub && <div className="text-[0.65rem] text-mute mt-0.5">{sub}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------------- EQ / waveform bars ---------------- */
export function WaveBars({ bars = 32, active = true, className = '', height = 44 }: { bars?: number; active?: boolean; className?: string; height?: number }) {
  const [seed] = useState(() => Array.from({ length: bars }, (_, i) => ({ d: 0.7 + ((i * 137) % 60) / 68, delay: (i * 89) % 90 / 100, dur: 0.65 + ((i * 61) % 70) / 100 })));
  return (
    <div className={`flex items-end gap-[3px] ${className}`} style={{ height }}>
      {seed.map((b, i) => (
        <span
          key={i}
          className="flex-1 rounded-full origin-bottom"
          style={{
            height: '100%',
            background: 'linear-gradient(180deg,#f6e7b8,#ddb45c 55%,#8f6b28)',
            animation: active ? `eq ${b.dur}s ease-in-out ${b.delay}s infinite alternate` : 'none',
            transform: active ? undefined : 'scaleY(0.18)',
            opacity: active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Gradient area chart (custom SVG) ---------------- */
export function GradientAreaChart({
  data,
  width = 640,
  height = 180,
  formatY = (v: number) => `${Math.round(v)}`,
}: {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  formatY?: (v: number) => string;
}) {
  const pad = { l: 30, r: 10, t: 14, b: 22 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const max = 100;
  const pts = data.map((d, i) => {
    const x = pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
    const y = pad.t + ih - (d.value / max) * ih;
    return { x, y, ...d };
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${(pad.t + ih).toFixed(1)} L${pts[0].x.toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;
  const gid = useRef(`a${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddb45c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ddb45c" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = pad.t + ih - (g / max) * ih;
        return (
          <g key={g}>
            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="rgba(232,213,163,0.09)" strokeDasharray="3 5" />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="8.5" fill="#948d7d" className="num">{g}</text>
          </g>
        );
      })}
      <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />
      <motion.path
        d={line}
        fill="none"
        stroke="#ecd394"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(236,211,148,0.5))' }}
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.4" fill="#0d0d0c" stroke="#ecd394" strokeWidth="1.6" />
          <text x={p.x} y={height - 7} textAnchor="middle" fontSize="8.5" fill="#948d7d">{p.label}</text>
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="8.5" fill="#e8d5a3" className="num">{formatY(p.value)}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------------- Delta badge ---------------- */
export function DeltaBadge({ value, invert = false, suffix = '' }: { value: number; invert?: boolean; suffix?: string }) {
  const positive = invert ? value < 0 : value >= 0;
  const sign = value >= 0 ? '+' : '−';
  return (
    <span
      className="num inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold"
      style={{
        color: positive ? '#8fe3b0' : '#f0957f',
        borderColor: positive ? 'rgba(110,220,150,0.35)' : 'rgba(240,149,127,0.35)',
        background: positive ? 'rgba(110,220,150,0.08)' : 'rgba(240,149,127,0.08)',
      }}
    >
      {sign}{Math.abs(Math.round(value * 10) / 10)}{suffix}
    </span>
  );
}
