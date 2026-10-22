import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, X, Send, Sparkles } from 'lucide-react';

const QUICK: { q: string; a: string }[] = [
  { q: 'How are pauses scored?', a: 'Any silence longer than 0.6s is flagged as a pause. We count pauses per minute and their average length. 1–3 thoughtful pauses per 100 words reads as deliberate and confident; beyond 5 per minute, answers start to feel fragmented.' },
  { q: 'What is a good SpeakScore?', a: 'Above 85 is elite — offers roll in at this level. 70–84 is competitive with strong prep. 60–69 is typical of early practice. Below 60, focus on relevance first: answer the exact question asked, with evidence.' },
  { q: 'How is keyword coverage measured?', a: 'Each question carries an expert-curated keyword set (e.g. CAP theorem → consistency, availability, partition, trade-off). Coverage is the percentage of that set present in your transcript, plus semantic overlap with the question itself.' },
  { q: 'How do I fix filler words?', a: 'SpeakScore counts “um/uh” plus 18 contextual fillers. Under 3 per minute is clean delivery. The fastest cure: replace the filler with a beat of silence — pauses score, fillers don’t. Watch your fillers-per-minute trend in the dashboard.' },
  { q: 'How many sessions until I improve?', a: 'Most candidates see a 12–18 point overall lift by session six. The biggest gains come from comparing sessions side-by-side — that is exactly what the Compare view is built for.' },
];
const MATCHERS: [RegExp, number][] = [
  [/pause|silence/i, 0],
  [/score|good|elite/i, 1],
  [/keyword|coverage/i, 2],
  [/filler|um|uh/i, 3],
  [/session|improve|progress|compare/i, 4],
];

export default function VoiceCopilot() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: 'copilot' | 'user'; text: string }[]>([
    { role: 'copilot', text: 'I’m your Interview Copilot. Ask me anything — pauses, keywords, filler words, or how many sessions it takes to level up.' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, typing]);

  if (pathname === '/practice') return null;

  const answer = (question: string) => {
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setTyping(true);
    let idx = -1;
    for (const [re, i] of MATCHERS) if (re.test(question)) { idx = i; break; }
    const text = idx >= 0
      ? QUICK[idx].a
      : 'Great question. Short version: specificity wins. Anchor every answer in one concrete project, one metric, one lesson. Run a session in Practice and I’ll show you exactly where the points are.';
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: 'copilot', text }]);
    }, 950);
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-5 sm:right-7 z-40 group flex items-center gap-3"
          aria-label="Open Interview Copilot"
        >
          <span className="hidden sm:block glass-strong rounded-2xl px-3.5 py-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-400">Interview Copilot</span>
            <span className="block text-[0.75rem] text-cream">Ask me anything →</span>
          </span>
          <span className="relative w-16 h-16 rounded-full overflow-hidden border border-gold-400/40 shadow-[0_10px_35px_-5px_rgba(221,180,92,0.5)]">
            <img src="/images/ai-coach.png" alt="SpeakScore Copilot" className="w-full h-full object-cover object-top" />
            <span className="absolute inset-0 rounded-full ring-2 ring-gold-400/30 animate-ping" style={{ animationDuration: '2.4s' }} />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-4 sm:right-7 z-40 w-[min(92vw,380px)] glass-strong rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] border border-gold-400/25">
          <div className="flex items-center gap-3 px-4 py-3 border-b hairline bg-gradient-to-r from-gold-500/10 to-transparent">
            <img src="/images/ai-coach.png" alt="" className="w-10 h-10 rounded-full object-cover object-top border border-gold-400/40" />
            <div className="flex-1">
              <div className="text-[0.78rem] font-semibold text-champagne flex items-center gap-1.5"><Sparkles size={12} /> Interview Copilot</div>
              <div className="text-[0.62rem] text-emerald-400/90 num tracking-wider">● ONLINE — SPEAKSCORE NLP</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 text-mute hover:text-cream"><X size={17} /></button>
          </div>
          <div ref={scrollRef} className="h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] text-[0.8rem] leading-snug rounded-2xl px-3.5 py-2.5 ${m.role === 'copilot' ? 'self-start bg-white/[0.06] text-cream rounded-tl-sm border border-white/5' : 'self-end bg-gold-400 text-ink rounded-tr-sm font-medium'}`}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="self-start bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            )}
          </div>
          <div className="px-3 pb-3">
            <div className="flex flex-wrap gap-1.5 mb-2 px-1">
              {QUICK.slice(0, 3).map((item) => (
                <button key={item.q} onClick={() => answer(item.q)} className="text-[0.62rem] border border-gold-400/25 text-gold-300 rounded-full px-2.5 py-1 hover:bg-gold-400/10 transition-colors">{item.q}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { answer(input.trim()); setInput(''); } }} className="flex items-center gap-2 bg-white/[0.05] border hairline rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-gold-400/50">
              <Mic size={14} className="text-gold-400 shrink-0" />
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your delivery…" className="bg-transparent flex-1 min-w-0 outline-none text-[0.8rem] placeholder:text-mute/70" />
              <button type="submit" className="w-8 h-8 rounded-full bg-gold-400 text-ink flex items-center justify-center hover:bg-gold-300 transition-colors"><Send size={14} /></button>
            </form>
            <Link to="/practice" onClick={() => setOpen(false)} className="block text-center text-[0.62rem] text-mute mt-2 hover:text-gold-300">Prefer to practice aloud? Start a live session →</Link>
          </div>
        </div>
      )}
    </>
  );
}
